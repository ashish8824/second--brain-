import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Second Brain API",
      version: "1.0.0",
      description: "Backend APIs for Second Brain SaaS",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // 👇 Swagger will scan these files
  apis: ["./src/modules/**/*.swagger.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerUI = swaggerUi;
export { swaggerSpec };
