import { URL } from "url";
import * as cheerio from "cheerio";
import crypto from "crypto";

// Cache to store scraped site data in memory
const CACHE_SITE: Record<string, CacheData> = {};
const MAX_LENGTH = 1000000

// Interface for metadata extracted from the website
interface Metadata {
  [key: string]: string;
}

// Interface for actions (e.g., buttons, forms, links) found on the website
interface Action {
  tag: string;
  text?: string;
  action?: string;
  method?: string;
  href?: string;
}

// Interface for internal links found on the website
interface InternalLink {
  link: string;
  title: string;
  about: string;
}

// Interface for semantic information extracted from the website
interface SemanticInfo {
  summary: string;
  keywords: string[];
  metadata: Metadata;
}

// Interface for the structure of the scraped data
export interface ScrapedData {
  link: string;
  title: string;
  contents: string;
  mediaLinks: string[];
  actions: Action[];
  semanticInfo: SemanticInfo;
  internalLinks: InternalLink[];
}

// Interface for cached data
interface CacheData {
  contents: string;
}

/** Scrapes a website and extracts various types of data, including:
* - Title, text, and media links
* - Actions (buttons, forms, links)
* - Metadata and semantic information
* - Internal links (up to a depth of 10 pages)
*
* @param startUrl - The URL of the website to scrape
* @returns A record of scraped data or `false` if an error occurs
*/
export const scrapeWebsite = async (startUrl: string): Promise<Record<string, ScrapedData> | boolean> => {
 const visited = new Set<string>();
 const siteData: Record<string, ScrapedData> = {};
 const queue: string[] = [startUrl];
 
 while (queue.length > 0 && visited.size < 15 && JSON.stringify(siteData).length < MAX_LENGTH) {
   const url = queue.shift();
   if (!url || visited.has(url)) continue;

   visited.add(url);

   const cacheData = CACHE_SITE[url];
   const lastCachedContent = cacheData?.contents || "";

   try {
     const res = await fetch(url);
     const html = await res.text();

     if (html === lastCachedContent) {
       if (cacheData) siteData[url] = cacheData as ScrapedData;
       continue;
     }

     const $ = cheerio.load(html);
     const title = $("title").text();
     const text = $("body").text();

     const mediaLinks: string[] = [];
     $("img, video, audio, source").each((_, el) => {
       const src = $(el).attr("src");
       if (src) mediaLinks.push(src);
     });

     const actions: Action[] = [];
     $("button").each((_, el) => {
       actions.push({ tag: "button", text: $(el).text() });
     });
     $("form").each((_, el) => {
       actions.push({ tag: "form", action: $(el).attr("action"), method: $(el).attr("method") });
     });
     $("a").each((_, el) => {
       actions.push({ tag: "a", text: $(el).text(), href: $(el).attr("href") });
     });

     const metadata: Metadata = {};
     $("meta").each((_, el) => {
       const name = $(el).attr("property") || $(el).attr("name");
       const content = $(el).attr("content");
       if (name && content) metadata[name] = content;
     });

     const internalLinks: InternalLink[] = [];
     const seenLinks = new Set<string>();
     const baseDomain = new URL(startUrl).hostname;

     $("a").each((_, el) => {
       const href = $(el).attr("href");
       if (!href) return;
       try {
         const fullUrl = new URL(href, url).href;
         const domain = new URL(fullUrl).hostname;
         if (domain === baseDomain && !seenLinks.has(fullUrl)) {
           seenLinks.add(fullUrl);
           internalLinks.push({
             link: fullUrl,
             title: $(el).text() || "Untitled",
             about: `Link found on ${url}`,
           });
           if (!visited.has(fullUrl) && !queue.includes(fullUrl)) {
             queue.push(fullUrl);
           }
         }
       } catch {
         // Ignore invalid URLs
       }
     });

     const semanticInfo: SemanticInfo = {
       summary: text.slice(0, 1000),
       keywords: Object.keys(metadata),
       metadata,
     };

     const data: ScrapedData = {
       link: url,
       title,
       contents: html,
       mediaLinks,
       actions,
       semanticInfo,
       internalLinks,
     };

     siteData[crypto.createHash("sha256").update(url).digest("hex")] = data;
     CACHE_SITE[crypto.createHash("sha256").update(url).digest("hex")] = data;
   } catch (err: any) {
     console.error(`Error scraping ${url}:`, err.message);
     return false
   }
 }
 return siteData;
};