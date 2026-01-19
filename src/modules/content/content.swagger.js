/**
 * @swagger
 * /content:
 *   post:
 *     summary: Create a new content item
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [text, link, image, document]
 *                 example: text
 *               title:
 *                 type: string
 *                 example: H1B Visa Notes
 *               body:
 *                 type: string
 *                 example: Key points about visa policies
 *               sourceUrl:
 *                 type: string
 *                 example: https://example.com/article
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["visa", "immigration"]
 *               metadata:
 *                 type: object
 *                 example:
 *                   platform: twitter
 *                   author: John Doe
 *     responses:
 *       201:
 *         description: Content created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /content:
 *   get:
 *     summary: Get all content for the logged-in user (Paginated & Filtered)
 *     description: >
 *       Fetch user content with pagination, filtering, and sorting support.
 *       All query parameters are optional.
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         description: Page number (1-based)
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 20
 *         description: Number of items per page (max 100)
 *
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [text, link, image, document]
 *         description: Filter by content type
 *
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *           example: visa
 *         description: Filter by a specific tag
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: createdAt
 *         description: Field to sort by
 *
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *         description: Sort order
 *
 *     responses:
 *       200:
 *         description: Paginated list of content
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - _id: "65a9f5c9e8c0d9b1a3a12345"
 *                   type: "text"
 *                   title: "H1B Visa Notes"
 *                   body: "Important policy changes"
 *                   tags: ["visa", "immigration"]
 *                   createdAt: "2026-01-18T12:30:00.000Z"
 *               pagination:
 *                 totalItems: 42
 *                 totalPages: 3
 *                 currentPage: 1
 *                 limit: 20
 *
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /content/{id}:
 *   get:
 *     summary: Get a single content item by ID
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Content ID
 *         schema:
 *           type: string
 *           example: 65afc1b2c8a9f3b9a1234567
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 *       404:
 *         description: Content not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /content/{id}:
 *   put:
 *     summary: Update a content item
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Content ID
 *         schema:
 *           type: string
 *           example: 65afc1b2c8a9f3b9a1234567
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Notes
 *               body:
 *                 type: string
 *                 example: Updated content body
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["updated", "notes"]
 *               metadata:
 *                 type: object
 *                 example:
 *                   source: blog
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       404:
 *         description: Content not found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /content/{id}:
 *   delete:
 *     summary: Delete a content item (soft delete)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Content ID
 *         schema:
 *           type: string
 *           example: 65afc1b2c8a9f3b9a1234567
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       404:
 *         description: Content not found
 *       401:
 *         description: Unauthorized
 */
