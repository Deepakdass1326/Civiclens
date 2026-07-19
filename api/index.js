import { app } from "../backend/src/app.js";
import { connectDB } from "../backend/src/config/db.js";

// Cache DB connection across warm serverless invocations
let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}
