import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { Server } from "socket.io";
import { initSocket } from "./src/utils/socket.js";

import authRoutes from "./src/modules/auth/auth.routes.js";
import userRoutes from "./src/modules/user/user.routes.js";
import leadRoutes from "./src/modules/lead/lead.routes.js";
import notificationRoutes from "./src/modules/notification/notification.routes.js";
import errorHandler from "./src/middleware/errorHandler.js";
import AppError from "./src/utils/AppError.js";
import { sequelize } from "./src/database/models/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger Docs Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LeadFlow CRM API",
      version: "1.0.0",
      description: "LeadFlow CRM - Enterprise Lead Management Platform API",
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/modules/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Routes (prefixing with /api)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/notifications", notificationRoutes);

// Base route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: `API Server is running 🚀. API Documentation available at http://localhost:${PORT}/api-docs`,
  });
});

// Unhandled routes
app.use((req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Centralized error handler
app.use(errorHandler);

let server;

// Only start listening if NOT in test environment
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, async () => {
    try {
      await sequelize.authenticate();

      console.log("✅ Database connected successfully");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
    } catch (error) {
      console.error("❌ Database connection failed");
      console.error(error.message);
      process.exit(1);
    }
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    }
  });

  initSocket(io);

  io.on("connection", (socket) => {
    socket.on("authenticate", (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });
  });
}

// Graceful Shutdown
const shutdown = (signal) => {
  console.log(`\n⚡ ${signal} received`);
  console.log("⏳ Closing server...");

  if (server) {
    server.close(async () => {
      console.log("✅ HTTP server closed");

      try {
        await sequelize.close();
        console.log("✅ Database connection closed");
        process.exit(0);
      } catch (error) {
        console.error("❌ Database close error");
        console.error(error.message);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

// Process signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Unhandled errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error);
  shutdown("unhandledRejection");
});

export default app;