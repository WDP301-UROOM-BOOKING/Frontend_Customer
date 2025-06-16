import ChatboxActions from "./actions"

const initialState = {
  Messages: [],
  lastActivity: null, // Thêm timestamp của hoạt động cuối
}

const chatboxReducer = (state = initialState, action) => {
  switch (action.type) {
    case ChatboxActions.ADD_MESSAGE:
      return {
        ...state,
        Messages: [...state.Messages, action.payload.message],
        lastActivity: Date.now(), // Cập nhật thời gian hoạt động
      }

    case ChatboxActions.CLEAR_MESSAGES:
      return {
        ...state,
        Messages: [],
        lastActivity: Date.now(),
      }

    case ChatboxActions.CHECK_EXPIRE:
      // Kiểm tra nếu đã quá 10 giây thì clear messages
      const now = Date.now()
      const lastActivity = state.lastActivity || now
      const shouldExpire = now - lastActivity > (1000 * 60 * 60 * 24) // 1 ngày

      if (shouldExpire && state.Messages.length > 0) {
        return {
          ...state,
          Messages: [],
          lastActivity: now,
        }
      }
      return state

    case "persist/REHYDRATE":
      // Khi app khởi động lại, kiểm tra expire
      if (action.payload && action.payload.ChatBox) {
        const now = Date.now()
        const lastActivity = action.payload.ChatBox.lastActivity || now
        const shouldExpire = now - lastActivity > (1000 * 60 * 60 * 24) // 1 ngày

        if (shouldExpire) {
          return {
            ...action.payload.ChatBox,
            Messages: [],
            lastActivity: now,
          }
        }
      }
      return state

    default:
      return state
  }
}

export default chatboxReducer
