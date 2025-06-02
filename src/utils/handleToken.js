export const getToken = async () => {
  return localStorage.getItem("token");
};

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const clearToken = () => {
  localStorage.removeItem("token");
};

export const getStatusBooking = async () => {
  return localStorage.getItem("StatusBooking") ?? 0;
};

export const setStatusBooking = (index) => {
  localStorage.setItem("StatusBooking", index);
};

export const clearStatusBooking = () => {
  localStorage.removeItem("StatusBooking");
};

