import express from "express";
import cors from "cors";
import passport from "passport";
import "./config/passport.js";

import authRoutes from "./modules/auth/auth.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import contentRoutes from "./modules/content/content.routes.js";
import collectionRoutes from "./modules/collection/collection.routes.js";
import embeddingRoutes from "./modules/ai/embedding.routes.js";

import { swaggerUI, swaggerSpec } from "./docs/swagger.js";

const app = express();

app.use(cors());
app.use(express.json());

// Passport
app.use(passport.initialize());

// Swagger
app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routes
app.use("/auth", authRoutes);
app.use("/content", contentRoutes);
app.use("/collections", collectionRoutes);
app.use("/ai", embeddingRoutes);

// Error handler last
app.use(errorHandler);

export default app;
