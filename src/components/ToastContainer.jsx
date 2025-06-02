import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Alert } from "react-bootstrap";
import "./css/ToastContainer.css"; // Custom CSS cho Toast

// Custom Toast Component với Bootstrap Alert
const ToastContent = ({ message, variant }) => (
  <Alert variant={variant} className={`mb-0 d-flex align-items-center toast-alert toast-${variant}`}>
    <span>{message}</span>
  </Alert>
);

// Cấu hình chung cho Toast (hiển thị progress bar)
const toastConfig = (variant) => ({
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false, // Hiển thị progress bar
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progressClassName: `toast-progress-${variant}`, // Gán class theo variant
});

// Hàm hiển thị toast với nhiều trạng thái khác nhau
export const showToast = {
  success: (message) => toast(<ToastContent message={message} variant="success" />, toastConfig("success")),
  error: (message) => toast(<ToastContent message={message} variant="danger" />, toastConfig("danger")),
  info: (message) => toast(<ToastContent message={message} variant="info" />, toastConfig("info")),
  warning: (message) => toast(<ToastContent message={message} variant="warning" />, toastConfig("warning")),
};

// Component chứa ToastContainer
export const ToastProvider = () => (
  <ToastContainer newestOnTop pauseOnFocusLoss />
);
