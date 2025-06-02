import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ExclamationTriangle, InfoCircle, CheckCircle } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/ConfirmationModal.css';

function ConfirmationModal({ 
  show, 
  onHide, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to perform this action?',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  type = 'warning' // 'warning', 'danger', 'info', 'accept'
}) {
  
  const getIcon = () => {
    switch(type) {
      case 'danger':
        return <ExclamationTriangle size={30} className="text-danger mb-3" />;
      case 'warning':
        return <ExclamationTriangle size={30} className="text-warning mb-3" />;
      case 'info':
        return <InfoCircle size={30} className="text-info mb-3" />;
      case 'accept':
        return <CheckCircle size={30} className="text-success mb-3" />;
      default:
        return <InfoCircle size={30} className="text-info mb-3" />;
    }
  };
  
  const getButtonVariant = () => {
    switch(type) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'primary';
      case 'accept':
        return 'success';
      default:
        return 'primary';
    }
  };

  const handleConfirm = async () => {
    await onConfirm(); // Chờ onConfirm() chạy xong nếu async
    onHide(); // Đóng modal sau khi xác nhận
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
      className="confirmation-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        {getIcon()}
        <p className="mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {cancelButtonText}
        </Button>
        <Button 
          variant={getButtonVariant()} 
          onClick={handleConfirm}
        >
          {confirmButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmationModal;
