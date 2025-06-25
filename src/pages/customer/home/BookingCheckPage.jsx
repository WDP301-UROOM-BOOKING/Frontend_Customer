import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { useAppSelector, useAppDispatch } from "../../../redux/store";
import Utils from "../../../utils/Utils";
import Factories from "../../../redux/search/factories";
import { ChatBox } from "./HomePage";
import SearchActions from "../../../redux/search/actions";
import HotelActions from "@redux/hotel/actions";
import HotelClosedModal from "./components/HotelClosedModal";

const BookingCheckPage = () => {
  const [showModalStatusBooking, setShowModalStatusBooking] = useState(false);

  const Auth = useAppSelector((state) => state.Auth.Auth);
  const SearchInformation = useAppSelector(
    (state) => state.Search.SearchInformation
  );
  const selectedRoomsTemps = useAppSelector(
    (state) => state.Search.selectedRooms
  );
  const selectedServicesFromRedux = useAppSelector(
    (state) => state.Search.selectedServices
  );
  const hotelDetailFromRedux = useAppSelector(
    (state) => state.Search.hotelDetail
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [bookingFor, setBookingFor] = useState("mainGuest");

  // Promotion code state
  const [promotionCode, setPromotionCode] = useState("");
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [promotionMessage, setPromotionMessage] = useState("");
  const [promotionId, setPromotionId] = useState(null);
  const [checkingPromotion, setCheckingPromotion] = useState(false);

  // Add state for booking data
  const [bookingData, setBookingData] = useState({
    selectedRooms: selectedRoomsTemps || [],
    selectedServices: selectedServicesFromRedux || [],
    hotelDetail: hotelDetailFromRedux || null,
    searchInfo: SearchInformation,
  });

  // Restore data from sessionStorage stack when component mounts
  useEffect(() => {
    const bookingStack = JSON.parse(
      sessionStorage.getItem("bookingStack") || "[]"
    );
    if (bookingStack.length > 0) {
      const currentBooking = bookingStack[bookingStack.length - 1];
      setBookingData(currentBooking);

      // Update Redux store with current data
      dispatch({
        type: SearchActions.SAVE_SELECTED_ROOMS,
        payload: {
          selectedRooms: currentBooking.selectedRooms,
          selectedServices: currentBooking.selectedServices,
          hotelDetail: currentBooking.hotelDetail,
        },
      });
    }
  }, [dispatch]);

  // Handle navigation back to HomeDetailPage
  const handleBackToHomeDetail = () => {
    const bookingStack = JSON.parse(
      sessionStorage.getItem("bookingStack") || "[]"
    );
    if (bookingStack.length > 0) {
      // Remove the current booking from stack
      bookingStack.pop();
      sessionStorage.setItem("bookingStack", JSON.stringify(bookingStack));
    }
    navigate(-1);
  };

  // Use bookingData instead of Redux state
  const selectedRooms = bookingData.selectedRooms;
  const selectedServices = bookingData.selectedServices;
  const hotelDetail = bookingData.hotelDetail;
  const searchInfo = bookingData.searchInfo;

  // Calculate number of days between check-in and check-out
  const calculateNumberOfDays = () => {
    const checkIn = new Date(searchInfo.checkinDate);
    const checkOut = new Date(searchInfo.checkoutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const numberOfDays = calculateNumberOfDays();

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
    dispatch({
      type: HotelActions.FETCH_DETAIL_HOTEL,
      payload: {
        hotelId: hotelDetail._id,
        userId: Auth._id,
        onSuccess: async (hotel) => {
          console.log("Hotel detail fetched successfully:", hotel);
          if (hotel.ownerStatus === "ACTIVE") {
            const totalRoomPrice = selectedRooms.reduce(
              (total, { room, amount }) =>
                total + room.price * amount * numberOfDays,
              0
            );

            const totalServicePrice = selectedServices.reduce(
              (total, service) => {
                const selectedDates = service.selectedDates || [];
                const serviceQuantity = service.quantity * selectedDates.length;
                return total + service.price * serviceQuantity;
              },
              0
            );

            const totalPrice = totalRoomPrice + totalServicePrice;

            const params = {
              hotelId: hotelDetail._id,
              checkOutDate: searchInfo.checkoutDate,
              checkInDate: searchInfo.checkinDate,
              totalPrice: totalPrice,
              roomDetails: selectedRooms.map(({ room, amount }) => ({
                room: {
                  _id: room._id,
                },
                amount: amount,
              })),
              serviceDetails: selectedServices.map((service) => ({
                _id: service._id,
                quantity:
                  service.quantity * (service.selectedDates?.length || 0),
                selectDate: service.selectedDates || [],
              })),
            };

            console.log("params >> ", params);

            try {
              const response = await Factories.create_booking(params);
              console.log("response >> ", response);
              if (response?.status === 200) {
                console.log("response >> ", response);
                const unpaidReservationId =
                  response?.data?.unpaidReservation?._id;
                const responseCheckout = await Factories.checkout_booking(
                  unpaidReservationId
                );
                console.log("responseCheckout >> ", responseCheckout);
                const paymentUrl = responseCheckout?.data?.sessionUrl;
                if (paymentUrl) {
                  window.location.href = paymentUrl;
                }
              }
              if (response?.status === 201) {
                console.log("response >> ", response);
                const reservationId = response?.data?.reservation?._id;
                const responseCheckout = await Factories.checkout_booking(
                  reservationId
                );
                const paymentUrl = responseCheckout?.data?.sessionUrl;
                if (paymentUrl) {
                  window.location.href = paymentUrl;
                }
              } else {
                console.log("error create booking");
              }
            } catch (error) {
              console.error("Error create payment: ", error);
              navigate(Routers.ErrorPage);
            }
          } else {
            setShowModalStatusBooking(true);
          }
        },
      },
    });
  };

  const handleAccept = () => {
    const totalRoomPrice = selectedRooms.reduce(
      (total, { room, amount }) => total + room.price * amount * numberOfDays,
      0
    );

    if (totalRoomPrice > 0) {
      createBooking();
      dispatch({
        type: SearchActions.SAVE_SELECTED_ROOMS,
        payload: {
          selectedRooms: [],
          selectedServices: [],
          hotelDetail: hotelDetail,
        },
      });
    }
  };
  // Promotion code handling
  // Tổng tiền chưa giảm giá
  const totalRoomPrice = selectedRooms.reduce(
    (total, { room, amount }) => total + room.price * amount * numberOfDays,
    0
  );
  const totalServicePrice = selectedServices.reduce((total, service) => {
    const selectedDates = service.selectedDates || [];
    const serviceQuantity = service.quantity * selectedDates.length;
    return total + service.price * serviceQuantity;
  }, 0);
  const totalPrice = totalRoomPrice + totalServicePrice;

  // Tổng tiền sau giảm giá
  const finalPrice = Math.max(totalPrice - promotionDiscount, 0);

  // Hàm kiểm tra promotion code
  const handleCheckPromotion = async () => {
    setCheckingPromotion(true);
    setPromotionMessage("");
    setPromotionDiscount(0);
    setPromotionId(null);
    try {
      const res = await axios.post("http://localhost:5000/api/promotions/apply", {
        code: promotionCode,
        orderAmount: totalPrice,
      });
      if (res.data.valid) {
        setPromotionDiscount(res.data.discount);
        setPromotionId(res.data.promotionId);
        setPromotionMessage("Promotion applied: -" + Utils.formatCurrency(res.data.discount));
      } else {
        setPromotionMessage(res.data.message || "Invalid promotion code");
      }
    } catch (err) {
      setPromotionMessage(
        err?.response?.data?.message || "Invalid promotion code"
      );
    }
    setCheckingPromotion(false);
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

  // Add null check for hotelDetail
  if (!hotelDetail) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
                        {Utils.getDate(searchInfo.checkinDate, 1)}
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
                        {Utils.getDate(searchInfo.checkoutDate, 1)}
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className="stay-info mb-2">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total length of stay:</span>
                    <span className="fw-bold">{numberOfDays} night</span>{" "}
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Total number of people:</span>
                    <span className="fw-bold">
                      {searchInfo.adults} Adults - {searchInfo.childrens}{" "}
                      Childrens
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
                        {amount} x {room.name} ({numberOfDays} days):
                      </span>
                      <span className="fw-bold">
                        {Utils.formatCurrency(
                          room.price * amount * numberOfDays
                        )}
                      </span>
                    </div>
                  ))}

                  <div className="small mb-3">
                    <a
                      className="text-blue text-decoration-none"
                      style={{ cursor: "pointer" }}
                      onClick={handleBackToHomeDetail}
                    >
                      Change your selection
                    </a>
                  </div>
                </div>

                {/* Selected Services Section */}
                {selectedServices.length > 0 && (
                  <div className="selected-services mb-2">
                    <h5 className="mb-3">Selected Services</h5>

                    {selectedServices.map((service) => {
                      const selectedDates = service.selectedDates || [];
                      const serviceQuantity =
                        service.quantity * selectedDates.length;
                      const serviceTotal = service.price * serviceQuantity;

                      return (
                        <div
                          key={service._id}
                          className="d-flex justify-content-between align-items-center mb-1"
                        >
                          <span>
                            {service.quantity} x {service.name} (
                            {selectedDates.length} days):
                          </span>
                          <span className="fw-bold">
                            {Utils.formatCurrency(serviceTotal)}
                          </span>
                        </div>
                      );
                    })}

                    <div className="small mb-3">
                      <a
                        className="text-blue text-decoration-none"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          dispatch({
                            type: SearchActions.SAVE_SELECTED_ROOMS,
                            payload: {
                              selectedRooms: selectedRooms,
                              selectedServices: selectedServices,
                              hotelDetail: hotelDetail,
                            },
                          });
                          navigate(-1);
                        }}
                      >
                        Change your selection
                      </a>
                    </div>
                  </div>
                )}

                <div
                  className="booking-divider mb-3"
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    margin: "15px 0",
                  }}
                ></div>

                {/* Promotion code input */}
                <h5 className="mb-4">Promotion</h5>
                <div className="promotion-section mb-3">
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Enter promotion code"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value)}
                      disabled={checkingPromotion}
                    />
                    <Button
                      variant="outline-light"
                      onClick={handleCheckPromotion}
                      disabled={checkingPromotion || !promotionCode}
                    >
                      {checkingPromotion ? "Checking..." : "Apply"}
                    </Button>
                  </InputGroup>
                  {promotionMessage && (
                    <div
                      className={`mt-2 small ${promotionDiscount > 0 ? "text-success" : "text-danger"
                        }`}
                    >
                      {promotionMessage}
                    </div>
                  )}
                </div>

                <div className="total-price">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="text-danger mb-0">
                      Total: {Utils.formatCurrency(finalPrice)}
                    </h5>
                  </div>
                  {promotionDiscount > 0 && (
                    <div className="small text-success">
                      Discount: -{Utils.formatCurrency(promotionDiscount)}
                    </div>
                  )}
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
          <ChatBox />
        </div>
      </div>
      <Footer />
      <HotelClosedModal
        show={showModalStatusBooking}
        onClose={() => {
          setShowModalStatusBooking(false);
        }}
      />
    </div>
  );
};

export default BookingCheckPage;
