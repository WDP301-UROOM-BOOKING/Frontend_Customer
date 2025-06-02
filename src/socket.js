import { io } from 'socket.io-client';

// Lấy URL từ biến môi trường theo môi trường build
const URL =
  process.env.REACT_APP_ENVIRONMENT === 'development'
    ? process.env.REACT_APP_BACKEND_CUSTOMER_URL_DEVELOPMENT
    : process.env.REACT_APP_BACKEND_CUSTOMER_URL_PRODUCT;

export const socket = io(URL, {
  transports: ['websocket'],      // Ép dùng WebSocket
  withCredentials: true,          // Cho phép gửi cookie khi cần
});