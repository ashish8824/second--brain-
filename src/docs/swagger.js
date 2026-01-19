import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Second Brain API",
      version: "1.0.0",
      description:
        "API documentation for Second Brain application - A personal knowledge management system",
      contact: {
        name: "Ashish",
        email: "ashish@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://second-brain-qx2p.onrender.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token (obtained from /auth/login)",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            name: {
              type: "string",
              example: "Ashish Anand",
            },
            email: {
              type: "string",
              example: "ashish@gmail.com",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Content",
        description: "Content management endpoints",
      },
      {
        name: "Collections",
        description: "Collection management endpoints",
      },
      {
        name: "AI",
        description: "AI and embedding endpoints",
      },
    ],
  },
  // ✅ Corrected paths based on your folder structure
  // swagger.js is in src/docs/, so we go up one level to src, then into modules
  apis: [
    path.join(__dirname, "../modules/auth/auth.swagger.js"),
    path.join(__dirname, "../modules/auth/auth.routes.js"),
    path.join(__dirname, "../modules/content/content.swagger.js"),
    path.join(__dirname, "../modules/content/content.routes.js"),
    path.join(__dirname, "../modules/collection/collection.swagger.js"),
    path.join(__dirname, "../modules/collection/collection.routes.js"),
    path.join(__dirname, "../modules/ai/embedding.swagger.js"),
    path.join(__dirname, "../modules/ai/embedding.routes.js"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

// ✅ Debug: Log loaded paths (remove after confirming it works)
console.log("📚 Swagger loaded paths:", Object.keys(swaggerSpec.paths || {}));

export { swaggerUI, swaggerSpec };
