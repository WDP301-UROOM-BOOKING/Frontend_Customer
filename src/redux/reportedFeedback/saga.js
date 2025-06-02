import { all, call, fork, put, takeEvery } from "@redux-saga/core/effects";
import ReportFeedbackActions from "./actions";
import Factories from "./factories";

function* reportFeedback() {
  yield takeEvery(ReportFeedbackActions.REPORT_FEEDBACK, function* (action) {
    const { feedbackId, reason, description, onSuccess, onFailed, onError } =
      action.payload;

    try {
      const response = yield call(() =>
        Factories.reportFeedback({
          feedbackId,
          reason,
          description,
        })
      );

      if (response?.status === 201 && response?.data?.error === false) {
        const report = response.data?.data;

        yield put({
          type: ReportFeedbackActions.REPORT_FEEDBACK_SUCCESS,
          payload: report,
        });

        onSuccess?.(report);
      } else {
        onFailed?.(response?.data?.message || "Không thể báo cáo feedback.");
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
function* getReportsByUserId() {
  yield takeEvery(ReportFeedbackActions.FETCH_REPORTS_BY_USERID, function* (action) {
    const { onSuccess, onFailed, userId } = action.payload || {};

    try {
      const response = yield call(Factories.getReportsByUserId, userId); // truyền userId nếu cần

      if (response?.status === 200 && response?.data?.error === false) {
        const reports = response.data?.data;

        yield put({
          type: ReportFeedbackActions.FETCH_REPORTS_BY_USERID_SUCCESS,
          payload: reports,
        });

        onSuccess?.(reports);
      } else {
        onFailed?.(
          response?.data?.message || "Không thể lấy danh sách báo cáo."
        );
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi server";
      onFailed?.(msg);
    }
  });
}
function* deleteReportedFeedback() {
  yield takeEvery(ReportFeedbackActions.DELETE_REPORTED_FEEDBACK, function* (action) {
    const { reportId, onSuccess, onFailed, onError } = action.payload;

    try {
      const response = yield call(() => Factories.deleteReportedFeedback(reportId));

      if (response?.status === 200 && response?.data?.error === false) {
        yield put({
          type: ReportFeedbackActions.DELETE_REPORTED_FEEDBACK_SUCCESS,
          payload: { id: reportId },
        });

        onSuccess?.();
      } else {
        onFailed?.(response?.data?.message || "Không thể xoá báo cáo.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi server";
      onFailed?.(msg);
    }
  });
}

export default function* feedbackSaga() {
  yield all([fork(reportFeedback), fork(getReportsByUserId),fork(deleteReportedFeedback)]);
 
}
