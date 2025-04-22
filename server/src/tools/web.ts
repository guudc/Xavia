import { URL } from "url";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import * as cheerio from "cheerio";

// Cache to store scraped site data in memory
const CACHE_SITE: Record<string, CacheData> = {};

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
interface ScrapedData {
  link: string;
  title: string;
  contents: string;
  text: string;
  mediaLinks: string[];
  actions: Action[];
  semanticInfo: SemanticInfo;
  internalLinks: InternalLink[];
}

// Interface for cached data
interface CacheData {
  contents: string;
}

/**
 * Scrapes a website and extracts various types of data, including:
 * - Title, text, and media links
 * - Actions (buttons, forms, links)
 * - Metadata and semantic information
 * - Internal links
 *
 * @param startUrl - The URL of the website to scrape
 * @returns A record of scraped data or `false` if an error occurs
 */
export const scrapeWebsite = async (startUrl: string): Promise<Record<string, ScrapedData> | boolean> => {
  const visited = new Set<string>(); // Tracks visited URLs to avoid duplicates
  const siteData: Record<string, ScrapedData> = {}; // Stores the scraped data

  // Retrieve cached data for the URL, if available
  const cacheData = CACHE_SITE[startUrl];
  const lastCachedContent = cacheData?.contents || "";

  try {
    // Fetch the HTML content of the website
    const res = await fetch(startUrl);
    const html = await res.text();

    // If the content matches the cached version, return the cached data
    if (html === lastCachedContent) {
      return cacheData ? { [startUrl]: cacheData as ScrapedData } : {};
    }

    // Load the HTML content into Cheerio for parsing
    const $ = cheerio.load(html);

    // Extract the title of the page
    const title = $("title").text();

    // Extract the text content of the page
    const text = $("body").text();

    // Extract media links (e.g., images, videos, audio)
    const mediaLinks: string[] = [];
    $("img, video, audio, source").each((_, el) => {
      const src = $(el).attr("src");
      if (src) mediaLinks.push(src);
    });

    // Extract actions (e.g., buttons, forms, links)
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

    // Extract metadata from meta tags
    const metadata: Metadata = {};
    $("meta").each((_, el) => {
      const name = $(el).attr("property") || $(el).attr("name");
      const content = $(el).attr("content");
      if (name && content) metadata[name] = content;
    });

    // Extract internal links (links within the same domain)
    const internalLinks: InternalLink[] = [];
    const seenLinks = new Set<string>();
    const baseDomain = new URL(startUrl).hostname;

    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      try {
        const fullUrl = new URL(href, startUrl).href;
        const domain = new URL(fullUrl).hostname;
        if (domain === baseDomain && !seenLinks.has(fullUrl)) {
          seenLinks.add(fullUrl);
          internalLinks.push({
            link: fullUrl,
            title: $(el).text() || "Untitled",
            about: `Link found on ${startUrl}`,
          });
        }
      } catch {
        // Ignore invalid URLs
      }
    });

    // Create semantic information from the extracted data
    const semanticInfo: SemanticInfo = {
      summary: text.slice(0, 1000), // First 1000 characters of the text
      keywords: Object.keys(metadata), // Keywords from metadata
      metadata, // Metadata object
    };

    // Compile all the extracted data into a ScrapedData object
    const data: ScrapedData = {
      link: startUrl,
      title,
      contents: html,
      text,
      mediaLinks,
      actions,
      semanticInfo,
      internalLinks,
    };

    // Store the scraped data in the siteData object and cache
    siteData[startUrl] = data;
    CACHE_SITE[startUrl] = data;
  } catch (err: any) {
    console.error(`Error scraping ${startUrl}:`, err.message);
    return false; // Return false if an error occurs
  }

  return siteData; // Return the scraped data
};