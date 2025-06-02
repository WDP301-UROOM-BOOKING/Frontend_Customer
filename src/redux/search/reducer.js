import SearchActions from "./actions";

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const initState = {
  SearchInformation: {
    address: "",
    checkinDate: today.toISOString().split("T")[0], // yyyy-mm-dd format
    checkoutDate: tomorrow.toISOString().split("T")[0], // yyyy-mm-dd format
    adults: 2,
    childrens: 1,
  },
  selectedRooms: [],
  hotelDetail: {}
};

const Reducer = (state = initState, action) => {
  switch (action.type) {
    case SearchActions.SAVE_SEARCH:
      return {
        ...state,
        SearchInformation: {
          ...action.payload?.SearchInformation,
        },
      };
    case SearchActions.SAVE_SELECTED_ROOMS:
      return {
        ...state,
        selectedRooms: [
          ...action.payload?.selectedRooms,
        ],
        hotelDetail: {
          ...action.payload?.hotelDetail,
        },
      };
    default:
      return state;
  }
};

export default Reducer;
