
import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import { Alert, Button, Card, Container, Form } from "react-bootstrap"
import { Image } from "react-bootstrap"
import { CheckCircle } from "lucide-react"
import Footer from "../Footer"
import Header from "../Header"
import Banner from "../../../images/banner.jpg"
import { ExclamationTriangleFill, Star, StarFill } from "react-bootstrap-icons"
import { useParams, useNavigate } from "react-router-dom"
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa"
import { useAppSelector, useAppDispatch } from "../../../redux/store"
import FeedbackActions from "../../../redux/feedback/actions"
import ReportFeedbackActions from "../../../redux/reportedFeedback/actions"


const ReportedFeedback = () => {
  const { id: feedbackId } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const User = useAppSelector((state) => state.Auth.Auth)
  // const selectedFeedback = useAppSelector((state) => state.Feedback.selectedFeedback)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [validated, setValidated] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
  })

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!feedbackId) {
        setError("No feedback ID provided")
        setLoading(false)
        return
      }

      setLoading(true)
      setError("")

      try {
        dispatch({
          type: FeedbackActions.FETCH_FEEDBACK_BY_ID,
          payload: {
            feedbackId,
            onSuccess: (feedback) => {
              console.log("Feedback fetched successfully:", feedback)
              setSelectedFeedback(feedback)
              setLoading(false)
            },
            onFailed: (message) => {
              console.error("Failed to fetch feedback:", message)
              setError(message || "Failed to fetch feedback")
              setLoading(false)
            },
            onError: (error) => {
              console.error("Error fetching feedback:", error)
              setError("An error occurred while fetching feedback")
              setLoading(false)
            },
          },
        })
      } catch (err) {
        console.error("Exception in dispatch:", err)
        setError("An unexpected error occurred")
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [feedbackId, dispatch])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget

    if (form.checkValidity() === false) {
      event.stopPropagation()
      setValidated(true)
      return
    }

    // Submit the report
    dispatch({
      type: ReportFeedbackActions.REPORT_FEEDBACK,
      payload: {
        feedbackId,
        reason: formData.reason,
        description: formData.description,
        onSuccess: (report) => {
          console.log("Report submitted successfully:", report)
          setSubmitted(true)
          setValidated(false)
          // Reset form
          setFormData({
            reason: "",
            description: "",
          })
        },
        onFailed: (message) => {
          console.error("Failed to submit report:", message)
          setError(message || "Failed to submit report")
        },
        onError: (error) => {
          console.error("Error submitting report:", error)
          setError("An error occurred while submitting report")
        },
      },
    })
  }

  if (submitted) {
    return (
      <div
        className="d-flex flex-column min-vh-100"
        style={{
          backgroundImage: `url(${Banner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Header />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <Container className="py-5">
            <Card className="shadow-sm">
              <Card.Body className="text-center p-5">
                <CheckCircle className="text-success mb-3" size={50} />
                <h2>Report Submitted Successfully</h2>
                <p className="mb-4">Thank you for your report. Our team will review it and take appropriate action.</p>
                <Button variant="primary" onClick={() => navigate(-1)}>
                  Return to Previous Page
                </Button>
              </Card.Body>
            </Card>
          </Container>
        </div>
        <Footer />
      </div>
    )
  }

  const renderStars = (count, total = 5) => {
    const stars = []
    for (let i = 0; i < total; i++) {
      if (i < count) {
        stars.push(<StarFill key={i} className="text-warning" />)
      } else {
        stars.push(<Star key={i} className="text-warning" />)
      }
    }
    return stars
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    try {
      return new Date(dateString).toLocaleString()
    } catch (error) {
      console.error("Date formatting error:", error)
      return dateString
    }
  }

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{
        backgroundImage: `url(${Banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header />
      <div
        className="flex-grow-1 d-flex align-items-center justify-content-center"
        style={{ paddingTop: "50px", paddingBottom: "50px" }}
      >
        <Container className="py-5">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h2 className="mb-0 fs-4">Report Inappropriate Feedback</h2>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-4">
                Use this form to report feedback that contains incorrect information, fraud, threats, or other
                inappropriate content.
              </p>

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Feedback <span className="text-danger">*</span>
                  </Form.Label>
                  <Card className="border-0">
                    <Card.Body>
                      {loading ? (
                        <div className="text-center p-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading feedback...</p>
                        </div>
                      ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                      ) : selectedFeedback ? (
                        <>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center">
                              <Image
                                src={
                                  (selectedFeedback.user &&
                                    selectedFeedback.user.image &&
                                    selectedFeedback.user.image.url) ||
                                  "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg" ||
                                  "/placeholder.svg"
                                }
                                roundedCircle
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  marginRight: "10px",
                                }}
                              />
                              <div>
                                <h6 className="mb-0">
                                  {(selectedFeedback.user && selectedFeedback.user.name) || "Unknown User"}
                                </h6>
                                <div>
                                  {renderStars(selectedFeedback.rating || 0)}
                                  <small className="text-muted ms-2">{formatDate(selectedFeedback.createdAt)}</small>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p>{selectedFeedback.content || "No content available"}</p>
                          <div>
                            <a
                              variant="outline-primary"
                              className="p-0 me-3"
                              style={{ textDecoration: "none", cursor: "pointer" }}
                            >
                              <FaThumbsUp className="me-2" />
                              {(selectedFeedback.likedBy && selectedFeedback.likedBy.length) || 0} lượt thích
                            </a>

                            <a
                              variant="outline-danger"
                              className="p-0"
                              style={{
                                textDecoration: "none",
                                color: "red",
                                cursor: "pointer",
                              }}
                            >
                              <FaThumbsDown className="me-2" />
                              {(selectedFeedback.dislikedBy && selectedFeedback.dislikedBy.length) || 0} lượt không
                              thích
                            </a>
                          </div>
                          {selectedFeedback.hotel && (
                            <div className="mt-3 pt-3 border-top">
                              <small className="text-muted">
                                Hotel: <strong>{selectedFeedback.hotel.hotelName}</strong>
                              </small>
                            </div>
                          )}
                        </>
                      ) : (
                        <Alert variant="warning">No feedback data available</Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Report Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select name="reason" value={formData.reason} onChange={handleChange} required>
                    <option value="">Select a reason for reporting</option>
                    <option value="Incorrect Information">Incorrect Information</option>
                    <option value="Fraudulent Content">Fraudulent Content</option>
                    <option value="Threatening or Harassing">Threatening or Harassing</option>
                    <option value="Inappropriate Content">Inappropriate Content</option>
                    <option value="Spam">Spam</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">Please select a report type.</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Description <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please describe why this feedback is being reported"
                    required
                  />
                  <Form.Control.Feedback type="invalid">Please provide details about the issue.</Form.Control.Feedback>
                </Form.Group>

                <Alert variant="warning" className="d-flex align-items-center">
                  <ExclamationTriangleFill className="me-2" />
                  <div>False reporting may result in account restrictions. Please ensure your report is accurate.</div>
                </Alert>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <Button
                    variant="outline-danger"
                    className="me-md-2"
                    style={{ width: "140px" }}
                    onClick={() => {
                      navigate(-1)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" style={{ width: "140px" }}>
                    Submit Report
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Footer />
    </div>
  )
}

export default ReportedFeedback
