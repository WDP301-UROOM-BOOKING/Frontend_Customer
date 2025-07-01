import ApiConstants from "../../adapter/ApiConstants";
import api from "../../libs/api/index";

const Factories = {
  fetchUserPromotions: () => {
    return api.get(ApiConstants.FETCH_USER_PROMOTIONS);
  },
  applyPromotion: (data) => {
    return api.post(ApiConstants.USE_PROMOTION, data);
  },
};

export default Factories;
