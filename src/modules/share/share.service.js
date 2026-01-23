import Share from "../../models/share.model.js";
import Content from "../../models/content.model.js";
import Collection from "../../models/collection.model.js";
import ApiError from "../../utils/apiError.js";
import bcrypt from "bcryptjs";

/**
 * Share Service
 * Handles content and collection sharing
 */
class ShareService {
  /**
   * Create a share link for content
   */
  async createContentShare(userId, contentId, options = {}) {
    // Verify ownership
    const content = await Content.findOne({
      _id: contentId,
      userId,
      isDeleted: false,
    });

    if (!content) {
      throw new ApiError(404, "Content not found");
    }

    // Check if active share already exists
    const existingShare = await Share.findOne({
      userId,
      contentId,
      shareType: "content",
      isActive: true,
    });

    if (existingShare) {
      console.log("[Share] Returning existing share link");
      return existingShare;
    }

    // Prepare share data
    const shareData = {
      userId,
      contentId,
      shareType: "content",
      title: options.title || content.title,
      description: options.description || content.summary,
      isPublic: options.isPublic !== undefined ? options.isPublic : true,
      expiresAt: options.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
        : null,
    };

    // Password protection
    if (options.password) {
      shareData.requirePassword = true;
      shareData.password = await bcrypt.hash(options.password, 10);
    }

    // Email whitelist
    if (options.allowedEmails && options.allowedEmails.length > 0) {
      shareData.allowedEmails = options.allowedEmails;
      shareData.isPublic = false;
    }

    // Create share
    const share = await Share.create(shareData);

    console.log(`[Share] Created content share: ${share.shareToken}`);

    return share;
  }

  /**
   * Create a share link for collection
   */
  async createCollectionShare(userId, collectionId, options = {}) {
    // Verify ownership
    const collection = await Collection.findOne({
      _id: collectionId,
      userId,
    });

    if (!collection) {
      throw new ApiError(404, "Collection not found");
    }

    // Check if active share already exists
    const existingShare = await Share.findOne({
      userId,
      collectionId,
      shareType: "collection",
      isActive: true,
    });

    if (existingShare) {
      console.log("[Share] Returning existing share link");
      return existingShare;
    }

    // Prepare share data
    const shareData = {
      userId,
      collectionId,
      shareType: "collection",
      title: options.title || collection.name,
      description: options.description || collection.description,
      isPublic: options.isPublic !== undefined ? options.isPublic : true,
      expiresAt: options.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
        : null,
    };

    // Password protection
    if (options.password) {
      shareData.requirePassword = true;
      shareData.password = await bcrypt.hash(options.password, 10);
    }

    // Email whitelist
    if (options.allowedEmails && options.allowedEmails.length > 0) {
      shareData.allowedEmails = options.allowedEmails;
      shareData.isPublic = false;
    }

    const share = await Share.create(shareData);

    console.log(`[Share] Created collection share: ${share.shareToken}`);

    return share;
  }

  /**
   * Get shared content by token (public access)
   */
  async getSharedContent(shareToken, accessOptions = {}) {
    const share = await Share.findOne({
      shareToken,
      shareType: "content",
    })
      .populate("userId", "username email")
      .select("+password");

    if (!share) {
      throw new ApiError(404, "Share link not found");
    }

    // Validate share
    const validation = share.isValid();
    if (!validation.valid) {
      throw new ApiError(403, validation.reason);
    }

    // Check email whitelist
    if (share.allowedEmails.length > 0) {
      if (
        !accessOptions.email ||
        !share.allowedEmails.includes(accessOptions.email)
      ) {
        throw new ApiError(403, "Access denied. This link is private.");
      }
    }

    // Check password
    if (share.requirePassword) {
      if (!accessOptions.password) {
        throw new ApiError(401, "Password required");
      }

      const isValidPassword = await bcrypt.compare(
        accessOptions.password,
        share.password,
      );
      if (!isValidPassword) {
        throw new ApiError(401, "Invalid password");
      }
    }

    // Get the content
    const content = await Content.findOne({
      _id: share.contentId,
      isDeleted: false,
    }).select("-userId -contentHash");

    if (!content) {
      throw new ApiError(404, "Content not found or has been deleted");
    }

    // Record the view
    await share.recordView(
      accessOptions.ip || "unknown",
      accessOptions.userAgent || "unknown",
    );

    return {
      share: {
        title: share.title,
        description: share.description,
        createdAt: share.createdAt,
        viewCount: share.viewCount,
        sharedBy: share.userId.username || share.userId.email,
      },
      content,
    };
  }

