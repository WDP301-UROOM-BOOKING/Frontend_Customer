import ChatboxActions from "./actions";

const initialState = {
  Messages: []
};

const chatboxReducer = (state = initialState, action) => {
  switch (action.type) {
    case ChatboxActions.ADD_MESSAGE:
      return {
        ...state,
        Messages: [...state.Messages, action.payload.message]
      };
    case ChatboxActions.CLEAR_MESSAGES:
      return {
        ...state,
        Messages: []
      };
    default:
      return state;
  }
};

export default chatboxReducer;
