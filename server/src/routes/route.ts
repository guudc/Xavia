/**
 * MAIN ROUTE DECLARATION
 * @dev COAT
 * @author devcharlzen
 * @description This file is the main route declaration for the backend.
 */
import express from 'express'; 
import { createSiteAI } from '../controllers/ai';
const router = express.Router();

/**
 * @swagger
 * /api/site-ai:
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
router.post("/api/site-ai", createSiteAI);

export default router;