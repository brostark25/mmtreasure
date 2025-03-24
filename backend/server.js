import express from "express";
import cors from "cors";
import userRoute from "./routes/user.route.js";
import seamlessRoute from "./routes/seamless.route.js";
import agentRoute from "./routes/agent.route.js";
import sportbookRoute from "./routes/sportbook.route.js";
import reportRoute from "./routes/report.route.js";
import dotenv from "dotenv";
import path from "path"; // Move the import to the top
import { fileURLToPath } from "url";

// Initialize environment variables and app
dotenv.config();
const app = express();

// Get the current directory name for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure CORS dynamically for production and development
const allowedOrigins = [
  process.env.NODE_ENV === "production"
    ? process.env.APP_ORIGIN
    : "http://localhost:5173",
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies to be sent
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoute);
app.use("/api", seamlessRoute, sportbookRoute);
app.use("/admin", agentRoute);
app.use("/report", reportRoute);

// Serve static files in production (optional, for serving frontend build)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
