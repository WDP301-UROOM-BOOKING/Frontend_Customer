import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import React, { useState } from "react";
import ConfirmationModal from "@components/ConfirmationModal";
import { showToast, ToastProvider } from "@components/ToastContainer";
import { useDispatch } from "react-redux";
import AuthActions from "../../../../redux/auth/actions";
const ChangePassword = () => {
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const initialFormData = {
    oldPassword: "",
    newPassword: "",
    againNewPassword: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  const handleCancel = () => {
    const { oldPassword, newPassword, againNewPassword } = formData;
    if (!oldPassword || !newPassword || !againNewPassword) {
      showToast.warning("Please fill in all fields.");
      return;
    }
    setFormData(initialFormData); // Reset form
    showToast.info("Cancelled change password.");
    setShowUpdateModal(false);
  };

  const handleSave = () => {
    const { oldPassword, newPassword, againNewPassword } = formData;

    if (!oldPassword || !newPassword || !againNewPassword) {
      showToast.warning("Please fill in all fields.");
      return;
    }

    if (
      oldPassword.length < 8 ||
      newPassword.length < 8 ||
      againNewPassword.length < 8
    ) {
      showToast.warning("All passwords must be at least 8 characters long.");
      return;
    }

    if (newPassword !== againNewPassword) {
      showToast.warning("New password and confirmation do not match.");
      return;
    }

    dispatch({
      type: AuthActions.CHANGE_PASSWORD,
      payload: {
        data: {
          currentPassword: oldPassword,
          newPassword,
          confirmPassword: againNewPassword,
        },
        onSuccess: () => {
          showToast.success("Password changed successfully!");
          setFormData(initialFormData);
        },
        onFailed: (msg) => {
          showToast.warning(`Change failed: ${msg}`);
        },
        onError: (err) => {
          console.error(err);
          showToast.warning("An error occurred while changing password.");
        },
      },
    });

    setShowAcceptModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowAcceptModal(true);
  };

  return (
    <Card.Body>
      <h2 className="fw-bold mb-4">Change Password</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 500 }}>Old Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your old password"
                  name="oldPassword"
                  value={formData.oldPassword}
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
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 500 }}>New Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  name="newPassword"
                  value={formData.newPassword}
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
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 500 }}>
                Again New Password
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter again your new password"
                  name="againNewPassword"
                  value={formData.againNewPassword}
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
          </Col>
        </Row>
        <div className="d-flex justify-content-end">
          <Button
            variant="danger"
            className="me-2"
            style={{ width: "100px" }}
            onClick={() => {
              setShowUpdateModal(true);
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="primary"
            type="submit"
            style={{ width: "100px" }}
            onClick={() => {
              setShowAcceptModal(true);
            }}
          >
            SAVE
          </Button>
        </div>
      </Form>
      {/* Update Confirmation Modal */}
      <ConfirmationModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        onConfirm={handleCancel}
        title="Confirm Cancel"
        message="Are you sure you want to reset this information ?"
        confirmButtonText="Confirm"
        type="warning"
      />

      {/* Accept Confirmation Modal */}
      <ConfirmationModal
        show={showAcceptModal}
        onHide={() => setShowAcceptModal(false)}
        onConfirm={handleSave}
        title="Confirm Update"
        message="Are you sure you want to change this new password ?"
        confirmButtonText="Accept"
        type="accept"
      />
      <ToastProvider />
    </Card.Body>
  );
};

export default ChangePassword;
