import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Pagination,
  Form,
} from "react-bootstrap";
import Select from "react-select";
import CancelReservationModal from "@pages/customer/home/components/CancelReservationModal";
import { showToast, ToastProvider } from "@components/ToastContainer";
import { useAppSelector, useAppDispatch } from "../../../../redux/store";
import ReservationActions from "../../../../redux/reservations/actions";
import * as Routers from "../../../../utils/Routes";

// Import your CSS
import "../../../../css/customer/BookingHistory.css";
import Utils from "../../../../utils/Utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import Factories from "../../../../redux/search/factories";
import Factories1 from "../../../../redux/refunding_reservation/factories";
import ConfirmationModal from "@components/ConfirmationModal";

const BookingHistory = () => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const dispatch = useAppDispatch();
  const Auth = useAppSelector((state) => state.Auth.Auth);

  const navigate = useNavigate();
  // Get filter and page from URL params or use defaults
  const getUrlParam = (name, defaultValue) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get(name) || defaultValue;
    }
    return defaultValue;
  };

  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const date = searchParams.get("date");
  const page = searchParams.get("page");
  const [activeFilter, setActiveFilter] = useState(Number(filter) ?? 0);
  const [dateFilter, setDateFilter] = useState(date ?? "NEWEST");
  const [activePage, setActivePage] = useState(
    Number(page) == 0 ? 1 : Number(page)
  );

  const [refundAmount, setRefundAmount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3); // 3 columns x 2 rows = 6 items per page
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterBill, setFilterBill] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  // Filter options
  const filters = [
    "COMPLETED", // Hoàn thành, đã phản hồi
    "CHECKED OUT", // Đã check-out, có thể để lại phản hồis
    "CHECKED IN", // Đang ở, đã check-in
    "BOOKED", // Đã đặt, trả tiền nhưng chưa check-in
    "NOT PAID", // Chưa trả tiền
    "CANCELLED", // Đã hủy
  ];

  const colors = [
    "#6F42C1", // COMPLETED - Tím (hoàn thành, khác biệt rõ)
    "#17A2B8", // CHECKED OUT - Xanh cyan (đã trả phòng, thông báo nhẹ)
    "#28A745", // CHECKED IN - Xanh lá (đã nhận phòng, thành công)
    "#007BFF", // BOOKED - Xanh dương (trạng thái đã đặt, trung lập)
    "#FD7E14", // NOT PAID - Cam đậm (chưa thanh toán, cảnh báo)
    "#DC3545", // CANCELLED - Đỏ (hủy bỏ, lỗi)
  ];

  useEffect(() => {
    if (selectedReservation) {
      const total = Utils.calculateTotalPrice(selectedReservation.rooms);
      setRefundAmount(total);
    }
  }, [selectedReservation]);

  // Update URL when filters change
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("active123: ", activePage);
      const params = new URLSearchParams();
      params.set("filter", activeFilter.toString());
      params.set("date", dateFilter);
      params.set("page", activePage.toString() ?? 1);

      // Use window.history to update URL without full page reload
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );

      // Save filter to localStorage
      localStorage.setItem("statusBooking", activeFilter.toString());
    }
  }, [activeFilter, dateFilter, activePage]);

  // Load saved filter from localStorage
  useEffect(() => {
    const fetchIndex = async () => {
      if (typeof window !== "undefined") {
        const savedStatus = localStorage.getItem("statusBooking");
        if (savedStatus && !getUrlParam("filter", null)) {
          setActiveFilter(Number(savedStatus));
        }
      }
    };
    fetchIndex();
  }, []);

  // Fetch user reservations from API
  useEffect(() => {
    fetchUserReservations();
  }, [dispatch]);

  const fetchUserReservations = () => {
    setIsLoading(true);
    dispatch({
      type: ReservationActions.FETCH_USER_RESERVATIONS,
      payload: {
        userId: Auth?.user?._id,
        onSuccess: (data) => {
          console.log("Fetched reservations:", data);
          // Transform API data to match the expected format
          const transformedData = data.map((reservation) => ({
            id: reservation._id,
            hotelId: reservation.hotel?._id,
            hotelName: reservation.hotel?.hotelName || "Unknown Hotel",
            checkIn: new Date(reservation.checkInDate).toLocaleDateString(),
            checkOut: new Date(reservation.checkOutDate).toLocaleDateString(),
            rooms: reservation?.rooms,
            totalPrice: formatCurrency(
              reservation.finalPrice && reservation.finalPrice > 0
                ? reservation.finalPrice
                : reservation.totalPrice
            ), // Ưu tiên finalPrice nếu > 0, nếu không thì dùng totalPrice
            status: reservation.status || "PENDING",
            originalData: reservation, // Keep the original data for reference
            createdAt: reservation.createdAt,
          }));
          setReservations(transformedData);
          setIsLoading(false);
        },

        onFailed: (msg) => {
          setIsLoading(false);
          // Set empty reservations if fetch fails
          setReservations([]);
        },
        onError: (err) => {
          console.error("Error fetching reservations:", err);
          setIsLoading(false);
          // Set empty reservations if fetch fails
          setReservations([]);
        },
      },
    });
  };

  function parseCurrency(formatted) {
    if (!formatted) return 0; // hoặc null tùy vào yêu cầu
    const numericString = formatted.replace(/[^\d]/g, "");
    return Number(numericString);
  }

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter reservations based on selected status
  useEffect(() => {
    const newList = reservations.filter(
      (e) => e.status === filters[activeFilter]
    );

    // Apply date sorting
    const sortedList = [...newList];
    if (dateFilter === "NEWEST") {
      sortedList.sort((a, b) => {
        return (
          new Date(b.originalData?.createdAt || b.checkIn) -
          new Date(a.originalData?.createdAt || a.checkIn)
        );
      });
    } else {
      sortedList.sort((a, b) => {
        return (
          new Date(a.originalData?.createdAt || a.checkIn) -
          new Date(b.originalData?.createdAt || b.checkIn)
        );
      });
    }

    setFilterBill(sortedList);
  }, [activeFilter, reservations, dateFilter]);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      border: state.isFocused ? "1px solid #0d6efd" : "1px solid #ced4da",
      boxShadow: state.isFocused
        ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
        : "none",
      borderRadius: "0.375rem",
      backgroundColor: "#fff",
      padding: "2px 4px",
      transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      minHeight: "40px",
      fontSize: "0.95rem",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6c757d",
    }),
  };

  // Handle cancel reservation
  const handleCancelReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filterBill.slice(startIndex, endIndex);
  };

  // Calculate total pages whenever filtered data changes
  useEffect(() => {
    setTotalPages(Math.ceil(filterBill.length / itemsPerPage));
    // Reset to page 1 if current page is now invalid
    if (
      activePage > Math.ceil(filterBill.length / itemsPerPage) &&
      filterBill.length > 0
    ) {
      if (totalPages > 1) {
        setActivePage(totalPages - 1);
      } else {
        setActivePage(1);
      }
    }
  }, [filterBill, itemsPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const handleCancelBooking = async (id, refundAmount) => {
    console.log("refundAmount ", refundAmount);

      
      setShowModal(false);
      try {
        const response = await Factories.cancel_payment(id);
        if (response?.status === 200) {
          showToast.success("Cancel reservation successfully !!!");
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
      }

      try {
        const response = await Factories1.create_refunding_reservation(
          id,
          refundAmount,
          accountHolderName,
          accountNumber,
          bankName
        );
        if (response?.status === 200) {
          showToast.success("Cancel reservation successfully !!!");
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
      }
      fetchUserReservations();
    
  };

  function parseCurrency(formatted) {
    if (!formatted) return 0; // hoặc null tùy vào yêu cầu
    const numericString = formatted.replace(/[^\d]/g, "");
    return Number(numericString);
  }

  // thinh update refund START 12/07/2025
  const calculateHoursUntilCheckIn = () => {
    const checkInRaw = selectedReservation?.checkInDate || selectedReservation?.checkIn;
    if (!checkInRaw) return null;

    const now = new Date();
    const checkInDate = new Date(checkInRaw);
    if (isNaN(checkInDate)) return null;

    // So sánh đến 12:00 PM (trưa) ngày check-in
    checkInDate.setHours(12, 0, 0, 0);

    const differenceInMs = checkInDate.getTime() - now.getTime();
    return Math.floor(differenceInMs / (1000 * 60 * 60)); // ms -> hours
  };


  // thinh update refund END 12/07/2025

  // thinh update refund START 12/07/2025
  const calculateRefundPolicy = () => {
  const hoursUntilCheckIn = calculateHoursUntilCheckIn();
  console.log(' hoursUntilCheckIn >> ', hoursUntilCheckIn)
  const totalPrice = Number(refundAmount) || 0;
  const status = selectedReservation?.status;

  if (status === "PENDING") {
    return {
      refundPercentage: 100,
      refundAmount: totalPrice,
      message: "Full refund available (PENDING)",
      alertClass: "refund-alert full-refund",
      hoursUntilCheckIn,
    };
  }

  if (status === "BOOKED") {
    if (hoursUntilCheckIn < 24) {
      return {
        refundPercentage: 50,
        refundAmount: +(totalPrice * 0.5).toFixed(2),
        message: "50% penalty applies (under 24h)",
        alertClass: "refund-alert penalty-high",
        hoursUntilCheckIn,
      };
    } else if (hoursUntilCheckIn < 72) {
      return {
        refundPercentage: 80,
        refundAmount: +(totalPrice * 0.8).toFixed(2),
        message: "20% penalty applies (under 72h)",
        alertClass: "refund-alert penalty-medium",
        hoursUntilCheckIn,
      };
    } else {
      return {
        refundPercentage: 100,
        refundAmount: totalPrice,
        message: "Full refund available",
        alertClass: "refund-alert full-refund",
        hoursUntilCheckIn,
      };
    }
  }

  return {
    refundPercentage: 0,
    refundAmount: 0,
    message: "Refund not applicable",
    alertClass: "refund-alert penalty-high",
    hoursUntilCheckIn,
  };
};

  // Thinh update refund END 12/07/2025

  return (
    <Container fluid className="py-4">
      <h2 className="fw-bold mb-4">Booking History</h2>
      <Row className="align-items-center mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="mb-2">Filter by Status</Form.Label>
            <Select
              options={filters.map((status, index) => ({
                value: index,
                label: status,
                color: colors[index], // Màu sắc tùy chỉnh cho mỗi option
              }))}
              value={
                filters[activeFilter]
                  ? { value: activeFilter, label: filters[activeFilter] }
                  : null
              }
              onChange={(option) => {
                setActiveFilter(option.value);
                localStorage.setItem("statusBooking", option.value.toString());
              }}
              placeholder="Select Status"
              isSearchable
              styles={{
                ...customStyles,
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? colors[state.data.value]
                    : "white",
                  color: state.isSelected ? "white" : "black",
                }),
              }}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label className="mb-2">Filter by Date</Form.Label>
            <Select
              options={[
                { value: "NEWEST", label: "NEWEST DATE" },
                { value: "OLDEST", label: "OLDEST DATE" },
              ]}
              value={
                dateFilter === "NEWEST"
                  ? { value: "NEWEST", label: "NEWEST DATE" }
                  : dateFilter === "OLDEST"
                  ? { value: "OLDEST", label: "OLDEST DATE" }
                  : null
              }
              onChange={(option) => {
                setDateFilter(option.value);
              }}
              placeholder="Select Order"
              isSearchable={false}
              styles={customStyles}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Reservation list */}
      <Row>
        {isLoading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filterBill.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
            <div
              className="rounded-circle bg-light d-flex align-items-center justify-content-center mb-4"
              style={{
                width: 140,
                height: 140,
                transition: "transform 0.3s",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src="/empty-state.svg"
                alt="No data"
                style={{ width: 80, height: 80, opacity: 0.75 }}
              />
            </div>
            <h5 className="text-muted fw-semibold">No Reservations Yet</h5>
            <p className="text-secondary mb-0" style={{ maxWidth: 300 }}>
              You haven't had any {filters[activeFilter].toLowerCase()} bookings
              yet.
            </p>
          </div>
        ) : (
          getPaginatedData().map((reservation) => (
            <Col key={reservation.id} lg={12} className="mb-4">
              <Card className="reservation-card">
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <div className="reservation-details">
                        <h5 className="mb-3">
                          Reservation ID: {reservation.id}
                        </h5>
                        <p>
                          <strong>Status:</strong>
                          <span
                            className="ms-2 py-1 px-3 rounded text-white"
                            style={{
                              backgroundColor: colors[activeFilter],
                              fontWeight: 400,
                            }}
                          >
                            {reservation.status}
                          </span>
                        </p>
                        <Row>
                          <Col md={6}>
                            <p>
                              <strong>Check-in:</strong> {reservation.checkIn}
                            </p>
                          </Col>
                          <Col md={6}>
                            <p>
                              <strong>Check-out:</strong> {reservation.checkOut}
                            </p>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <p>
                              <strong>Total price:</strong>{" "}
                              {Utils.formatCurrency(
                                parseCurrency(reservation.totalPrice)
                              )}
                            </p>
                          </Col>
                          <Col md={6}>
                            <p>
                              <strong>Created-at:</strong>{" "}
                              {Utils.getDate(reservation.createdAt, 1)}
                            </p>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                    <Col
                      md={4}
                      className="d-flex flex-column gap-2 justify-content-center"
                    >
                      <Button
                        variant="outline-primary"
                        onClick={() => {
                          navigate(`${Routers.BookingBill}/${reservation.id}`);
                        }}
                      >
                        View Details
                      </Button>
                      {/* tạo mới feedback */}
                      {activeFilter === 1 && (
                        <Button
                          variant="outline-success"
                          onClick={() => {
                            navigate(
                              `${Routers.CreateFeedback}/${reservation.id}`
                            );
                          }}
                        >
                          Create Feedback
                        </Button>
                      )}

                      {activeFilter === 0 && (
                        <Button
                          variant="outline-success"
                          onClick={() => {}}
                          disabled={true}
                        >
                          Already Feedbacked
                        </Button>
                      )}

                      {activeFilter == 2 && (
                        <Button
                          variant="outline-success"
                          onClick={() => {}}
                          disabled={true}
                        >
                          Create Feedback
                        </Button>
                      )}

                      {(activeFilter === 4 || activeFilter === 3) && (
                        <Button
                          variant="outline-danger"
                          onClick={() => handleCancelReservation(reservation)}
                        >
                          Cancel Booking
                        </Button>
                      )}

                      {activeFilter === 6 && (
                        <Button variant="outline-danger" disabled={true}>
                          Already Cancelled
                        </Button>
                      )}
                      {activeFilter === 5 && (
                        <Button
                          variant="outline-warning"
                          onClick={async () => {
                            const responseCheckout =
                              await Factories.checkout_booking(reservation.id);
                            console.log(
                              "responseCheckout >> ",
                              responseCheckout
                            );
                            const paymentUrl =
                              responseCheckout?.data?.sessionUrl;
                            if (paymentUrl) {
                              window.location.href = paymentUrl;
                            }
                          }}
                        >
                          Pay Money
                        </Button>
                      )}
                      {activeFilter === 5 && (
                        <Button
                          variant="outline-danger"
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowCancelModal(true);
                          }}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {filterBill.length > 0 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={activePage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(Math.max(activePage - 1, 1))}
              disabled={activePage === 1}
            />

            {/* Show page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show current page, and pages close to current page
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - activePage) <= 1
                );
              })
              .map((page, index, array) => {
                // Add ellipsis if there are gaps
                if (index > 0 && array[index - 1] !== page - 1) {
                  return (
                    <React.Fragment key={`ellipsis-${page}`}>
                      <Pagination.Ellipsis disabled />
                      <Pagination.Item
                        key={page}
                        active={page === activePage}
                        onClick={() => handlePageChange(page)}
                      >
                        <b
                          style={{
                            color: page === activePage ? "white" : "#0d6efd",
                          }}
                        >
                          {page}
                        </b>
                      </Pagination.Item>
                    </React.Fragment>
                  );
                }
                return (
                  <Pagination.Item
                    key={page}
                    active={page === activePage}
                    onClick={() => handlePageChange(page)}
                  >
                    <b
                      style={{
                        color: page === activePage ? "white" : "#0d6efd",
                      }}
                    >
                      {page}
                    </b>
                  </Pagination.Item>
                );
              })}

            <Pagination.Next
              onClick={() =>
                handlePageChange(Math.min(activePage + 1, totalPages))
              }
              disabled={activePage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={activePage === totalPages}
            />
          </Pagination>
        </div>
      )}

      <ToastProvider />
      <CancelReservationModal
        setRefundAmount={setRefundAmount}
        selectedReservation={selectedReservation}
        refundAmount={
          Utils.calculateTotalPrice(selectedReservation?.rooms) 
        }
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={handleCancelBooking}
        accountHolderName={accountHolderName}
        accountNumber={accountNumber}
        bankName={bankName}
        setAccountHolderName={setAccountHolderName}
        setAccountNumber={setAccountNumber}
        setBankName={setBankName}
      />
      <ConfirmationModal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        onConfirm={async () => {
          try {
            const response = await Factories.cancel_payment(
              selectedReservation.id
            );
            console.log("Response: ", response);
            if (response?.status === 200) {
              console.log("Response: ", response);
              showToast.success("Cancel reservation successfully !!!");
              fetchUserReservations();
            }
          } catch (error) {
            console.error("Error fetching hotels:", error);
          } finally {
            setShowCancelModal(false);
          }
        }}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmButtonText="Cancel Booking"
        type="danger"
      />
    </Container>
  );
};

export default BookingHistory;
