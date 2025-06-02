import { useState } from "react"
import { Button, Container, Row, Col, Card } from "react-bootstrap"
import ConfirmationModal from "../ConfirmationModal"
import "bootstrap/dist/css/bootstrap.min.css"

function ExmapleConfirmationModal() {
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const handleDelete = () => {
    console.log("Item deleted!")
  }


  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const handleUpdate = () => {
    console.log("Item updated!")
  }


  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const handleAccept = () => {
    console.log("Item accepted!")
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Confirmation Modal Examples</h2>

      <Row className="g-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Delete Confirmation</Card.Title>
              <Card.Text>Click the button below to see a delete confirmation modal.</Card.Text>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                Delete Item
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Update Confirmation</Card.Title>
              <Card.Text>Click the button below to see an update confirmation modal.</Card.Text>
              <Button variant="warning" onClick={() => setShowUpdateModal(true)}>
                Update Item
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Accept Confirmation</Card.Title>
              <Card.Text>Click the button below to see an accept confirmation modal.</Card.Text>
              <Button variant="success" onClick={() => setShowAcceptModal(true)}>
                Accept Item
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmButtonText="Delete"
        type="danger"
      />

      {/* Update Confirmation Modal */}
      <ConfirmationModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        onConfirm={handleUpdate}
        title="Confirm Update"
        message="Are you sure you want to update this item with the new information?"
        confirmButtonText="Update"
        type="warning"
      />

      {/* Accept Confirmation Modal */}
      <ConfirmationModal
        show={showAcceptModal}
        onHide={() => setShowAcceptModal(false)}
        onConfirm={handleAccept}
        title="Confirm Acceptance"
        message="Are you sure you want to accept this item?"
        confirmButtonText="Accept"
        type="accept"
      />
    </Container>
  )
}

export default ExmapleConfirmationModal