/**
 * @swagger
 * /ai/content/{contentId}/embedding:
 *   post:
 *     summary: Generate AI embedding for a content item
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Embedding generated successfully
 *       400:
 *         description: Content has no embeddable text
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * /ai/semantic-search:
 *   get:
 *     summary: Semantic search across user content
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Ranked semantic search results
 */
