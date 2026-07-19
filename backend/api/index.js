import { app } from "../src/app.js";
import { connectDB } from "../src/config/db.js";

// Cache DB connection across warm serverless invocations.
// On Vercel, function instances are reused ("warm starts") so this
// prevents opening a new MongoDB connection on every request.
let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}
