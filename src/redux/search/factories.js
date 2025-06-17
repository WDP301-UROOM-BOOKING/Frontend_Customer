import ApiConstants from "../../adapter/ApiConstants"
import api from "../../libs/api/index";

const Factories = {
  searchHotel: (query) => {
    const params = {
      address: '',
      checkinDate: '',
      checkoutDate: '',
      numberOfPeople: 0,
      page: 1,
      limit: 3,
      star: 0,
      district: '',
      selectedFacilities: "",
    };

    if (Array.isArray(query.selectedFacilities) && query.selectedFacilities.length > 0) {
      params.selectedFacilities = query.selectedFacilities.join(",");
    }

    if(query.address){
      params.address= query.address
    }
    if(query.checkoutDate){
      params.checkoutDate= query.checkoutDate
    }
    if(query.checkinDate){
      params.checkinDate= query.checkinDate
    }
    if(query.numberOfPeople){
      params.numberOfPeople= query.numberOfPeople
    }
    if(query.page){
      params.page= query.page
    }
    if(query.limit){
      params.limit= query.limit
    }
    if(query.star){
      params.star= query.star
    }
    if(query.district){
      params.district= query.district
    }
    return api.get(ApiConstants.SEARCH_HOTEL, {params});
  },


  create_booking: (params) => {
    return api.post(ApiConstants.CREATE_BOOKING, {params});
  },

  checkout_booking: (reservationId) => {
    return api.post(ApiConstants.CHECKOUT_BOOKING, {reservationId});
  },

  cancel_payment: (reservationId) => {
    return api.post(ApiConstants.CANCEL_PAYMENT, {reservationId});
  },

  accept_payment: (reservationId) => {
    return api.post(ApiConstants.ACCEPT_PAYMENT, {reservationId});
  },
};
export default Factories;
