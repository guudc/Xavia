import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import mainRoute from "./routes/route";  
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./utils/swagger";
import connectDB from "./models/db";  
import apiMiddleware from "./middlewares/api";
import { getBlockAndTx } from "./tools/chain";
import { scrapeWebsite } from "./tools/web";
// Load environment variables from .env
dotenv.config();

// Initialize Express app
const app: Application = express();
connectDB(); // Connect to the database

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(apiMiddleware)
// Use main route
app.use("/api", mainRoute);

// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerSpec, {
//     explorer: true, // Adds an "Explore" button to Swagger UI
//     swaggerOptions: {
//       docExpansion: "none", // Optionally set to 'none' to minimize loading
//       persistAuthorization: true, // Remember authorization details for future requests
//       authAction: {
//         // API Key Authorization
//         AuthorizeApiKey: {
//           type: "apiKey",
//           name: "x-api-key", // Name of the header that contains the API key
//           in: "header", // The header where the API key will be passed
//         },
//       },
//     },
//   })
// );

// Default route
app.get("/api", (req: Request, res: Response) => {
  res.send("Welcome to the Xavia AI Agent API");
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(await scrapeWebsite('https://google.com'))
});
