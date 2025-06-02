import ApiConstants from "../../adapter/ApiConstants"
import api from "../../libs/api/index";


const Factories = {
  fetch_room: (hotelId, query) => {

    const params = {
      checkInDate: '',
      checkOutDate: '',
    };
    if(query.checkoutDate){
      params.checkOutDate= query.checkoutDate
    }
    if(query.checkinDate){
      params.checkInDate= query.checkinDate
    }
    const url = ApiConstants.FETCH_ROOM.replace(":hotelId", hotelId);
    return api.get(url, {params});  
  },
  fetch_room_detail: (roomId) => {
    const url = ApiConstants.FETCH_ROOM_DETAIL.replace(":roomId", roomId);
    console.log("Room Detail API URL:", url);
    return api.get(url);
  },
};

export default Factories;
