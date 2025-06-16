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

const BookingHistory = () => {
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
  console.log("Page: ", page);
  const [activeFilter, setActiveFilter] = useState(Number(filter) ?? 0);
  const [dateFilter, setDateFilter] = useState(date ?? "NEWEST");
  const [activePage, setActivePage] = useState(
    Number(page) == 0 ? 1 : Number(page)
  );
  console.log("activePage: ", activeFilter);
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
    "PENDING", // Chờ xử lý hoặc xác nhận
    "NOT PAID", // Chưa trả tiền
    "CANCELLED", // Đã hủy
  ];

  const colors = [
    "#6F42C1", // COMPLETED - Tím (hoàn thành, khác biệt rõ)
    "#17A2B8", // CHECKED OUT - Xanh cyan (đã trả phòng, thông báo nhẹ)
    "#28A745", // CHECKED IN - Xanh lá (đã nhận phòng, thành công)
    "#007BFF", // BOOKED - Xanh dương (trạng thái đã đặt, trung lập)
    "#FFC107", // PENDING - Vàng cam (đang chờ xử lý, cảnh báo nhẹ)
    "#FD7E14", // NOT PAID - Cam đậm (chưa thanh toán, cảnh báo)
    "#DC3545", // CANCELLED - Đỏ (hủy bỏ, lỗi)
  ];

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
            totalPrice: formatCurrency(reservation.totalPrice),
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

  console.log("res: ", reservations);
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

  console.log("Selected Reservation: ", selectedReservation);
  const handleCancelBooking = async (id) => {
    console.log("A: ", accountHolderName);
    console.log("A: ", accountNumber);
    console.log("A: ", bankName);

    if (!accountHolderName || !accountNumber || !bankName) {
      showToast.error("Please input full information banking");
    } else {
      setShowModal(false);
      try {
        const response = await Factories.cancel_payment(id);
        if (response?.status === 200) {
          console.log("Response: ", response);
          showToast.success("Cancel reservation successfully !!!");
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
      }

      try {
        const response = await Factories1.create_refunding_reservation(
          id,
          Utils.calculateTotalPrice(selectedReservation?.rooms),
          accountHolderName,
          accountNumber,
          bankName
        );
        if (response?.status === 200) {
          console.log("Response: ", response);
          showToast.success("Cancel reservation successfully !!!");
        }
        console.log("ABC");
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
      }
      fetchUserReservations();
    }
  };

  function parseCurrency(formatted) {
    if (!formatted) return 0; // hoặc null tùy vào yêu cầu
    const numericString = formatted.replace(/[^\d]/g, "");
    return Number(numericString);
  }

  const calculateDaysUntilCheckIn = () => {
    if (!selectedReservation?.checkIn) {
      return null; // hoặc return 0 tùy logic bạn muốn xử lý
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [day, month, year] = selectedReservation.checkIn.split("/");

    // Kiểm tra dữ liệu tách có hợp lệ không
    if (!day || !month || !year) {
      return null;
    }

    const checkInDate = new Date(year, month - 1, day);
    checkInDate.setHours(0, 0, 0, 0);

    const differenceInTime = checkInDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    return differenceInDays;
  };

  const calculateRefundPolicy = () => {
    const daysUntilCheckIn = calculateDaysUntilCheckIn();
    const totalPrice = parseCurrency(selectedReservation?.totalPrice);
    if (selectedReservation?.status === "PENDING") {
      return {
        refundPercentage: 100,
        refundAmount: totalPrice,
        message: "Full refund available",
        alertClass: "refund-alert full-refund",
        daysUntilCheckIn,
      };
    } else {
      if (daysUntilCheckIn < 1) {
        return {
          refundPercentage: 50,
          refundAmount: (totalPrice * 0.5).toFixed(2),
          message: "50% penalty applies",
          alertClass: "refund-alert penalty-high",
          daysUntilCheckIn,
        };
      } else if (daysUntilCheckIn < 3) {
        return {
          refundPercentage: 80,
          refundAmount: (totalPrice * 0.8).toFixed(2),
          message: "20% penalty applies",
          alertClass: "refund-alert penalty-medium",
          daysUntilCheckIn,
        };
      } else {
        return {
          refundPercentage: 100,
          refundAmount: totalPrice,
          message: "Full refund available",
          alertClass: "refund-alert full-refund",
          daysUntilCheckIn,
        };
      }
    }
  };

  const calculateTotalPrice = (rooms) => {
    if (!rooms || !Array.isArray(rooms)) return 0;
    return rooms.reduce((total, roomItem) => {
      const roomPrice = roomItem.room?.price || 0;
      const quantity = roomItem.quantity || 1;
      return total + roomPrice * quantity;
    }, 0);
  };
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
                                calculateTotalPrice(reservation.rooms)
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
                          onClick={() => {
                            console.log(reservation);
                            // Store state in sessionStorage for complex state passing
                            navigate(Routers.PaymentPage, {
                              state: {
                                createdAt: reservation.createdAt,
                                idReservation: reservation.id,
                                totalPrice: parseCurrency(
                                  reservation.totalPrice
                                ),
                              },
                            });
                          }}
                        >
                          Pay Money
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
        selectedReservation={selectedReservation}
        refundAmount={Utils.calculateTotalPrice(selectedReservation?.rooms) ?? 0}
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={() => {
          handleCancelBooking(selectedReservation.id);
        }}
        accountHolderName={accountHolderName}
        accountNumber={accountNumber}
        bankName={bankName}
        setAccountHolderName={setAccountHolderName}
        setAccountNumber={setAccountNumber}
        setBankName={setBankName}
      />
    </Container>
  );
};

export default BookingHistory;
