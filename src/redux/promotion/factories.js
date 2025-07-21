import ApiConstants from "../../adapter/ApiConstants";
import api from "../../libs/api/index";

const Factories = {
  fetchUserPromotions: () => {
    return api.get(ApiConstants.FETCH_USER_PROMOTIONS);
  },

  // Claim promotion
  claimPromotion: (data) => {
    return api.post(ApiConstants.CLAIM_PROMOTION, data);
  },

  // Fetch all promotions for modal (public endpoint)
  fetchAllPromotions: () => {
    // Note: totalPrice filtering will be done in saga after fetching all promotions
    return api.get(ApiConstants.FETCH_ALL_PROMOTIONS);
  },

  // Apply promotion
  applyPromotion: (data) => {
    return api.post(ApiConstants.USE_PROMOTION, data);
  },

  // Legacy method (keep for backward compatibility)
  usePromotion: (data) => {
    return api.post(ApiConstants.USE_PROMOTION, data);
  },
};

export default Factories;
