import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Form, Button, Card, Modal, Spinner } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import * as Routers from "../../../utils/Routes";
import Banner from "../../../images/banner.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthActions from "../../../redux/auth/actions";
import { showToast, ToastProvider } from "@components/ToastContainer";
import { clearToken } from "@utils/handleToken";
import Utils from "@utils/Utils";
import GoogleLogin from "./GoogleLogin";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Check for messages in location state when component mounts or location changes
  useEffect(() => {
    if (location.state?.message) {
      showToast.success(location.state.message);
      // Clear the message from location state to prevent showing it again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleResendVerification = () => {
    if (!unverifiedEmail) {
      setShowVerifyModal(false);
      return;
    }

    setIsResending(true);
    console.log("ABC")
    dispatch({
      type: AuthActions.RESEND_VERIFICATION,
      payload: {
        data: { email: unverifiedEmail },
        onSuccess: (data) => {
          setIsResending(false);
          showToast.success(
            "A new verification code has been sent to your email"
          );
          setShowVerifyModal(false);
          navigate(Routers.VerifyCodeRegisterPage, {
            state: {
              message: "Please check your email for the verification code",
              email: unverifiedEmail,
            },
          });
        },
        onFailed: (msg) => {
          setIsResending(false);
          showToast.error(msg);
        },
        onError: (error) => {
          setIsResending(false);
          showToast.error("Failed to resend verification code");
        },
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{8,}$/; // tối thiểu 6 ký tự
    if (!formData.email || !formData.password) {
      showToast.warning(
        "Email and password is required. Please fill in completely !"
      );
    } else if (!emailRegex.test(formData.email)) {
      showToast.warning("Invalid email format. Enter email again !!!");
    } else if (!passwordRegex.test(formData.password)) {
      showToast.warning(
        "Password must be at least 8 characters.  Enter password again !!!"
      );
    } else {
      setIsLoading(true);
      dispatch({
        type: AuthActions.LOGIN,
        payload: {
          data: { email: formData.email, password: formData.password },
          onSuccess: (user) => {
            setIsLoading(false);
            if (user.isLocked) {
              navigate(Routers.BannedPage, {
                state: {
                  reasonLocked: user.reasonLocked,
                  dateLocked: Utils.getDate(user.dateLocked, 4),
                  lockDuration: user.lockDuration,
                  lockExpiresAt: user.lockExpiresAt,
                },
              });
              dispatch({ type: AuthActions.LOGOUT });
              clearToken();
            } else {
              if(location.state?.from === "register" || location.state?.from === "login"){
                navigate(Routers.Home,  { state: { message: "Login account successfully !!!" } })
              }else{
                navigate(-1)
              }
            }
          },
          onFailed: (msg) => {
            setIsLoading(false);
            // Check if the error is about email not being verified
            if (msg === "Your email is not verified") {
              setUnverifiedEmail(formData.email);
              setShowVerifyModal(true);
            } else {
              showToast.warning("Email or password is not correct");
              setFormData({ ...formData, password: "" });
            }
          },
          onError: (error) => {
            setIsLoading(false);
            showToast.error("Email or password is not correct");
          },
        },
      });
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
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container className="position-relative">
        <ToastProvider />
        <Card className="mx-auto shadow" style={{ maxWidth: "800px" }}>
          <Card.Body className="p-4 p-md-5">
            <h2 className="text-center mb-4">Login Account</h2>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: 500 }}>Email</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="py-2"
                  required
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
                    required
                  />
                  <Button
                    variant="link"
                    className="position-absolute text-decoration-none text-muted h-100 d-flex align-items-center pe-3"
                    style={{ right: 0, top: 0 }}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>

              <div className="d-flex justify-content-between mb-4">
                <Form.Check
                  type="checkbox"
                  label="Remember me"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="text-muted"
                />
                <a
                  href={Routers.ForgetPasswordPage}
                  className="text-decoration-none"
                >
                  Forgot Password?
                </a>
              </div>

              <GoogleLogin />

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
                    Logging in...
                  </>
                ) : (
                  "Login Account"
                )}
              </Button>

              <div className="text-center">
                <span className="text-muted">Not a member? </span>
                <a
                  onClick={() => {
                    navigate(Routers.RegisterPage)
                  }} 
                  className="text-decoration-none">
                  Register now
                </a>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* Verification Modal */}
      <Modal
        show={showVerifyModal}
        onHide={() => setShowVerifyModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Account Not Verified</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Your account hasn't been verified yet. Would you like to receive a
            new verification code?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleResendVerification}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Sending...
              </>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LoginPage;
