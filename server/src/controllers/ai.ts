/**
 * AI CONTROLLER AI
 */

import { Request, Response } from "express";
import { Chat } from "../models/chat";
import { v4 as uuidv4 } from "uuid";
import { URL } from "url";
import { ScrapedData, scrapeWebsite } from "../tools/web";

/**
 * Controller to create a site AI entry.
 * Accepts a website URL, extracts the hostname, generates an ID, and saves it to the Chat database.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const createSiteAI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    // Validate the URL
    if (!url) {
      res.status(400).json({ error: "URL is required" });
      return;
    }
    let hostname: string;
    try {
      // Extract the hostname from the URL
      const parsedUrl = new URL(url);
      hostname = parsedUrl.hostname;
    } catch (error) {
      res.status(400).json({ error: "Invalid URL format" });
      return;
    }
    // Generate a unique ID for the chat
    const id = uuidv4();
    //scrape the website data
    const websiteMeta:any = await  scrapeWebsite(url)
    if(!(websiteMeta as any)?.title){
        res.status(400).json({ error: "unable to access website" });
        return
    }
    // Create a new chat document
    const newChat = new Chat({
      id,
      host:hostname,
      history: [
        {
          role: "init",
          message: `You are actiong as an ai agent for this website named, ${hostname}. 
          You would respond only in first person speech as if you are the website talking to the user.
          This is the site metatdata in Json format for your reference, use it to answer any question the user asks.
          ${JSON.stringify(websiteMeta)}`,
        },
      ],
      createdAt: new Date(),
    });

    // Save the chat document to the database
    await newChat.save();

    // Respond with the created chat document
    res.status(201).json({
      message: "Site AI created successfully",
      chat: id,
    });
  } catch (error: any) {
    console.error("Error creating site AI:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};