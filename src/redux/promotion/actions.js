const PromotionActions = {
  FETCH_USER_PROMOTIONS: "FETCH_USER_PROMOTIONS",
  FETCH_USER_PROMOTIONS_SUCCESS: "FETCH_USER_PROMOTIONS_SUCCESS",
  FETCH_USER_PROMOTIONS_FAILURE: "FETCH_USER_PROMOTIONS_FAILURE",
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

export default PromotionActions;
