import React, { useState, useEffect, use } from "react";
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
import { FaStar, FaRegStar, FaTag, FaTimes } from "react-icons/fa";
import Banner from "../../../images/banner.jpg";
import Header from "../Header";
import Footer from "../Footer";
import * as Routers from "../../../utils/Routes";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "@components/ConfirmationModal";
import PromotionModal from "./components/PromotionModal";
import PromotionErrorModal from "./components/PromotionErrorModal";
import { useAppSelector, useAppDispatch } from "../../../redux/store";
import { applyPromotion } from "../../../redux/promotion/actions";
import Utils from "../../../utils/Utils";
import Factories from "../../../redux/search/factories";
import { ChatBox } from "./HomePage";
import SearchActions from "../../../redux/search/actions";
import HotelActions from "@redux/hotel/actions";
import HotelClosedModal from "./components/HotelClosedModal";
import { showToast, ToastProvider } from "@components/ToastContainer";
import getApiBackendUrl from "@utils/apiConfig";
import RoomClosedModal from "./components/RoomClosedModal";

const BookingCheckPage = () => {
  const API_BASE_URL = getApiBackendUrl(); // Add this line

  const [showModalStatusBooking, setShowModalStatusBooking] = useState(false);
  const [error, setError]= useState(null);
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

  // Redux promotion selectors
  const {
    applyLoading: promotionApplyLoading,
    applyError: promotionApplyError,
    appliedPromotion
  } = useAppSelector(state => state.Promotion);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [bookingFor, setBookingFor] = useState("mainGuest");

  // Promotion code state
  const [promotionCode, setPromotionCode] = useState("");
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [promotionMessage, setPromotionMessage] = useState("");
  const [promotionId, setPromotionId] = useState(null);

  // Add state for booking data
  const [bookingData, setBookingData] = useState({
    selectedRooms: selectedRoomsTemps || [],
    selectedServices: selectedServicesFromRedux || [],
    hotelDetail: hotelDetailFromRedux || null,
    searchInfo: SearchInformation,
  });

  const [dataRestored, setDataRestored] = useState(false);
  const [isValidatingPromotion, setIsValidatingPromotion] = useState(false);
  const [isCheckingHotelStatus, setIsCheckingHotelStatus] = useState(false);
  const [
    isValidatingPromotionBeforeBooking,
    setIsValidatingPromotionBeforeBooking,
  ] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
    setDataRestored(true);
    setIsInitialLoading(false);
  }, [dispatch]);

  // Load promotion info from sessionStorage AFTER booking data is restored
  useEffect(() => {
    if (dataRestored) {
      const promo = JSON.parse(
        sessionStorage.getItem("promotionInfo") || "null"
      );
      if (promo) {
        // Check if this is a new booking (different hotel or rooms)
        const currentHotelId = bookingData.hotelDetail?._id;
        const savedHotelId = promo.hotelId;
        const currentRoomsHash = JSON.stringify(
          bookingData.selectedRooms
            ?.map((r) => ({ roomId: r.room._id, amount: r.amount }))
            .sort()
        );
        const savedRoomsHash = promo.roomsHash;

        if (
          currentHotelId !== savedHotelId ||
          currentRoomsHash !== savedRoomsHash
        ) {
          // This is a new booking, clear old promotion
          sessionStorage.removeItem("promotionInfo");
          console.log("🆕 New booking detected, cleared old promotion");
          return;
        }

        // Check if promotion was saved more than 5 minutes ago
        const savedTime = promo.savedTime || Date.now();
        const timeDiff = Date.now() - savedTime;
        const fiveMinutes = 5 * 60 * 1000;

        if (timeDiff > fiveMinutes) {
          // Auto-validate if promotion is old
          console.log("Promotion is old, auto-validating...");
          setPromotionCode(promo.promotionCode || "");
          setPromotionDiscount(promo.promotionDiscount || 0);
          setPromotionMessage("Validating promotion...");
          setPromotionId(promo.promotionId || null);
        } else {
          setPromotionCode(promo.promotionCode || "");
          setPromotionDiscount(promo.promotionDiscount || 0);
          setPromotionMessage(promo.promotionMessage || "");
          setPromotionId(promo.promotionId || null);
          console.log(
            "🔄 Restored promotion for same booking:",
            promo.promotionCode
          );
        }
      }
    }
  }, [dataRestored, bookingData.hotelDetail, bookingData.selectedRooms]);

  // Save promotion info to sessionStorage when any promotion state changes
  useEffect(() => {
    if (dataRestored) {
      // Chỉ save khi đã restore xong data
      sessionStorage.setItem(
        "promotionInfo",
        JSON.stringify({
          promotionCode,
          promotionDiscount,
          promotionMessage,
          promotionId,
          savedTime: Date.now(), // Add timestamp for validation
          // Save booking context to detect new bookings
          hotelId: bookingData.hotelDetail?._id,
          roomsHash: JSON.stringify(
            bookingData.selectedRooms
              ?.map((r) => ({ roomId: r.room._id, amount: r.amount }))
              .sort()
          ),
        })
      );
    }
  }, [
    promotionCode,
    promotionDiscount,
    promotionMessage,
    promotionId,
    dataRestored,
    bookingData.hotelDetail,
    bookingData.selectedRooms,
  ]);

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

  // Calculate prices
  const totalRoomPrice = selectedRooms.reduce(
    (total, { room, amount }) => total + room.price * amount * numberOfDays,
    0
  );
  const totalServicePrice = selectedServices.reduce((total, service) => {
    const selectedDates = service.selectedDates || [];
    const serviceQuantity = service.quantity * selectedDates.length;
    return total + service.price * serviceQuantity;
  }, 0);
  const subtotal = totalRoomPrice + totalServicePrice;
  const finalPrice = Math.max(subtotal - promotionDiscount, 0);

  // Validate promotion when data is restored or booking changes
  useEffect(() => {
    if (
      !dataRestored ||
      !promotionCode ||
      !promotionId ||
      promotionDiscount === 0
    )
      return;

    // Add a small delay to ensure promotion is fully restored before validation
    const timeoutId = setTimeout(() => {
      // Only show loading if validation takes longer than 200ms
      const loadingTimeoutId = setTimeout(() => {
        setIsValidatingPromotion(true);
      }, 200);

      dispatch(applyPromotion({
        code: promotionCode,
        orderAmount: subtotal,
        onSuccess: (data) => {
          clearTimeout(loadingTimeoutId);
          setIsValidatingPromotion(false);

          if (!data.valid || data.discount !== promotionDiscount) {
            // Batch update all promotion states to minimize re-renders
            setTimeout(() => {
              setPromotionCode("");
              setPromotionDiscount(0);
              setPromotionMessage(
                "Promotion is no longer valid due to booking changes"
              );
              setPromotionId(null);
              sessionStorage.removeItem("promotionInfo");
            }, 0);
          }
        },
        onFailed: (error) => {
          clearTimeout(loadingTimeoutId);
          setIsValidatingPromotion(false);
          // Batch update all promotion states to minimize re-renders
          setTimeout(() => {
            setPromotionCode("");
            setPromotionDiscount(0);
            setPromotionMessage("Promotion is no longer valid");
            setPromotionId(null);
            sessionStorage.removeItem("promotionInfo");
          }, 0);
        }
      }));
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [dataRestored, subtotal, promotionCode, promotionId, promotionDiscount, dispatch]); // Validate when subtotal changes or data is restored

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
    // Don't clear promotion here - user might come back with same selection
    // Promotion will be cleared only when new booking (different hotel/rooms) is detected
    navigate(-1);
  };

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
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showPromotionErrorModal, setShowPromotionErrorModal] = useState(false);
  const [promotionErrorMessage, setPromotionErrorMessage] = useState("");
  const [invalidPromotionCode, setInvalidPromotionCode] = useState("");

  // Add state for payment error modal
  const [showPaymentErrorModal, setShowPaymentErrorModal] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState({
    title: "",
    mainMessage: "",
    subMessage: ""
  });

  // Hàm xử lý áp dụng promotion từ modal với batch update để tránh multiple re-renders
  const handleApplyPromotionFromModal = (promotionData) => {
    // Batch update all promotion states at once to minimize re-renders
    const updatePromotionStates = () => {
      setPromotionCode(promotionData.code);
      setPromotionDiscount(promotionData.discount);
      setPromotionMessage(promotionData.message);
      setPromotionId(promotionData.promotionId);
    };

    // Use setTimeout to batch the state updates
    setTimeout(updatePromotionStates, 0);
  };

  // Function to validate promotion before booking (optimized to avoid unnecessary re-renders)
  const validatePromotionBeforeBooking = async () => {
    if (!promotionCode || !promotionId || promotionDiscount === 0) {
      return { valid: true }; // No promotion to validate
    }

    // Only show loading state if validation takes longer than 300ms
    let shouldShowLoading = false;
    const loadingTimeoutId = setTimeout(() => {
      shouldShowLoading = true;
      setIsValidatingPromotionBeforeBooking(true);
    }, 300);

    return new Promise((resolve) => {
      dispatch(applyPromotion({
        code: promotionCode,
        orderAmount: subtotal,
        onSuccess: (data) => {
          // Clear timeout and loading state
          clearTimeout(loadingTimeoutId);
          if (shouldShowLoading) {
            setIsValidatingPromotionBeforeBooking(false);
          }

          if (!data.valid) {
            resolve({
              valid: false,
              message: data.message || "Promotion is no longer valid",
            });
            return;
          }

          if (data.discount !== promotionDiscount) {
            resolve({
              valid: false,
              message:
                "Promotion discount has changed. Please reapply the promotion.",
            });
            return;
          }

          resolve({ valid: true });
        },
        onFailed: (error) => {
          // Clear timeout and loading state
          clearTimeout(loadingTimeoutId);
          if (shouldShowLoading) {
            setIsValidatingPromotionBeforeBooking(false);
          }
          resolve({
            valid: false,
            message: "Unable to validate promotion. Please try again.",
          });
        }
      }));
    });
  };

  // Function to check hotel status before booking (optimized to avoid unnecessary loading states)
  const checkHotelStatusBeforeBooking = async () => {
    return new Promise((resolve, reject) => {
      // Only show loading state if check takes longer than 300ms
      let shouldShowLoading = false;
      const loadingTimeoutId = setTimeout(() => {
        shouldShowLoading = true;
        setIsCheckingHotelStatus(true);
      }, 300);

      dispatch({
        type: HotelActions.FETCH_DETAIL_HOTEL,
        payload: {
          hotelId: hotelDetail._id,
          userId: Auth._id,
          onSuccess: (hotel) => {
            clearTimeout(loadingTimeoutId);
            if (shouldShowLoading) {
              setIsCheckingHotelStatus(false);
            }
            if (hotel.ownerStatus === "ACTIVE") {
              resolve(hotel);
            } else {
              reject(new Error("Hotel is currently inactive"));
            }
          },
          onFailed: (error) => {
            clearTimeout(loadingTimeoutId);
            if (shouldShowLoading) {
              setIsCheckingHotelStatus(false);
            }
            reject(new Error(error || "Failed to check hotel status"));
          },
          onError: () => {
            clearTimeout(loadingTimeoutId);
            if (shouldShowLoading) {
              setIsCheckingHotelStatus(false);
            }
            reject(new Error("Server error while checking hotel status"));
          },
        },
      });
    });
  };
  const createBooking = async () => {
    try {
      // Validate promotion first if there's one applied
      const promotionValidation = await validatePromotionBeforeBooking();
      if (!promotionValidation.valid) {
        // Store error info for modal
        setPromotionErrorMessage(promotionValidation.message);
        setInvalidPromotionCode(promotionCode);

        // Clear invalid promotion
        setPromotionCode("");
        setPromotionDiscount(0);
        setPromotionMessage("");
        setPromotionId(null);
        sessionStorage.removeItem("promotionInfo");

        // Show error modal
        setShowPromotionErrorModal(true);
        return;
      }

      // Check hotel status
      const hotel = await checkHotelStatusBeforeBooking();
      console.log("Hotel detail fetched successfully:", hotel);
      const totalRoomPrice = selectedRooms.reduce(
        (total, { room, amount }) => total + room.price * amount * numberOfDays,
        0
      );

      const totalServicePrice = selectedServices.reduce((total, service) => {
        const selectedDates = service.selectedDates || [];
        const serviceQuantity = service.quantity * selectedDates.length;
        return total + service.price * serviceQuantity;
      }, 0);

      const bookingSubtotal = totalRoomPrice + totalServicePrice;

      const params = {
        hotelId: hotelDetail._id,
        checkOutDate: searchInfo.checkoutDate,
        checkInDate: searchInfo.checkinDate,
        totalPrice: bookingSubtotal, // giá gốc
        finalPrice: finalPrice, // giá sau giảm giá
        roomDetails: selectedRooms.map(({ room, amount }) => ({
          room: {
            _id: room._id,
          },
          amount: amount,
        })),
        serviceDetails: selectedServices.map((service) => ({
          _id: service._id,
          quantity: service.quantity * (service.selectedDates?.length || 0),
          selectDate: service.selectedDates || [],
        })),
        // Thêm promotionId và promotionDiscount nếu có
        ...(promotionId && { promotionId }),
        ...(promotionDiscount > 0 && { promotionDiscount }),
      };

      console.log("params >> ", params);

      // Helper function to save reservationId to bookingStack
      const saveReservationIdToBookingStack = (reservationId) => {
        if (reservationId) {
          const bookingStack = JSON.parse(
            sessionStorage.getItem("bookingStack") || "[]"
          );
          if (bookingStack.length > 0) {
            bookingStack[bookingStack.length - 1].reservationId = reservationId;
            sessionStorage.setItem(
              "bookingStack",
              JSON.stringify(bookingStack)
            );
          }
        }
      };
      try {
        let reservationId = null;
        const bookingStack = JSON.parse(
          sessionStorage.getItem("bookingStack") || "[]"
        );
        if (
          bookingStack.length > 0 &&
          bookingStack[bookingStack.length - 1].reservationId
        ) {
          reservationId = bookingStack[bookingStack.length - 1].reservationId;
        }
        const response = await Factories.create_booking({
          ...params,
          reservationId,
        });
        console.log("response >> ", response);
        if (response?.status === 200) {
          reservationId = response?.data?.unpaidReservation?._id;
          saveReservationIdToBookingStack(reservationId);
          const unpaidReservationId = reservationId;
          const responseCheckout = await Factories.checkout_booking(
            unpaidReservationId
          );
          console.log("responseCheckout >> ", responseCheckout);
          const paymentUrl = responseCheckout?.data?.sessionUrl;
          if (paymentUrl) {
            // Don't clear promotion here - user might come back from payment
            // Promotion will be cleared when new booking is created
            window.location.href = paymentUrl;
          }
        } else if (response?.status === 201) {
          reservationId = response?.data?.reservation?._id;
          saveReservationIdToBookingStack(reservationId);
          const responseCheckout = await Factories.checkout_booking(
            reservationId
          );
          const paymentUrl = responseCheckout?.data?.sessionUrl;
          if (paymentUrl) {
            // Don't clear promotion here - user might come back from payment
            // Promotion will be cleared when new booking is created
            window.location.href = paymentUrl;
          }
        } else {
          showToast.error("error create booking");
        }
      } catch (error) {
        
        console.error("Error create payment: ", error.response?.data?.message);
        setPaymentErrorMessage({
          title: "Payment Error",
          mainMessage: "Unable to process your payment at this time",
          subMessage: error.response?.data?.message || "Please try again later"
        });
        setShowPaymentErrorModal(true);
      }
    } catch (error) {
      console.error("Error checking hotel status:", error);
      setShowModalStatusBooking(true);
    }
  };

  const handleAccept = async () => {
    const totalRoomPrice = selectedRooms.reduce(
      (total, { room, amount }) => total + room.price * amount * numberOfDays,
      0
    );

    if (totalRoomPrice > 0) {
      // Final validation before creating booking
      await createBooking();

      // Only clear selection if booking was successful
      // (createBooking will handle errors and not reach this point if failed)
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

  const handleConfirmBooking = () => {
    setShowAcceptModal(true);
  };

  // Only show loading spinner during initial load, not during re-renders
  if (isInitialLoading || (!hotelDetail && !dataRestored)) {
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

  // If data is restored but hotelDetail is still missing, redirect back
  if (!hotelDetail && dataRestored) {
    navigate(-1);
    return null;
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
            <ToastProvider />
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

                <div className="promotion-section mb-3">
                  {/* Current applied promotion display */}
                  {promotionDiscount > 0 ? (
                    <Card
                      className="promotion-applied mb-3"
                      style={{
                        backgroundColor: "rgba(40, 167, 69, 0.2)",
                        borderColor: "#28a745",
                        border: "2px solid #28a745",
                      }}
                    >
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="d-flex align-items-center">
                              <FaTag className="text-success me-2" />
                              <span className="fw-bold text-success">
                                {promotionCode}
                              </span>
                            </div>
                            <small className="text-success">
                              Save {Utils.formatCurrency(promotionDiscount)}
                            </small>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleApplyPromotionFromModal({
                                code: "",
                                discount: 0,
                                message: "",
                                promotionId: null,
                              })
                            }
                            className="d-flex align-items-center"
                            disabled={
                              isValidatingPromotion ||
                              isValidatingPromotionBeforeBooking
                            }
                          >
                            <FaTimes className="me-1" />
                            {isValidatingPromotion ||
                            isValidatingPromotionBeforeBooking
                              ? "..."
                              : "Remove"}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ) : (
                    <div
                      className="text-center py-3 mb-3"
                      style={{
                        border: "2px dashed rgba(255,255,255,0.3)",
                        borderRadius: "8px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                      }}
                    >
                      <FaTag className="text-muted mb-2" size={24} />
                      <div className="text-muted small">
                        No promotion applied
                      </div>
                    </div>
                  )}

                  {/* Button to open promotion modal */}
                  <Button
                    variant="outline-light"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => setShowPromotionModal(true)}
                    style={{
                      borderStyle: "dashed",
                      borderWidth: "2px",
                      padding: "12px",
                    }}
                    disabled={
                      isValidatingPromotion ||
                      isValidatingPromotionBeforeBooking
                    }
                  >
                    <FaTag className="me-2" />
                    {isValidatingPromotion || isValidatingPromotionBeforeBooking
                      ? "Validating..."
                      : promotionDiscount > 0
                      ? "Change Promotion"
                      : "Select Promotion"}
                  </Button>

                  {/* Validation status indicator */}
                  {(isValidatingPromotion ||
                    isValidatingPromotionBeforeBooking) && (
                    <div className="text-center mt-2">
                      <small className="text-info">
                        <div
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Checking promotion validity...
                      </small>
                    </div>
                  )}
                </div>

                {/* Price breakdown section */}
                <div className="price-breakdown">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Subtotal:</span>
                    <span className="fw-bold">
                      {Utils.formatCurrency(subtotal)}
                    </span>
                  </div>

                  {promotionDiscount > 0 && (
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-success">Discount:</span>
                      <span className="fw-bold text-success">
                        -{Utils.formatCurrency(promotionDiscount)}
                      </span>
                    </div>
                  )}

                  <div
                    className="booking-divider mb-2"
                    style={{
                      height: "1px",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      margin: "10px 0",
                    }}
                  ></div>

                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="text-danger mb-0">
                      Total: {Utils.formatCurrency(finalPrice)}
                    </h5>
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
                      disabled={
                        isCheckingHotelStatus ||
                        isValidatingPromotion ||
                        isValidatingPromotionBeforeBooking
                      }
                    >
                      {isValidatingPromotionBeforeBooking
                        ? "Validating Promotion..."
                        : isCheckingHotelStatus
                        ? "Checking Hotel..."
                        : "Booking"}
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

      {/* Promotion Modal */}
      <PromotionModal
        show={showPromotionModal}
        onHide={() => setShowPromotionModal(false)}
        totalPrice={subtotal}
        onApplyPromotion={handleApplyPromotionFromModal}
        currentPromotionId={promotionId}
      />

      <HotelClosedModal
        show={showModalStatusBooking}
        onClose={() => {
          setShowModalStatusBooking(false);
        }}
      />

      {/* Promotion Error Modal */}
      <PromotionErrorModal
        show={showPromotionErrorModal}
        onClose={() => {
          setShowPromotionErrorModal(false);
          setPromotionErrorMessage("");
          setInvalidPromotionCode("");
        }}
        onSelectNewPromotion={() => {
          setShowPromotionErrorModal(false);
          setPromotionErrorMessage("");
          setInvalidPromotionCode("");
          setShowPromotionModal(true);
        }}
        errorMessage={promotionErrorMessage}
        promotionCode={invalidPromotionCode}
      />

      <RoomClosedModal 
        show={showPaymentErrorModal}
        onClose={() => setShowPaymentErrorModal(false)}
        title={paymentErrorMessage.title}
        mainMessage={paymentErrorMessage.mainMessage}
        subMessage={paymentErrorMessage.subMessage}
        buttonText="Try Again"
      />
    </div>
  );
};

export default BookingCheckPage;
