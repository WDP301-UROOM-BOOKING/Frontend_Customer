// redux/socketSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

const baseUrl = process.env.REACT_APP_ENVIRONMENT === 'development' ? process.env.REACT_APP_BACKEND_CUSTOMER_URL_DEVELOPMENT : process.env.REACT_APP_BACKEND_CUSTOMER_URL_PRODUCT;

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    socket: null,
  },
  reducers: {
    setSocket(state, action) {
      state.socket = action.payload;
    },
    clearSocket(state) {
      state.socket?.disconnect();
      state.socket = null;
    },
  },
});

export const { setSocket, clearSocket } = socketSlice.actions;

export const initializeSocket = () => (dispatch, getState) => {
  const existingSocket = getState()?.Socket?.socket;

  if (existingSocket) {
    console.log("Already has connection!");
    return;
  }

  try {
    const socketConnection = io(`${baseUrl}`, {
      withCredentials: true,
    });

    dispatch(setSocket(socketConnection));
  } catch (error) {
    console.error("Socket connection failed:", error);
  }
};

export const disconnectSocket = () => (dispatch, getState) => {
  const socket = getState()?.Socket?.socket;

  if (socket) {
    console.log("Disconnecting socket...");
    socket.disconnect();
    dispatch(clearSocket());
  } else {
    console.log("No active socket to disconnect.");
  }
};

export default socketSlice.reducer;
