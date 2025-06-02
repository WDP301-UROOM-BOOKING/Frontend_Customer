import React from "react";
import { Container, Button } from "react-bootstrap";
import { FaLock } from "react-icons/fa";
import "../css/BannedPage.css";
import * as Routers from "../utils/Routes";
import { useLocation, useNavigate } from "react-router-dom";

const BannedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Container fluid className="banned-container">
      <div className="banned-content text-center">
        <div className="lock-icon">
          <FaLock size={250} />
        </div>

        <h1 className="banned-title" style={{ fontSize: 60 }}>
          Banned
        </h1>
        <p className="banned-subtitle" style={{ fontSize: 40 }}>
          Your account has been locked
        </p>

        <div className="banned-details">
          <div className="detail-item">
            <span className="detail-label">Reason: </span>
            <span className="detail-value" style={{ color: "red" }}>
              {location.state.reasonLocked}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Date locked: </span>
            <span className="detail-value">              
              {location.state.dateLocked}
            </span>
          </div>
        </div>

        <div className="banned-actions">
          <Button
            variant="primary"
            className="home-btn"
            style={{ width: "140px" }}
            onClick={() => {
              navigate(Routers.Home);
            }}
          >
            Home Page
          </Button>
          <Button
            variant="danger"
            className="contact-btn"
            style={{ width: "140px" }}
          >
            Contact
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default BannedPage;
