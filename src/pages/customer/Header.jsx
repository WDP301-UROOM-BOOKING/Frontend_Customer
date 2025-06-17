import {
  Container,
  Navbar,
  Nav,
  Button,
  Image,
  Dropdown,
  Badge,
  ListGroup,
  Spinner,
  Modal,
} from "react-bootstrap";
import "../../css/customer/NavigationBar.css";
import * as Routers from "../../utils/Routes";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBell, FaEnvelope, FaCheck, FaTimes, FaTrash, FaClock, FaUser } from "react-icons/fa";
import image from "../../images/image-removebg-preview.png";
import { useAppSelector } from "../../redux/store";
import AuthActions from "../../redux/auth/actions";
import { useDispatch } from "react-redux";
import { clearToken, setStatusBooking } from "@utils/handleToken";
import SearchActions from "@redux/search/actions";
import { disconnectSocket } from "@redux/socket/socketSlice";
import NotificationService from "../../services/NotificationService";

function NavigationBar({ from }) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const Auth = useAppSelector((state) => state.Auth.Auth);
  const dispatch = useDispatch();

  // Lắng nghe sự kiện cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (Auth._id !== -1) {
      fetchNotifications();
      fetchUnreadCount();

      // Set up interval to refresh unread count every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [Auth._id]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      console.log("ABC")
      const response = await  NotificationService.getUserNotifications(1, 10); // Get first 10 notifications
      if (response.Data) {
        setNotifications(response.Data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      if (response.Data) {
        setUnreadCount(response.Data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  //  rk notification as read
  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
      // Update unread count if deleted notification was unread
      const deletedNotification = notifications.find((n) => n._id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    // Set selected notification and show modal
    setSelectedNotification(notification);
    setShowNotificationModal(true);
    setShowNotifications(false); // Close dropdown
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "NEW_MESSAGE":
        return <FaEnvelope className="text-info" />;
      case "BOOKING_CONFIRMED":
        return <FaCheck className="text-success" />;
      case "BOOKING_CANCELLED":
        return <FaTimes className="text-danger" />;
      case "PAYMENT_SUCCESS":
        return <FaCheck className="text-success" />;
      case "REFUND_PROCESSED":
        return <FaCheck className="text-warning" />;
      default:
        return <FaBell className="text-primary" />;
    }
  };

  // Format notification time
  const formatNotificationTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Format full date time for modal
  const formatFullDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get notification type label
  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case "NEW_MESSAGE":
        return "New Message";
      case "BOOKING_CONFIRMED":
        return "Booking Confirmed";
      case "BOOKING_CANCELLED":
        return "Booking Cancelled";
      case "PAYMENT_SUCCESS":
        return "Payment Success";
      case "REFUND_PROCESSED":
        return "Refund Processed";
      default:
        return "Notification";
    }
  };

  return (
    <>
      <Navbar
        expand="lg"
        className={`fixed-top ${scrolled ? "navbar-scrolled" : "navbar-dark"}`}
        style={{
          backgroundColor: scrolled ? "rgba(26, 43, 73, 0.9)" : "transparent",
          transition: "background-color 0.3s ease",
        }}
      >
        <Container>
          <Image
            src={image}
            width="100"
            height="28"
            className="ms-2 me-2"
            onClick={() => {
              navigate(Routers.Home);
            }}
            style={{ cursor: "pointer" }}
          />
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link
                className="nav-link"
                onClick={() => navigate(Routers.Home)}
              >
                Home
              </Nav.Link>
              <Nav.Link
                className="nav-link"
                onClick={() => {
                  if (Auth._id != -1) {
                    navigate(Routers.ChatPage);
                  } else {
                    navigate(Routers.LoginPage);
                  }
                }}
              >
                Message
              </Nav.Link>
              <Nav.Link
                className="nav-link"
                onClick={() => {
                  if (Auth._id != -1) {
                    navigate(`${Routers.MyAccountPage}/booking_history`);
                  } else {
                    navigate(Routers.LoginPage);
                  }
                }}
              >
                Transaction
              </Nav.Link>
              <Nav.Link
                className="nav-link"
                onClick={() => {
                  if (Auth._id != -1) {
                    navigate(`${Routers.MyAccountPage}/my_feedback`);
                  } else {
                    navigate(Routers.LoginPage);
                  }
                }}
              >
                My Feedback
              </Nav.Link>
              <Nav.Link
                className="nav-link"
                onClick={() => {
                  if (Auth._id != -1) {
                    navigate(`${Routers.MyAccountPage}/favorite_hotel`);
                  } else {
                    navigate(Routers.LoginPage);
                  }
                }}
              >
                Favorite hotels
              </Nav.Link>
              <Nav.Link
                className="nav-link"
                onClick={() => {
                  if (Auth._id != -1) {
                    navigate(`${Routers.MyAccountPage}/my_report`);
                  } else {
                    navigate(Routers.LoginPage);
                  }
                }}
              >
                My Reports
              </Nav.Link>
              <Nav.Link
                className="nav-link"
                onClick={() => {
                  if (Auth._id != -1) {
                    navigate(`${Routers.MyAccountPage}/my_refund`);
                  } else {
                    navigate(Routers.LoginPage);
                  }
                }}
              >
                My Refund
              </Nav.Link>
            </Nav>

            <div className="d-flex align-items-center gap-3">
              {/* Notification Bell */}
              {Auth._id !== -1 && (
                <Dropdown
                  show={showNotifications}
                  onToggle={setShowNotifications}
                  align="end"
                >
                  <Dropdown.Toggle
                    variant="link"
                    className="p-0 border-0 position-relative notification-bell"
                    style={{ background: "none", boxShadow: "none" }}
                  >
                    <FaBell
                      size={20}
                      className="text-white"
                      style={{ cursor: "pointer" }}
                    />
                    {unreadCount > 0 && (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{
                          fontSize: "10px",
                          minWidth: "18px",
                          height: "18px",
                        }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className="notification-dropdown"
                    style={{
                      width: "350px",
                      maxHeight: "400px",
                      overflowY: "auto",
                      border: "1px solid #dee2e6",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                      <h6 className="mb-0 fw-bold">Notifications</h6>
                      {unreadCount > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-primary fw-bold"
                          onClick={markAllAsRead}
                          style={{ textDecoration: "none", fontSize: "12px" }}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>

                    {notificationLoading ? (
                      <div className="text-center p-4">
                        <Spinner animation="border" size="sm" />
                        <p className="mt-2 mb-0 text-muted">
                          Loading notifications...
                        </p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center p-4">
                        <FaBell size={30} className="text-muted mb-2" />
                        <p className="mb-0 text-muted">No notifications yet</p>
                      </div>
                    ) : (
                      <>
                        <ListGroup variant="flush">
                          {notifications.map((notification) => (
                            <ListGroup.Item
                              key={notification._id}
                              className={`notification-item ${
                                !notification.isRead ? "unread" : ""
                              }`}
                              style={{
                                cursor: "pointer",
                                backgroundColor: !notification.isRead
                                  ? "#f8f9fa"
                                  : "white",
                                border: "none",
                                borderBottom: "1px solid #f0f0f0",
                              }}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="d-flex align-items-start">
                                <div className="me-3 mt-1">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <h6
                                      className="mb-1 fw-bold"
                                      style={{ fontSize: "14px" }}
                                    >
                                      {notification.title}
                                    </h6>
                                    <div className="d-flex align-items-center gap-1">
                                      <small className="text-muted">
                                        {formatNotificationTime(notification.createdAt)}
                                      </small>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 text-danger"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteNotification(notification._id);
                                        }}
                                        style={{ fontSize: "12px" }}
                                      >
                                        <FaTrash />
                                      </Button>
                                    </div>
                                  </div>
                                  <p
                                    className="mb-1 text-muted"
                                    style={{ fontSize: "13px" }}
                                  >
                                    {notification.message}
                                  </p>
                                  {!notification.isRead && (
                                    <div className="d-flex justify-content-end">
                                      <Badge bg="primary" style={{ fontSize: "10px" }}>
                                        New
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              )}

              {/* User Dropdown */}
              {Auth._id !== -1 ? (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    className="login-btn d-flex align-items-center"
                  >
                    <a
                      style={{
                        display: "inline-block",
                        maxWidth: "150px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {Auth.name}
                    </a>{" "}
                    <Image
                      src={
                        Auth?.image?.url != "" && Auth?.image?.url != undefined
                          ? Auth?.image?.url
                          : "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
                      }
                      roundedCircle
                      width="30"
                      height="30"
                      className="ms-2 me-2"
                    />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() =>
                        navigate(`${Routers.MyAccountPage}/view_information`)
                      }
                    >
                      View Information
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() => {
                        dispatch(disconnectSocket());
                        navigate(Routers.Home, {
                          state: { message: "Logout account successfully !!!" },
                        });
                        dispatch({
                          type: AuthActions.LOGOUT,
                        });
                        dispatch({
                          type: SearchActions.SAVE_SELECTED_ROOMS,
                          payload: {
                            SearchInformation: {
                              address: "",
                              checkinDate: today.toISOString().split("T")[0],
                              checkoutDate: tomorrow.toISOString().split("T")[0],
                              adults: 2,
                              childrens: 1,
                            },
                            selectedRooms: [],
                            hotelDetail: {},
                          },
                        });
                        clearToken();
                        setStatusBooking(0);
                      }}
                    >
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <div className="d-flex gap-3">
                  <Button
                    className="px-4 py-2 fw-bold"
                    style={{
                      borderRadius: 8,
                      backgroundColor: "white",
                      color: "#2E9AED",
                    }}
                    onClick={() => {
                      if (from === "login") {
                        navigate(Routers.LoginPage, {
                          state: { from: "register" },
                        });
                      } else {
                        navigate(Routers.LoginPage);
                      }
                    }}
                  >
                    Login
                  </Button>
                </div>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Notification Detail Modal */}
      <Modal
        show={showNotificationModal}
        onHide={() => setShowNotificationModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="d-flex align-items-center gap-2">
            {selectedNotification && getNotificationIcon(selectedNotification.type)}
            <span>Notification Details</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedNotification && (
            <div>
              {/* Notification Type Badge */}
              <div className="mb-3">
                <Badge 
                  bg="secondary" 
                  className="px-3 py-2"
                  style={{ fontSize: "12px" }}
                >
                  {getNotificationTypeLabel(selectedNotification.type)}
                </Badge>
              </div>

              {/* Title */}
              <h4 className="fw-bold mb-3 text-dark">
                {selectedNotification.title}
              </h4>

              {/* Message Content */}
              <div className="mb-4">
                <p className="text-muted mb-0" style={{ fontSize: "16px", lineHeight: "1.6" }}>
                  {selectedNotification.message}
                </p>
              </div>

              {/* Additional Data if exists */}
              {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Additional Information:</h6>
                  <div className="bg-light p-3 rounded">
                    {Object.entries(selectedNotification.data).map(([key, value]) => (
                      <div key={key} className="row mb-2">
                        <div className="col-4">
                          <strong className="text-capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong>
                        </div>
                        <div className="col-8">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </div>
                      </div>
                    ))}                             
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-top pt-3">
                <div className="row text-muted" style={{ fontSize: "14px" }}>
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaClock />
                      <span>
                        <strong>Created:</strong> {formatFullDateTime(selectedNotification.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="col-6">
                    {selectedNotification.readAt && (
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaCheck className="text-success" />
                        <span>
                          <strong>Read:</strong> {formatFullDateTime(selectedNotification.readAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="d-flex align-items-center gap-2 mt-2">
                  <span className="fw-bold">Status:</span>
                  <Badge 
                    bg={selectedNotification.isRead ? "success" : "warning"}
                    className="px-2 py-1"
                  >
                    {selectedNotification.isRead ? "Read" : "Unread"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button
            variant="secondary"
            onClick={() => setShowNotificationModal(false)}
          >
            Close
          </Button>
          {selectedNotification && (
            <Button
              variant="danger"
              onClick={() => {
                deleteNotification(selectedNotification._id);
                setShowNotificationModal(false);
              }}
            >
              <FaTrash className="me-2" />
              Delete Notification
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NavigationBar;
