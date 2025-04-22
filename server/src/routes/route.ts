/**
 * MAIN ROUTE DECLARATION
 * @dev COAT
 * @author devcharlzen
 * @description This file is the main route declaration for the backend.
 */
import express from 'express'; 
import { createSiteAI, history, talkToXavia } from '../controllers/ai';
const router = express.Router();

/**
 * @swagger
 * /api/createXavia:
 *   post:
 *     summary: Create a Site AI entry
 *     description: Accepts a website URL, extracts the hostname, generates an ID, and saves it to the Chat database.
 *     tags:
 *       - Site AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: The URL of the website.
 *                 example: "https://example.com"
 *     responses:
 *       201:
 *         description: Site AI created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Site AI created successfully"
 *                 chat:
 *                   type: string
 *                   description: The unique ID of the created chat.
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *       400:
 *         description: Invalid input or unable to access the website.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "URL is required"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/createXavia", createSiteAI);

/**
 * @swagger
 * /api/talkToXavia:
 *   post:
 *     summary: Interact with the AI assistant
 *     description: Accepts a chatId and user prompt, retrieves the chat history from the database, feeds it to the AI along with the user prompt, and returns the AI's response.
 *     tags:
 *       - Site AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The unique ID of the chat.
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               prompt:
 *                 type: string
 *                 description: The user's input or question for the AI.
 *                 example: "What is this website about?"
 *     responses:
 *       200:
 *         description: AI response generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "AI response generated successfully"
 *                 response:
 *                   type: string
 *                   description: The AI's response to the user's prompt.
 *                   example: "This website is about providing high-quality tutorials."
 *       400:
 *         description: Invalid input or chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "chatId and userPrompt are required"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/talkToXavia", talkToXavia);

/**
 * @swagger
 * /api/{chatId}/history:
 *   get:
 *     summary: Fetch chat history
 *     description: Retrieves the chat history for a given chat ID from the database.
 *     tags:
 *       - Site AI
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the chat.
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chatId:
 *                   type: string
 *                   description: The unique ID of the chat.
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                         description: The role of the message sender (e.g., "user", "assistant").
 *                         example: "user"
 *                       message:
 *                         type: string
 *                         description: The content of the message.
 *                         example: "What is this website about?"
 *       404:
 *         description: Chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Chat not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/:chatId/history", history);


export default router;