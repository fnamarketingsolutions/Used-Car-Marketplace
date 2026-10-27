import User from "../models/User.js";

/** Seller IDs that must not appear in public browse results. */
export const getHiddenSellerIds = async () => {
  const hidden = await User.find({
    accountStatus: { $in: ["suspended", "blocked"] },
  }).select("_id");
  return hidden.map((u) => u._id);
};

export const publicListingFilter = async (extra = {}) => {
  const hiddenSellerIds = await getHiddenSellerIds();
  return {
    status: "Live",
    seller: { $nin: hiddenSellerIds },
    ...extra,
  };
};
