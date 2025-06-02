import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaStar, FaRegStar } from "react-icons/fa";
import Banner from "../../../images/banner.jpg";
import Header from "../Header";
import Footer from "../Footer";
import * as Routers from "../../../utils/Routes";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "@components/ConfirmationModal";
import { useAppSelector } from "../../../redux/store";
import Utils from "../../../utils/Utils";
import Factories from "../../../redux/search/factories";
import { ChatBox } from "./HomePage";

const BookingCheckPage = () => {
  const Auth = useAppSelector((state) => state.Auth.Auth);
  const SearchInformation = useAppSelector(
    (state) => state.Search.SearchInformation
  );
  const selectedRooms = useAppSelector((state) => state.Search.selectedRooms);
  const hotelDetail = useAppSelector((state) => state.Search.hotelDetail);
  const navigate = useNavigate();
  const [bookingFor, setBookingFor] = useState("mainGuest");
  
  // Star rating component
  const StarRating = ({ rating }) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) =>
          index < rating ? (
            <FaStar key={index} className="star filled" />
          ) : (
            <FaRegStar key={index} className="star" />
          )
        )}
      </div>
    );
  };

  const [showAcceptModal, setShowAcceptModal] = useState(false);

  const createBooking = async () => {

    const totalPrice= selectedRooms.reduce(
      (total, { room, amount }) =>
        total + room.price * amount,
      0
    );

    const params= {
      hotelId: hotelDetail._id,
      checkOutDate: SearchInformation.checkoutDate,
      checkInDate: SearchInformation.checkinDate,
      totalPrice: totalPrice,
      roomDetails: selectedRooms
    }

    try {
      const response = await Factories.create_booking(params);
      if (response?.status === 201) {
        const reservation= response?.data.reservation
        console.log("reservation: ", reservation)
        navigate(Routers.PaymentPage,
          {
            state: {
              createdAt: reservation.createdAt,
              totalPrice: totalPrice,
              idReservation: reservation._id,
              messageSuccess: response?.data.message
            }
          }
        )
      }else{
        console.log("unpaidReservation: ", response?.data.unpaidReservation)
        navigate(Routers.PaymentPage,
          {
            state: {
              createdAt: response?.data.unpaidReservation.createdAt,
              totalPrice: response?.data.unpaidReservation.totalPrice,
              idReservation: response?.data.unpaidReservation._id,
              messageError: response?.data.message
            }
          }
        )
      }
    } catch (error) {
      console.error("Error create payment: ", error);
      navigate(Routers.ErrorPage,)
    } finally {
    }
  };

  const handleAccept = () => {
    createBooking();
  };

  const handleConfirmBooking = () => {
    setShowAcceptModal(true);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0";
    return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    }).format(amount);
  };

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
        style={{ paddingTop: "65px", paddingBottom: "50px" }}
      >
        <Container className="mt-4">
          <Row className="justify-content-center">
            {/* Left Card - Booking Details */}
            <Col md={5} lg={4}>
              <Card
                className="booking-card text-white"
                style={{
                  backgroundColor: "rgba(20, 30, 70, 0.85)",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <div
                  className="stars mb-2"
                  style={{
                    justifyContent: "flex-start",
                    justifyItems: "self-start",
                  }}
                >
                  <StarRating rating={hotelDetail.star} />
                </div>

                <h4 className="hotel-name mb-1">
                  {hotelDetail.hotelName ?? ""}
                </h4>

                <p className="hotel-address small mb-4">
                  {hotelDetail.address ?? ""}
                </p>

                <div
                  className="booking-divider mb-3"
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    margin: "15px 0",
                  }}
                ></div>

                <h5 className="mb-4">Your booking detail</h5>

                <Row className="mb-4">
                  <Col xs={6}>
                    <div className="checkin">
                      <div
                        className="small mb-1 fw-bold"
                        style={{ fontSize: 20 }}
                      >
                        Checkin
                      </div>
                      <div className="time">
                        {Utils.getDate(SearchInformation.checkinDate, 1)}
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="checkout">
                      <div
                        className="small mb-1 fw-bold"
                        style={{ fontSize: 20 }}
                      >
                        Checkout
                      </div>
                      <div className="time">
                        {Utils.getDate(SearchInformation.checkoutDate, 1)}
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className="stay-info mb-2">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total length of stay:</span>
                    <span className="fw-bold">
                      {(new Date(SearchInformation.checkoutDate) -
                        new Date(SearchInformation.checkinDate)) /
                        (1000 * 60 * 60 * 24)}{" "}
                      night
                    </span>{" "}
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Total number of people:</span>
                    <span className="fw-bold">
                      {SearchInformation.adults} Adults -{" "}
                      {SearchInformation.childrens} Childrens
                    </span>
                  </div>
                </div>

                <div
                  className="booking-divider mb-3"
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    margin: "15px 0",
                  }}
                ></div>

                <div className="selected-room mb-2">
                  <h5 className="mb-4">You selected</h5>

                  {selectedRooms.map(({ room, amount }) => (
                    <div
                      key={room._id}
                      className="d-flex justify-content-between align-items-center mb-1"
                    >
                      <span>
                        {amount} x {room.name}:
                      </span>
                      <span className="fw-bold">{Utils.formatCurrency(room.price * amount)}</span>
                    </div>
                  ))}

                  <div className="small mb-3">
                    <a
                      className="text-blue text-decoration-none"
                      style={{cursor: 'pointer'}}
                      onClick={() => {
                        navigate(-1);
                      }}
                    >
                      Change your selection
                    </a>
                  </div>
                </div>

                <div
                  className="booking-divider mb-3"
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    margin: "15px 0",
                  }}
                ></div>

                <div className="total-price">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="text-danger mb-0">
                      Total: {Utils.formatCurrency(selectedRooms.reduce((total, { room, amount }) => total + room.price * amount,0))}
                    </h5>{" "}
                  </div>
                  <div className="small">Includes taxes and fees</div>
                </div>
              </Card>
            </Col>

            {/* Right Card - Customer Information */}
            <Col md={5} lg={4}>
              <Card
                className="info-card"
                style={{
                  backgroundColor: "rgba(20, 30, 70, 0.85)",
                  borderRadius: "10px",
                  padding: "20px",
                  color: "white",
                }}
              >
                <h4 className="mb-4">Check your information</h4>

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Full name</Form.Label>
                    <Form.Control
                      type="text"
                      value={Auth.name}
                      className="bg-transparent text-white"
                      style={{
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "5px",
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={Auth.email}
                      placeholder="nguyenvanx@gmail.com"
                      className="bg-transparent text-white"
                      style={{
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "5px",
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={Auth.phoneNumber}
                      placeholder="0912345678"
                      className="bg-transparent text-white"
                      style={{
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "5px",
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Who are you booking for?</Form.Label>
                    <div>
                      <Form.Check
                        type="radio"
                        id="mainGuest"
                        label="I'm the main guest"
                        name="bookingFor"
                        checked={bookingFor === "mainGuest"}
                        onChange={() => setBookingFor("mainGuest")}
                        className="mb-2"
                      />
                      <Form.Check
                        type="radio"
                        id="someoneElse"
                        label="I'm booking for someone else"
                        name="bookingFor"
                        checked={bookingFor === "someoneElse"}
                        onChange={() => setBookingFor("someoneElse")}
                      />
                    </div>
                  </Form.Group>

                  <div className="text-center">
                    <Button
                      className="px-4 py-2"
                      style={{
                        borderRadius: "10px",
                        backgroundColor: "white",
                        color: "#007bff",
                        border: "none",
                        fontWeight: "bold",
                      }}
                      onClick={handleConfirmBooking}
                    >
                      Booking
                    </Button>
                    {/* Accept Confirmation Modal */}
                    <ConfirmationModal
                      show={showAcceptModal}
                      onHide={() => setShowAcceptModal(false)}
                      onConfirm={handleAccept}
                      title="Confirm Acceptance"
                      message="Do you want to proceed with this booking confirmation?"
                      confirmButtonText="Accept"
                      type="accept"
                    />
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </Container>
        <div>
          <ChatBox/>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingCheckPage;
