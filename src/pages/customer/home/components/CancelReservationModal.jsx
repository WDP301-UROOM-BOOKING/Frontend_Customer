import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Utils from "../../../../utils/Utils";
import { Form, Badge, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import ConfirmationModal from "@components/ConfirmationModal";

// Combined component with inline styles
function CancelReservationModal({
  selectedReservation,
  refundAmount,
  show,
  onHide,
  onConfirm,
  accountHolderName,
  accountNumber,
  bankName,
  setAccountHolderName,
  setAccountNumber,
  setBankName,
  setRefundAmount,
}) {
  const [showModal, setShowModal] = useState(show);

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

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate refund policy based on days until check-in
  const calculateRefundPolicy = () => {
    const daysUntilCheckIn = calculateDaysUntilCheckIn();
    const totalPrice = refundAmount;
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

  const refundPolicy = calculateRefundPolicy();
  useEffect(() => {
    const refundPolicyTest = calculateRefundPolicy();
    const refundAmountValue = refundPolicyTest.refundAmount;
    setRefundAmount(refundAmountValue);
  }, []);
  return (
    <>
      {/* CSS Styles */}
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

      {/* Modal Component */}
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
                    selectedReservation?.status == "BOOKED"
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
            <h5>Information Banking Refunding</h5>

            <Form className="mt-4">
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group controlId="accountHolderName">
                    <Form.Label>Account Holder Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter account holder name"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group controlId="accountNumber">
                    <Form.Label>Account Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter account number"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group controlId="bankName">
                    <Form.Label>Bank Name</Form.Label>
                    <Form.Select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    >
                      <option value="">Select a bank</option>
                      <option value="Vietcombank">Vietcombank</option>
                      <option value="VietinBank">VietinBank</option>
                      <option value="BIDV">BIDV</option>
                      <option value="Techcombank">Techcombank</option>
                      <option value="ACB">ACB</option>
                      <option value="Sacombank">Sacombank</option>
                      <option value="TPBank">TPBank</option>
                      <option value="MB Bank">MB Bank</option>
                      <option value="VPBank">VPBank</option>
                      <option value="SHB">SHB</option>
                      {/* Thêm các ngân hàng khác nếu cần */}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </div>

          <div className="cancellation-section">
            <h5>Cancellation Policy</h5>

            <div className={refundPolicy.alertClass}>
              {refundPolicy.message}
            </div>

            <div className="detail-row mt-3">
              <span>Days until check-in:</span>
              <span>{refundPolicy.daysUntilCheckIn}</span>
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
                  Less than 1 day before check-in: <strong>50% penalty</strong>
                </li>
                <li>
                  Less than 3 days before check-in: <strong>20% penalty</strong>
                </li>
                <li>
                  3 or more days before check-in: <strong>Full refund</strong>
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
        onConfirm={onConfirm}
        title="Cancel Reservation Confirmation"
        message="Are you sure you want to cancel this reservation?"
        confirmButtonText="Confirm"
        type="danger"
      />
    </>
  );
}

export default CancelReservationModal;
