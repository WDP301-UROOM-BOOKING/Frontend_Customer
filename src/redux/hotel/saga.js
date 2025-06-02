import { all, call, fork, put, takeEvery } from "@redux-saga/core/effects";
import HotelActions from "./actions";
import Factories from "./factories";

function* getFavoriteHotels() {
  yield takeEvery(HotelActions.FETCH_FAVORITE_HOTELS, function* (action) {
    const { ids,paramsQuery, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.fetch_favorite_hotel(ids, paramsQuery));

      console.log('status: ', response?.status);
      console.log('data: ', response?.data?.hotels);

      if (response?.status === 200) {
        const hotels = response.data.hotels;

        yield put({
          type: HotelActions.FETCH_FAVORITE_HOTELS_SUCCESS,
          payload: hotels, 
        });

        onSuccess && onSuccess(hotels);
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.MsgNo;

      console.log("status: ", status);
      console.log("msg: ", msg);

      if (status >= 500) {
        onError && onError(error);
      } else {
        onFailed && onFailed(msg);
      }
    }
  });
}

function* getHotelDetails() {
  yield takeEvery(HotelActions.FETCH_DETAIL_HOTEL, function* (action) {
    const { hotelId, userId, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.fetch_detail_hotel(hotelId, userId));
      if (response?.status === 200) {
        const hotel = response.data.hotel;
        const isFavorite= response.data.isFavorite;
        yield put({
          type: HotelActions.FETCH_DETAIL_HOTEL_SUCCESS,
          payload: hotel,
        });
        onSuccess?.(hotel, isFavorite);
      } else {
        onFailed?.("Failed to fetch hotel details");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      const status = error.response?.status;
      if (status >= 500) {
        onError?.(error);
      } else {
        onFailed?.(msg);
      }
    }
  });
}
function* getAllHotels() {
  yield takeEvery(HotelActions.FETCH_ALL_HOTEL, function* (action) {
    const { onSuccess, onFailed, onError } = action.payload || {};

    try {
      const response = yield call(() => Factories.get_all_hotels());

      console.log("Get all hotels response:", response);

      if (response?.status === 200) {
        const hotels = response.data.hotels;

        yield put({
          type: HotelActions.FETCH_All_HOTEL_SUCCESS,
          payload: hotels,
        });

        onSuccess?.(hotels);
      } else {
        onFailed?.(response?.data?.message || "Failed to get hotels");
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Something went wrong";

      console.log("Get all hotels error:", msg);

      if (status >= 500) {
        onError?.(error);
      } else {
        onFailed?.(msg);
      }
    }
  });
}
function* getTop3Hotels() {
  yield takeEvery(HotelActions.FETCH_TOP3_HOTEL, function* (action) {
    const { onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.get_top3_hotels());

      console.log("Top 3 hotels response:", response);

      if (response?.status === 200) {
        const topHotels = response.data || []; 

        yield put({
          type: HotelActions.FETCH_TOP3_HOTEL_SUCCESS,
          payload: topHotels,
        });

        onSuccess?.(topHotels);
      } else {
        onFailed?.(response?.data?.message || "Không lấy được top 3 khách sạn");
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Có lỗi xảy ra khi lấy top 3 khách sạn";

      console.log("Top 3 hotels error:", msg);

      if (status >= 500) {
        onError?.(error);
      } else {
        onFailed?.(msg);
      }
    }
  });
}

export default function* userSaga() {
  yield all([
    fork(getFavoriteHotels),
    fork(getHotelDetails),
    fork(getAllHotels),
    fork(getTop3Hotels),
  ]);
}
