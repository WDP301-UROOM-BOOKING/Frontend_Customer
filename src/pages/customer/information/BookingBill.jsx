"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Image,
  Spinner,
} from "react-bootstrap";
import {
  FaStar,
  FaRegStar,
  FaFilePdf,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import Banner from "../../../images/banner.jpg";
import "../../../css/customer/BookingBill.css";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { useAppSelector, useAppDispatch } from "../../../redux/store";
import { showToast } from "@components/ToastContainer";
import ReservationActions from "../../../redux/reservations/actions";
import HotelActions from "../../../redux/hotel/actions";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as Routers from "../../../utils/Routes";
import { ChatBox } from "../home/HomePage";

const BookingBill = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const Auth = useAppSelector((state) => state.Auth.Auth);
  const reservationDetail = useAppSelector(
    (state) => state.Reservation?.reservationDetail
  );
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [ownerContact, setOwnerContact] = useState({
    name: "N/A",
    phone: "N/A",
    email: "N/A",
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [hotelDetail, setHotelDetail] = useState(null);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Load Vietnamese font
  useEffect(() => {
    const loadFont = async () => {
      try {
        const pdfLib = await import("jspdf");
        const pdfFontLib = await import("jspdf/dist/polyfills.es");

        setFontLoaded(true);
      } catch (error) {
        console.error("Error loading font:", error);
      }
    };

    loadFont();
  }, []);

  useEffect(() => {
    if (id) {
      fetchReservationDetail(id);
    }
  }, [id]);

  useEffect(() => {
    const hotelId = reservationDetail?.hotel?._id;
    console.log("Hotel ID for details:", hotelId);

    if (hotelId) {
      fetchHotelDetails(hotelId);
    }
  }, [reservationDetail]);

  useEffect(() => {
    if (hotelDetail) {
      console.log("Hotel details loaded:", hotelDetail);

      const hotelEmail = hotelDetail.email || "N/A";
      const hotelPhone = hotelDetail.phoneNumber || "N/A";

      let ownerName = "N/A";
      let ownerPhone = "N/A";
      let ownerEmail = "N/A";

      if (hotelDetail.owner) {
        if (typeof hotelDetail.owner === "object") {
          ownerName = hotelDetail.owner.name || "N/A";
          ownerPhone = hotelDetail.owner.phoneNumber || "N/A";
          ownerEmail = hotelDetail.owner.email || "N/A";
        }
      }

      // Set contact information with priority to owner info, fallback to hotel info
      setOwnerContact({
        name: ownerName,
        phone: ownerPhone || hotelPhone,
        email: ownerEmail || hotelEmail,
      });

      console.log("Updated owner contact:", {
        name: ownerName,
        phone: ownerPhone || hotelPhone,
        email: ownerEmail || hotelEmail,
      });
    }
  }, [hotelDetail]);

  const fetchReservationDetail = (reservationId) => {
    setLoading(true);
    dispatch({
      type: ReservationActions.FETCH_RESERVATION_DETAIL,
      payload: {
        reservationId,
        onSuccess: (data) => {
          console.log("Fetched reservation detail:", data);
          setLoading(false);
        },
        onFailed: (msg) => {
          showToast.error(msg || "Failed to fetch reservation details");
          setLoading(false);
        },
        onError: (err) => {
          console.error("Error fetching reservation details:", err);
          showToast.error(
            "Server error occurred while fetching reservation details"
          );
          setLoading(false);
        },
      },
    });
  };

  const fetchHotelDetails = (hotelId) => {
    console.log("Fetching hotel details for hotel ID:", hotelId);

    try {
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
            showToast.warning("Could not fetch hotel information");
          },
          onError: (err) => {
            console.error("Error fetching hotel details:", err);
            showToast.error("Server error while fetching hotel information");
          },
        },
      });
    } catch (error) {
      console.error("Exception while dispatching hotel detail action:", error);
    }
  };

  // Export bill as PDF with proper Vietnamese support
  const exportBillAsPDF = () => {
    if (!reservationDetail) {
      showToast.error("Không có thông tin đặt phòng để xuất hóa đơn");
      return;
    }

    setExportLoading(true);

    try {
      // Create a new jsPDF instance with proper configuration for Unicode support
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        floatPrecision: 16,
      });

      const addWrappedText = (text, x, y, maxWidth, lineHeight = 7) => {
        if (!text || text === "N/A") {
          doc.text("N/A", x, y);
          return y + lineHeight;
        }

        const words = text.split(" ");
        let line = "";
        let currentY = y;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          const testWidth =
            (doc.getStringUnitWidth(testLine) * doc.internal.getFontSize()) /
            doc.internal.scaleFactor;

          if (testWidth > maxWidth && i > 0) {
            doc.text(line, x, currentY);
            line = words[i] + " ";
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }

        doc.text(line, x, currentY);
        return currentY + lineHeight;
      };

      // Add a border to the page
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 220);

      // Add header with logo/branding
      doc.setFillColor(33, 43, 73); // Dark blue color
      doc.rect(10, 10, 190, 25, "F");

      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("UROOM", 105, 25, { align: "center" });

      // Add booking bill title
      doc.setFillColor(245, 245, 245); // Light gray background
      doc.rect(10, 35, 190, 10, "F");

      doc.setTextColor(33, 43, 73); // Dark blue text
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("BOOKING INVOICE", 105, 42, { align: "center" });

      // Add date in a nice format
      doc.setTextColor(100, 100, 100); // Gray color
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const createdDate = reservationDetail.createdAt
        ? formatDate(reservationDetail.createdAt)
        : "N/A";
      doc.text(`Date created: ${createdDate}`, 150, 52, { align: "right" });

      // Add reference number
      doc.text(`Booking code: ${id || "N/A"}`, 180, 57, { align: "right" });

      // Add hotel information in a box
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(15, 60, 85, 48);

      doc.setTextColor(33, 43, 73);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("HOTEL INFORMATION", 20, 68);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const hotelName =
        hotelDetail?.hotelName || reservationDetail.hotel?.name || "Hotel name";
      let currentY = 75;
      doc.text("Name:", 20, currentY);
      currentY = addWrappedText(hotelName, 35, currentY, 60);

      const hotelAddress = hotelDetail?.address1 || "77 Le Duan, Phuong Pham Ngu Lao, Quan 1, Ho Chi Minh City";
      doc.text("Address:", 20, currentY);
      currentY = addWrappedText(hotelAddress, 35, currentY, 60);

      const hotelPhone =
        hotelDetail?.phoneNumber || ownerContact.phone || "N/A";
      doc.text("Phone:", 20, currentY);
      currentY = addWrappedText(hotelPhone, 35, currentY, 60);

      const hotelEmail = hotelDetail?.email || ownerContact.email || "N/A";
      doc.text("Email:", 20, currentY);
      currentY = addWrappedText(hotelEmail, 35, currentY, 60);

      // Add customer information in a box
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(110, 60, 85, 48);  

      doc.setTextColor(33, 43, 73);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CUSTOMER INFORMATION", 115, 68);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      currentY = 75;
      doc.text("Name Customer:", 115, currentY);
      currentY = addWrappedText(Auth?.name || "N/A", 145, currentY, 60);

      doc.text("Phone Customer:", 115, currentY);
      currentY = addWrappedText(Auth?.phoneNumber || "N/A", 145, currentY, 60);

      doc.text("Email Customer:", 115, currentY);
      currentY = addWrappedText(Auth?.email || "N/A", 145, currentY, 60);

      // Add booking details in a box
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(15, 115, 180, 28);

      doc.setTextColor(33, 43, 73);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BOOKING DETAILS", 20, 123);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const checkInDate = formatDate(
        reservationDetail.checkInDate || reservationDetail.checkIn || ""
      );
      const checkOutDate = formatDate(
        reservationDetail.checkOutDate || reservationDetail.checkOut || ""
      );

      doc.text(`Check-in date: ${checkInDate}`, 20, 130);
      doc.text(`Check-out date: ${checkOutDate}`, 115, 130);
      doc.text(`Total amount: $${reservationDetail.totalAmount || calculateTotalPrice(reservationDetail.rooms)}`, 20, 138);
      doc.text(`Admin contact: uroom@web.com`, 115, 138);
      let finalY= 155;

      // Add signature section with improved styling
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(15, finalY, 85, 40);

      doc.setTextColor(33, 43, 73);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CUSTOMER SIGNATURE", 20, finalY + 10);

      doc.line(20, finalY + 30, 80, finalY + 30); // Signature line

      // Add hotel signature section
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(110, finalY, 85, 40);

      doc.setTextColor(33, 43, 73);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("HOTEL SIGNATURE", 115, finalY + 10);

      doc.line(115, finalY + 30, 175, finalY + 30); // Signature line

      // Add terms and conditions
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");

      // Use text wrapping for terms and conditions
      const termsText =
        "This invoice confirms your booking with the agreed terms and conditions.";
      const termsLines = doc.splitTextToSize(termsText, 150);
      doc.text(termsLines, 105, finalY + 50, { align: "center" });

      // Add footer
      doc.setFillColor(33, 43, 73); // Dark blue color
      doc.rect(10, 212, 190, 10, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Create date ${new Date().toLocaleDateString(
          "vi-VN"
        )} |UROOM - Online booking system`,
        105,
        218,
        {
          align: "center",
        }
      );

      // Save the PDF
      try {
        doc.save(`order-for-room-${id}.pdf`);
        showToast.success("Invoice successfully issued!");
      } catch (saveError) {
        console.error("Error saving PDF:", saveError);
        showToast.error("Unable to save PDF file");
      }
    } catch (error) {
      console.error("Error exporting bill:", error);
      showToast.error(
        "Lỗi khi xuất hóa đơn: " + (error.message || "Lỗi không xác định")
      );
    } finally {
      setExportLoading(false);
    }
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return `${amount}`;
    }
  };

  // Calculate total price from rooms
  const calculateTotalPrice = (rooms) => {
    if (!rooms || !Array.isArray(rooms)) return 0;
    return rooms.reduce((total, roomItem) => {
      const roomPrice = roomItem.room?.price || 0;
      const quantity = roomItem.quantity || 1;
      return total + roomPrice * quantity;
    }, 0);
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
      <div className="flex-grow-1 d-flex align-items-center justify-content-center content-wrapper" style={{paddingTop: '25px', paddingBottom: '25px'}}>
        <Container
          fluid
          className="booking-bill-container"
          style={{ marginTop: "50px" }}
        >
          {loading ? (
            <div className="text-center py-5 bg-white rounded shadow">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading booking information...</p>
              </div>
          ) : !reservationDetail ? (
            <div className="text-center py-5 bg-white rounded shadow">
              <div className="mb-3">
                <FaArrowLeft
                  style={{ cursor: "pointer", fontSize: "1.5rem" }}
                  onClick={() => navigate(-1)}
                />
              </div>
              <h4>Booking information not found</h4>
              <p className="text-muted">
                The booking information does not exist or you do not have
                permission to access it.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/booking-history")}
              >
                Back to booking history
              </Button>
            </div>
          ) : (
            <Card className="booking-bill-card">
              <Row className="g-0">
                {/* Left side - Hotel Image and Info */}
                <Col
                  md={5}
                  className="hotel-info-section"
                  style={{ paddingTop: "20px", paddingLeft: "20px", cursor: 'pointer' }}
                  onClick={() => {
                    navigate(`${Routers.Home_detail}/${reservationDetail.hotel?._id}`)
                  }}
                >
                  <Image
                    src={
                      hotelDetail?.images?.[0] ||
                      reservationDetail.hotel?.images?.[0] ||
                      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/647144068.jpg?k=acaba5abb30178b9f1c312eb53c94e59996dd9e624bb1835646a2a427cf87f0a&o=&hp=1" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                     || "/placeholder.svg"}
                    alt="Hotel Room"
                    style={{
                      height: "510px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div className="hotel-details">
                    <h5 className="hotel-name-title">Hotel name</h5>
                    <p className="hotel-full-name">
                      {hotelDetail?.hotelName ||
                        hotelDetail?.name ||
                        reservationDetail.hotel?.hotelName ||
                        reservationDetail.hotel?.name ||
                        "Hotel Name"}
                    </p>

                    <div className="check-dates-container">
                      <div className="check-date-box">
                        <p className="date-label">Check-in date</p>
                        <p className="date-value">
                          {formatDate(reservationDetail.checkInDate)}
                        </p>
                      </div>

                      <div className="star-rating-container">
                        <p className="star-hotel-text">Rating</p>
                        <StarRating
                          rating={reservationDetail.hotel?.star || 4}
                        />
                      </div>

                      <div className="check-date-box">
                        <p className="date-label">Check-out date</p>
                        <p className="date-value">
                          {formatDate(
                            reservationDetail.checkOutDate ||
                              reservationDetail.checkOut
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Right side - Booking Bill */}
                <Col md={7} className="bill-section">
                  <div className="bill-header">
                    <h2 className="uroom-title">UROOM</h2>
                    <div className="booking-bill-header">
                      <h4>Reservation invoice</h4>
                      <p className="date-created">
                        Date created:{" "}
                        {formatDate(reservationDetail.createdAt) || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Customer Information */}

                  <div className="info-section">
                    <Row className="mb-2">
                      <Col md={12} className="info-label">
                        <h5>I. CUSTOMER INFORMATION</h5>
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col md={3} className="info-label">
                        Customer name:
                      </Col>
                      <Col md={9} className="info-value">
                        {Auth.name || "N/A"}
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col md={3} className="info-label">
                        Phone number:
                      </Col>
                      <Col md={9} className="info-value">
                        {Auth.phoneNumber || "N/A"}
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col md={3} className="info-label">
                        Email:
                      </Col>
                      <Col md={9} className="info-value">
                        {Auth.email || "N/A"}
                      </Col>
                    </Row>
                  </div>

                  <div className="info-section">
                    <Row className="mb-2">
                      <Col md={12} className="info-label">
                      <h5>II. HOTEL INFORMATION</h5>
                      </Col>
                    </Row>
                    <Row className="mb-2"></Row>
                    {/* Update the hotel contact information display section */}
                    <Row className="mb-2">
                      <Col md={3} className="info-label">
                        Phone number:
                      </Col>
                      <Col md={9} className="info-value">
                        <div className="d-flex align-items-center">
                          {hotelDetail?.phoneNumber ||
                            hotelDetail?.owner?.phoneNumber ||
                            ownerContact.phone ||
                            "N/A"}
                        </div>
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col md={3} className="info-label">
                        Email:
                      </Col>
                      <Col md={9} className="info-value">
                        <div className="d-flex align-items-center">
                          {hotelDetail?.email ||
                            hotelDetail?.owner?.email ||
                            ownerContact.email ||
                            "hot1@gm.com"}
                        </div>
                      </Col>
                    </Row>
                    {hotelDetail?.address && (
                      <Row className="mb-2">
                        <Col md={3} className="info-label">
                          Address:
                        </Col>
                        <Col md={9} className="info-value">
                          {hotelDetail.address}
                        </Col>
                      </Row>
                    )}
                  </div>

                  <div className="info-section">
                    <Row className="mb-2">
                      <Col md={12} className="info-label">
                      <h5>III. BOOKING INFORMATION</h5>
                      </Col>
                    </Row>
                    <Table bordered className="booking-table">
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Room name</th>
                          <th>Quantity</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservationDetail.rooms &&
                        Array.isArray(reservationDetail.rooms) ? (
                          reservationDetail.rooms.map((roomItem, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{roomItem.room?.name || "Phòng"}</td>
                              <td>{roomItem.quantity || 1}</td>
                              <td>
                                {formatCurrency(roomItem.room?.price * roomItem.quantity || 0)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center">
                              No room information available
                            </td>
                          </tr>
                        )}
                        <tr className="total-row">
                          <td colSpan={2}>Total amount</td>
                          <td colSpan={2}>
                            {formatCurrency(
                              reservationDetail.totalAmount ||
                                calculateTotalPrice(reservationDetail.rooms)
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>

                  <div className="info-section">
                    <h5>IV. CUSTOMER SIGNATURE</h5>
                    <Form.Check
                      type="checkbox"
                      id="terms-checkbox"
                      label="Agree to the Hotel and Website Terms & Privacy"
                      className="terms-checkbox"
                    />
                    {/* <div className="export-button-container">
                      <Button
                        variant="info"
                        className="export-button"
                        style={{ color: "white", borderRadius: 10 }}
                        onClick={exportBillAsPDF}
                        disabled={exportLoading}
                      >
                        {exportLoading ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />{" "}
                            Đang xuất...
                          </>
                        ) : (
                          <>
                            <FaFilePdf className="me-2" /> Xuất PDF
                          </>
                        )}
                      </Button>
                    </div> */}
                  </div>
                </Col>
              </Row>
            </Card>
          )}
        </Container>
          <div>
            <ChatBox/>
          </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingBill;
