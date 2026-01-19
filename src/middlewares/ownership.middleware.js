import ApiError from "../utils/apiError.js";

/**
 * Generic ownership validator
 * @param {MongooseModel} Model
 * @param {string} paramKey - req.params key (e.g. "id", "contentId")
 */
const validateOwnership = (Model, paramKey = "id") => {
  return async (req, res, next) => {
    const resourceId = req.params[paramKey];
    const userId = req.user.userId;

    const exists = await Model.exists({
      _id: resourceId,
      userId,
      isDeleted: false,
    });

    if (!exists) {
      return next(new ApiError(404, "Resource not found or access denied"));
    }

    next();
  };
};

export default validateOwnership;
