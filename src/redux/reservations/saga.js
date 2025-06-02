import { all, call, fork, put, takeEvery } from "@redux-saga/core/effects";
import ReservationActions from "./actions";
import Factories from "./factories";
function* getUserReservations() {
  yield takeEvery(ReservationActions.FETCH_USER_RESERVATIONS, function* (action) {
    const { userId, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.fetchUserReservations(userId));

      if (response?.status === 200 && response?.data?.error === false) {
        const reservations = response.data?.data;
        yield put({
          type: ReservationActions.FETCH_USER_RESERVATIONS_SUCCESS,
          payload: reservations,
        });
        onSuccess?.(reservations);
      } else {
        onFailed?.(response?.data?.message || "Không lấy được danh sách đặt phòng");
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Lỗi server";
      if (status >= 500) {
        onError?.(error);
      } else {
        onFailed?.(msg);
      }
    }
  });
}
function* getReservationDetail() {
  yield takeEvery(ReservationActions.FETCH_RESERVATION_DETAIL, function* (action) {
    const { reservationId, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() =>
        Factories.fetchReservationDetail(reservationId)
      );

      if (response?.status === 200 && response?.data?.error === false) {
        const reservationDetail = response.data?.data;

        yield put({
          type: ReservationActions.FETCH_RESERVATION_DETAIL_SUCCESS,
          payload: reservationDetail,
        });

        onSuccess?.(reservationDetail);
      } else {
        onFailed?.(response?.data?.message || "Không lấy được chi tiết đặt phòng");
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Lỗi server";
      if (status >= 500) {
        onError?.(error);
      } else {
        onFailed?.(msg);
      }
    }
  });
}
function* updateReservation() {
  yield takeEvery(ReservationActions.UPDATE_RESERVATIONS, function* (action) {
    const { reservationId, data, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() =>
        Factories.updateReservationById(reservationId, data)
      );

      if (response?.status === 200 && response?.data?.error === false) {
        const updatedReservation = response.data?.data;

        yield put({
          type: ReservationActions.UPDATE_RESERVATIONS_SUCCESS,
          payload: updatedReservation,
        });

        onSuccess?.(updatedReservation);
      } else {
        onFailed?.(response?.data?.message || "Không thể cập nhật đơn đặt phòng");
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Lỗi server";
      if (status >= 500) {
        onError?.(error);
      } else {
        onFailed?.(msg);
      }
    }
  });
}


export default function* reservationSaga() {
  yield all([
    fork(getUserReservations),
    fork(getReservationDetail),
    fork(updateReservation),
  ]);
}
