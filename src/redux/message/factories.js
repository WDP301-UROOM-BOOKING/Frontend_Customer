import ApiConstants from "../../adapter/ApiConstants";
import api from "../../libs/api/index";

const Factories = {
  fetch_chat: (receiverId) => {
    return api.get(ApiConstants.FETCH_CHAT_MESSAGE.replace(":receiverId", receiverId));
  },

  fetch_all_users: () => {
    return api.get(ApiConstants.FETCH_CHAT_ALL_USERS);
  },
};



export default Factories;
