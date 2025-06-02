import { all, call, fork, put, takeEvery } from "@redux-saga/core/effects";
import MessageActions from "./actions";
import Factories from "./factories";

function* fetchAllUsers() {
  yield takeEvery(MessageActions.FETCH_ALL_USERS_BY_USERID, function* (action) {
    const {onSuccess, onFailed, onError } = action.payload;
    console.log("1")
    try {
      const response = yield call(() => Factories.fetch_all_users());
      if (response?.status === 200) {
        const users = response.data.data.users;
        console.log("response: ", response.data)
        yield put({
          type: MessageActions.FETCH_ALL_USERS_BY_USERID_SUCCESS,
          payload: users,
        });

        onSuccess && onSuccess(users);
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

function* fetchHistoryMessage() {
  yield takeEvery(MessageActions.FETCH_HISTORY_MESSAGE, function* (action) {
    const {receiverId, onSuccess, onFailed, onError } = action.payload;
    try {
      const response = yield call(() => Factories.fetch_chat(receiverId));
      if (response?.status === 200) {
        const messages = response.data;
        yield put({
          type: MessageActions.FETCH_HISTORY_MESSAGE_SUCCESS,
          payload: messages,
        });
        onSuccess && onSuccess(messages);
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


export default function* userSaga() {
  yield all([
    fork(fetchAllUsers),
    fork(fetchHistoryMessage),
  ]);
}
