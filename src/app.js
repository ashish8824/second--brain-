import express from "express";
import cors from "cors";
import passport from "passport";
import "./config/passport.js";

import authRoutes from "./modules/auth/auth.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import contentRoutes from "./modules/content/content.routes.js";
import collectionRoutes from "./modules/collection/collection.routes.js";
import embeddingRoutes from "./modules/ai/embedding.routes.js";
import aiQARoutes from "./modules/ai/aiQA.routes.js";
import shareRoutes from "./modules/share/share.routes.js"; // ✅ NEW
import fileRoutes from "./modules/content/file.routes.js";

import { swaggerUI, swaggerSpec } from "./docs/swagger.js";

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition', 'Content-Length'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Second Brain API is running!",
    status: "healthy",
    version: "1.0.0",
    documentation: "/api/docs",
    endpoints: {
      auth: {
        register: "POST /auth/register",
        login: "POST /auth/login",
        googleAuth: "GET /auth/google",
        me: "GET /auth/me (Protected)",
        forgotPassword: "POST /auth/forgot-password",
        resetPassword: "POST /auth/reset-password/:token",
      },
      content: "/content/*",
      collections: "/collections/*",
      ai: {
        embeddings: "/ai/*",
        qa: "POST /ai/ask",
      },
      sharing: {
        // ✅ NEW
        createShare: "POST /share/content/:id or POST /share/collection/:id",
        viewShared:
          "POST /shared/content/:token or POST /shared/collection/:token",
        myShares: "GET /share/my-shares",
      },
      files: {
        // ✅ NEW
        view: "GET /files/view/:filename",
        download: "GET /files/download/:contentId",
        preview: "GET /files/preview/:contentId",
      },
    },
    swagger: {
      ui: "/api/docs",
      json: "/api/docs.json",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Swagger Documentation
app.use(
  "/api/docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Second Brain API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }),
);

app.get("/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// API Routes
app.use("/auth", authRoutes);
app.use("/content", contentRoutes);
app.use("/collections", collectionRoutes);
app.use("/ai", embeddingRoutes);
app.use("/ai", aiQARoutes);
app.use("/share", shareRoutes); // ✅ NEW - Protected routes
app.use("/shared", shareRoutes); // ✅ NEW - Public routes
app.use("/files", fileRoutes); // ✅ NEW  - File serving routes

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    availableEndpoints: {
      documentation: "/api/docs",
      auth: "/auth/*",
      content: "/content/*",
      collections: "/collections/*",
      ai: "/ai/*",
      aiQA: "POST /ai/ask",
      sharing: "/share/*",
      files: "/files/*",
    },
  });
});

// Error handler
app.use(errorHandler);

export default app;
