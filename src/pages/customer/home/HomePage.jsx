import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  InputGroup,
  Image,
  Badge,
} from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaHotel,
  FaSearch,
  FaCalendarAlt,
  FaChild,
  FaUser,
  FaStar,
  FaThumbsDown,
  FaThumbsUp,
  FaQuoteLeft,
  FaPaperPlane,
  FaTimes,
  FaArrowRight,
  FaTrash,
} from "react-icons/fa";
import { askGemini, getWeatherForCity, extractCity, extractTopHotelRequest, getTopHotels, getTopHotelsFromServer } from "@utils/chatAI";
import { useEffect, useRef, useState } from "react";
import NavigationBar from "../Header";
import Footer from "../Footer";
import "../../../css/customer/home.css";
import "../../../css/customer/ChatBox.css";
import image4 from "@images/image_3.png";
import image5 from "../../../images/image-1.png";
import image6 from "../../../images/unsplash_7uXn7nudorc_1.png";
import image7 from "../../../images/unsplash_7uXn7nudorc_1.png";
import image9 from "../../../images/Ellipse_3.png";
import image10 from "../../../images/Ellipse_3_(1).png";
import travel1 from "../../../images/image 10.png";
import travel2 from "../../../images/image 10 (1).png";
import travel3 from "../../../images/unsplash_tQpypKA92k8.png";
import travel4 from "../../../images/saigon.jpg";
import travel5 from "../../../images/nhatrang.jpg";
import travel6 from "../../../images/hanoi.jpg";
import travel7 from "../../../images/phuquoc.jpg";
import chatbox from "../../../images/chatbox.png";
import onePrize from "../../../images/prize1.png";
import twoPrize from "../../../images/prize2.png";
import threePrize from "../../../images/prize3.png";
import ConfirmationModal from "@components/ConfirmationModal";

