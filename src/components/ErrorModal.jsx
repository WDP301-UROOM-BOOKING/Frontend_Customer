
import React from "react"
import { Modal, Button } from "react-bootstrap"
import { FaExclamationTriangle } from "react-icons/fa"


const ErrorModal = ({ show, onClose, message }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton style={{ border: "none" }}>
        <Modal.Title className="w-100 text-center">
          <FaExclamationTriangle className="text-warning" style={{ fontSize: "2rem" }} />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5 className="text-center">{message}</h5>
      </Modal.Body>
      <Modal.Footer style={{ border: "none", justifyContent: "center" }}>
        <Button variant="primary" onClick={onClose} style={{ minWidth: "100px" }}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ErrorModal