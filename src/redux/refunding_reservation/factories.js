import ApiConstants from "../../adapter/ApiConstants"
import api from "../../libs/api/index";


const Factories = {

  create_refunding_reservation: (idReservation, refundAmount,  accountHolderName, accountNumber, bankName) => {
    const url = `${ApiConstants.CREATE_REFUNDING_RESERVATION}`
    return api.post(url, {idReservation, refundAmount,  accountHolderName, accountNumber, bankName});
  },
  
  get_refunding_reservation_byUserId: () => {
    const url = `${ApiConstants.GET_REFUNDING_RESERVATION_BYUSERID}`
    return api.get(url);
  },
  update_banking_info: ({ refundId, accountHolderName, accountNumber, bankName }) => {
    const url = `${ApiConstants.UPDATE_BANKING_INFO}/${refundId}`;
    return api.put(url, { accountHolderName, accountNumber, bankName });
  }
};

export default Factories;
