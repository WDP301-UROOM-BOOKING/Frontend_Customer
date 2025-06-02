import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Form, Button, Card } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import * as Routers from "../../../utils/Routes";
import { Route, useLocation, useNavigate } from "react-router-dom";
import Banner from "../../../images/banner.jpg";
import { showToast, ToastProvider } from "@components/ToastContainer";
import axios from "axios";
import Factories from "@redux/auth/factories";
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    again_password: "",
    password: "",
  }); 

  console.log("formData:", formData);
  const { email, code, verified } = location.state || {};

  useEffect(() => {
    if (!verified) {
      // Nếu không có verified, không cho vào trang này
      navigate(Routers.LoginPage, { replace: true });
    }
  }, [verified, navigate]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password || !formData.again_password) {
      showToast.error("Please fill in all fields");
      return;
    }
    if (formData.password.length < 8) {
      showToast.error("Password must be at least 8 characters");
      return;
    }
    if (formData.password !== formData.again_password) {
      showToast.error("Passwords do not match");
      return;
    }
    try {

      const response = await Factories.reset_password({
        email,
        code,
        newPassword: formData.password,
        confirmPassword: formData.again_password,
      });
      if (response?.status === 200) {
        navigate(Routers.LoginPage, {
          state: {from: "login", message: "Reset password successfully" },
        });
      }
    } catch (error) {
      showToast.error(
        error.response?.data?.MsgNo ||
        error.response?.data?.message ||
        "Reset password failed"
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (location.state?.message) {
      showToast.warning(location.state.message);
    }
  }, [location]);

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        backgroundImage: `url(${Banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container className="position-relative">
        <ToastProvider />
        <Card className="mx-auto shadow" style={{ maxWidth: "800px" }}>
          <Card.Body className="p-4 p-md-5">
            <h2 className="text-center mb-4">Reset New Password</h2>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: 500 }}>
                  New password
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="py-2"
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-0 text-decoration-none text-muted h-100 d-flex align-items-center pe-3"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 500 }}>
                  Again new password
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter again your new password"
                    name="again_password"
                    value={formData.again_password}
                    onChange={handleChange}
                    className="py-2"
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-0 text-decoration-none text-muted h-100 d-flex align-items-center pe-3"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2 mt-2"
              >
                Reset Password
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ResetPasswordPage;
