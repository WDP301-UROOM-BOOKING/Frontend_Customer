import React from "react";
import { Container, Button } from "react-bootstrap";
import { FaLock } from "react-icons/fa";
import "../css/BannedPage.css";
import * as Routers from "../utils/Routes";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppSelector } from "@redux/store";

function getUnlockCountdown(lockExpiresAt) {
  if (!lockExpiresAt) return null;
  const now = new Date();
  const expires = new Date(lockExpiresAt);
  const diffMs = expires - now;
  if (diffMs <= 0) return null;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { diffDays, diffHours, diffMinutes };
}

const BannedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const Auth = useAppSelector((state) => state.Auth.Auth);
  const reasonLocked = location.state?.reasonLocked || "";
  const lockDuration = location.state?.lockDuration;
  const lockExpiresAt = location.state?.lockExpiresAt;
  const [countdown, setCountdown] = useState(() =>
    lockDuration && lockDuration !== "permanent"
      ? getUnlockCountdown(lockExpiresAt)
      : null
  );

  useEffect(() => {
    if (lockDuration && lockDuration !== "permanent" && lockExpiresAt) {
      const interval = setInterval(() => {
        setCountdown(getUnlockCountdown(lockExpiresAt));
      }, 60000); // cập nhật mỗi phút
      return () => clearInterval(interval);
    }
  }, [lockDuration, lockExpiresAt]);

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
              {reasonLocked}
            </span>
          </div>

          {countdown && typeof countdown === "object" ? (
            <div className="detail-item">
              <span className="detail-label">Time remaining: </span>
              <span className="detail-value" style={{ color: "orange" }}>
                {countdown.diffDays > 0 ? `${countdown.diffDays} days, ` : ""}
                {countdown.diffHours} hours, {countdown.diffMinutes} minutes
              </span>
            </div>
          ) : null}
          <div className="detail-item">
            <span className="detail-label">Date locked: </span>
            <span className="detail-value">{location.state.dateLocked}</span>
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
            onClick={() => {
              if (Auth?._id != -1) {
                navigate(Routers.ChatPage, {
                  state: {
                    receiver: {
                      _id: 16,
                      name: "Admin Uroom",
                      image: {
                        public_ID: "avatar_admin1",
                        url: "https://cdn-icons-png.freepik.com/512/4880/4880553.png",
                      },
                    },
                  },
                });
              } else {
                navigate(Routers.LoginPage);
              }
            }}
          >
            Contact
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default BannedPage;
