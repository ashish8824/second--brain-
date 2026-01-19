/**
 * @swagger
 * /collections:
 *   post:
 *     summary: Create a new collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: Immigration
 *             description: Visa related notes
 *     responses:
 *       201:
 *         description: Collection created
 *       409:
 *         description: Collection already exists
 *
 *   get:
 *     summary: Get all collections for user
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of collections
 *
 * /collections/{id}:
 *   put:
 *     summary: Update collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             name: Immigration Notes
 *     responses:
 *       200:
 *         description: Collection updated
 *
 *   delete:
 *     summary: Delete collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Collection deleted
 *
 * /collections/{id}/content:
 *   get:
 *     summary: Get content inside a collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Content list
 */

/**
 * @swagger
 * /content/{contentId}/collections/{collectionId}:
 *   put:
 *     summary: Add content to a collection
 *     description: Assign an existing content item to a collection. Operation is idempotent.
 *     tags: [Content, Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection ID
 *
 *     responses:
 *       200:
 *         description: Content successfully added to collection
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: "696dc241f9032f7beae6d15b"
 *                 collections:
 *                   - "696dccd208d9c9a07c7a19df"
 *
 *       400:
 *         description: Invalid content or collection ID
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Content not found
 */
