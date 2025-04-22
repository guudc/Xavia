import { Schema, model, Document } from "mongoose";

/**
 * Interface representing a single message in the chat history.
 */
interface ChatMessage {
  role: string; // Role of the sender (e.g., "user", "system", "assistant")
  message: string; // The message content
}

/**
 * Interface representing the Chat document in MongoDB.
 */
export interface ChatDocument extends Document {
  id: string; // Unique identifier for the chat
  host: string; // website hostname
  history: ChatMessage[]; // Array of chat messages
  createdAt: Date; // Timestamp when the chat was created
}

/**
 * Mongoose schema for the Chat model.
 */
const ChatSchema = new Schema<ChatDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    host: {
        type: String,
        required: true,
    },
    history: [
      {
        role: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set the creation date
    },
  },
  {
    timestamps: false, // Disable automatic `updatedAt` field
  }
);

/**
 * Mongoose model for the Chat schema.
 */
export const Chat = model<ChatDocument>("Chat", ChatSchema);