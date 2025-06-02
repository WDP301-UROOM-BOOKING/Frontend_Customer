import ApiConstants from "../../adapter/ApiConstants";
import api from "../../libs/api/index";

const Factories = {
  fetchUserReservations: (userId) => {
    return api.get(ApiConstants.FETCH_USER_RESERVATIONS.replace(":userId", userId));
  },
  fetchReservationDetail: (reservationId) => {
    return api.get(ApiConstants.FETCH_RESERVATION_DETAIL.replace(":id", reservationId));
  },
  updateReservationById: (reservationId, data) => {
    return api.put(ApiConstants.UPDATE_RESERVATION.replace(":id", reservationId), data);
  },
};



export default Factories;
