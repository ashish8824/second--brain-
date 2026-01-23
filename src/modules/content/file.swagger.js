/*
/**
 * @swagger
 * components:
 *   schemas:
 *     FilePreviewResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             contentId:
 *               type: string
 *               example: "65afc1b2c8a9f3b9a1234567"
 *             title:
 *               type: string
 *               example: "Research Paper on AI"
 *             type:
 *               type: string
 *               enum: [pdf, image, text, link, note]
 *               example: "pdf"
 *             fileUrl:
 *               type: string
 *               example: "http://localhost:5000/files/view/1706022000000-research-paper.pdf"
 *             downloadUrl:
 *               type: string
 *               example: "http://localhost:5000/files/download/65afc1b2c8a9f3b9a1234567"
 *             fileName:
 *               type: string
 *               example: "research-paper.pdf"
 *             fileSize:
 *               type: number
 *               example: 2458624
 *               description: File size in bytes
 *             mimeType:
 *               type: string
 *               example: "application/pdf"
 *
 *     FileError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Content not found"
 */

/**
 * @swagger
 * /files/download/{contentId}:
 *   get:
 *     summary: ⬇️ Download a file
 *     description: |
 *       Download a file by content ID. This endpoint:
 *       - Forces browser download (Content-Disposition: attachment)
 *       - Validates user ownership of the content
 *       - Uses original filename for download
 *       - Only allows downloading non-deleted content
 *
 *       **Security:**
 *       - User can only download their own files
 *       - Deleted content cannot be downloaded
 *       - Requires valid JWT authentication
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the content
 *         example: "65afc1b2c8a9f3b9a1234567"
 *     responses:
 *       200:
 *         description: File download initiated
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *             description: 'attachment; filename="original-name.pdf"'
 *           Content-Type:
 *             schema:
 *               type: string
 *             description: MIME type of the file
 *           Content-Length:
 *             schema:
 *               type: integer
 *             description: File size in bytes
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileError'
 *       404:
 *         description: Content not found or file not attached
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileError'
 *             examples:
 *               contentNotFound:
 *                 value:
 *                   success: false
 *                   message: "Content not found"
 *               fileNotFound:
 *                 value:
 *                   success: false
 *                   message: "File not found for this content"
 *       500:
 *         description: Server error during download
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileError'
 */

/**
 * @swagger
 * /files/preview/{contentId}:
 *   get:
 *     summary: 🔍 Get file preview metadata
 *     description: |
 *       Get file URLs and metadata for preview purposes. This endpoint:
 *       - Returns file URLs for viewing and downloading
 *       - Provides file metadata (size, type, name)
 *       - Validates user ownership
 *       - Returns URLs that can be used in frontend
 *
 *       **Response includes:**
 *       - `fileUrl`: URL to view/stream the file inline
 *       - `downloadUrl`: URL to force download the file
 *       - File metadata (name, size, MIME type)
 *       - Content metadata (title, type)
 *
 *       **Use case:**
 *       Perfect for building file preview UIs where you need to show:
 *       - File information before viewing
 *       - Multiple action buttons (view/download)
 *       - File type icons based on MIME type
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the content
 *         example: "65afc1b2c8a9f3b9a1234567"
 *     responses:
 *       200:
 *         description: File preview metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilePreviewResponse'
 *             examples:
 *               pdfFile:
 *                 value:
 *                   success: true
 *                   data:
 *                     contentId: "65afc1b2c8a9f3b9a1234567"
 *                     title: "Research Paper on AI"
 *                     type: "pdf"
 *                     fileUrl: "http://localhost:5000/files/view/1706022000000-research-paper.pdf"
 *                     downloadUrl: "http://localhost:5000/files/download/65afc1b2c8a9f3b9a1234567"
 *                     fileName: "research-paper.pdf"
 *                     fileSize: 2458624
 *                     mimeType: "application/pdf"
 *               imageFile:
 *                 value:
 *                   success: true
 *                   data:
 *                     contentId: "65afc1b2c8a9f3b9a1234568"
 *                     title: "Screenshot of Code"
 *                     type: "image"
 *                     fileUrl: "http://localhost:5000/files/view/1706022000000-screenshot.png"
 *                     downloadUrl: "http://localhost:5000/files/download/65afc1b2c8a9f3b9a1234568"
 *                     fileName: "screenshot.png"
 *                     fileSize: 845632
 *                     mimeType: "image/png"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileError'
 *       404:
 *         description: Content not found or no file attached
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileError'
 *             examples:
 *               contentNotFound:
 *                 value:
 *                   success: false
 *                   message: "Content not found"
 *               noFileAttached:
 *                 value:
 *                   success: false
 *                   message: "No file attached to this content"
 *       500:
 *         description: Server error while fetching preview
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileError'
 */