import { useLocation, useNavigate } from "react-router-dom";
import * as Routers from "../../../utils/Routes";
import { showToast, ToastProvider } from "@components/ToastContainer";
import Select from "react-select";
import { useDispatch } from "react-redux";
import { cityOptionSelect } from "@utils/data";
import SearchActions from "../../../redux/search/actions";
// Import the ErrorModal component at the top of the file with the other imports
import ErrorModal from "../../../components/ErrorModal";
import { useAppSelector, useAppDispatch } from "../../../redux/store";
import HotelActions from "../../../redux/hotel/actions";
import RoomActions from "../../../redux/room/actions";
import Utils from "@utils/Utils";
import ReactMarkdown from "react-markdown";
import qaData, {
  CancellationPolicy,
  ChatSupportCard,
  ListHotel,
} from "@utils/qaData";
import ChatboxActions from "@redux/chatbox/actions";
function Home() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate(); // cần thêm dòng này

  // Hiển thị message nếu có và xóa state để tránh hiện lại khi reload
  useEffect(() => {
    window.scrollTo(0, 0);

    if (location.state?.message) {
      showToast.success(location.state.message);
      // Xóa message sau khi hiển thị để tránh hiện lại khi reload
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const [hotels, setHotels] = useState([]);
  useEffect(() => {
    dispatch({
      type: HotelActions.FETCH_ALL_HOTEL,
      payload: {
        onSuccess: (hotels) => {
          setHotels(hotels);
        },
      },
    });
  }, []);

  return (
    <div className="app-container_1">
      <NavigationBar from="login" />
      <ToastProvider />
      <HeroSection />
      <SearchBar />
      <OtherHotels />
      <RecommendHotels />
      <AboutUs />
      <HotelBooking />
      <ChatBox />
      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <div className="hero-section_1">
      <div className="hero-content_1">
        <h1 style={{ textAlign: "center" }}>
          Discover Your Life, Travel
          <br></br>Where You Want
        </h1>
        <h5 style={{ marginTop: "16", textAlign: "center" }}>
          Would you explore natur paradise in the world, let’s find the<br></br>{" "}
          best destination in world with us.
        </h5>
      </div>
    </div>
  );
}

// Options for adults select
const adultsOptions = Array.from({ length: 20 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} Adults`,
}));

// Options for children select
const childrenOptions = Array.from({ length: 11 }, (_, i) => ({
  value: i,
  label: `${i} Childrens`,
}));
// search component
export const SearchBar = () => {
  const navigate = useNavigate();
  const hotels = useAppSelector((state) => state.hotel.hotels);
  const todayDate = new Date();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const today = todayDate.toISOString().split("T")[0];
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  const [checkinDate, setCheckinDate] = useState(today);
  const [checkoutDate, setCheckoutDate] = useState(tomorrow);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [selectedCity, setSelectedCity] = useState({
    value: "Hà Nội",
    label: "Hà Nội",
  });
  const [selectedAdults, setSelectedAdults] = useState(adultsOptions[0]);
  const [selectedChildren, setSelectedChildren] = useState(childrenOptions[0]);
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({
    address: false,
    checkinDate: false,
    checkoutDate: false,
    dateOrder: false,
  });

  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Filter hotels based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = hotels.filter(
        (hotel) =>
          hotel?.hotelName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hotel?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHotels(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredHotels([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, hotels]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHotelSelect = (hotel) => {
    setSearchQuery(hotel.hotelName);
    // Extract city from address or use a mapping
    navigate(`${Routers.Home_detail}/${hotel._id}`);
    setShowSuggestions(false);
  };

  const extractCityFromAddress = (address) => {
    const cities = [
      "Hà Nội",
      "Hồ Chí Minh",
      "Đà Nẵng",
      "Hải Phòng",
      "Phú Quốc",
    ];
    return cities.find((city) =>
      address?.toLowerCase().includes(city.toLowerCase())
    );
  };

  const handleSearch = () => {
    setErrors({
      address: false,
      checkinDate: false,
      checkoutDate: false,
      dateOrder: false,
    });

    if (!selectedCity) {
      setErrorMessage("Please select a location");
      setShowModal(true);
      setErrors((prev) => ({ ...prev, address: true }));
      return;
    }

    if (!checkinDate) {
      setErrorMessage("Please select a check-in date");
      setShowModal(true);
      setErrors((prev) => ({ ...prev, checkinDate: true }));
      return;
    }

    if (!checkoutDate) {
      setErrorMessage("Please select a check-out date");
      setShowModal(true);
      setErrors((prev) => ({ ...prev, checkoutDate: true }));
      return;
    }

    if (new Date(checkinDate) >= new Date(checkoutDate)) {
      setErrorMessage("Check-in date must be before check-out date");
      setShowModal(true);
      setErrors((prev) => ({ ...prev, dateOrder: true }));
      return;
    }

    const adults = selectedAdults ? selectedAdults.value : 1;
    const childrens = selectedChildren ? selectedChildren.value : 0;

    const SearchInformation = {
      address: selectedCity.value,
      checkinDate,
      checkoutDate,
      adults,
      childrens,
      hotelName: searchQuery, // Add hotel name to search
    };

    dispatch({
      type: SearchActions.SAVE_SEARCH,
      payload: { SearchInformation },
    });

    navigate(Routers.HotelSearchPage);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      border: "none",
      background: "transparent",
      boxShadow: "none",
      width: "100%",
    }),
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} style={{ backgroundColor: "#fff3cd", padding: "0" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div style={{ maxWidth: "1800px", margin: "0 auto", marginTop: "-4.5%" }}>
      <div
        style={{
          borderRadius: "20%",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {/* Hotel Title */}
        <div
          className="px-5 py-2 bg-white d-flex align-items-center pt-3"
          style={{
            paddingRight: "40px",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            borderBottomRightRadius: "5px",
            fontSize: "18px",
            fontWeight: "bold",
            width: "fit-content",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            paddingLeft: "20px",
            marginBottom: "-1%",
            marginLeft: "-0.65%",
          }}
        >
          <FaHotel style={{ color: "#2D74FF", fontSize: "24px" }} />
          <span style={{ color: "black", marginLeft: "10px" }}>
            Search Hotels
          </span>
        </div>

        {/* Search Bar */}
        <Row
          className="d-flex align-items-center bg-white px-4 py-4"
          style={{
            borderBottomRightRadius: "20px",
            borderBottomLeftRadius: "20px",
            borderTopRightRadius: "20px",
            position: "relative",
          }}
        >
          {/* Hotel Search Input */}
          <Col md={2} className="position-relative" ref={searchRef}>
            <InputGroup className="border" style={{ borderRadius: "10px" }}>
              <InputGroup.Text className="bg-transparent border-0">
                <FaHotel />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Name hotel or city ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                }}
              />
            </InputGroup>

            {/* Hotel Suggestions Dropdown */}
            {showSuggestions && filteredHotels.length > 0 && (
              <Card
                ref={suggestionsRef}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  right: "0",
                  marginTop: "8px",
                  zIndex: 1000,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  border: "2px solid #f3f4f6",
                  borderRadius: "12px",
                  maxHeight: "320px",
                  overflowY: "auto",
                }}
              >
                <Card.Body style={{ padding: "0" }}>
                  {filteredHotels.map((hotel, index) => (
                    <div
                      key={hotel.hotelId}
                      onClick={() => handleHotelSelect(hotel)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem",
                        cursor: "pointer",
                        borderBottom:
                          index < filteredHotels.length - 1
                            ? "1px solid #f3f4f6"
                            : "none",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#eff6ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <Image
                        src={hotel.images?.[0].url || "/placeholder.svg"}
                        alt={hotel.hotelName}
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h6
                          style={{
                            fontWeight: "600",
                            color: "#111827",
                            fontSize: "14px",
                            margin: "0 0 4px 0",
                          }}
                        >
                          {highlightText(hotel.hotelName, searchQuery)}
                        </h6>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#6b7280",
                            fontSize: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          <span>
                            {highlightText(hotel.address, searchQuery)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Badge
                            bg="secondary"
                            style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                            }}
                          >
                            {extractCityFromAddress(hotel.address) || "N/A"}
                          </Badge>
                          <div style={{ display: "flex", gap: "2px" }}>
                            {[...Array(hotel.star || 0)].map((_, i) => (
                              <FaStar
                                key={i}
                                style={{
                                  color: "#fbbf24",
                                  fontSize: "12px",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Location Select */}
          <Col md={2}>
            <InputGroup className="border" style={{ borderRadius: "10px" }}>
              <InputGroup.Text className="bg-transparent border-0">
                <FaMapMarkerAlt />
              </InputGroup.Text>
              <div style={{ flex: 1 }}>
                <Select
                  options={cityOptionSelect}
                  value={selectedCity}
                  onChange={setSelectedCity}
                  placeholder="Search location"
                  isSearchable
                  styles={selectStyles}
                />
              </div>
              <InputGroup.Text className="bg-transparent border-0">
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
          </Col>

          {/* Dates */}
          <Col md={4}>
            <Row className="align-items-center">
              <Col className="d-flex flex-grow-1">
                <InputGroup
                  className="border w-100"
                  style={{ borderRadius: "10px" }}
                >
                  <InputGroup.Text className="bg-transparent border-0">
                    <FaCalendarAlt />
                  </InputGroup.Text>
                  <Form.Control
                    type="date"
                    className="border-0 bg-transparent"
                    value={checkinDate}
                    onChange={(e) => setCheckinDate(e.target.value)}
                    min={today}
                  />
                </InputGroup>
              </Col>

              <Col
                xs="auto"
                className="d-flex align-items-center justify-content-center"
              >
                <FaArrowRight style={{ fontSize: "1.2rem", color: "#555" }} />
              </Col>

              <Col className="d-flex flex-grow-1">
                <InputGroup
                  className="border w-100"
                  style={{ borderRadius: "10px" }}
                >
                  <InputGroup.Text className="bg-transparent border-0">
                    <FaCalendarAlt />
                  </InputGroup.Text>
                  <Form.Control
                    type="date"
                    className="border-0 bg-transparent"
                    value={checkoutDate}
                    onChange={(e) => setCheckoutDate(e.target.value)}
                    min={today}
                  />
                </InputGroup>
              </Col>
            </Row>
          </Col>

          {/* Guests */}
          <Col md={3} className="px-3">
            <InputGroup
              className="border"
              style={{ borderRadius: "10px", padding: "2px" }}
            >
              <InputGroup.Text className="bg-transparent border-0">
                <FaUser />
              </InputGroup.Text>
              <div style={{ flex: 1 }}>
                <Select
                  options={adultsOptions}
                  value={selectedAdults}
                  onChange={setSelectedAdults}
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>

              <InputGroup.Text className="bg-transparent border-0">
                <FaChild />
              </InputGroup.Text>
              <div style={{ flex: 1 }}>
                <Select
                  options={childrenOptions}
                  value={selectedChildren}
                  onChange={setSelectedChildren}
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>
            </InputGroup>
          </Col>

          {/* Search Button */}
          <Col xs="auto" className="px-2">
            <Button
              variant="primary"
              style={{ width: "60px", height: "45px", borderRadius: "15px" }}
              onClick={handleSearch}
            >
              <FaSearch />
            </Button>
          </Col>
        </Row>
      </div>

      {/* Error Modal */}
      <ErrorModal
        show={showModal}
        onClose={closeModal}
        message={errorMessage}
      />
    </div>
  );
};

function OtherHotels() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);

  console.log("Hotels: ", hotels);
  useEffect(() => {
    dispatch({
      type: HotelActions.FETCH_TOP3_HOTEL,
      payload: {
        onSuccess: (hotelList) => {
          setHotels(hotelList);
        },
        onFailed: (msg) => {
          console.error("Failed to fetch hotels:", msg);
        },
        onError: (err) => {
          console.error("Server error:", err);
        },
      },
    });
  }, [dispatch]);

  return hotels.length != 0 ? (
    <Container style={{ marginTop: "8%", marginBottom: "5%" }}>
      <h1 className="section-title" style={{ fontSize: "2.5rem" }}>
        Special Offers Just For You
      </h1>
      <Row className="g-4">
        {hotels.map((hotel, index) => {
          const hotelId = hotel.hotelId;

          return (
            <Col md={4} key={hotelId}>
              <Card
                style={{
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    height: "250px",
                    borderTopLeftRadius: "20px",
                    borderTopRightRadius: "20px",
                    overflow: "hidden",
                  }}
                >
                  {index == 0 ? (
                    <Image
                      src={onePrize}
                      width="60px"
                      height="60px"
                      style={{ position: "absolute", top: 10, left: 10 }}
                    />
                  ) : (
                    <></>
                  )}
                  {index == 1 ? (
                    <Image
                      src={twoPrize}
                      width="60px"
                      height="60px"
                      style={{ position: "absolute", top: 10, left: 10 }}
                    />
                  ) : (
                    <></>
                  )}
                  {index == 2 ? (
                    <Image
                      src={threePrize}
                      width="60px"
                      height="60px"
                      style={{ position: "absolute", top: 10, left: 10 }}
                    />
                  ) : (
                    <></>
                  )}
                  <Image
                    src={hotel.images?.[0].url || "/placeholder.svg"}
                    alt="Hotel"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "15px",
                      right: "20px",
                      display: "flex",
                      gap: "3px",
                    }}
                  >
                    {[...Array(5)].map((_, i) =>
                      i < (hotel.star || 0) ? (
                        <FaStar
                          key={i}
                          style={{ color: "#f5b50a", fontSize: "1.4rem" }}
                        />
                      ) : null
                    )}
                  </div>
                </div>
                <Card.Body style={{ padding: "1.5rem" }}>
                  <Card.Title
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "600",
                      marginBottom: "10px",
                      minHeight: "48px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{hotel.hotelName}</span>
                    </div>
                  </Card.Title>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#555",
                      fontSize: "0.95rem",
                      marginTop: "-20px",
                      marginBottom: "12px",
                    }}
                  >
                    <FaCalendarAlt style={{ color: "#0d6efd" }} />
                    <span style={{ fontSize: "16px" }}>
                      {hotel.totalBookings} bookings this month
                    </span>
                  </div>
                  <Button
                    variant="outline-primary"
                    style={{
                      width: "100%",
                      padding: "0.7rem",
                      fontWeight: "500",
                      borderRadius: "10px",
                      fontSize: "1rem",
                    }}
                    onClick={() => {
                      dispatch({
                        type: SearchActions.SAVE_SELECTED_ROOMS,
                        payload: { selectedRooms: [] },
                      });
                      navigate(`${Routers.Home_detail}/${hotelId}`);
                    }}
                  >
                    Book Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  ) : (
    <></>
  );
}

const AboutUs = () => {
  return (
    <Container
      id="about_us"
      className="about-us-container_1"
      style={{ marginTop: "8%" }}
    >
      <Row className="justify-content-center text-center">
        <Col md={8}>
          <h2 className="about-title_1">About Us</h2>
          <p className="about-subtitle_1">Book Anywhere, Perfect Experience</p>
        </Col>
      </Row>

      <Row className="align-items-center">
        {/* Nội dung giới thiệu */}
        <Col md={6} className="ms-auto">
          <p className="about-text_1">
            At our core, we strive to be the ultimate bridge connecting
            travelers with extraordinary stays across the globe. With a vast
            network spanning over 10,000 hotels, from serene beach resorts to
            luxurious city-center accommodations, we ensure you always have
            access to the perfect lodging that fits your style and budget.
            <br />
            <br />
            Our platform is designed to provide a seamless and efficient booking
            experience, offering you competitive prices, exclusive seasonal
            discounts, and a hassle-free reservation process. Whether you're
            planning a short business trip or a long-term getaway, our
            user-friendly system helps you make informed choices with ease.
            <br />
            <br />
            More than just a booking service, we take pride in delivering a
            superior travel experience. Our dedicated customer support team is
            available 24/7 to assist you, ensuring every aspect of your journey
            is smooth and stress-free. From personalized recommendations to
            last-minute changes, we are here to make your travel plans
            effortless. Let us be your trusted travel partner, accompanying you
            on every adventure, big or small.
          </p>
        </Col>

        {/* Hình ảnh */}
        <Col md={6} className="about-images_1">
          <div
            className="image-stack_1"
            style={{ marginLeft: "30%", marginTop: "5%" }}
          >
            <img
              src={travel1 || "/placeholder.svg"}
              alt="Travel 1"
              className="top-image_1"
            />
            <img
              src={travel2 || "/placeholder.svg"}
              alt="Travel 2"
              className="bottom-image_1"
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};
const HotelBooking = () => {
  const navigate = useNavigate();
  const Auth = useAppSelector((state) => state.Auth.Auth);
  return (
    <Container className="hotel-booking_1" style={{ marginTop: "15%" }}>
      <Row className="align-items-center">
        <Col md={6} className="position-relative">
          <div className="image-container_1">
            <img
              src={travel3 || "/placeholder.svg"}
              alt="Traveler"
              className="main-image_1"
            />
            <div className="info-badge_1 top-right">
              <span style={{ color: "#3E86F5", fontSize: "25px" }}>100+</span>
              <br></br> DESTINATIONS
            </div>
            <div className="info-badge_1 bottom-right">
              <span style={{ color: "#3E86F5", fontSize: "25px" }}>150+</span>
              <br></br>HOTELS
            </div>
            <div className="info-badge_1 bottom-left">
              <span style={{ color: "#3E86F5", fontSize: "25px" }}>50+</span>
              <br></br> ROOM TYPE
            </div>
          </div>
        </Col>
        <Col md={6}>
          <h2 style={{ fontWeight: "bold" }}>Book Hotels Anywhere with Us</h2>
          <p style={{ fontSize: "16px", color: "#666" }}>
            Whether you're planning a luxurious getaway, a family vacation, or a
            business trip, we are here to make your hotel booking experience
            seamless and hassle-free. Our platform connects you with thousands
            of hotels worldwide, from high-end resorts by the beach to cozy
            stays in the heart of the city.
          </p>
          <p style={{ fontSize: "16px", color: "#666" }}>
            Enjoy exclusive deals, seasonal discounts, and a wide range of
            accommodations tailored to your budget and preferences. Our
            easy-to-use online booking system ensures that you find the perfect
            place to stay with just a few clicks. Plus, our dedicated customer
            support team is available 24/7 to assist you at every step of your
            journey.
          </p>
          <p style={{ fontSize: "16px", color: "#666" }}>
            Experience a seamless travel planning process with us, whether
            you're looking for a short weekend escape or a long-term stay. Let
            us take care of your accommodation needs so you can focus on
            creating unforgettable memories.
          </p>
          <Button
            variant="primary"
            style={{ marginTop: "5%" }}
            onClick={() => {
              if (Auth?._id != -1) {
                navigate(Routers.ChatPage, {
                  state: {
                    receiver: {
                      _id: 16,
                      name: "Admin Uroom",
                      image: {
                        public_ID: "avatar_admin1",
                        url: "https://cdn-icons-png.freepik.com/512/4880/4880553.png",
                      },
                    },
                  },
                });
              } else {
                navigate(Routers.LoginPage);
              }
            }}
          >
            Contact Us
          </Button>
        </Col>
      </Row>
    </Container>
  );
};
function RecommendHotels() {
  const hotels = [
    {
      city: "Hồ Chí Minh",
      image: travel4,
    },
    {
      city: "Hà Nội",
      image: travel6,
    },
    {
      city: "Đà Nẵng",
      image: travel5,
    },
    {
      city: "Hải Phòng",
      image: travel7,
    },
  ];

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const todayDate = new Date(); // Date object
  const tomorrowDate = new Date();
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const today = todayDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const tomorrow = tomorrowDate.toISOString().split("T")[0];
  return (
    <Container className="other-hotels-section_2" style={{ marginTop: "8%" }}>
      <h1 className="section-title" style={{ fontSize: "2.5rem" }}>
        Hotels for domestic tourists
      </h1>
      <Row>
        {hotels.map((hotel) => (
          <Col md={3} key={hotel.id}>
            <Card
              className="hotel-card"
              style={{ cursor: "pointer" }}
              onClick={() => {
                console.log("Abc");
                const SearchInformation = {
                  address: hotel.city,
                  checkinDate: today,
                  checkoutDate: tomorrow,
                  adults: 1,
                  childrens: 0,
                };
                dispatch({
                  type: SearchActions.SAVE_SEARCH,
                  payload: { SearchInformation },
                });
                navigate(Routers.HotelSearchPage);
              }}
            >
              <div className="hotel-image-container">
                <Card.Img
                  variant="top"
                  src={hotel.image}
                  className="hotel-image"
                  style={{ height: "250px" }}
                />
              </div>
              <Card.Body>
                <Card.Title className="hotel-name">{hotel.city}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
function CustomerReviews() {
  const reviews = [
    {
      id: 1,
      text: "Great experience! Professional service, clean and modern room.",
      author: "Nguyen Van B",
      rating: 4.5,
      image: image9,
    },
    {
      id: 2,
      text: "Quick booking process, many attractive offers",
      author: "Huynh Van B",
      rating: 4.8,
      image: image10,
    },
  ];

  return (
    <Container className="reviews-section" style={{ marginTop: "8%" }}>
      <h2
        className="reviews-title"
        style={{
          textAlign: "center",
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "3rem",
          color: "#1a2b49",
        }}
      >
        Customer Reviews
      </h2>
      <Row>
        {reviews.map((review) => (
          <Col md={6} key={review.id}>
            <div className="review-card">
              <FaQuoteLeft
                className="quote-icon"
                style={{ alignItems: "center" }}
              />
              <p className="review-text">{review.text}</p>
              <div className="review-actions">
                <button className="action-btn">
                  <FaThumbsUp />
                </button>
                <button className="action-btn">
                  <FaThumbsDown />
                </button>
              </div>
              <div className="reviewer-info">
                <div className="reviewer-name">-{review.author}</div>
                <div className="reviewer-status">Happy Treloo</div>
                <div className="reviewer-profile">
                  <img
                    src={review.image || image7}
                    alt={review.author}
                    className="reviewer-image"
                  />
                  <div className="rating">
                    <FaStar className="star-icon" />
                    <span>{review.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export const findAnswerFromQA = (message) => {
  const lowerMsg = message.trim().toLowerCase();
  for (const qa of qaData) {
    if (
      qa.questions.some((q) =>
        lowerMsg.includes(q.toLowerCase())
      )
    ) {
      // Trả về mảng answer (có thể là text hoặc tên component đặc biệt)
      return qa.answer;
    }
  }
  return null;
};

export const ChatBox = () => {
  const dispatch = useDispatch();
  const Messages = useAppSelector((state) => state.ChatBox.Messages);
  console.log("Messages123: ", Messages);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(Messages ?? []);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 1000);
    }
  }, [isOpen]);

  const sendMessage = () => {
    if (input.trim() !== "") {
      const userMessage = input.trim();
      setMessages([...messages, { text: input, sender: "user" }]);
      dispatch({
        type: ChatboxActions.ADD_MESSAGE,
        payload: {
          message: { text: input, sender: "user" },
        },
      });
      setInput("");

      setTimeout(async () => {
        // 1. Check FAQ trước
        const qaAnswers = findAnswerFromQA(userMessage);
        if (qaAnswers && qaAnswers.length > 0) {
          for (const ans of qaAnswers) {
            setMessages((prev) => [...prev, { text: ans, sender: "bot" }]);
            dispatch({
              type: ChatboxActions.ADD_MESSAGE,
              payload: {
                message: { text: ans, sender: "bot" },
              },
            });
          }
          return; // Không xử lý tiếp nếu đã trả lời từ FAQ
        }

        // // 2. Xử lý top khách sạn như cũ
        // const topHotelRequest = extractTopHotelRequest(userMessage);
        // if (topHotelRequest) {
        //   const list = getTopHotels(topHotelRequest.city, topHotelRequest.count);
        //   if (list.length > 0) {
        //     const formatted = list
        //       .map((hotel, idx) => `${idx + 1}. ${hotel.name} (${hotel.rating}⭐)`)
        //       .join("\n");

        //     setMessages((prev) => [...prev, { text: formatted, sender: "bot" }]);
        //     dispatch({
        //       type: ChatboxActions.ADD_MESSAGE,
        //       payload: {
        //         message: { text: formatted, sender: "bot" },
        //       },
        //     });
        //     return;
        //   }
        // }

        // 3. Xử lý thời tiết và gọi AI như cũ
        const city = extractCity(userMessage);
        let weatherText = "";
        if (city) {
          weatherText = await getWeatherForCity(city);
        }

        const reply = await askGemini(userMessage, weatherText);

        setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
        dispatch({
          type: ChatboxActions.ADD_MESSAGE,
          payload: {
            message: {
              text: reply,
              sender: "bot",
            },
          },
        });
      }, 1000);
    }
  };
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="chatbox-container">
      {!isOpen && (
        <button className="chatbox-toggle" onClick={toggleChat}>
          <img
            src={chatbox || "/placeholder.svg"}
            alt="AI Chat"
            width="50"
            height="50"
          />
        </button>
      )}
      <ConfirmationModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={() => {
          dispatch({
            type: ChatboxActions.CLEAR_MESSAGES,
            payload: {},
          });
          setIsOpen(false);
          setMessages([]);
        }}
        title="Confirm clear messages"
        message="Are you sure you want to clear this messages ?"
        confirmButtonText="Confirm"
        type="danger"
      />
      {isOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <span>
              <img
                src={chatbox || "/placeholder.svg"}
                alt="AI Chat"
                width="20"
                height="20"
                className="me-2"
              />
              Chatbox
            </span>
            <div>
              <FaTrash
                className="me-2"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (messages.length != 0) {
                    setShowModal(true);
                  }
                }}
              />
              <FaTimes className="close-icon" onClick={toggleChat} />
            </div>
          </div>
          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text === "ChatSupportCard" && <ChatSupportCard />}
                {msg.text === "CancellationPolicy" && <CancellationPolicy />}
                {msg.text === "ListHotelDaNang" && (
                  <ListHotel address="Đà Nẵng" />
                )}
                {msg.text === "ListHotelHoChiMinh" && (
                  <ListHotel address="Hồ Chí Minh" />
                )}
                {msg.text === "ListHotelHaNoi" && (
                  <ListHotel address="Hà Nội" />
                )}
                {msg.text !== "ChatSupportCard" &&
                  msg.text !== "CancellationPolicy" &&
                  msg.text !== "ListHotelDaNang" &&
                  msg.text !== "ListHotelHoChiMinh" &&
                  msg.text !== "ListHotelHaNoi" &&
                  <ReactMarkdown>{msg.text}</ReactMarkdown>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbox-input">
            <input
              type="text"
              placeholder="Enter the message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
