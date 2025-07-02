import { all, call, fork, put, takeEvery } from "@redux-saga/core/effects";
import PromotionActions, { getPromotionsSuccess, getPromotionsFailure, usePromotionSuccess, usePromotionFailure } from "./actions";
import Factories from "./factories";

// 1. Lấy danh sách promotion của người dùng
function* getUserPromotions() {
  yield takeEvery(PromotionActions.FETCH_USER_PROMOTIONS, function* (action) {
    const { page, limit, search, status, userId, onSuccess, onFailed, onError } = action.payload || {};

    try {
      console.log("🚀 Redux Saga: Fetching promotions from API...");
      const response = yield call(() => Factories.fetchUserPromotions());
      console.log("✅ Redux Saga: API Response:", response);

      if (response?.status === 200) {
        console.log("✅ response.data:", response.data);
        let promotions = response.data.promotions || []; // Backend trả về array trực tiếp
        
        // Filter to show only active and upcoming promotions
        const now = new Date();
        const relevantPromotions = promotions.filter(promo => {
          const startDate = new Date(promo.startDate);
          const endDate = new Date(promo.endDate);
          
          if (now < startDate) {
            return promo.isActive; // upcoming
          } else if (now > endDate) {
            return false; // expired
          } else if (!promo.isActive) {
            return false; // inactive
          } else if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            return false; // used_up
          } else {
            return promo.isActive; // active
          }
        });
        
        // Apply client-side filtering if needed
        let filteredPromotions = relevantPromotions;
        if (search) {
          filteredPromotions = relevantPromotions.filter(promo =>
            promo.name?.toLowerCase().includes(search.toLowerCase()) ||
            promo.code?.toLowerCase().includes(search.toLowerCase()) ||
            promo.description?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        if (status) {
          filteredPromotions = filteredPromotions.filter(promo => {
            if (status === "active") {
              const startDate = new Date(promo.startDate);
              const endDate = new Date(promo.endDate);
              return now >= startDate && now <= endDate && promo.isActive;
            } else if (status === "upcoming") {
              const startDate = new Date(promo.startDate);
              return now < startDate;
            }
            return true;
          });
        }
        
        console.log("✅ Redux Saga: Dispatching success with data:", filteredPromotions);
        yield put(getPromotionsSuccess({
          promotions: filteredPromotions,
          totalCount: filteredPromotions.length
        }));
        onSuccess?.(filteredPromotions);
      } else {
        const message = response?.data?.message || response?.statusText || "Không lấy được danh sách khuyến mãi";
        console.error("❌ Redux Saga: API Error:", message);
        yield put(getPromotionsFailure(message));
        onFailed?.(message);
      }
    } catch (error) {
      console.error("❌ Redux Saga: Error in getUserPromotions saga:", error);
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message || "Lỗi server";
      
      yield put(getPromotionsFailure(msg));

      if (status >= 500) {
        onError?.(error);
      } else {
        onFailed?.(msg);
      }
    }
  });
}

// 2. Sử dụng promotion
function* applyPromotion() {
  yield takeEvery(PromotionActions.USE_PROMOTION, function* (action) {
    const { code, orderAmount, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.applyPromotion({ code, orderAmount }));

      if (response?.status === 200) {
        const result = response.data;
        yield put(usePromotionSuccess(result));
        onSuccess?.(result);
      } else {
        const message = response?.data?.message || response?.statusText || "Không thể sử dụng khuyến mãi";
        yield put(usePromotionFailure(message));
        onFailed?.(message);
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Lỗi server";
      
      yield put(usePromotionFailure(msg));

      if (status >= 500) {
        onError?.(error);
      } else {
        onFailed?.(msg);
      }
    }
  });
}

export default function* promotionSaga() {
  yield all([
    fork(getUserPromotions),
    fork(applyPromotion),
  ]);
}
