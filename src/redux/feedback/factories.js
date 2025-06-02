import ApiConstants from "../../adapter/ApiConstants";
import api from "../../libs/api/index";

const Factories = {
  get_feedback_by_hotelId: (hotelId, query) => {
    const params = {
      page: 1,
      limit: 3,
      sort: 0,
      star: 0,
    };
    if(query.page){
      params.page= query.page
    }
    if(query.sort){
      params.sort= query.sort
    }
    if(query.star){
      params.star= query.star
    }
    const url = ApiConstants.FETCH_FEEDBACK_BY_HOTELID.replace(":hotelId", hotelId);
    return api.get(url, {params});  
  },
  fetchUserFeedbacks: (userId) => {
    return api.get(ApiConstants.FETCH_USER_FEEDBACKS.replace(":userId", userId));
  },
  updateFeedback: (feedbackId, data) => {
    return api.put(ApiConstants.UPDATE_FEEDBACK.replace(":feedbackId", feedbackId), data);
  },
  deleteFeedback: (feedbackId) => {
    return api.delete(ApiConstants.DELETE_FEEDBACK.replace(":feedbackId", feedbackId));
  },

  like_feedback: (feedbackId) => {
    const url = `${ApiConstants.LIKE_FEEDBACK}/${feedbackId}`
    return api.post(url);  
  },
  dislike_feedback: (feedbackId) => {
    const url = `${ApiConstants.DISLIKE_FEEDBACK}/${feedbackId}`
    return api.post(url);  
  },
  
  createFeedback: (data) => {
    return api.post(ApiConstants.CREATE_FEEDBACK, data);
  },
  getFeedbackById: (feedbackId) => {
    const url = ApiConstants.FETCH_FEEDBACK_BY_ID.replace(":feedbackId", feedbackId);
    return api.get(url);
  },
};

export default Factories;
