import ApiConstants from "../../adapter/ApiConstants";
import api from "../../libs/api/index";

const Factories = {
  reportFeedback: (data) => {
    return api.post(ApiConstants.REPORT_FEEDBACK, data);
  },  
  getReportsByUserId: () => {
    return api.get(ApiConstants.FETCH_REPORTS_BY_USERID);
  },
  deleteReportedFeedback: (reportId) => {
    return api.delete(ApiConstants.DELETE_REPORTED_FEEDBACK.replace(":reportId", reportId));
  },
};


export default Factories;
