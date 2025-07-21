const PromotionActions = {
  FETCH_USER_PROMOTIONS: "FETCH_USER_PROMOTIONS",
  FETCH_USER_PROMOTIONS_SUCCESS: "FETCH_USER_PROMOTIONS_SUCCESS",
  FETCH_USER_PROMOTIONS_FAILURE: "FETCH_USER_PROMOTIONS_FAILURE",

  // Fetch all promotions for modal
  FETCH_ALL_PROMOTIONS: "FETCH_ALL_PROMOTIONS",
  FETCH_ALL_PROMOTIONS_SUCCESS: "FETCH_ALL_PROMOTIONS_SUCCESS",
  FETCH_ALL_PROMOTIONS_FAILURE: "FETCH_ALL_PROMOTIONS_FAILURE",

  // Apply promotion
  APPLY_PROMOTION: "APPLY_PROMOTION",
  APPLY_PROMOTION_SUCCESS: "APPLY_PROMOTION_SUCCESS",
  APPLY_PROMOTION_FAILURE: "APPLY_PROMOTION_FAILURE",

  // Legacy USE_PROMOTION actions (keep for backward compatibility)
  USE_PROMOTION: "USE_PROMOTION",
  USE_PROMOTION_SUCCESS: "USE_PROMOTION_SUCCESS",
  USE_PROMOTION_FAILURE: "USE_PROMOTION_FAILURE",
};

// Action creators
export const getPromotions = (params) => ({
  type: PromotionActions.FETCH_USER_PROMOTIONS,
  payload: params
});

export const getPromotionsSuccess = (data) => ({
  type: PromotionActions.FETCH_USER_PROMOTIONS_SUCCESS,
  payload: data
});

export const getPromotionsFailure = (error) => ({
  type: PromotionActions.FETCH_USER_PROMOTIONS_FAILURE,
  payload: error
});

export const usePromotion = (promotionId, data) => ({
  type: PromotionActions.USE_PROMOTION,
  payload: { promotionId, data }
});

export const usePromotionSuccess = (data) => ({
  type: PromotionActions.USE_PROMOTION_SUCCESS,
  payload: data
});

export const usePromotionFailure = (error) => ({
  type: PromotionActions.USE_PROMOTION_FAILURE,
  payload: error
});

// Alternative exports with different names to avoid ESLint hook warnings
export const promotionUseSuccess = (data) => ({
  type: PromotionActions.USE_PROMOTION_SUCCESS,
  payload: data
});

export const promotionUseFailure = (error) => ({
  type: PromotionActions.USE_PROMOTION_FAILURE,
  payload: error
});

// Fetch all promotions for modal
export const fetchAllPromotions = (params) => ({
  type: PromotionActions.FETCH_ALL_PROMOTIONS,
  payload: params
});

export const fetchAllPromotionsSuccess = (data) => ({
  type: PromotionActions.FETCH_ALL_PROMOTIONS_SUCCESS,
  payload: data
});

export const fetchAllPromotionsFailure = (error) => ({
  type: PromotionActions.FETCH_ALL_PROMOTIONS_FAILURE,
  payload: error
});

// Apply promotion
export const applyPromotion = (params) => ({
  type: PromotionActions.APPLY_PROMOTION,
  payload: params
});

export const applyPromotionSuccess = (data) => ({
  type: PromotionActions.APPLY_PROMOTION_SUCCESS,
  payload: data
});

export const applyPromotionFailure = (error) => ({
  type: PromotionActions.APPLY_PROMOTION_FAILURE,
  payload: error
});

export default PromotionActions;
