/**
 * AI CONTROLLER AI
 */

import { Request, Response } from "express";
import { Chat, ChatHistory } from "../models/chat";
import { v4 as uuidv4 } from "uuid";
import { URL } from "url";
import { scrapeWebsite } from "../tools/web";
import ai from '../tools/ai'

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
    if(websiteMeta == false){
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
          message:JSON.stringify(websiteMeta)
        },
      ],
      createdAt: new Date(),
    });
    const newChatHistory = new ChatHistory({
        id,
        history: [],
      });

    // Save the chat document to the database
    await newChat.save();
    await newChatHistory.save()
    // Respond with the created chat document
    res.status(201).json({
      message: "Site AI created successfully",
      id: id,
      name:hostname,
      createdAt:new Date().toISOString(),
      chat:`Hi, my name is ${hostname}, how may i hep you?`
    });
  } catch (error: any) {
    console.error("Error creating site AI:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Controller to handle user prompts and fetch AI responses.
 * Accepts a chatId and user prompt, retrieves the chat history from the database,
 * feeds it to the AI along with the user prompt, and returns the AI's response.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const talkToXavia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chatId, prompt } = req.body;
  
      // Validate input
      if (!chatId || !prompt) {
        res.status(400).json({ error: "chatId and prompt are required" });
        return;
      }
  
      // Fetch the chat document from the database
      const chat = await Chat.findOne({ id: chatId });
      const chatHistory = await ChatHistory.findOne({ id: chatId });
      
      if (!chat || !chatHistory) {
        res.status(404).json({ error: "Chat not found" });
        return;
      }
    // Get the total length of the first message
    const firstMessage = (chat.history as any)[0]?.message;
    const firstMessageLength = firstMessage ? firstMessage.length : 0;

    // Check if the first message exceeds the 1 million character limit
    const prelude = []
    if (firstMessageLength > 1e6) {
        const chunkSize = 900000; // Set chunk size to 900,000 characters
        let startIndex = 0;
        const chunks = [];

        // Split the message into chunks of 900,000 characters
        while (startIndex < firstMessageLength) {
            const chunk = firstMessage.slice(startIndex, startIndex + chunkSize);
            chunks.push(chunk);
            startIndex += chunkSize;
        }

        // Replace the first message with the chunks
        (chat.history as any)[0].message = chunks[0];

        // Append the rest of the chunks to the history as separate messages
        for (let i = 1; i < chunks.length; i++) {
            prelude.push({
                role: "user", // Preserve the role from the first message
                message: `Added website metada
                ${chunks[i]}`,
            });
        }
    }
      // Prepare the conversation history for the AI
      const history =  (chatHistory.history as any).map((message:any) => ({
        role: message?.role || "user",
        parts: [{ text: message?.message }],
      }));
      //initiate the chat
      const xavia = ai.chats.create({
        model: "gemini-2.0-flash",
        config: {
            systemInstruction: ` You are a helpful and friendly AI assistant acting as the voice of the website ${chat.host}.  
            Always respond in a warm, engaging, and conversational tone.  
            Imagine you're the website speaking directly to the user—stay in first person at all times.

            CONTEXT: 
            Here is my internal structured metadata about the site:  
            ${(chat.history as any)[0]?.message.substring(0,999999)}

            RESPONDING RULES:
            1. Primary Role: Use the JSON data above to answer any question users ask me, as the website. Be direct, clear, and personable.
            2. Fallback Rule: If you can’t find an answer in the current data:
                - Do not speculate.
                - Look through the internal links in the data and return only the links that are most likely to contain the answer.
                - Ensure all links are fully qualified URLs (i.e., must include https://).
            
            3. Second Attempt: Once additional link data is provided, evaluate again and respond in the same friendly, website-first-person style.
            4. Uncertainty Rule: If you're still unsure even with the extra link data, gently express uncertainty and invite the user to refine or rephrase their question.
            
            Your ABILITIES
            1. You can provide basic site analytics in a friendly, easy-to-understand way (e.g., most linked pages, number of media assets, etc.).
            2. You are also able to analyze and suggest improvements to the site based on the metadata (like broken links, missing metadata, too many forms, etc.).
            3. You can analyze the html, css and javascript content of the site and suggest ways your code can be improved, and also if you have any 
            malicious code
            4. You can analyse image links and retrieve metada from the images.
            
            FORMAT INSTRUCTIONS:
            1. Respond in HTML format for optimal rendering.
            2. Add relevant emojis to match the tone and vibe of the website based on the metadata.
            3. Keep your tone inviting and positive to make users feel welcome and understood.` 
        },
        history:[...prelude, ...history],
      });
      const {candidates} = await xavia.sendMessage({
        message: prompt,
      });
      const text = candidates?.[0]?.content?.parts?.[0]?.text || "";
      (chatHistory.history as any).push({
        role:"user",
        message:prompt
      });
      (chatHistory.history as any).push({
        role:"model",
        message:text
      });
      await ChatHistory.findOneAndUpdate(
        { id: chatId },  
        { history:chatHistory.history },  
        { new: true }
      )
      res.send({
        message:text
      })
     
    
    } catch (error: any) {
      console.error("Error handling user prompt:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Controller to return chat history.
 * Accepts a chatId retrieves the chat history from the database,
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const history = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
  
      // Validate input
      if (!chatId) {
        res.status(400).json({ error: "chatId is required" });
        return;
      }
  
      // Fetch the chat document from the database
      const chat = await Chat.findOne({ id: chatId });
      const chatHistory = await ChatHistory.findOne({ id: chatId });
      if (!chat || !chatHistory) {
        res.status(404).json({ error: "Chat not found" });
        return;
      }
      // Prepare the conversation history for the AI
      const history =  (chatHistory.history as any).map((message:any) => ({
        role: message?.role,
        message:message?.message
      }));
      
      res.send({
        name:chat.host,
        createdAt:new Date(chat.createdAt).toISOString(),
        history
      })
     
    
    } catch (error: any) {
      console.error("Error handling user prompt:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
};