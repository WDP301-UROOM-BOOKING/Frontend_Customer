import { all, call, fork, put, takeEvery } from "@redux-saga/core/effects";
import FeedbackActions from "./actions";
import Factories from "./factories";

// 1. Lấy danh sách feedback của người dùng
function* getUserFeedbacks() {
  yield takeEvery(FeedbackActions.FETCH_USER_FEEDBACKS, function* (action) {
    const { userId, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.fetchUserFeedbacks(userId));

      if (response?.status === 200 && response?.data?.error === false) {
        const feedbacks = response.data?.data;
        yield put({
          type: FeedbackActions.FETCH_USER_FEEDBACKS_SUCCESS,
          payload: feedbacks,
        });
        onSuccess?.(feedbacks);
      } else {
        onFailed?.(response?.data?.message || "Không lấy được feedback");
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

// 2. Cập nhật feedback
function* updateFeedback() {
  yield takeEvery(FeedbackActions.UPDATE_FEEDBACK, function* (action) {
    const { feedbackId, data, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.updateFeedback(feedbackId, data));

      if (response?.status === 200 && response?.data?.error === false) {
        const updatedFeedback = response.data?.data;
        yield put({
          type: FeedbackActions.UPDATE_FEEDBACK_SUCCESS,
          payload: updatedFeedback,
        });
        onSuccess?.(updatedFeedback);
      } else {
        onFailed?.(response?.data?.message || "Không thể cập nhật feedback");
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

// 3. Xoá feedback
function* deleteFeedback() {
  yield takeEvery(FeedbackActions.DELETE_FEEDBACK, function* (action) {
    const { feedbackId, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.deleteFeedback(feedbackId));

      if (response?.status === 200 && response?.data?.error === false) {
        yield put({
          type: FeedbackActions.DELETE_FEEDBACK_SUCCESS,
          payload: feedbackId,
        });
        onSuccess?.(feedbackId);
      } else {
        onFailed?.(response?.data?.message || "Không thể xoá feedback");
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
function* createFeedback() {
  yield takeEvery(FeedbackActions.CREATE_FEEDBACK, function* (action) {
    const { data, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.createFeedback(data));

      if (response?.status === 201 && response?.data?.error === false) {
        const newFeedback = response.data?.data;

        yield put({
          type: FeedbackActions.CREATE_FEEDBACK_SUCCESS,
          payload: newFeedback,
        });

        onSuccess?.(newFeedback);
      } else {
        onFailed?.(response?.data?.message || "Không thể tạo feedback");
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
function* getFeedbackById() {
  yield takeEvery(FeedbackActions.FETCH_FEEDBACK_BY_ID, function* (action) {
    const { feedbackId, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.getFeedbackById(feedbackId));

      if (response?.status === 200 && response?.data?.error === false) {
        const feedback = response.data?.data;
        yield put({
          type: FeedbackActions.FETCH_FEEDBACK_BY_ID_SUCCESS,
          payload: feedback,
        });
        onSuccess?.(feedback);
      } else {
        onFailed?.(response?.data?.message || "Không thể lấy feedback");
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



export default function* feedbackSaga() {
  yield all([
    fork(getUserFeedbacks),
    fork(updateFeedback),
    fork(deleteFeedback),
    fork(createFeedback),
    fork(getFeedbackById),
  ]);
}
