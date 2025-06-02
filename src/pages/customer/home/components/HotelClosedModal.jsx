import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons'; // Cần cài thêm react-bootstrap-icons

function HotelClosedModal({ show, onClose }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center text-danger">
          <ExclamationTriangleFill className="me-2" />
          Booking Unavailable
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>
            We're sorry, this hotel is currently not operating.
          </p>
          <p style={{ fontSize: '1rem' }}>
            You cannot make a booking at this time.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default HotelClosedModal;
