import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Utils from "../../../../utils/Utils";
import { Form, Badge, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import ConfirmationModal from "@components/ConfirmationModal";

function CancelReservationModal({
  selectedReservation,
  refundAmount,
  show,
  onHide,
  onConfirm,
  setRefundAmount,
}) {
  const [showModal, setShowModal] = useState(show);


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
    console.log('differenceInMs >> ', differenceInMs)
    return Math.floor(differenceInMs / (1000 * 60 * 60)); // ms -> hours
  };


  // thinh update refund END 12/07/2025

  const formatCurrency = (amount) => {
    if (amount == null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // const calculateRefundPolicy = () => {
  //   const daysUntilCheckIn = calculateHoursUntilCheckIn();
  //   const totalPrice = refundAmount;

  //   if (selectedReservation?.status === "PENDING") {
  //     return {
  //       refundPercentage: 100,
  //       refundAmount: totalPrice,
  //       message: "Full refund available",
  //       alertClass: "refund-alert full-refund",
  //       daysUntilCheckIn,
  //     };
  //   }

  //   if (daysUntilCheckIn < 1) {
  //     return {
  //       refundPercentage: 50,
  //       refundAmount: (totalPrice * 0.5).toFixed(2),
  //       message: "50% penalty applies",
  //       alertClass: "refund-alert penalty-high",
  //       daysUntilCheckIn,
  //     };
  //   } else if (daysUntilCheckIn < 3) {
  //     return {
  //       refundPercentage: 80,
  //       refundAmount: (totalPrice * 0.8).toFixed(2),
  //       message: "20% penalty applies",
  //       alertClass: "refund-alert penalty-medium",
  //       daysUntilCheckIn,
  //     };
  //   } else {
  //     return {
  //       refundPercentage: 100,
  //       refundAmount: totalPrice,
  //       message: "Full refund available",
  //       alertClass: "refund-alert full-refund",
  //       daysUntilCheckIn,
  //     };
  //   }
  // };

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

  const refundPolicy = calculateRefundPolicy();

  useEffect(() => {
    const refundPolicyTest = calculateRefundPolicy();
    setRefundAmount(refundPolicyTest.refundAmount);
  }, []);

  return (
    <>
      <style>
        {`
          .reservation-details {
            margin-top: 15px;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .status-badge {
            font-size: 0.85rem;
          }

          .cancellation-section {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
          }

          .refund-alert {
            padding: 10px 15px;
            border-radius: 4px;
            font-weight: 500;
            margin-top: 10px;
          }

          .full-refund {
            background-color: #d4edda;
            color: #155724;
          }

          .penalty-medium {
            background-color: #fff3cd;
            color: #856404;
          }

          .penalty-high {
            background-color: #f8d7da;
            color: #721c24;
          }

          .policy-details {
            font-size: 0.85rem;
            color: #6c757d;
          }

          .policy-details ul {
            padding-left: 20px;
            margin-bottom: 0;
          }

          .disclaimer {
            font-size: 0.85rem;
            color: #6c757d;
          }

          .close-button {
            padding: 0;
            font-size: 1.5rem;
          }

          .confirm-button {
            background-color: #dc3545;
            border-color: #dc3545;
          }
        `}
      </style>

      <Modal show={show} onHide={onHide} centered>
        <Modal.Header>
          <Modal.Title>Cancel Reservation</Modal.Title>
          <Button
            variant="link"
            className="close-button"
            onClick={onHide}
            style={{ position: "absolute", top: 5, right: 15 }}
          >
            <span aria-hidden="true">&times;</span>
          </Button>
        </Modal.Header>

        <Modal.Body>
          <div className="reservation-section">
            <h5>Reservation Details</h5>
            <div className="reservation-details">
              <div className="detail-row">
                <span>Hotel:</span>
                <span>{selectedReservation?.hotelName}</span>
              </div>
              <div className="detail-row">
                <span>Created-at:</span>
                <span>{Utils.getDate(selectedReservation?.createdAt, 1)}</span>
              </div>
              <div className="detail-row">
                <span>Check-in:</span>
                <span>{selectedReservation?.checkIn}</span>
              </div>
              <div className="detail-row">
                <span>Check-out:</span>
                <span>{selectedReservation?.checkOut}</span>
              </div>
              <div className="detail-row">
                <span>Total:</span>
                <span>{Utils.formatCurrency(refundAmount)}</span>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <Badge
                  bg={
                    selectedReservation?.status === "BOOKED"
                      ? "primary"
                      : "warning"
                  }
                  className="status-badge"
                >
                  {selectedReservation?.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="cancellation-section">

            <div className="detail-row mt-3">
              <span>Hours until check-in:</span>
              <span>{refundPolicy?.hoursUntilCheckIn} hours</span>
            </div>
            <div className="detail-row">
              <span>Refund amount:</span>
              <span>
                {formatCurrency(refundPolicy.refundAmount)} (
                {refundPolicy.refundPercentage}%)
              </span>
            </div>

            <div className="policy-details mt-2">
              <h4>Cancellation Policy</h4>
              <ul>
                <li style={{ listStyle: "none", fontSize: 16 }}>
                  For orders with status: <code>BOOKED</code>
                </li>
                <li>
                  less than 24 hours before 12:00 PM check-in : <strong>50% penalty</strong>
                </li>
                <li>
                  less than 72 hours before 12:00 PM check-in: <strong>20% penalty</strong>
                </li>
                <li>
                  72 or more hours before 12:00 PM check-in: <strong>Full refund</strong>
                </li>
              </ul>
              <ul>
                <li style={{ listStyle: "none", fontSize: 16 }}>
                  For orders with status: <code>PENDING</code>
                </li>
                <li>
                  Any time: <strong>Full refund</strong>
                </li>
              </ul>
            </div>
          </div>

          <div className="disclaimer mt-4">
            By proceeding, you agree to our cancellation terms. Refunds are
            processed to your original payment method within 5-7 business days.
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Close
          </Button>
          <Button
            variant="danger"
            className="confirm-button"
            onClick={() => setShowModal(true)}
          >
            Confirm Cancellation
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmationModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={()=>onConfirm(selectedReservation.id, formatCurrency(refundPolicy.refundAmount))}
        title="Cancel Reservation Confirmation"
        message="Are you sure you want to cancel this reservation?"
        confirmButtonText="Confirm"
        type="danger"
      />
    </>
  );
}

export default CancelReservationModal;
