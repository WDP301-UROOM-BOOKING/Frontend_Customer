import ApiConstants from "../../adapter/ApiConstants";
import api from "../../libs/api/index";

const Factories = {
  login: (data) => {
    return api.post(ApiConstants.LOGIN_CUSTOMER, data);
  },
  register: (data) => {
    return api.post(ApiConstants.REGISTER_CUSTOMER, data);
  },
  update_profile: (data) => {
    return api.post(ApiConstants.UPDATE_PROFILE, data);
  },
  change_password: (data) => {
    return api.post(ApiConstants.CHANGE_PASSWORD, data);
  },
  verify_email: (data) => {
    return api.post(ApiConstants.VERIFY_EMAIL, data);
  },
  resend_verification: (data) => {
    return api.post(ApiConstants.RESEND_VERIFICATION, data);
  },
  update_avatar: (formData) => {
    return api.put(ApiConstants.UPDATE_AVATAR, formData);
  },

  remove_favorite_hotel: (hotelId) => {
    return api.post(ApiConstants.REMOVE_FAVORITE_HOTELS, { hotelId });
  },

  add_favorite_hotel: (hotelId) => {
    return api.post(ApiConstants.ADD_FAVORITE_HOTELS, { hotelId });
  },

  google_login: (data) => {
    return api.post(ApiConstants.GOOGLE_LOGIN, data);
  },
  forgetPassword: (data) => {
    return api.post(ApiConstants.FORGOT_PASSWORD, data);
  },

  reset_password: (data) => {
    return api.post(ApiConstants.RESET_PASSWORD, data);
  },
  verify_forgot_password: (data) => {
    return api.post(ApiConstants.VERIFY_FORGOT_PASSWORD, data);
  },
};
export default Factories;
