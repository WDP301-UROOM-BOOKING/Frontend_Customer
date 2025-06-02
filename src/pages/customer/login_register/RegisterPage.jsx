import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Form, Button, Card, Spinner } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import * as Routers from "../../../utils/Routes";
import { useNavigate } from "react-router-dom";
import Banner from "../../../images/banner.jpg";
import { useDispatch } from "react-redux";
import AuthActions from "../../../redux/auth/actions";
import { showToast, ToastProvider } from "@components/ToastContainer";
import GoogleLogin from "./GoogleLogin";


const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    let isValid = true;
    
    // Validate name
    if (!formData.name.trim()) {
      showToast.error("Username is required");
      isValid = false;
    }
    
    // Validate phone
    if (!formData.phoneNumber.trim()) {
      showToast.error("Phone number is required");
      isValid = false;
    } else if (!/^\d{9,12}$/.test(formData.phoneNumber.trim())) {
      showToast.error("Please enter a valid phone number (9-12 digits)");
      isValid = false;
    }
    
    // Validate email
    if (!formData.email.trim()) {
      showToast.error("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showToast.error("Please enter a valid email address");
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      showToast.error("Password is required");
      isValid = false;
    } else if (formData.password.length < 8) {
      showToast.error("Password must be at least 8 characters");
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    console.log("Register submitted:", formData);
    
    dispatch({
      type: AuthActions.REGISTER,
      payload: {
        data: formData,
        onSuccess: (Data) => {
          console.log('abc');
          setIsLoading(false);
          showToast.success("Register successfully");
          navigate(Routers.VerifyCodeRegisterPage, {
            state: {
              message: "Code is sent in your email, verify in here!",
              email: formData.email
            },
          });
        },
        onFailed: (msg) => {
          setIsLoading(false);
          showToast.error(msg);
        },
        onError: (error) => {
          setIsLoading(false);
          showToast.error("Register failed", error.message);
        },
      },
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
            <h2 className="text-center mb-4">Register Account</h2>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: 500 }}>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your username"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="py-2"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: 500 }}>Phone </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your phone number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="py-2"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: 500 }}>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="py-2"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 500 }}>Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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

              <GoogleLogin/>
              
              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2 mb-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Processing...
                  </>
                ) : (
                  "Register Account"
                )}
              </Button>

              <div className="text-center">
                <span className="text-muted">You have a account? </span>
                <a
                  onClick={() => {
                    navigate(Routers.LoginPage, { state: { from: "register" } })
                  }}
                  className="text-decoration-none">
                  Sign in here
                </a>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default RegisterPage;
