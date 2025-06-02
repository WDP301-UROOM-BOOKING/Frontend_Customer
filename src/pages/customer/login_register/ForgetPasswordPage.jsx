import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import * as Routers from "../../../utils/Routes";
import Banner from '../../../images/banner.jpg';
import { useNavigate } from 'react-router-dom';
import { showToast, ToastProvider } from "@components/ToastContainer";
import { useDispatch } from "react-redux";
import AuthActions from "../../../redux/auth/actions";
import Factories from '@redux/auth/factories';
import axios from "axios";
const ForgetPasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const response = await Factories.forgetPassword({
      email: formData.email,
    });
    if (response?.status === 200) {
      setIsLoading(false);
      navigate(Routers.VerifyCodePage, {
        state: {
          message: "Code is sent in your email, verify in here!",
          email: formData.email
        },
      });
    }
  
  } catch (error) {
    setIsLoading(false);
    // Ưu tiên lấy MsgNo nếu có, sau đó đến message, cuối cùng là mặc định
    const msg =
        error.response?.data?.MsgNo ||
        error.response?.data?.message ||
        "Send email failed";
    console.error("Error sending email:", error);
    showToast.error(msg);
  }
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        backgroundImage: `url(${Banner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >

    
      <Container className="position-relative">
        <Card className="mx-auto shadow" style={{ maxWidth: '800px' }}>
          <Card.Body className="p-4 p-md-5">
            <h2 className="text-center mb-2">Forget Password</h2>
            <div className="text-center">
              <span className="text-muted">Remember your password ?</span>
              <a href={Routers.LoginPage} className="text-decoration-none"> Sign in here</a>
            </div>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: 500 }}>Email Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-100 py-2 mb-4"
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Reset Password"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
        <ToastProvider/>
      </Container>
      
    </div>
  );
};

export default ForgetPasswordPage;
