import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ExclamationTriangleFill, TagFill } from 'react-bootstrap-icons';

function PromotionErrorModal({ show, onClose, onSelectNewPromotion, errorMessage, promotionCode }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center text-warning">
          <ExclamationTriangleFill className="me-2" />
          Promotion Issue
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <TagFill size={48} className="text-muted mb-3" />
          
          {promotionCode && (
            <div className="mb-3">
              <span className="badge bg-secondary fs-6 mb-2">{promotionCode}</span>
            </div>
          )}
          
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
            {errorMessage}
          </p>
          
          <p style={{ fontSize: '0.95rem', color: '#6c757d' }}>
            You can select a new promotion or continue booking without one.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button 
          variant="outline-primary" 
          onClick={onSelectNewPromotion}
          className="me-2"
        >
          <TagFill className="me-1" />
          Select New Promotion
        </Button>
        <Button 
          variant="primary" 
          onClick={onClose}
        >
          Continue Without Promotion
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PromotionErrorModal;
