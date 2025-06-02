import { useState, useEffect } from "react";
import { Button, Container } from "react-bootstrap";
import {
  FaPaperPlane,
  FaEnvelope,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaInbox,
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Routers from "../../../../utils/Routes";
import { ToastProvider } from "@components/ToastContainer";
import { useAppSelector, useAppDispatch } from "../../../../redux/store";
import Factories from "../../../../redux/refunding_reservation/factories";
import Utils from "../../../../utils/Utils";

const RefundReservations = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const Auth = useAppSelector((state) => state.Auth.Auth);

  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "1";
  const status = searchParams.get("status") || "ALL";

  const [refunds, setRefunds] = useState([]);
  const [activePage, setActivePage] = useState(Number(page));
  const [activeStatus, setActiveStatus] = useState(status);
  const url = `${Routers.MyAccountPage}/my_refund`;
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 3;

  const fetchRefundingReservation = async () => {
    try {
      const response = await Factories.get_refunding_reservation_byUserId();
      if (response?.status === 200) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
    }
  };

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      const fetchRefunds = await fetchRefundingReservation();

      let filteredRefunds = [...(fetchRefunds || [])]; // ensure it's not undefined

      // Filter by status if not "ALL"
      if (activeStatus !== "ALL") {
        filteredRefunds = filteredRefunds.filter(
          (refund) => refund.status === activeStatus
        );
      }

      setRefunds(filteredRefunds);
      setLoading(false);
    };

    setTimeout(fetchData, 800); // use setTimeout correctly with async function
  }, [dispatch, activeStatus]);

  // Calculate pagination
  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRefunds = refunds.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(refunds.length / itemsPerPage);

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    setActivePage(1);
    navigate(`${url}?status=${status}&page=1`);
  };

  const handlePageChange = (newPage) => {
    setActivePage(newPage);
    navigate(`${url}?status=${activeStatus}&page=${newPage}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span
            className="badge bg-warning px-3 py-3"
            style={{ borderRadius: "16px", fontSize: "16px" }}
          >
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span
            className="badge bg-success px-3 py-3"
            style={{ borderRadius: "16px", fontSize: "16px" }}
          >
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span
            className="badge bg-danger px-3 py-3"
            style={{ borderRadius: "16px", fontSize: "16px" }}
          >
            Rejected
          </span>
        );
      default:
        return (
          <span
            className="badge bg-secondary px-3 py-3"
            style={{ borderRadius: "16px", fontSize: "16px" }}
          >
            {status}
          </span>
        );
    }
  };

  return (
    <Container fluid className="py-4">
      <h2 className="fw-bold mb-4">Refund Requests</h2>

      {/* Status Filter Tabs */}
      <Container
        style={{
          justifyContent: "space-between",
          marginBottom: "20px",
          paddingLeft: "",
        }}
      >
        <ul className="nav nav-pills nav-fill">
          <li className="nav-item">
            <button
              className={`nav-link ${activeStatus === "ALL" ? "active" : ""}`}
              style={
                activeStatus !== "ALL"
                  ? {
                      backgroundColor: "white",
                      color: "#0D6EFD",
                      width: "150px",
                    }
                  : { width: "150px" }
              }
              onClick={() => handleStatusChange("ALL")}
            >
              <b style={activeStatus !== "ALL" ? { color: "#0D6EFD" } : {}}>
                All Requests
              </b>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeStatus === "PENDING" ? "active" : ""
              }`}
              style={
                activeStatus !== "PENDING"
                  ? { backgroundColor: "white", width: "150px" }
                  : { width: "150px" }
              }
              onClick={() => handleStatusChange("PENDING")}
            >
              <b style={activeStatus !== "PENDING" ? { color: "#0D6EFD" } : {}}>
                Pending
              </b>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeStatus === "APPROVED" ? "active" : ""
              }`}
              style={
                activeStatus !== "APPROVED"
                  ? { backgroundColor: "white", width: "150px" }
                  : { width: "150px" }
              }
              onClick={() => handleStatusChange("APPROVED")}
            >
              <b
                style={activeStatus !== "APPROVED" ? { color: "#0D6EFD" } : {}}
              >
                Approved
              </b>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeStatus === "REJECTED" ? "active" : ""
              }`}
              style={
                activeStatus !== "REJECTED"
                  ? { backgroundColor: "white", width: "150px" }
                  : { width: "150px" }
              }
              onClick={() => handleStatusChange("REJECTED")}
            >
              <b
                style={activeStatus !== "REJECTED" ? { color: "#0D6EFD" } : {}}
              >
                Rejected
              </b>
            </button>
          </li>
        </ul>
      </Container>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : currentRefunds.length > 0 ? (
        <div
          className="refund-list"
        >
          {currentRefunds.map((refund) => (
            <div 
              key={refund._id} className="card mb-3 border-0 shadow-sm"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(`${Routers.BookingBill}/${refund.reservation._id}`);
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-3">Refund Id: {refund._id}</h5>

                    <div className="d-flex align-items-center mb-2">
                      <FaCalendarAlt className="text-primary me-2" />
                      <span>
                        Check-in:{" "}
                        {new Date(
                          refund.reservation.checkInDate
                        ).toLocaleDateString()}{" "}
                        | Check-out:{" "}
                        {new Date(
                          refund.reservation.checkOutDate
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <FaMoneyBillWave className="text-success me-2" />
                      <span>
                        Refund Amount:{" "}
                        <strong>
                          {Utils.formatCurrency(refund.refundAmount)}
                        </strong>{" "}
                        (Original:{" "}
                        {Utils.formatCurrency(refund.reservation.totalPrice)})
                      </span>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <FaPaperPlane className="text-primary me-2" />
                      <span>
                        Request Date: {Utils.getDate(refund.requestDate, 4)}
                      </span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaEnvelope className="text-primary me-2" />
                      <span>
                        Decision Date:{" "}
                        {refund.decisionDate
                          ? Utils.getDate(refund.decisionDate, 4)
                          : "Wait to decision"}
                      </span>
                    </div>
                    {refund.status == "APPROVED" && (
                      <div className="d-flex align-items-center mb-2">
                        <FaInbox className="text-primary me-2" />
                        <span>
                          Status: {refund.reason ?? "Already payment"}
                        </span>
                      </div>
                    )}
                    {refund.status == "REJECTED" && (
                      <div className="d-flex align-items-center mb-2">
                        <FaInbox className="text-primary me-2" />
                        <span>
                          Reason:{" "}
                          {refund.reason ?? "Contact with admin to know reason"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ position: "absolute", top: 16, right: 16 }}>
                      {getStatusBadge(refund.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {refunds.length > itemsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      activePage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(activePage - 1)}
                      disabled={activePage === 1}
                      style={{
                        borderRadius: "0",
                        borderTopLeftRadius: "4px",
                        borderBottomLeftRadius: "4px",
                      }}
                    >
                      &lt;
                    </button>
                  </li>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (activePage <= 3) {
                      pageNum = i + 1;
                    } else if (activePage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = activePage - 2 + i;
                    }

                    return (
                      <li
                        key={pageNum}
                        className={`page-item ${
                          activePage === pageNum ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            backgroundColor:
                              activePage === pageNum ? "#0d6efd" : "#f8f9fa",
                            color: activePage === pageNum ? "white" : "#0d6efd",
                            fontWeight: "bold",
                            borderRadius: "0",
                          }}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}

                  <li
                    className={`page-item ${
                      activePage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(activePage + 1)}
                      disabled={activePage === totalPages}
                      style={{
                        borderRadius: "0",
                        borderTopRightRadius: "4px",
                        borderBottomRightRadius: "4px",
                      }}
                    >
                      &gt;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-5">
          <img
            src="/empty-state.svg"
            alt="No refund requests"
            style={{ height: "150px", opacity: "0.6" }}
          />
          <p className="mt-4 text-secondary fs-5">
            You don't have any refund requests
            {activeStatus !== "ALL"
              ? ` with ${activeStatus.toLowerCase()} status`
              : ""}
            .
          </p>
        </div>
      )}

      <ToastProvider />
    </Container>
  );
};

export default RefundReservations;
