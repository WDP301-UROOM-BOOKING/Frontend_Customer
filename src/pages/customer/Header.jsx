import {
  Container,
  Navbar,
  Nav,
  Button,
  Image,
  Dropdown,
} from "react-bootstrap"; // ✅ Thêm Dropdown
import "../../css/customer/NavigationBar.css";
import * as Routers from "../../utils/Routes";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import image from "../../images/image-removebg-preview.png";
import { useAppSelector } from "../../redux/store";
import AuthActions from "../../redux/auth/actions";
import { useDispatch } from "react-redux";
import { clearToken, setStatusBooking } from "@utils/handleToken";
import SearchActions from "@redux/search/actions";
import { disconnectSocket } from "@redux/socket/socketSlice";

function NavigationBar({ from }) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  // ✅ Nhận `header` từ props (hoặc có thể setState)
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Danh sách thông báo mẫu
  const notifications = [
    "Bạn có 1 tin nhắn mới",
    "Cập nhật hệ thống vào 10h tối nay",
    "Khách hàng vừa đặt hàng mới",
  ];
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

  const Auth = useAppSelector((state) => state.Auth.Auth);
  const dispatch = useDispatch();
  return (
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

          {Auth._id !== -1 ? (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="login-btn d-flex align-items-center"
              >
                <a
                  style={{
                    display: "inline-block",
                    maxWidth: "150px", // hoặc width tùy bạn
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
                          checkinDate: today.toISOString().split("T")[0], // yyyy-mm-dd format
                          checkoutDate: tomorrow.toISOString().split("T")[0], // yyyy-mm-dd format
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
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
