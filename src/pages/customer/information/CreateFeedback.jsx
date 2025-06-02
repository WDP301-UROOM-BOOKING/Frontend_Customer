import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import "../../../css/customer/CreateFeedback.css";
import Banner from "../../../images/banner.jpg";
import Header from "../Header";
import Footer from "../Footer";
import ConfirmationModal from "@components/ConfirmationModal";
import * as Routers from "../../../utils/Routes";
import { useNavigate, useParams } from "react-router-dom";
import { showToast, ToastProvider } from "@components/ToastContainer";
import { useAppSelector, useAppDispatch } from "../../../redux/store";
import FeedbackActions from "../../../redux/feedback/actions";
import HotelActions from "../../../redux/hotel/actions";
import ReservationActions from "../../../redux/reservations/actions";
import { ChatBox } from "../home/HomePage";

const CreateFeedback = () => {
  const dispatch = useAppDispatch();
  const Auth = useAppSelector((state) => state.Auth.Auth);
  const navigate = useNavigate();
  const { id: reservationId } = useParams();
  const [hotelId, setHotelId] = useState(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [hover, setHover] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hotelDetail, setHotelDetail] = useState(null);
  const [userReservations, setUserReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState("");
  const [selectedReservationDetails, setSelectedReservationDetails] = useState({
    checkIn: "",
    checkOut: "",
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  // Hàm tính số ngày giữa 2 ngày
  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "";
    try {
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `(${diffDays} days)`;
    } catch (error) {
      console.error("Error calculating duration:", error);
      return "";
    }
  };

  // Hàm định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      // Kiểm tra xem dateString có phải là chuỗi hợp lệ không
      console.log("Formatting date:", dateString, "Type:", typeof dateString);

      // Nếu là chuỗi ISO hoặc timestamp
      const date = new Date(dateString);

      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return dateString;
      }

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, "for date:", dateString);
      return dateString;
    }
  };

  // Lấy chi tiết đặt phòng
  const fetchReservationDetail = (reservationId) => {
    setIsLoading(true);
    dispatch({
      type: ReservationActions.FETCH_RESERVATION_DETAIL,
      payload: {
        reservationId,
        onSuccess: (data) => {
          console.log("Fetched reservation detail:", data);
          // Thêm dòng này để cập nhật ngày check-in và check-out
          if (data && data.checkInDate && data.checkOutDate) {
            console.log("Setting dates directly from fetchReservationDetail:", {
              checkIn: data.checkInDate,
              checkOut: data.checkOutDate,
            });
            setSelectedReservationDetails({
              checkIn: data.checkInDate,
              checkOut: data.checkOutDate,
            });
            setSelectedReservation(reservationId);
          }
          setIsLoading(false);
        },
        onFailed: (msg) => {
          showToast.error(msg || "Failed to fetch reservation details");
          setIsLoading(false);
        },
        onError: (err) => {
          console.error("Error fetching reservation details:", err);
          showToast.error(
            "Server error occurred while fetching reservation details"
          );
          setIsLoading(false);
        },
      },
    });
  };

  // Lấy thông tin khách sạn
  const fetchHotelDetails = (hotelId) => {
    if (!hotelId) return;

    console.log("Fetching hotel details for hotel ID:", hotelId);
    dispatch({
      type: HotelActions.FETCH_DETAIL_HOTEL,
      payload: {
        hotelId: hotelId,
        userId: Auth?._id,
        onSuccess: (hotel) => {
          console.log("Hotel detail fetched successfully:", hotel);
          setHotelDetail(hotel);
        },
        onFailed: (msg) => {
          console.error("Failed to fetch hotel details:", msg);
        },
        onError: (err) => {
          console.error("Error fetching hotel details:", err);
        },
      },
    });
  };

  // Xử lý thay đổi nội dung
  const handleContentChange = (e) => {
    const text = e.target.value;
    if (text.length <= 150) {
      setContent(text);
    }
  };

  // Xử lý hủy
  const handleCancel = () => {
    navigate(-1);
  };

  // Xử lý lưu
  const handleSave = () => {
    if (!content.trim()) {
      showToast.error("Please provide feedback content");
      setShowAcceptModal(false);
      return;
    }

    if (!selectedReservation) {
      showToast.error("Please select a reservation");
      setShowAcceptModal(false);
      return;
    }

    setIsSubmitting(true);

    const feedbackData = {
      hotel: hotelId,
      reservation: selectedReservation,
      content: content,
      rating: rating,
    };

    dispatch({
      type: FeedbackActions.CREATE_FEEDBACK,
      payload: {
        data: feedbackData,
        onSuccess: (newFeedback) => {
          setIsSubmitting(false);
          showToast.success("Create feedback successfully");

          // Cập nhật trạng thái thành COMPLETED
          if (reservationId) {
            dispatch({
              type: ReservationActions.UPDATE_RESERVATIONS,
              payload: {
                reservationId: reservationId,
                data: { status: "COMPLETED" },
                onSuccess: () => {
                  console.log("Status updated to COMPLETED");
                },
                onError: (err) => {
                  console.error("Error during status update:", err);
                },
              },
            });
          }

          navigate(-1);
        },
        onFailed: (message) => {
          setIsSubmitting(false);
          showToast.error(message || "Failed to create feedback");
        },
        onError: (error) => {
          setIsSubmitting(false);
          console.error("Error creating feedback:", error);
          showToast.error("Server error occurred");
        },
      },
    });
  };

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    if (reservationId) {
      console.log("Fetching reservation details for ID:", reservationId);
      fetchReservationDetail(reservationId);
    }
  }, [reservationId]);

  useEffect(() => {
    if (Auth && Auth._id) {
      if (reservationId) {
        // Chỉ lấy thông tin khách sạn nếu chưa có
        if (!hotelId || !hotelDetail) {
          dispatch({
            type: ReservationActions.FETCH_RESERVATION_DETAIL,
            payload: {
              reservationId,
              onSuccess: (data) => {
                console.log("Fetched hotel info from reservation:", data);
                if (data && data.hotel && data.hotel._id) {
                  setHotelId(data.hotel._id);
                  fetchHotelDetails(data.hotel._id);
                } else {
                  setError(
                    "Could not find hotel information for this reservation"
                  );
                  setIsLoading(false);
                }
              },
              onFailed: (msg) => {
                showToast.error(msg || "Failed to fetch reservation details");
                setError("Failed to fetch reservation details");
                setIsLoading(false);
              },
              onError: (err) => {
                console.error("Error fetching reservation details:", err);
                setError(
                  "Server error occurred while fetching reservation details"
                );
                setIsLoading(false);
              },
            },
          });
        }
      }
    } else {
      setError("You must be logged in to leave feedback");
      setIsLoading(false);
    }
  }, [Auth, reservationId, hotelId, hotelDetail]);

  // Debug useEffect để kiểm tra dữ liệu
  useEffect(() => {
    if (selectedReservationDetails.checkIn) {
      console.log("Current dates in state:", {
        checkIn: selectedReservationDetails.checkIn,
        formattedCheckIn: formatDate(selectedReservationDetails.checkIn),
        checkOut: selectedReservationDetails.checkOut,
        formattedCheckOut: formatDate(selectedReservationDetails.checkOut),
      });
    }
  }, [selectedReservationDetails]);

  // Hiển thị loading
  if (isLoading) {
    return (
      <div
        className="d-flex flex-column min-vh-100"
        style={{ backgroundImage: `url(${Banner})`, backgroundSize: "cover" }}
      >
        <Header />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
        <Footer />
      </div>
    );
  }

  // Hiển thị lỗi
  if (error && !hotelDetail) {
    return (
      <div
        className="d-flex flex-column min-vh-100"
        style={{ backgroundImage: `url(${Banner})`, backgroundSize: "cover" }}
      >
        <Header />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <Card className="p-4 text-center">
            <h4>Error</h4>
            <p>{error}</p>
            <Button
              variant="primary"
              onClick={() =>
                navigate(Routers.MyAccountPage, { state: { id: 3 } })
              }
            >
              Go Back
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundImage: `url(${Banner})`, backgroundSize: "cover" }}
    >
      <Header />
      <div className="flex-grow-1 d-flex align-items-center justify-content-center content-wrapper">
        <Container className="py-4" style={{ width: "1000px" }}>
          <Card className="feedback-card">
            <Card.Body>
              <div className="d-flex align-items-center mb-4">
                <h4 className="mb-0">Create new feedback</h4>
              </div>

              <Form>
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Label className="text-muted">Hotel:</Form.Label>
                  </Col>
                  <Col md={9}>
                    <p className="mb-0">
                      {hotelDetail?.name ||
                        hotelDetail?.hotelName ||
                        "Unknown Hotel"}
                    </p>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Label className="text-muted">
                      Checkin - Checkout:
                    </Form.Label>
                  </Col>
                  <Col md={9}>
                    <p className="mb-0">
                      {selectedReservationDetails.checkIn ? (
                        <>
                          {formatDate(selectedReservationDetails.checkIn)} -{" "}
                          {formatDate(selectedReservationDetails.checkOut)}{" "}
                          {calculateDuration(
                            selectedReservationDetails.checkIn,
                            selectedReservationDetails.checkOut
                          )}
                        </>
                      ) : (
                        "Loading date information..."
                      )}
                    </p>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Label className="text-muted">Rating:</Form.Label>
                  </Col>
                  <Col md={9}>
                    <div
                      className="star-rating"
                      style={{ justifyContent: "start" }}
                    >
                      {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                          <label key={index}>
                            <input
                              type="radio"
                              name="rating"
                              value={ratingValue}
                              onClick={() => setRating(ratingValue)}
                            />
                            <FaStar
                              className="star"
                              color={
                                ratingValue <= (hover || rating)
                                  ? "#ffc107"
                                  : "#e4e5e9"
                              }
                              onMouseEnter={() => setHover(ratingValue)}
                              onMouseLeave={() => setHover(null)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={3}>
                    <Form.Label className="text-muted">Description:</Form.Label>
                  </Col>
                  <Col md={9}>
                    <Form.Group className="position-relative">
                      <Form.Control
                        as="textarea"
                        rows={6}
                        placeholder="Enter your feedback here"
                        value={content}
                        onChange={handleContentChange}
                        maxLength={150}
                        required
                      />
                      <small className="char-count">{content.length}/150</small>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-center gap-3">
                  <Button
                    variant="danger"
                    className="px-4"
                    onClick={() => setShowUpdateModal(true)}
                    disabled={isSubmitting}
                  >
                    CANCEL
                  </Button>
                  <Button
                    variant="primary"
                    className="px-4"
                    onClick={() => setShowAcceptModal(true)}
                    disabled={
                      isSubmitting || !content.trim() || !selectedReservation
                    }
                  >
                    {isSubmitting ? "CREATING..." : "CREATE"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
        <div>
          <ChatBox />
        </div>

        {/* Modals */}
        <ConfirmationModal
          show={showUpdateModal}
          onHide={() => setShowUpdateModal(false)}
          onConfirm={handleCancel}
          title="Confirm Cancel"
          message="Are you sure you want to cancel Create Feedback ?"
          confirmButtonText="Confirm"
          type="warning"
        />

        <ConfirmationModal
          show={showAcceptModal}
          onHide={() => setShowAcceptModal(false)}
          onConfirm={handleSave}
          title="Confirm Create"
          message="Are you sure you want to create this new feedback ?"
          confirmButtonText="Accept"
          type="accept"
        />
        <ToastProvider />
      </div>
      <Footer />
    </div>
  );
};

export default CreateFeedback;
