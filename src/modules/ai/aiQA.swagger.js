/**
 * @swagger
 * /ai/ask:
 *   post:
 *     summary: 🤖 Ask a question to your knowledge base (AI Q&A)
 *     description: |
 *       Chat with your Second Brain! Ask any question and get AI-powered answers
 *       based on all your saved content.
 *
 *       **How it works:**
 *       1. Search your knowledge base for relevant content
 *       2. AI analyzes the content and generates a comprehensive answer
 *       3. Returns the answer with source citations
 *
 *       **Examples:**
 *       - "What are the best practices for Node.js I've saved?"
 *       - "Summarize what I know about React hooks"
 *       - "What did I learn about machine learning?"
 *     tags: [AI - Q&A]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 500
 *                 example: "What are the key concepts about Node.js that I've saved?"
 *                 description: Your question about the content in your knowledge base
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["nodejs", "javascript"]
 *                 description: Optional - Filter sources by specific tags
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 5
 *                 example: 5
 *                 description: Maximum number of content sources to use for answering
 *     responses:
 *       200:
 *         description: Successfully generated answer
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               answer: |
 *                 Based on your saved content about Node.js, here are the key concepts:
 *
 *                 **1. Event-Driven Architecture**
 *                 According to Source 1, Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient...
 *
 *                 **2. NPM Ecosystem**
 *                 Source 2 highlights that Node.js has the largest ecosystem of open source libraries...
 *
 *                 **3. Use Cases**
 *                 Your saved articles (Sources 1, 3, and 4) mention that Node.js is particularly suited for:
 *                 - Real-time applications
 *                 - API development
 *                 - Microservices
 *
 *                 For more detailed information, check the sources below.
 *               sources:
 *                 - id: "65afc1b2c8a9f3b9a1234567"
 *                   title: "Node.js Architecture Explained"
 *                   url: "https://nodejs.org/en/about"
 *                   type: "link"
 *                   snippet: "Node.js is an open-source, cross-platform JavaScript runtime..."
 *                   tags: ["nodejs", "javascript", "backend"]
 *                   relevance: 1
 *                   createdAt: "2026-01-15T10:30:00.000Z"
 *                 - id: "65afc1b2c8a9f3b9a1234568"
 *                   title: "Best Practices for Node.js Development"
 *                   url: "https://example.com/nodejs-best-practices"
 *                   type: "link"
 *                   snippet: "Follow these guidelines for production-ready Node.js apps..."
 *                   tags: ["nodejs", "best-practices"]
 *                   relevance: 2
 *                   createdAt: "2026-01-14T14:20:00.000Z"
 *               confidence: 0.95
 *               contentCount: 5
 *               timestamp: "2026-01-22T12:00:00.000Z"
 *       400:
 *         description: Invalid request (missing or invalid question)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Question is required"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 * /ai/qa/stats:
 *   get:
 *     summary: Get AI Q&A statistics
 *     description: Get statistics about your AI Q&A usage
 *     tags: [AI - Q&A]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Q&A statistics
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 totalQuestions: 42
 *                 averageConfidence: 0.87
 *                 mostQueriedTags: ["javascript", "nodejs", "react"]
 *                 lastAsked: "2026-01-22T11:45:00.000Z"
 */
