import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';

function RoomClosedModal({ show, onClose }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center text-danger">
          <ExclamationTriangleFill className="me-2" />
          Room Unavailable
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>
            We're sorry, this room is currently not available.
          </p>
          <p style={{ fontSize: '1rem' }}>
            This room type is temporarily closed for booking.
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

export default RoomClosedModal;