import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Card, Form, Button } from "react-bootstrap";
import AuthActions from "../../../../redux/auth/actions";
import { useAppSelector } from "../../../../redux/store";
import { useDispatch } from "react-redux";
import { showToast, ToastProvider } from "@components/ToastContainer";
import ConfirmationModal from "@components/ConfirmationModal";

function ViewAvatar() {
  const Auth = useAppSelector((state) => state.Auth.Auth);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(Auth?.image?.url);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Xử lý mở modal
  const handleOpenModal = () => setShowAvatarModal(true);
  const handleCloseModal = () => setShowAvatarModal(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file);
    }
  };

  const handleUploadFile = () => {
    if (!selectedFile) {
      showToast.warning("Please select a file to upload.");
      return;
    };

    const formData = new FormData();
    formData.append("avatar", selectedFile);
    setLoading(true);
    dispatch({
      type: AuthActions.UPDATE_AVATAR,
      payload: {
        formData: formData,
        onSuccess: (MsgYes) => {
          setLoading(false);
          showToast.success(MsgYes);
        },
        onFailed: () => {
          showToast.warning("Failed to update avatar. Please try again.");
          setLoading(false);
        },
        onError: () => {
          showToast.warning("An error occurred while uploading the file.");
          setLoading(false);
        },
      },
    });
  };

  return (
    <Card.Body>
      <h2 className="fw-bold mb-4">View Avatar</h2>
      <div className="text-center">
        <img
          src={(selectedImage != "" && selectedImage) ? selectedImage : "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"}
          className="rounded-circle mb-2"
          style={{ width: "150px", height: "150px", objectFit: "cover" }}
          alt="avatar"
        />
        <br />
        <Button
          className="fw-bold mb-4"
          variant="outline-primary"
          onClick={handleOpenModal}
        >
          View Avatar
        </Button>
      </div>
      <p className="text-center text-muted">
        Maximum file size is 1 MB
        <br />
        Format JPEG, PNG, JPG, ...
      </p>
      <Form>
        <Form.Group controlId="formFile" className="mb-3 text-center">
          <Form.Control
            name="avatar"
            type="file"
            className="d-inline-block w-auto"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
          />
        </Form.Group>
        <div className="d-flex justify-content-end">
          <Button
            variant="danger"
            className="me-2"
            onClick={() => {
              setShowUpdateModal(true);
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="primary"
            disabled={loading} // disable khi loading
            onClick={() => {
              setShowAcceptModal(true);
            }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </Form>

      {/* Avatar Modal */}
      <Modal
        show={showAvatarModal}
        onHide={handleCloseModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Customer Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <img
            src={(selectedImage != "" && selectedImage) ? selectedImage : "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"}
            alt="Customer avatar"
            className="img-fluid"
            style={{ height: "480px", width: "480px" }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastProvider />
      {/* Update Confirmation Modal */}
      <ConfirmationModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        onConfirm={() => {
          setSelectedImage(Auth.image.url);
          setSelectedFile()
        }}
        title="Confirm Cancel"
        message="Are you sure you want to reset this avatar ?"
        confirmButtonText="Confirm"
        type="warning"
      />

      {/* Accept Confirmation Modal */}
      <ConfirmationModal
        show={showAcceptModal}
        onHide={() => setShowAcceptModal(false)}
        onConfirm={handleUploadFile}
        title="Confirm Update"
        message="Are you sure you want to update this new avatar?"
        confirmButtonText="Accept"
        type="accept"
      />
    </Card.Body>
  );
}

export default ViewAvatar;
