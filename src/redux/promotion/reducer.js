import PromotionActions from "./actions";

// Mock data for demo purposes
const mockPromotions = [
  {
    _id: "1",
    code: "SAVE20",
    name: "Save $20 Deal",
    description: "Save $20 on orders over $100",
    discountType: "FIXED_AMOUNT",
    discountValue: 20,
    minOrderAmount: 100,
    maxDiscountAmount: 20,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    isActive: true,
    usageLimit: 100,
    usedCount: 25
  },
  {
    _id: "2",
    code: "PERCENT10",
    name: "10% Off Everything",
    description: "10% off on all bookings",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 50,
    maxDiscountAmount: 50,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    isActive: true,
    usageLimit: null,
    usedCount: 0
  },
  {
    _id: "3",
    code: "SUMMER25",
    name: "Summer Special",
    description: "25% off summer bookings - Starting July 1st",
    discountType: "PERCENTAGE",
    discountValue: 25,
    minOrderAmount: 200,
    maxDiscountAmount: 100,
    startDate: "2025-07-01",
    endDate: "2025-08-31",
    isActive: true,
    usageLimit: 50,
    usedCount: 0
  },
  {
    _id: "4",
    code: "NEWUSER30",
    name: "New User Bonus",
    description: "$30 off for new customers - Coming soon!",
    discountType: "FIXED_AMOUNT",
    discountValue: 30,
    minOrderAmount: 150,
    maxDiscountAmount: 30,
    startDate: "2025-08-01",
    endDate: "2025-12-31",
    isActive: true,
    usageLimit: 200,
    usedCount: 0
  }
];

// Filter mock data to show only active and upcoming
const now = new Date();
const filteredMockPromotions = mockPromotions.filter(promo => {
  const startDate = new Date(promo.startDate);
  const endDate = new Date(promo.endDate);
  
  if (now < startDate) {
    return true; // upcoming
  } else if (now > endDate) {
    return false; // expired
  } else if (!promo.isActive) {
    return false; // inactive
  } else if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return false; // used_up
  } else {
    return true; // active
  }
});

const initialState = {
  promotions: filteredMockPromotions,
  totalCount: filteredMockPromotions.length,
  loading: false,
  error: null,

  // For modal promotions
  allPromotions: [],
  allPromotionsLoading: false,
  allPromotionsError: null,

  // For apply promotion
  applyLoading: false,
  applyError: null,
  appliedPromotion: null,
};

const promotionReducer = (state = initialState, action) => {
  switch (action.type) {
    case PromotionActions.FETCH_USER_PROMOTIONS:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case PromotionActions.FETCH_USER_PROMOTIONS_SUCCESS:
      console.log("🔍 Reducer: FETCH_USER_PROMOTIONS_SUCCESS payload:", action.payload);

      // Ensure we always get an array
      let promotionsData = action.payload.promotions || action.payload;
      if (!Array.isArray(promotionsData)) {
        console.warn("🚨 Reducer: promotions data is not an array:", promotionsData);
        promotionsData = [];
      }

      return {
        ...state,
        loading: false,
        promotions: promotionsData,
        totalCount: action.payload.totalCount || promotionsData.length || 0,
        error: null,
      };

    case PromotionActions.FETCH_USER_PROMOTIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case PromotionActions.USE_PROMOTION_SUCCESS:
      return {
        ...state,
        promotions: state.promotions.map((promotion) =>
          promotion._id === action.payload._id
            ? { ...promotion, isUsed: true, usedAt: new Date().toISOString() }
            : promotion
        ),
      };

    // Fetch all promotions for modal
    case PromotionActions.FETCH_ALL_PROMOTIONS:
      return {
        ...state,
        allPromotionsLoading: true,
        allPromotionsError: null,
      };

    case PromotionActions.FETCH_ALL_PROMOTIONS_SUCCESS:
      console.log("🔍 Reducer: FETCH_ALL_PROMOTIONS_SUCCESS payload:", action.payload);

      let allPromotionsData = action.payload.promotions || action.payload;
      if (!Array.isArray(allPromotionsData)) {
        console.warn("🚨 Reducer: all promotions data is not an array:", allPromotionsData);
        allPromotionsData = [];
      }

      return {
        ...state,
        allPromotionsLoading: false,
        allPromotions: allPromotionsData,
        allPromotionsError: null,
      };

    case PromotionActions.FETCH_ALL_PROMOTIONS_FAILURE:
      return {
        ...state,
        allPromotionsLoading: false,
        allPromotionsError: action.payload,
      };

    // Apply promotion
    case PromotionActions.APPLY_PROMOTION:
      return {
        ...state,
        applyLoading: true,
        applyError: null,
        appliedPromotion: null,
      };

    case PromotionActions.APPLY_PROMOTION_SUCCESS:
      return {
        ...state,
        applyLoading: false,
        appliedPromotion: action.payload,
        applyError: null,
      };

    case PromotionActions.APPLY_PROMOTION_FAILURE:
      return {
        ...state,
        applyLoading: false,
        applyError: action.payload,
        appliedPromotion: null,
      };

    // Clear applied promotion
    case PromotionActions.CLEAR_APPLIED_PROMOTION:
      return {
        ...state,
        appliedPromotion: null,
        applyError: null,
      };

    default:
      return state;
  }
};

export default promotionReducer;
