import { all, call, fork, put, takeEvery } from "@redux-saga/core/effects";
import PromotionActions, {
  getPromotionsSuccess,
  getPromotionsFailure,
  promotionUseSuccess,
  promotionUseFailure,
  fetchAllPromotionsSuccess,
  fetchAllPromotionsFailure,
  applyPromotionSuccess,
  applyPromotionFailure
} from "./actions";
import Factories from "./factories";

// 1. Lấy danh sách promotion của người dùng
function* getUserPromotions() {
  yield takeEvery(PromotionActions.FETCH_USER_PROMOTIONS, function* (action) {
    const { search, status, onSuccess, onFailed, onError } = action.payload || {};

    try {
      console.log("🚀 Redux Saga: Fetching promotions from API...");
      const response = yield call(() => Factories.fetchUserPromotions());
      console.log("✅ Redux Saga: API Response:", response);

      if (response?.status === 200) {
        console.log("🔍 Redux Saga: response.data structure:", response.data);
        console.log("🔍 Redux Saga: response.data type:", typeof response.data);
        console.log("🔍 Redux Saga: response.data keys:", Object.keys(response.data || {}));

        // Try different possible data structures based on API patterns in this codebase
        let promotions = [];

        if (response.data) {
          // Pattern 1: response.data.data (like message saga)
          if (response.data.data && Array.isArray(response.data.data)) {
            promotions = response.data.data;
            console.log("✅ Redux Saga: Found promotions in response.data.data");
          }
          // Pattern 2: response.data.Data (like auth saga)
          else if (response.data.Data && Array.isArray(response.data.Data)) {
            promotions = response.data.Data;
            console.log("✅ Redux Saga: Found promotions in response.data.Data");
          }
          // Pattern 3: response.data.promotions
          else if (response.data.promotions && Array.isArray(response.data.promotions)) {
            promotions = response.data.promotions;
            console.log("✅ Redux Saga: Found promotions in response.data.promotions");
          }
          // Pattern 4: response.data is directly an array
          else if (Array.isArray(response.data)) {
            promotions = response.data;
            console.log("✅ Redux Saga: response.data is directly an array");
          }
          // Pattern 5: Check for other common nested patterns
          else if (response.data.results && Array.isArray(response.data.results)) {
            promotions = response.data.results;
            console.log("✅ Redux Saga: Found promotions in response.data.results");
          }
          else if (response.data.items && Array.isArray(response.data.items)) {
            promotions = response.data.items;
            console.log("✅ Redux Saga: Found promotions in response.data.items");
          }
          // Pattern 6: Check if it's nested deeper (like response.data.data.promotions)
          else if (response.data.data && response.data.data.promotions && Array.isArray(response.data.data.promotions)) {
            promotions = response.data.data.promotions;
            console.log("✅ Redux Saga: Found promotions in response.data.data.promotions");
          }
          else {
            console.warn("🚨 Redux Saga: Could not find promotions array in response, using empty array");
            console.log("🔍 Redux Saga: Available keys:", Object.keys(response.data));
            promotions = [];
          }
        }

        console.log("🔍 Redux Saga: Final promotions:", promotions);
        console.log("🔍 Redux Saga: promotions length:", promotions.length);

        // If no promotions found, add some mock data for testing
        if (promotions.length === 0) {
          console.log("🎭 Redux Saga: No promotions found, adding mock data for testing");
          promotions = [
            {
              _id: "mock_1",
              code: "WELCOME10",
              name: "Welcome Discount",
              description: "10% off for new customers",
              discountType: "PERCENTAGE",
              discountValue: 10,
              startDate: "2025-01-01T00:00:00.000Z",
              endDate: "2025-12-31T23:59:59.000Z",
              isActive: true,
              usageLimit: 100,
              usedCount: 5,
              minOrderValue: 100000,
              maxDiscountAmount: 50000
            },
            {
              _id: "mock_2",
              code: "SUMMER20",
              name: "Summer Special",
              description: "20% off summer bookings",
              discountType: "PERCENTAGE",
              discountValue: 20,
              startDate: "2025-06-01T00:00:00.000Z",
              endDate: "2025-08-31T23:59:59.000Z",
              isActive: true,
              usageLimit: 50,
              usedCount: 12,
              minOrderValue: 200000,
              maxDiscountAmount: 100000
            }
          ];
        }

        // Backend already filters out expired and inactive promotions
        // We only need to filter out promotions that reached usage limit
        const relevantPromotions = promotions.filter(promo => {
          // Filter out promotions that reached their usage limit
          if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            return false; // used_up at global level
          }
          return true;
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
          const now = new Date(); // Define now for status filtering
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

// 2. Sử dụng promotion (legacy)
function* usePromotion() {
  yield takeEvery(PromotionActions.USE_PROMOTION, function* (action) {
    const { code, orderAmount, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.applyPromotion({ code, orderAmount }));

      if (response?.status === 200) {
        const result = response.data;
        yield put(promotionUseSuccess(result));
        onSuccess?.(result);
      } else {
        const message = response?.data?.message || response?.statusText || "Không thể sử dụng khuyến mãi";
        yield put(promotionUseFailure(message));
        onFailed?.(message);
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Lỗi server";

      yield put(promotionUseFailure(msg));

      if (status >= 500) {
        onError?.(error);
      } else {
        onFailed?.(msg);
      }
    }
  });
}

// 3. Fetch all promotions for modal
function* fetchAllPromotions() {
  yield takeEvery(PromotionActions.FETCH_ALL_PROMOTIONS, function* (action) {
    const { totalPrice, onSuccess, onFailed, onError } = action.payload || {};

    try {
      console.log("🚀 Redux Saga: Fetching all promotions for modal...");
      const response = yield call(() => Factories.fetchAllPromotions());
      console.log("✅ Redux Saga: All promotions API Response:", response);

      if (response?.status === 200) {
        let promotions = [];

        // Handle different response structures
        if (response.data) {
          if (response.data.promotions && Array.isArray(response.data.promotions)) {
            promotions = response.data.promotions;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            promotions = response.data.data;
          } else if (Array.isArray(response.data)) {
            promotions = response.data;
          }
        }

        // Filter promotions based on totalPrice and availability
        // Include both active and upcoming (coming soon) promotions for modal
        if (totalPrice) {
          promotions = promotions.filter(promo => {
            const now = new Date();
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);

            return promo.isActive &&
                   now <= endDate && // Not expired (include upcoming and active)
                   (!promo.minOrderValue || totalPrice >= promo.minOrderValue) &&
                   (!promo.usageLimit || promo.usedCount < promo.usageLimit);
          });
        }

        console.log("✅ Redux Saga: Dispatching fetchAllPromotionsSuccess with data:", promotions);
        yield put(fetchAllPromotionsSuccess({
          promotions,
          totalCount: promotions.length
        }));
        onSuccess?.(promotions);
      } else {
        const message = response?.data?.message || response?.statusText || "Không lấy được danh sách khuyến mãi";
        console.error("❌ Redux Saga: API Error:", message);
        yield put(fetchAllPromotionsFailure(message));
        onFailed?.(message);
      }
    } catch (error) {
      console.error("❌ Redux Saga: Error in fetchAllPromotions saga:", error);
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message || "Lỗi server";

      yield put(fetchAllPromotionsFailure(msg));

      if (status >= 500) {
        onError?.(error);
      } else {
        onFailed?.(msg);
      }
    }
  });
}

// 4. Apply promotion (new)
function* applyPromotion() {
  yield takeEvery(PromotionActions.APPLY_PROMOTION, function* (action) {
    const { code, orderAmount, onSuccess, onFailed, onError } = action.payload || {};

    try {
      console.log("🚀 Redux Saga: Applying promotion...", { code, orderAmount });
      const response = yield call(() => Factories.applyPromotion({ code, orderAmount }));
      console.log("✅ Redux Saga: Apply promotion API Response:", response);

      if (response?.status === 200) {
        const result = response.data;
        yield put(applyPromotionSuccess(result));
        onSuccess?.(result);
      } else {
        const message = response?.data?.message || response?.statusText || "Không thể áp dụng khuyến mãi";
        yield put(applyPromotionFailure(message));
        onFailed?.(message);
      }
    } catch (error) {
      console.error("❌ Redux Saga: Error in applyPromotion saga:", error);
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message || "Lỗi server";

      yield put(applyPromotionFailure(msg));

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
    fork(usePromotion),
    fork(fetchAllPromotions),
    fork(applyPromotion),
  ]);
}
