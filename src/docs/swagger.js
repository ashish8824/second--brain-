import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

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
  apis: [
    "./modules/auth/*.swagger.js",
    "./modules/content/*.swagger.js",
    "./modules/collection/*.swagger.js",
    "./modules/ai/*.swagger.js",
    "./modules/auth/auth.routes.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUI, swaggerSpec };
