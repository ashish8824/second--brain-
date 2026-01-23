import swaggerJsdoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Second Brain API",
      version: "1.0.0",
      description: "AI-Powered Personal Knowledge Management System",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "Development server",
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
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Content", description: "Content management" },
      { name: "Collections", description: "Collection management" },
      {
        name: "AI - Embeddings",
        description: "Semantic search with embeddings",
      },
      { name: "AI - Q&A", description: "Chat with your knowledge base" },
      { name: "Sharing", description: "Share content and collections" }, // ✅ NEW
    ],
  },
  apis: [
    "./src/modules/auth/*.swagger.js",
    "./src/modules/content/*.swagger.js",
    "./src/modules/collection/*.swagger.js",
    "./src/modules/ai/*.swagger.js",
    "./src/modules/share/*.swagger.js", // ✅ NEW
    "./src/modules/content/fileUpload.swagger.js", // ✅ NEW
  ],
};

console.log("Swagger files:", options.apis);

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUI, swaggerSpec };
