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
        url: "http://16.171.12.184:5000",
        description: "AWS EC2 Production",
      },
      {
        url: "http://localhost:5000",
        description: "Local Development",
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
      { name: "AI - Q&A", description: "Chat with your knowledge base" },
      { name: "Sharing", description: "Share content and collections" },
      { name: "Files", description: "File viewing, downloading, and preview" },
    ],
  },
  apis: [
    "./src/modules/auth/*.swagger.js",
    "./src/modules/content/*.swagger.js",
    "./src/modules/collection/*.swagger.js",
    "./src/modules/ai/*.swagger.js",
    "./src/modules/share/*.swagger.js",
    "./src/modules/content/fileUpload.swagger.js",
    "./src/modules/content/file.swagger.js",
  ],
};

console.log("Swagger files:", options.apis);

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUI, swaggerSpec };
