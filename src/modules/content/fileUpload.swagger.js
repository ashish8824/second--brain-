/**
 * @swagger
 * /content/upload/pdf:
 *   post:
 *     summary: 📄 Upload PDF document
 *     description: |
 *       Upload a PDF file. The system will:
 *       - Extract text from all pages
 *       - Generate AI summary
 *       - Extract key points
 *       - Auto-tag content
 *       - Store metadata (pages, author, etc.)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file (max 10MB)
 *               title:
 *                 type: string
 *                 description: Optional custom title
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags (e.g., "research,important")
 *     responses:
 *       201:
 *         description: PDF processed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "PDF processed successfully"
 *               data:
 *                 id: "65afc1b2c8a9f3b9a1234567"
 *                 title: "Research Paper on AI"
 *                 summary: "This paper explores the latest developments in artificial intelligence..."
 *                 keyPoints:
 *                   - "AI models are becoming more efficient"
 *                   - "Transfer learning reduces training time"
 *                   - "Ethical considerations are increasingly important"
 *                 tags: ["ai", "research", "machine-learning", "pdf"]
 *                 numPages: 25
 *                 wordCount: 8450
 *                 createdAt: "2026-01-22T15:00:00.000Z"
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *
 * /content/upload/image:
 *   post:
 *     summary: 🖼️ Upload image with OCR
 *     description: |
 *       Upload an image file. The system will:
 *       - Optimize and compress image
 *       - Extract text using OCR (if image contains text)
 *       - Generate AI summary of extracted text
 *       - Auto-tag content
 *       - Store image metadata
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file - JPEG, PNG, GIF, WebP (max 10MB)
 *               title:
 *                 type: string
 *                 description: Optional custom title
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               extractText:
 *                 type: boolean
 *                 default: true
 *                 description: Extract text using OCR
 *     responses:
 *       201:
 *         description: Image processed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Image processed successfully"
 *               data:
 *                 id: "65afc1b2c8a9f3b9a1234567"
 *                 title: "Screenshot of Code"
 *                 summary: "Code snippet showing React component implementation..."
 *                 keyPoints:
 *                   - "Uses functional components with hooks"
 *                   - "Implements useEffect for data fetching"
 *                 tags: ["react", "code", "screenshot", "image"]
 *                 dimensions: "1920x1080"
 *                 hasText: true
 *                 wordCount: 145
 *                 ocrConfidence: 92.5
 *                 createdAt: "2026-01-22T15:00:00.000Z"
 *       400:
 *         description: No file or invalid file type
 */
