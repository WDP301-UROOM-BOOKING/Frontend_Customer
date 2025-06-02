import FeedbackActions from "./actions";
const initialState = {
  status: null,   
  error: null,
  myReports: [],    
};
const reportFeedbackReducer = (state = initialState, action) => {
  switch (action.type) {

    case FeedbackActions.REPORT_FEEDBACK_SUCCESS:
      return {
        ...state,
        status: "success",
        error: null,
      };
      case FeedbackActions.FETCH_REPORTS_BY_USERID_SUCCESS:
        return {
          ...state,
          
          myReports: action.payload,
          error: null,
        };
        case FeedbackActions.DELETE_REPORTED_FEEDBACK_SUCCESS:
          return {
            ...state,
            status: "success",
            myReports: state.myReports.filter(report => report.id !== action.payload.id), 
            error: null,
          };
  

    default:
      return state;
  }
};

export default reportFeedbackReducer;