  /**
   * Get shared collection by token
   */
  async getSharedCollection(shareToken, accessOptions = {}) {
    const share = await Share.findOne({
      shareToken,
      shareType: "collection",
    })
      .populate("userId", "username email")
      .select("+password");

    if (!share) {
      throw new ApiError(404, "Share link not found");
    }

    // Validate share
    const validation = share.isValid();
    if (!validation.valid) {
      throw new ApiError(403, validation.reason);
    }

    // Check access controls
    if (share.allowedEmails.length > 0) {
      if (
        !accessOptions.email ||
        !share.allowedEmails.includes(accessOptions.email)
      ) {
        throw new ApiError(403, "Access denied. This link is private.");
      }
    }

    if (share.requirePassword) {
      if (!accessOptions.password) {
        throw new ApiError(401, "Password required");
      }

      const isValidPassword = await bcrypt.compare(
        accessOptions.password,
        share.password,
      );
      if (!isValidPassword) {
        throw new ApiError(401, "Invalid password");
      }
    }

    // Get collection with content
    const collection = await Collection.findById(share.collectionId);

    if (!collection) {
      throw new ApiError(404, "Collection not found or has been deleted");
    }

    // Get all content in collection
    const content = await Content.find({
      collections: share.collectionId,
      isDeleted: false,
    }).select("-userId -contentHash");

    // Record the view
    await share.recordView(
      accessOptions.ip || "unknown",
      accessOptions.userAgent || "unknown",
    );

    return {
      share: {
        title: share.title,
        description: share.description,
        createdAt: share.createdAt,
        viewCount: share.viewCount,
        sharedBy: share.userId.username || share.userId.email,
      },
      collection: {
        name: collection.name,
        description: collection.description,
        contentCount: content.length,
      },
      content,
    };
  }

  /**
   * Get all shares created by a user
   */
  async getUserShares(userId, options = {}) {
    const { page = 1, limit = 20, shareType, isActive } = options;

    const filter = { userId };

    if (shareType) {
      filter.shareType = shareType;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [shares, total] = await Promise.all([
      Share.find(filter)
        .populate("contentId", "title type sourceUrl")
        .populate("collectionId", "name description")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Share.countDocuments(filter),
    ]);

    // Add share URLs
    const sharesWithUrls = shares.map((share) => ({
      ...share,
      shareUrl: this.buildShareUrl(share.shareToken),
    }));

    return {
      shares: sharesWithUrls,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  /**
   * Update share settings
   */
  async updateShare(userId, shareId, updates) {
    const share = await Share.findOne({
      _id: shareId,
      userId,
    });

    if (!share) {
      throw new ApiError(404, "Share not found");
    }

    // Update allowed fields
    const allowedUpdates = [
      "title",
      "description",
      "isActive",
      "expiresAt",
      "allowedEmails",
    ];

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        share[field] = updates[field];
      }
    });

    // Handle password update
    if (updates.password !== undefined) {
      if (updates.password) {
        share.requirePassword = true;
        share.password = await bcrypt.hash(updates.password, 10);
      } else {
        share.requirePassword = false;
        share.password = undefined;
      }
    }

    await share.save();

    console.log(`[Share] Updated share: ${shareId}`);

    return share;
  }

  /**
   * Revoke (deactivate) a share
   */
  async revokeShare(userId, shareId) {
    const share = await Share.findOneAndUpdate(
      { _id: shareId, userId },
      { isActive: false },
      { new: true },
    );

    if (!share) {
      throw new ApiError(404, "Share not found");
    }

    console.log(`[Share] Revoked share: ${shareId}`);

    return share;
  }

  /**
   * Delete a share permanently
   */
  async deleteShare(userId, shareId) {
    const share = await Share.findOneAndDelete({
      _id: shareId,
      userId,
    });

    if (!share) {
      throw new ApiError(404, "Share not found");
    }

    console.log(`[Share] Deleted share: ${shareId}`);

    return { message: "Share deleted successfully" };
  }

  /**
   * Get share analytics
   */
  async getShareAnalytics(userId, shareId) {
    const share = await Share.findOne({
      _id: shareId,
      userId,
    });

    if (!share) {
      throw new ApiError(404, "Share not found");
    }

    return {
      totalViews: share.viewCount,
      uniqueViewers: share.uniqueViewers.length,
      lastViewedAt: share.lastViewedAt,
      createdAt: share.createdAt,
      isActive: share.isActive,
      expiresAt: share.expiresAt,
      viewHistory: share.uniqueViewers.map((v) => ({
        viewedAt: v.viewedAt,
        userAgent: v.userAgent,
      })),
    };
  }

  /**
   * Build share URL
   */
  buildShareUrl(token) {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return `${baseUrl}/shared/${token}`;
  }
}

export default new ShareService();
