import HotelActions from "./actions";

const initialState = {
  hotels: [],
  hotelDetail: null,
  error: null,
  top3Hotels: [],
};

const favoriteHotelReducer = (state = initialState, action) => {
  switch (action.type) {
    case HotelActions.FETCH_FAVORITE_HOTELS_SUCCESS:
      return {
        ...state,
        hotels: action.payload,
      };
      case HotelActions.FETCH_DETAIL_HOTEL_SUCCESS:
        return {
          ...state,
          hotelDetail: action.payload,
        };
        case HotelActions.FETCH_All_HOTEL_SUCCESS: 
        return {
          ...state,
          hotels: action.payload,
        };    
        case HotelActions.FETCH_TOP3_HOTEL_SUCCESS: 
        return {
          ...state,
          top3Hotels: action.payload,
        };
    
    default:
      return state;
  }
};

export default favoriteHotelReducer;
