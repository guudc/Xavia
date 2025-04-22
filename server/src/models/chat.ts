import { Schema, model, Document } from "mongoose";

/**
 * Interface representing the Chat document in MongoDB.
 */
export interface ChatDocument extends Document {
  id: string; // Unique identifier for the chat
  host: string; // website hostname
  history: object; // Array of chat messages
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
    history: {
        type: Array,
        required: true,
    },
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
 * Mongoose schema for the Chat model.
 */
const ChatHistorySchema = new Schema<ChatDocument>(
    {
      id: {
            type: String,
            required: true,
            unique: true,
          },
      history: {
          type: Array,
          required: true,
      },
    },
    {
      timestamps: false, // Disable automatic `updatedAt` field
    }
  );
/**
 * Mongoose model for the Chat schema.
 */
export const Chat = model<ChatDocument>("Chat_v2", ChatSchema);
export const ChatHistory = model<ChatDocument>("ChatHistory_v2", ChatHistorySchema);