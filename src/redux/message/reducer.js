import MessageActions from "./actions";

const initialState = {
   Users: [],
   Message: [],
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case MessageActions.FETCH_ALL_USERS_BY_USERID_SUCCESS:
      return {
        ...state,
        Users: [...action.payload]
      };
    case MessageActions.FETCH_HISTORY_MESSAGE_SUCCESS:
      return {
        ...state,
        Message: [...action.payload]
      };
    default:
      return state;
  }
};


export default messageReducer;
