import { all, call, fork, put, takeEvery } from "@redux-saga/core/effects";
import RoomActions from "./actions";
import Factories from "./factories";


function* getRoomsByHotel() {
  yield takeEvery(RoomActions.FETCH_ROOM, function* (action) {
    const { hotelId, query, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(Factories.fetch_room, hotelId, query); 
      if (response?.status === 200) {
        yield put({
          type: RoomActions.FETCH_ROOM_SUCCESS,
          payload: response.data.rooms, 
        });

        onSuccess && onSuccess(response.data.rooms); 
      } else {
        throw new Error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error("Error fetching rooms: ", error)
    }
  });
}
function* getRoomDetail() {
  yield takeEvery(RoomActions.FETCH_ROOM_DETAIL, function* (action) {
    const { roomId, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.fetch_room_detail(roomId));
      console.log("Room detail response:", response);

      if (response?.status === 200) {
        const room = response.data.room;
        yield put({
          type: RoomActions.FETCH_ROOM_DETAIL_SUCCESS,
          payload: room,
        });
        onSuccess?.(room);
      } else {
        onFailed?.("Failed to fetch room details");
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

export default function* roomSaga() {
  yield all([fork(getRoomsByHotel),fork(getRoomDetail)]); 
}
