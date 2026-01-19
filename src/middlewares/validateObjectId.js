import mongoose from "mongoose";
import ApiError from "../utils/apiError.js";

const validateObjectId =
  (paramName = "id") =>
  (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      return next(new ApiError(400, "Invalid content ID"));
    }
    next();
  };

export default validateObjectId;
