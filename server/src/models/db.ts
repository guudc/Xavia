/**
 * DB connection
 * @description This file is responsible for connecting to the database.
 */
import mongoose from "mongoose";

//export the connectDB function
export default async function connectDB() {
    let databaseUrl = process.env.DEV_MONGO_URI as string;
    if (process.env.NODE_ENV === "production") {
        databaseUrl = process.env.PROD_MONGO_URI as string;
    }
    try {
        await mongoose.connect(databaseUrl);
        console.log("Database connection successful");
    } catch (error) {
        console.error(error);
    }
}
