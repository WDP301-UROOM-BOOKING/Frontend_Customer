import { Row, Col, Card, Form, Button, InputGroup } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import ConfirmationModal from "@components/ConfirmationModal";
import { showToast, ToastProvider } from "@components/ToastContainer";
import { useAppSelector } from "../../../../redux/store";
import { useDispatch } from "react-redux";
import AuthActions from "../../../../redux/auth/actions";
import Utils from "@utils/Utils";
import "react-datepicker/dist/react-datepicker.css";
import { getToken } from "@utils/handleToken";
import moment from "moment";
const ViewInformation = () => {
  const dispatch = useDispatch();
  const Auth = useAppSelector((state) => state.Auth.Auth);
  const [formData, setFormData] = useState(Auth);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const today = moment().format("YYYY-MM-DD");
  console.log("formData: ", formData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.gender ||
      !formData.birthDate ||
      !formData.cmnd ||
      !formData.phoneNumber ||
      !formData.address
    ) {
      showToast.warning("Please fill in all required fields!");
      return;
    }

    setShowAcceptModal(true);
  };

  const handleCancel = () => {
    setFormData(Auth);
    setShowUpdateModal(false);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber" || name === "cmnd") {
      let numericValue = value.replace(/\D/g, "");
      if (name === "phoneNumber") {
        numericValue = numericValue.slice(0, 10);
      } else if (name === "cmnd") {
        numericValue = numericValue.slice(0, 12);
      }
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = () => {
    console.log("Token: ", getToken());
    dispatch({
      type: AuthActions.UPDATE_PROFILE,
      payload: {
        data: formData,
        onSuccess: (user) => {
          showToast.success("Update Information Successfully!");
          setFormData({ ...user });
          setShowAcceptModal(false);
        },
        onFailed: (msg) => {
          showToast.warning(`Update failed: ${msg}`);
          setShowAcceptModal(false);
        },
        onError: (err) => {
          showToast.warning("Something went wrong!");
          console.error(err);
          setShowAcceptModal(false);
        },
      },
    });
  };

  return (
    <Card.Body>
      <h2 className="fw-bold mb-4">View Information</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Full name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name here"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={() => {
                  if (!formData.cmnd.trim()) {
                    showToast.warning("Không được để trống!");
                  }
                }}
                required
                maxLength={50}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Gender</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="Male"
                  name="gender"
                  id="MALE"
                  value="MALE"
                  checked={formData.gender === "MALE"}
                  onChange={handleInputChange}
                  required
                  onBlur={() => {
                    if (!formData.cmnd.trim()) {
                      showToast.warning("Không được để trống!");
                    }
                  }}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Female"
                  name="gender"
                  id="FEMALE"
                  value="FEMALE"
                  checked={formData.gender === "FEMALE"}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Birthdate</Form.Label>
              <InputGroup>
                <Form.Control
                  type="date"
                  placeholder="DD/MM/YYYY"
                  name="birthDate"
                  value={
                    formData.birthDate
                      ? Utils.getDate(formData.birthDate, 3)
                      : ""
                  }
                  onChange={handleInputChange}
                  max={today}
                  required
                  onBlur={() => {
                    if (!formData.cmnd.trim()) {
                      showToast.warning("Không được để trống!");
                    }
                  }}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>CMND</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your CMND here"
                name="cmnd"
                value={formData.cmnd}
                onChange={handleInputChange}
                maxLength={12}
                pattern="\d{12}"
                inputMode="numeric"
                title="CMND phải bao gồm đúng 12 chữ số"
                required
                onBlur={() => {
                  if (!formData.cmnd.trim()) {
                    showToast.warning("Không được để trống!");
                  }
                }}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Number phone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your phone number here"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                maxLength={10}
                inputMode="numeric"
                pattern="0\d{9}"
                title="Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số"
                required
                onBlur={() => {
                  if (!formData.cmnd.trim()) {
                    showToast.warning("Không được để trống!");
                  }
                }}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your email here"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
                style={{ backgroundColor: "white" }}
                required
                onBlur={() => {
                  if (!formData.cmnd.trim()) {
                    showToast.warning("Không được để trống!");
                  }
                }}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter your address here"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                maxLength={255}
                onBlur={() => {
                  if (!formData.cmnd.trim()) {
                    showToast.warning("Không được để trống!");
                  }
                }}
              />
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
      <ConfirmationModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        onConfirm={handleCancel}
        title="Confirm Cancel"
        message="Are you sure you want to reset this information?"
        confirmButtonText="Confirm"
        type="warning"
      />
      <ConfirmationModal
        show={showAcceptModal}
        onHide={() => setShowAcceptModal(false)}
        onConfirm={handleSave}
        title="Confirm Update"
        message="Are you sure you want to update this new information?"
        confirmButtonText="Accept"
        type="accept"
      />

      <ToastProvider />
    </Card.Body>
  );
};

export default ViewInformation;