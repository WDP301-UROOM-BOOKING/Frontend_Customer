import React, { useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { XCircle, ArrowLeft } from "react-feather";
import "bootstrap/dist/css/bootstrap.min.css";
import Banner from "../../../images/banner.jpg";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../Footer";
import Header from "../Header";
import * as Routers from "../../../utils/Routes";
import Factories from "@redux/search/factories";

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get("reservationId");
  console.log("reservationId", reservationId);
  
  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{
        backgroundImage: `url(${Banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header />
      <div
        className="flex-grow-1 d-flex align-items-center justify-content-center content-wrapper"
        style={{ paddingTop: "50px", paddingBottom: "50px" }}
      >
        <Card
          className="text-center"
          style={{
            maxWidth: "800px",
            height: "500px",
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "15px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "none",
            padding: "2rem",
          }}
        >
          <Card.Body>
            <div className="mb-4">
              <XCircle
                size={150}
                style={{
                  color: "#e74c3c",
                  strokeWidth: 2,
                }}
              />
            </div>

            <h2
              className="mb-3"
              style={{ fontWeight: "700", color: "#e74c3c" }}
            >
              Payment Failed!
            </h2>

            <p
              className="text-muted mb-2"
              style={{ fontWeight: "600", fontSize: 20 }}
            >
              Oops! Your payment was not successful.
            </p>
            <p
              className="mb-4"
              style={{ fontSize: "1.2rem", fontWeight: "500" }}
            >
              Please try again or contact support.
            </p>

            <div className="d-flex justify-content-center mt-5">
              <Button
                variant="dark"
                className="px-4 py-3 d-flex align-items-center justify-content-center"
                style={{
                  flex: 1,
                  borderRadius: "8px",
                  backgroundColor: "#000",
                  border: "none",
                }}
                onClick={() => {
                  navigate(Routers.Home);
                }}
              >
                <ArrowLeft size={20} className="me-2" />
                Go to home page
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentFailedPage;
