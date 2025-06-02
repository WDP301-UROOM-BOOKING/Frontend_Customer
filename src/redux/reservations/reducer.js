import ReservationActions from "./actions";

const initialState = {
  reservations: [],
  reservationDetail: null,
  error: null,
};

const reservationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ReservationActions.FETCH_USER_RESERVATIONS_SUCCESS:
      return {
        ...state,
        reservations: action.payload,
      };
      case ReservationActions.FETCH_RESERVATION_DETAIL_SUCCESS:
        return {
          ...state,
          reservationDetail: action.payload,
          error: null,
        };
        case ReservationActions.UPDATE_RESERVATIONS_SUCCESS:
          return {
            ...state,
            reservationDetail: {
              ...state.reservationDetail,
              ...action.payload, 
            },
            error: null,
          };
    default:
      return state;
  }
};

export default reservationReducer;
