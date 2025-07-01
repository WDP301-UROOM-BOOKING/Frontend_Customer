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
import pdfMake from '../../../utils/fonts';
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
  const [termsAccepted, setTermsAccepted] = useState(false);

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
// lấy thông tin chi tiết khách sạn
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

  // Calculate total price from rooms and services
  const calculateTotalPrice = (rooms, services = [], checkInDate, checkOutDate) => {
    // Calculate number of nights
    const calculateNights = (checkIn, checkOut) => {
      if (!checkIn || !checkOut) return 1;
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return nights > 0 ? nights : 1;
    };

    const nights = calculateNights(checkInDate, checkOutDate);

    const roomsTotal = rooms && Array.isArray(rooms) 
      ? rooms.reduce((total, roomItem) => {
          const roomPrice = roomItem.room?.price || 0;
          const quantity = roomItem.quantity || 1;
          // Room price = price per night × quantity × number of nights
          return total + roomPrice * quantity * nights;
        }, 0)
      : 0;

    const servicesTotal = services && Array.isArray(services)
      ? services.reduce((total, serviceItem) => {
          const servicePrice = serviceItem.service?.price || 0;
          const quantity = serviceItem.quantity || 1;
          const daysCount = serviceItem.selectDate?.length || 1;
          // Service price = price × quantity × selected days
          return total + servicePrice * quantity * daysCount;
        }, 0)
      : 0;

    return roomsTotal + servicesTotal;
  };

  // Export bill as PDF with services included
  const exportBillAsPDF = () => {
    if (!termsAccepted) {
      showToast.warning("Please agree to the Terms & Privacy before exporting");
      return;
    }

    if (!reservationDetail) {
      showToast.error("Không có thông tin đặt phòng để xuất hóa đơn");
      return;
    }

    setExportLoading(true);

    try {
      // Calculate nights for PDF
      const calculateNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 1;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return nights > 0 ? nights : 1;
      };

      const nights = calculateNights(reservationDetail.checkInDate, reservationDetail.checkOutDate);

      // Prepare rooms data for PDF
      const roomsData = reservationDetail.rooms?.map((roomItem, index) => [
        (index + 1).toString(),
        `${roomItem.room?.name || "Phòng"} (${formatCurrency(roomItem.room?.price || 0)} × ${roomItem.quantity} × ${nights} nights)`,
        `${roomItem.quantity || 1} × ${nights} nights`,
        formatCurrency((roomItem.room?.price || 0) * (roomItem.quantity || 1) * nights),
      ]) || [];

      // Prepare services data for PDF
      const servicesData = reservationDetail.services?.map((serviceItem, index) => [
        (roomsData.length + index + 1).toString(),
        `${serviceItem.service?.name || "Dịch vụ"} (${formatCurrency(serviceItem.service?.price || 0)} × ${serviceItem.quantity / serviceItem.selectDate?.length || 1} × ${serviceItem.selectDate?.length || 1} days)`,
        `${serviceItem.quantity / serviceItem.selectDate?.length || 1} × ${serviceItem.selectDate?.length || 1} days`,
        formatCurrency(
          (serviceItem.service?.price || 0) * 
          (serviceItem.quantity || 1)
        ),
      ]) || [];

      // Combine rooms and services data
      const allItemsData = [...roomsData, ...servicesData];

      // Document definition
      const pdfTableBody = [
        ["STT", "Rooms and Services", "Quantity", "Price"],
        ...allItemsData,
        [
          "",
          "",
          "Total amount",
          formatCurrency(
            reservationDetail.totalAmount ||
              reservationDetail.totalPrice ||
              calculateTotalPrice(
                reservationDetail.rooms,
                reservationDetail.services,
                reservationDetail.checkInDate,
                reservationDetail.checkOutDate
              )
          ),
        ],
      ];
      if (reservationDetail.promotionDiscount > 0) {
        pdfTableBody.push([
          "",
          "",
          { text: "Discount", color: "red" },
          { text: "-" + formatCurrency(reservationDetail.promotionDiscount), color: "red" },
        ]);
        pdfTableBody.push([
          "",
          "",
          { text: "Total after discount", color: "green", bold: true },
          { text: formatCurrency(reservationDetail.finalPrice), color: "green", bold: true },
        ]);
      }
      const docDefinition = {
        content: [
          // Header
          {
            text: "UROOM",
            style: "header",
            alignment: "center",
            margin: [0, 0, 0, 20],
          },
          {
            text: "BOOKING INVOICE",
            style: "subheader",
            alignment: "center",
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                text: `Date created: ${formatDate(
                  reservationDetail.createdAt
                )}`,
                alignment: "left",
              },
              {
                text: `Booking code: ${id || "N/A"}`,
                alignment: "right",
              },
            ],
            margin: [0, 0, 0, 20],
          },
          // Hotel Information
          {
            text: "HOTEL INFORMATION",
            style: "sectionHeader",
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              widths: ["30%", "70%"],
              body: [
                [
                  "Name:",
                  hotelDetail?.hotelName ||
                    reservationDetail.hotel?.name ||
                    "Hotel name",
                ],
                ["Address:", hotelDetail?.address || "N/A"],
                [
                  "Phone:",
                  hotelDetail?.phoneNumber || ownerContact.phone || "N/A",
                ],
                ["Email:", hotelDetail?.email || ownerContact.email || "N/A"],
              ],
            },
            margin: [0, 0, 0, 20],
          },
          // Customer Information
          {
            text: "CUSTOMER INFORMATION",
            style: "sectionHeader",
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              widths: ["30%", "70%"],
              body: [
                ["Name:", Auth?.name || "N/A"],
                ["Phone:", Auth?.phoneNumber || "N/A"],
                ["Email:", Auth?.email || "N/A"],
              ],
            },
            margin: [0, 0, 0, 20],
          },
          // Booking Details
          {
            text: "BOOKING DETAILS",
            style: "sectionHeader",
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              widths: ["10%", "40%", "20%", "30%"],
              body: pdfTableBody,
            },
            margin: [0, 0, 0, 20],
          },
          // Terms and Signature
          {
            text: "This invoice confirms your booking with the agreed terms and conditions.",
            style: "terms",
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                text: "CUSTOMER SIGNATURE",
                style: "signatureHeader",
                alignment: "center",
              },
              {
                text: "HOTEL SIGNATURE",
                style: "signatureHeader",
                alignment: "center",
              },
            ],
            margin: [0, 40, 0, 40],
          },
        ],
        styles: {
          header: {
            fontSize: 24,
            bold: true,
            color: "#212B49",
          },
          subheader: {
            fontSize: 18,
            bold: true,
            color: "#212B49",
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: "#212B49",
          },
          terms: {
            fontSize: 10,
            italics: true,
            color: "#666666",
          },
          signatureHeader: {
            fontSize: 12,
            bold: true,
          },
        },
        defaultStyle: {
          font: "Roboto",
          fallbackFonts: ['Times-Roman']
        },
      };

      // Generate PDF
      pdfMake.createPdf(docDefinition).download(`order-for-room-${id}.pdf`);
      showToast.success("Invoice successfully issued!");
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
        style={{ paddingTop: "25px", paddingBottom: "25px" }}
      >
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
                  style={{
                    paddingTop: "20px",
                    paddingLeft: "20px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate(
                      `${Routers.Home_detail}/${reservationDetail.hotel?._id}`
                    );
                  }}
                >
                  <Image
                    src={
                      hotelDetail?.images?.[0].url ||
                      reservationDetail.hotel?.images?.[0] ||
                      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/647144068.jpg?k=acaba5abb30178b9f1c312eb53c94e59996dd9e624bb1835646a2a427cf87f0a&o=&hp=1"
                    }
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

                  {/* Hotel Information */}
                  <div className="info-section">
                    <Row className="mb-2">
                      <Col md={12} className="info-label">
                        <h5>II. HOTEL INFORMATION</h5>
                      </Col>
                    </Row>
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
                          {hotelDetail?.email || "hot1@gm.com"}
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

                  {/* Booking Information */}
                  <div className="info-section">
                    <Row className="mb-2">
                      <Col md={12} className="info-label">
                        <h5>III. BOOKING INFORMATION</h5>
                      </Col>
                    </Row>
                    <Table bordered>
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Rooms and Services</th>
                          <th>Quantity</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Rooms */}
                        {reservationDetail.rooms &&
                        Array.isArray(reservationDetail.rooms) ? (
                          reservationDetail.rooms.map((roomItem, index) => {
                            const nights = (() => {
                              if (!reservationDetail.checkInDate || !reservationDetail.checkOutDate) return 1;
                              const checkInDate = new Date(reservationDetail.checkInDate);
                              const checkOutDate = new Date(reservationDetail.checkOutDate);
                              const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
                              const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
                              return nights > 0 ? nights : 1;
                            })();

                            return (
                              <tr key={`room-${index}`}>
                                <td>{index + 1}</td>
                                <td>
                                  <strong>Room:</strong> {roomItem.room?.name || "Phòng"}
                                  <br />
                                  <small className="text-muted">
                                    {formatCurrency(roomItem.room?.price || 0)} × {roomItem.quantity} room × {nights} nights
                                  </small>
                                </td>
                                <td>
                                  {roomItem.quantity || 1}
                                  <br />
                                  <small className="text-muted">
                                    × {nights} nights
                                  </small>
                                </td>
                                <td>
                                  {formatCurrency(
                                    (roomItem.room?.price || 0) * (roomItem.quantity || 1) * nights
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : null}
                        
                        {/* Services */}
                        {reservationDetail.services &&
                        Array.isArray(reservationDetail.services) &&
                        reservationDetail.services.length > 0 ? (
                          reservationDetail.services.map((serviceItem, index) => (
                            <tr key={`service-${index}`}>
                              <td>{(reservationDetail.rooms?.length || 0) + index + 1}</td>
                              <td>
                                <strong>Service:</strong> {serviceItem.service?.name || "Dịch vụ"}
                                <br />
                                <small className="text-muted">
                                  Dates: {serviceItem.selectDate?.map(date => 
                                    formatDate(date)
                                  ).join(", ") || "N/A"}
                                </small>
                              </td>
                              <td>
                                {serviceItem.quantity / serviceItem.selectDate?.length || 1}
                                <br />
                                <small className="text-muted">
                                  x {serviceItem.selectDate?.length || 1} days
                                </small>
                              </td>
                              <td>
                                {formatCurrency(
                                  (serviceItem.service?.price || 0) * 
                                  (serviceItem.quantity || 1) 
                                )}
                              </td>
                            </tr>
                          ))
                        ) : null}

                        {/* Show message if no rooms or services */}
                        {(!reservationDetail.rooms || reservationDetail.rooms.length === 0) &&
                         (!reservationDetail.services || reservationDetail.services.length === 0) && (
                          <tr>
                            <td colSpan={4} className="text-center">
                              No booking information available
                            </td>
                          </tr>
                        )}

                        {/* Total Row */}
                        <tr className="total-row">
                          <td colSpan={2}>
                            <strong>Total amount</strong>
                          </td>
                          <td colSpan={2}>
                            <strong>
                              {formatCurrency(
                                reservationDetail.totalAmount ||
                                reservationDetail.totalPrice ||
                                calculateTotalPrice(
                                  reservationDetail.rooms, 
                                  reservationDetail.services,
                                  reservationDetail.checkInDate,
                                  reservationDetail.checkOutDate
                                )
                              )}
                            </strong>
                          </td>
                        </tr>
                        {reservationDetail.promotionDiscount > 0 && (
                          <tr className="discount-row">
                            <td colSpan={2}>
                              <strong>Discount</strong>
                            </td>
                            <td colSpan={2}>
                              <span style={{ color: 'red', fontWeight: 'bold' }}>-
                                {formatCurrency(reservationDetail.promotionDiscount)}
                              </span>
                            </td>
                          </tr>
                        )}
                        {reservationDetail.promotionDiscount > 0 && (
                          <tr className="final-row">
                            <td colSpan={2}>
                              <strong>Total after discount</strong>
                            </td>
                            <td colSpan={2}>
                              <strong style={{ color: 'green' }}>
                                {formatCurrency(reservationDetail.finalPrice)}
                              </strong>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* Customer Signature */}
                  <div className="info-section">
                    <h5>IV. CUSTOMER SIGNATURE</h5>
                    <Form.Check
                      type="checkbox"
                      id="terms-checkbox"
                      label="Agree to the Hotel and Website Terms & Privacy"
                      className="terms-checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <div className="export-button-container">
                      <Button
                        variant="info"
                        className="export-button"
                        style={{ color: "white", borderRadius: 10 }}
                        onClick={exportBillAsPDF}
                        disabled={exportLoading || !termsAccepted}
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
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          )}
        </Container>
        <div>
          <ChatBox />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingBill;
