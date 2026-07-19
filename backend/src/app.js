import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

export const app = express();

// Support multiple allowed origins (comma-separated CLIENT_ORIGIN env var).
// In production set CLIENT_ORIGIN to your Vercel URL, e.g.:
//   CLIENT_ORIGIN=https://civiclens.vercel.app
// For multiple origins separate with commas:
//   CLIENT_ORIGIN=https://civiclens.vercel.app,https://www.civiclens.vercel.app
const allowedOrigins = env.CLIENT_ORIGIN
  ? env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Render health checks, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" })); // photos come in as base64, need headroom

app.get("/health", (req, res) => res.json({ status: "ok", service: "civiclens-backend" }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);
