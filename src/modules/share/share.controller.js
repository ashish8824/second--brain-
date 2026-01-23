import shareService from "./share.service.js";

/**
 * Create share link for content
 * POST /share/content/:contentId
 */
export const createContentShare = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.userId;
    const options = req.body;

    const share = await shareService.createContentShare(
      userId,
      contentId,
      options,
    );

    res.status(201).json({
      success: true,
      message: "Share link created successfully",
      data: {
        shareId: share._id,
        shareToken: share.shareToken,
        shareUrl: share.shareUrl,
        title: share.title,
        requirePassword: share.requirePassword,
        isPublic: share.isPublic,
        expiresAt: share.expiresAt,
        createdAt: share.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create share link for collection
 * POST /share/collection/:collectionId
 */
export const createCollectionShare = async (req, res, next) => {
  try {
    const { collectionId } = req.params;
    const userId = req.user.userId;
    const options = req.body;

    const share = await shareService.createCollectionShare(
      userId,
      collectionId,
      options,
    );

    res.status(201).json({
      success: true,
      message: "Collection share link created successfully",
      data: {
        shareId: share._id,
        shareToken: share.shareToken,
        shareUrl: share.shareUrl,
        title: share.title,
        requirePassword: share.requirePassword,
        isPublic: share.isPublic,
        expiresAt: share.expiresAt,
        createdAt: share.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get shared content (public access)
 * GET /shared/content/:token
 */
export const getSharedContent = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, email } = req.body;

    const accessOptions = {
      password,
      email,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    const result = await shareService.getSharedContent(token, accessOptions);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get shared collection (public access)
 * GET /shared/collection/:token
 */
export const getSharedCollection = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, email } = req.body;

    const accessOptions = {
      password,
      email,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    const result = await shareService.getSharedCollection(token, accessOptions);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all shares for current user
 * GET /share/my-shares
 */
export const getMyShares = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit, shareType, isActive } = req.query;

    const result = await shareService.getUserShares(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      shareType,
      isActive:
        isActive === "true" ? true : isActive === "false" ? false : undefined,
    });

    res.json({
      success: true,
      data: result.shares,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update share settings
 * PUT /share/:shareId
 */
export const updateShare = async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.userId;
    const updates = req.body;

    const share = await shareService.updateShare(userId, shareId, updates);

    res.json({
      success: true,
      message: "Share updated successfully",
      data: share,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke share link
 * POST /share/:shareId/revoke
 */
export const revokeShare = async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.userId;

    await shareService.revokeShare(userId, shareId);

    res.json({
      success: true,
      message: "Share link revoked successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete share permanently
 * DELETE /share/:shareId
 */
export const deleteShare = async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.userId;

    await shareService.deleteShare(userId, shareId);

    res.json({
      success: true,
      message: "Share deleted permanently",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get share analytics
 * GET /share/:shareId/analytics
 */
export const getShareAnalytics = async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.userId;

    const analytics = await shareService.getShareAnalytics(userId, shareId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};
