import { useEffect, useRef, useState } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  Route,
} from "react-router-dom";
import MapComponent from "@pages/MapLocation";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  InputGroup,
  Image,
  ProgressBar,
  Spinner,
  Modal,
} from "react-bootstrap";
import Pagination from "@components/Pagination";
import {
  FaStar,
  FaSearch,
  FaCalendarAlt,
  FaChild,
  FaUser,
  FaThumbsUp,
  FaThumbsDown,
  FaArrowRight,
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as GiIcons from "react-icons/gi";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../../src/css/customer/Home_detail.css";
import { Star, StarFill } from "react-bootstrap-icons";

// Components
import NavigationBar from "../Header";
import Footer from "../Footer";

// Routes and Redux
import * as Routers from "../../../utils/Routes";
import { useAppSelector, useAppDispatch } from "../../../redux/store";
import HotelActions from "../../../redux/hotel/actions";
import RoomActions from "../../../redux/room/actions";
import AuthActions from "../../../redux/auth/actions";
import { showToast } from "@components/ToastContainer";
import Factories from "../../../redux/search/factories";
import Factories2 from "../../../redux/feedback/factories";
import Utils from "../../../utils/Utils";
import ErrorModal from "@components/ErrorModal";
import SearchActions from "../../../redux/search/actions";
import HotelClosedModal from "./components/HotelClosedModal";
import { ChatBox } from "./HomePage";

// Options for select inputs
const adultsOptions = Array.from({ length: 20 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} Adults`,
}));

const childrenOptions = Array.from({ length: 11 }, (_, i) => ({
  value: i,
  label: `${i} Childrens`,
}));

// Utility functions
const renderIcon = (iconName) => {
  const iconLibraries = {
    ...FaIcons,
    ...MdIcons,
    ...GiIcons,
  };

  const IconComponent = iconLibraries[iconName];
  return IconComponent ? (
    <IconComponent style={{ fontSize: "20px", color: "#1a2b49" }} />
  ) : null;
};

// Select styles
const selectStyles = {
  control: (provided) => ({
    ...provided,
    border: "none",
    background: "transparent",
    boxShadow: "none",
    width: "100%",
  }),
};

export default function HotelDetailPage() {
  const { id: hotelId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const Auth = useAppSelector((state) => state.Auth.Auth);
  const SearchInformation = useAppSelector(
    (state) => state.Search.SearchInformation
  );
  const selectedRoomsTemps = useAppSelector(
    (state) => state.Search.selectedRooms
  );
  const [showModalStatusBooking, setShowModalStatusBooking] = useState(false);

  // State variables
  const [hotelDetail, setHotelDetail] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [shuffledHotels, setShuffledHotels] = useState([]);
  const [roomsByHotel, setRoomsByHotel] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState({});
  const [totalPages, setTotalPages] = useState();
  const [showModalMap, setShowModalMap] = useState(false);
  const [addressMap, setAddressMap] = useState("");
  const [searchParamsTemp] = useSearchParams();
  const sortTemp = searchParamsTemp.get("sort");
  const starTemp = searchParamsTemp.get("star");
  const pageTemp = searchParamsTemp.get("page");
  const [currentPage, setCurrentPage] = useState(Number(pageTemp) ?? 1);
  const [sort, setSort] = useState(Number(sortTemp) ?? 0);
  const [star, setStar] = useState(Number(starTemp) ?? 0);

  const [filterParams, setFilterParams] = useState({
    page: currentPage,
    sort: sort,
    star: star,
  });
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Search state
  const [checkinDate, setCheckinDate] = useState(SearchInformation.checkinDate);
  const [checkoutDate, setCheckoutDate] = useState(
    SearchInformation.checkoutDate
  );

  useEffect(() => {
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);

    if (checkin.getTime() === checkout.getTime()) {
      const nextDay = new Date(checkin);
      nextDay.setDate(checkin.getDate() + 1);
      setCheckoutDate(nextDay.toISOString().split("T")[0]); // format as yyyy-mm-dd
    }
  }, [checkoutDate, checkinDate]);

  const [selectedAdults, setSelectedAdults] = useState(
    adultsOptions.find((option) => option.value === SearchInformation.adults) ||
      adultsOptions[0]
  );
  const [selectedChildren, setSelectedChildren] = useState(
    childrenOptions.find(
      (option) => option.value === SearchInformation.childrens
    ) || childrenOptions[0]
  );
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setSelectedRooms([]);
    dispatch({
      type: SearchActions.SAVE_SELECTED_ROOMS,
      payload: {
        selectedRooms: [],
      },
    });
  }, [hotelId]);
  // Update URL when filters change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams();
      params.set("sort", sort.toString());
      params.set("star", star.toString());
      params.set("page", currentPage.toString() ?? 1);

      // Use window.history to update URL without full page reload
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );

      // Save filter to localStorage
    }
  }, [sort, star, currentPage]);

  const today = new Date().toISOString().split("T")[0];
  // Fetch hotel details
  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;

    if (hotelId) {
      dispatch({
        type: HotelActions.FETCH_DETAIL_HOTEL,
        payload: {
          hotelId,
          userId: Auth._id,
          onSuccess: (hotel, isFavorite) => {
            if (isMounted) {
              setHotelDetail(hotel);
              setIsFavorite(isFavorite);
              if (hotel.images && hotel.images.length > 0) {
                setMainImage(hotel.images[0]);
              }
            }
          },
          onFailed: (msg) => {
            if (isMounted) {
              showToast.warning("Get hotel details failed");
            }
          },
          onError: (err) => {
            if (isMounted) {
              showToast.warning("Server error");
            }
          },
        },
      });
    }

    return () => {
      isMounted = false;
    };
  }, [hotelId, dispatch, Auth._id]);

  const [searchParams, setSearchParams] = useState({
    address: SearchInformation.address,
    checkinDate: SearchInformation.checkinDate,
    checkoutDate: SearchInformation.checkoutDate,
    numberOfPeople: SearchInformation.adults + SearchInformation.childrens,
    page: 1,
    limit: 10,
  });
  // Fetch rooms
  useEffect(() => {
    let isMounted = true;

    if (hotelId) {
      dispatch({
        type: RoomActions.FETCH_ROOM,
        payload: {
          hotelId,
          query: searchParams,
          onSuccess: (roomList) => {
            if (isMounted) {
              if (Array.isArray(roomList)) {
                setRooms(roomList);
              } else {
                console.warn("Unexpected data format received:", roomList);
              }
            }
          },
          onFailed: (msg) => {
            if (isMounted) {
              console.error("Failed to fetch rooms:", msg);
            }
          },
          onError: (err) => {
            if (isMounted) {
              console.error("Server error:", err);
            }
          },
        },
      });
    }

    return () => {
      isMounted = false;
    };
  }, [hotelId, dispatch]);

  const [searchRoom, setSearchRoom] = useState(false);

  const handleSearchRoom = () => {
    const adults = selectedAdults ? selectedAdults.value : 1;
    const childrens = selectedChildren ? selectedChildren.value : 0;
    const SearchInformationTemp = {
      address: SearchInformation.address,
      checkinDate,
      checkoutDate,
      adults,
      childrens,
    };

    console.log("SearchInformationTemp: ", SearchInformationTemp);
    dispatch({
      type: SearchActions.SAVE_SEARCH,
      payload: { SearchInformation: SearchInformationTemp },
    });
    dispatch({
      type: SearchActions.SAVE_SELECTED_ROOMS,
      payload: { selectedRooms: [] },
    });
    setSelectedRooms([]);
    setSearchRoom(true);
    dispatch({
      type: RoomActions.FETCH_ROOM,
      payload: {
        hotelId,
        query: searchParams,
        onSuccess: (roomList) => {
          if (Array.isArray(roomList)) {
            setRooms(roomList);
            setTimeout(() => {
              setSearchRoom(false);
            }, 1000);
          } else {
            console.warn("Unexpected data format received:", roomList);
          }
        },
        onFailed: (msg) => console.error("Failed to fetch rooms:", msg),
        onError: (err) => console.error("Server error:", err),
      },
    });
  };
  // Fetch other hotels

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setFilterParams({
      ...filterParams,
      page: page,
    });
  };

  const scrollRef = useRef(null);
  const scrollRefRoom = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
    return () => {
      // No cleanup needed for this simple DOM manipulation
    };
  }, [shuffledHotels]);
  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchHotelsData = async () => {
      try {
        const response = await Factories.searchHotel(searchParams);
        if (response?.status === 200 && isMounted) {
          const shuffled = [...response.data.hotels].sort(
            () => 0.5 - Math.random()
          );
          setShuffledHotels(shuffled);

          // Fetch rooms for each hotel
          shuffled.forEach((hotel) => {
            if (isMounted) {
              dispatch({
                type: RoomActions.FETCH_ROOM,
                payload: {
                  hotelId: hotel.hotel._id,
                  query: searchParams,
                  onSuccess: (roomList) => {
                    if (isMounted) {
                      setRoomsByHotel((prev) => ({
                        ...prev,
                        [hotel.hotel._id]: roomList,
                      }));
                    }
                  },
                  onFailed: (msg) => {
                    if (isMounted) {
                      console.error("Failed to fetch rooms:", msg);
                    }
                  },
                  onError: (err) => {
                    if (isMounted) {
                      console.error("Server error:", err);
                    }
                  },
                },
              });
            }
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching hotels:", error);
        }
      }
    };

    fetchHotelsData();

    return () => {
      isMounted = false;
    };
  }, [searchRoom, dispatch, searchParams]);

  const fetchFeedbacks = async () => {
    try {
      const response = await Factories2.get_feedback_by_hotelId(
        hotelId,
        filterParams
      );
      if (response?.status === 200) {
        setFeedbacks(response?.data.listFeedback);
        setTotalFeedback(response?.data.totalFeedback);
        setAverageRating(response?.data.averageRating);
        setRatingBreakdown(response?.data.ratingBreakdown);
        setTotalPages(response?.data.totalPages);
        setCurrentPage(response?.data.currentPage);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchFeedbacksData = async () => {
      try {
        const response = await Factories2.get_feedback_by_hotelId(
          hotelId,
          filterParams
        );
        if (response?.status === 200 && isMounted) {
          setFeedbacks(response?.data.listFeedback);
          setTotalFeedback(response?.data.totalFeedback);
          setAverageRating(response?.data.averageRating);
          setRatingBreakdown(response?.data.ratingBreakdown);
          setTotalPages(response?.data.totalPages);
          setCurrentPage(response?.data.currentPage);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching feedbacks:", error);
        }
      }
    };

    fetchFeedbacksData();

    return () => {
      isMounted = false;
    };
  }, [filterParams, hotelId]);
  // Event handlers
  const handleChangeFavorite = (isFavorite, hotelId) => {
    if (isFavorite) {
      dispatch({
        type: AuthActions.REMOVE_FAVORITE_HOTEL_REQUEST,
        payload: {
          hotelId,
          onSuccess: () => setIsFavorite(false),
          onFailed: (msg) => {},
          onError: (error) => console.error(error),
        },
      });
    } else {
      dispatch({
        type: AuthActions.ADD_FAVORITE_HOTEL_REQUEST,
        payload: {
          hotelId,
          onSuccess: () => setIsFavorite(true),
          onFailed: (msg) => {},
          onError: (error) => console.error(error),
        },
      });
    }
  };

  const [showModalService, setShowModalService] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceClickService = (service) => {
    setSelectedService(service);
    setShowModalService(true);
  };

  const handleCloseModalService = () => {
    setShowModalService(false);
    setSelectedService(null);
  };

  const handleThumbnailClick = (image, index) => {
    setMainImage(image);
    const newStart = Math.max(
      0,
      Math.min(index - 1, (hotelDetail?.images?.length || 0) - 3)
    );
    setThumbnailStartIndex(newStart);
  };

  const handleRoomClick = (roomId, availableQuantity) => {
    navigate(`${Routers.RoomDetailPage}/${roomId}`, {
      state: { availableQuantity: availableQuantity },
    });
  };

  //booking room
  const [selectedRooms, setSelectedRooms] = useState(selectedRoomsTemps ?? []);
  console.log("selectedRooms: ", selectedRooms);
  const handleAmountChange = (room, amount) => {
    setSelectedRooms((prevSelected) => {
      if (amount === 0) {
        return prevSelected.filter((item) => item.room._id !== room._id);
      }

      const existing = prevSelected.find((item) => item.room._id === room._id);
      if (existing) {
        // Nếu đã có thì cập nhật amount
        return prevSelected.map((item) =>
          item.room._id === room._id ? { ...item, amount } : item
        );
      } else {
        // Nếu chưa có thì thêm mới
        return [...prevSelected, { room, amount }];
      }
    });
  };

  //feedback
  const handleLike = async (feedbackId) => {
    try {
      const response = await Factories2.like_feedback(feedbackId);
      if (response?.status === 200) {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
    }
  };

  const handleDisLike = async (feedbackId) => {
    try {
      const response = await Factories2.dislike_feedback(feedbackId);
      if (response?.status === 200) {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
    }
  };

  // Add this function to get the amount for a specific room from selectedRoomsTemps
  const getRoomAmountFromRedux = (roomId) => {
    if (!selectedRoomsTemps) return 0;

    const foundRoom = selectedRooms.find(
      (item) => item.room._id === roomId || item.room.id === roomId
    );
    return foundRoom ? foundRoom.amount : 0;
  };

  // Initialize selectedRooms with data from Redux when component mounts
  useEffect(() => {
    if (selectedRoomsTemps && selectedRoomsTemps.length > 0) {
      setSelectedRooms(selectedRoomsTemps);
    }
  }, [selectedRoomsTemps]);

  if (!hotelDetail) {
    return (
      <div
        className="loading-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div
          className="loading-animation"
          style={{
            position: "relative",
            width: "80px",
            height: "80px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "64px",
              height: "64px",
              border: "8px solid #e0e0e0",
              borderRadius: "50%",
              animation: "spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
              borderColor: "#1a2b49 transparent transparent transparent",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              width: "64px",
              height: "64px",
              border: "8px solid #e0e0e0",
              borderRadius: "50%",
              animation: "spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
              borderColor: "transparent #1a2b49 transparent transparent",
              animationDelay: "-0.45s",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              width: "64px",
              height: "64px",
              border: "8px solid #e0e0e0",
              borderRadius: "50%",
              animation: "spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
              borderColor: "transparent transparent #1a2b49 transparent",
              animationDelay: "-0.3s",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              width: "64px",
              height: "64px",
              border: "8px solid #e0e0e0",
              borderRadius: "50%",
              animation: "spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
              borderColor: "transparent transparent transparent #1a2b49",
              animationDelay: "-0.15s",
            }}
          ></div>
        </div>
        <div
          className="loading-text"
          style={{
            fontSize: "18px",
            fontWeight: "500",
            color: "#1a2b49",
            textAlign: "center",
          }}
        >
          <p>Loading your perfect stay...</p>
          <p style={{ fontSize: "14px", color: "#6c757d", marginTop: "5px" }}>
            Please wait while we prepare the best offers for you
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  const imageList = hotelDetail.images || [];

  const renderStars = (count, total = 5) => {
    const stars = [];
    for (let i = 0; i < total; i++) {
      if (i < count) {
        stars.push(<StarFill key={i} className="text-warning" />);
      } else {
        stars.push(<Star key={i} className="text-warning" />);
      }
    }
    return stars;
  };

  const getRoomAmount = (roomId) => {
    const room = selectedRooms.find(
      (item) => item.room._id === roomId || item.room.id === roomId
    );
    return room ? room.amount : 0;
  };

  return (
    <div className="app-container">
      <NavigationBar />
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>{hotelDetail.hotelName || "Hotel Paradise"}</h1>
          <div className="rating">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={
                  index < hotelDetail.star ? "star-filled" : "star-empty"
                }
              />
            ))}
          </div>
          <Button
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              marginTop: "20px",
            }}
            variant="outline-light"
            onClick={() => {
              navigate(Routers.ChatPage, {
                state: {
                  receiver: {
                    ...hotelDetail.owner,
                    ownedHotels: [{ hotelName: hotelDetail.hotelName }],
                  },
                },
              });
            }}
          >
            Contact with hotel
          </Button>
        </div>
      </div>
      {/* Main Content */}
      <Container className="main-content">
        <Card className="content-card">
          <div
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              borderWidth: "2px",
              borderColor: isFavorite ? "red" : "gray",
              borderStyle: "solid",
              position: "absolute",
              top: 10,
              right: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaHeart
              onClick={() => handleChangeFavorite(isFavorite, hotelId)}
              style={{
                fontSize: "20px",
                color: isFavorite ? "red" : "gray",
                cursor: "pointer",
              }}
            />
          </div>
          <Row>
            <Col lg={6}>
              <div className="main-image-container">
                <img
                  src={mainImage || "https://via.placeholder.com/600x400"}
                  alt="Main Room"
                  className="main-image"
                  style={{
                    objectFit: "cover",
                    userSelect: "none",
                    width: "100%",
                    height: "450px",
                  }}
                />
                <div
                  className="thumbnail-container"
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  {imageList
                    .slice(thumbnailStartIndex, thumbnailStartIndex + 3)
                    .map((image, index) => {
                      const actualIndex = thumbnailStartIndex + index;
                      return (
                        <img
                          key={actualIndex}
                          src={image || "/placeholder.svg"}
                          alt={`Room ${actualIndex + 1}`}
                          className={`thumbnail ${
                            mainImage === image ? "active" : ""
                          }`}
                          onClick={() =>
                            handleThumbnailClick(image, actualIndex)
                          }
                          style={{
                            width: "300px",
                            objectFit: "cover",
                            cursor: "pointer",
                            border:
                              mainImage === image
                                ? "2px solid blue"
                                : "2px solid transparent",
                            borderRadius: "5px",
                          }}
                        />
                      );
                    })}
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hotel-info">
                <h1 style={{ fontWeight: "bold" }}>
                  {hotelDetail.hotelName || "Hotel"}
                </h1>
                {hotelDetail.description ? (
                  hotelDetail.description
                    .split("\n")
                    .map((para, index) => <p key={index}>{para}</p>)
                ) : (
                  <p>No description.</p>
                )}
                <h3 style={{ fontWeight: "bold" }}>
                  Address Hotel{" - "}
                  <a
                    onClick={() => {
                      setAddressMap(hotelDetail.address);
                      setShowModalMap(true);
                    }}
                    className="text-primary"
                    style={{ cursor: "pointer", fontSize: "14px", fontWeight: '500'}}
                  >
                    Show on map
                  </a>
                </h3>
                <p>{hotelDetail.address}</p>

                <Row style={{ marginTop: "-40px" }}>
                  <Col md={6}>
                    <h3 style={{ fontWeight: "bold" }}>Check-in Time </h3>
                  </Col>
                  <Col md={6}>
                    <h3 style={{ fontWeight: "bold" }}>Check-out Time </h3>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <p>
                      {hotelDetail.checkInStart} - {hotelDetail.checkInEnd}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      {hotelDetail.checkOutStart} - {hotelDetail.checkOutEnd}
                    </p>
                  </Col>
                </Row>
                <h3 style={{ fontWeight: "bold", marginTop: "-10px" }}>
                  Contact Hotel:
                </h3>
                <p>Phone Number: {hotelDetail.phoneNumber}</p>
                <h3 style={{ fontWeight: "bold", marginTop: "-10px" }}>
                  Highlights of the services
                </h3>

                <ul
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    listStyleType: "disc",
                    paddingLeft: "20px",
                    marginTop: "10px",
                  }}
                >
                  {hotelDetail.services?.length > 0 ? (
                    hotelDetail.services.map((service, index) => {
                      if (service.statusActive === "ACTIVE") {
                        return (
                          <li
                            key={index}
                            style={{
                              width: "100%",
                              marginBottom: "8px",
                              cursor: "pointer",
                            }}
                            onClick={() => handleServiceClickService(service)}
                          >
                            {service.name} -{" "}
                            {Utils.formatCurrency(service.price)}/{service.type}
                          </li>
                        );
                      }
                    })
                  ) : (
                    <li style={{ width: "100%" }}>No highlights.</li>
                  )}
                </ul>
              </div>
            </Col>
          </Row>
          <Row>
            <h3 style={{ fontWeight: "bold", color: "#1a2b49" }}>
              Favorite amenities
            </h3>
            <div className="amenities-grid">
              {hotelDetail.facilities?.length > 0 ? (
                hotelDetail.facilities.map((facility, index) => (
                  <div
                    key={index}
                    className="amenity-item"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    {renderIcon(facility.icon)}
                    <span style={{ marginLeft: "5px" }}>{facility.name}</span>
                  </div>
                ))
              ) : (
                <div>No amenities.</div>
              )}
            </div>
          </Row>
        </Card>
      </Container>
      {/* Search Bar */}
      <Container>
        <Row
          className="d-flex align-items-center bg-white px-4 py-4"
          style={{
            borderBottomRightRadius: "20px",
            borderBottomLeftRadius: "20px",
            borderTopRightRadius: "20px",
          }}
        >
          <Col md={6}>
            <Row className="align-items-center">
              {/* Check-in date */}
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
                    onChange={(e) => {
                      const newCheckinDate = e.target.value;
                      if (checkoutDate && newCheckinDate >= checkoutDate) {
                        const date = new Date(newCheckinDate);
                        date.setDate(date.getDate() + 1);
                        const newCheckOutDate = date
                          .toISOString()
                          .split("T")[0];
                        setCheckoutDate(newCheckOutDate);
                        setSearchParams({
                          ...searchParams,
                          checkinDate: newCheckinDate,
                          checkoutDate: newCheckOutDate,
                        });
                      } else {
                        setSearchParams({
                          ...searchParams,
                          checkinDate: newCheckinDate,
                        });
                      }
                      setCheckinDate(newCheckinDate);
                    }}
                    required
                    min={today}
                  />
                </InputGroup>
              </Col>

              {/* Arrow icon */}
              <Col
                xs="auto"
                className="d-flex align-items-center justify-content-center"
              >
                <FaArrowRight style={{ fontSize: "1.2rem", color: "#555" }} />
              </Col>

              {/* Check-out date */}
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
                    onChange={(e) => {
                      setCheckoutDate(e.target.value);
                      setSearchParams({
                        ...searchParams,
                        checkoutDate: e.target.value,
                      });
                    }}
                    min={
                      new Date(new Date(checkinDate).getTime() + 86400000)
                        .toISOString()
                        .split("T")[0]
                    }
                    required
                  />
                </InputGroup>
              </Col>
            </Row>
          </Col>

          {/* Adults and Children selection */}
          <Col md={5} className="px-3 ">
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
              style={{
                width: "60px",
                height: "45px",
                borderRadius: "15px",
              }}
              onClick={handleSearchRoom}
            >
              <FaSearch />
            </Button>
          </Col>
        </Row>
      </Container>
      <Container className="rooms-section py-5">
        <h3
          className="text-center text-uppercase fw-bold mb-5"
          style={{ color: "#1a2b49", fontSize: "2.5rem" }}
        >
          Hotel Rooms
        </h3>

        {searchRoom ? (
          <div className="text-center py-5">
            <Spinner
              animation="border"
              role="status"
              variant="primary"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3" style={{ color: "#666", fontSize: "1.1rem" }}>
              Loading available rooms...
            </p>
          </div>
        ) : (
          <>
            <div style={{ position: "relative" }}>
              {/* Nút trái */}
              <Button
                variant="light"
                onClick={() => {
                  scrollRefRoom.current.scrollBy({
                    left: -400,
                    behavior: "smooth",
                  });
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "-20px",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  borderRadius: "50%",
                  padding: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                <FaChevronLeft />
              </Button>

              {/* Nút phải */}
              <Button
                variant="light"
                onClick={() => {
                  scrollRefRoom.current.scrollBy({
                    left: 400,
                    behavior: "smooth",
                  });
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "-20px",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  borderRadius: "50%",
                  padding: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                <FaChevronRight />
              </Button>

              {/* Danh sách khách sạn */}
              <div
                ref={scrollRefRoom}
                className="horizontal-scroll mt-5"
                style={{
                  display: "flex",
                  overflowX: "hidden", // ❌ ẩn scroll
                  scrollSnapType: "x mandatory",
                  gap: "20px",
                  paddingBottom: "20px",
                }}
              >
                {rooms.map((room) => (
                  <div
                    key={room.id || room._id}
                    style={{
                      minWidth: "400px",
                      maxWidth: "400px",
                      scrollSnapAlign: "start",
                    }}
                  >
                    <Card
                      className="shadow-sm border-0 h-100 room-card"
                      style={{
                        borderRadius: "15px",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 16px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        className="overflow-hidden"
                        style={{
                          borderTopLeftRadius: "15px",
                          borderTopRightRadius: "15px",
                        }}
                      >
                        <Card.Img
                          variant="top"
                          src={room.images?.[0] || "/default-room.jpg"}
                          alt={room.type}
                          onClick={() =>
                            handleRoomClick(
                              room.id || room._id,
                              room.availableQuantity
                            )
                          }
                          style={{
                            height: "220px",
                            objectFit: "cover",
                            cursor: "pointer",
                            width: "100%",
                            transition: "transform 0.3s ease",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.transform = "scale(1.02)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                      </div>

                      <Card.Body className="d-flex flex-column justify-content-between p-3">
                        <div>
                          <Card.Title
                            onClick={() => handleRoomClick(room.id || room._id)}
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 700,
                              color: "#1a2b49",
                              cursor: "pointer",
                            }}
                          >
                            {room?.name}
                            {getRoomAmount(room._id || room.id) > 0 && (
                              <span
                                className="ms-2 badge"
                                style={{
                                  backgroundColor: "#1a2b49",
                                  color: "white",
                                  fontSize: "0.75rem",
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "20px",
                                }}
                              >
                                {getRoomAmount(room._id || room.id)} selected
                              </span>
                            )}
                          </Card.Title>

                          <div className="d-flex align-items-center text-muted mb-2">
                            <FaUser className="me-2" />
                            <span style={{ fontSize: "0.95rem" }}>
                              {room.capacity} Guests
                            </span>
                          </div>

                          <div
                            className="text-primary fw-bold"
                            style={{ fontSize: "1.4rem", marginBottom: "8px" }}
                          >
                            {Utils.formatCurrency(room.price)}
                            <span
                              className="text-muted"
                              style={{ fontSize: "0.85rem", marginLeft: "4px" }}
                            >
                              / Day
                            </span>
                          </div>
                        </div>

                        <div>
                          {room.availableQuantity <= 3 ? (
                            <div
                              className="text-danger fw-semibold"
                              style={{
                                fontSize: "0.95rem",
                                marginBottom: "10px",
                              }}
                            >
                              Only {room.availableQuantity} rooms left for this
                              room type!
                            </div>
                          ) : (
                            <div
                              className="fw-semibold"
                              style={{
                                fontSize: "0.95rem",
                                marginBottom: "10px",
                              }}
                            >
                              Have {room.availableQuantity} rooms left for this
                              room type!
                            </div>
                          )}
                          <div className="mt-2 d-flex justify-content-between align-items-center">
                            <span
                              className="text-muted"
                              style={{ fontSize: "0.9rem", fontWeight: 600 }}
                            >
                              Amount
                            </span>
                            <select
                              className="form-select w-auto"
                              style={{ fontSize: "0.9rem" }}
                              value={getRoomAmountFromRedux(
                                room._id || room.id
                              )}
                              onChange={(e) =>
                                handleAmountChange(room, Number(e.target.value))
                              }
                            >
                              {Array.from(
                                { length: room.availableQuantity + 1 },
                                (_, n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-5">
              <Button
                variant="primary"
                onClick={() => {
                  if (selectedRooms.length == 0) {
                    setErrorMessage(
                      "Please select a room to proceed with your booking"
                    );
                    setShowModal(true);
                  } else {
                    console.log("hotelDetail: ", hotelDetail);
                    if (hotelDetail.ownerStatus != "ACTIVE") {
                      setShowModalStatusBooking(true);
                    } else {
                      if (Auth._id != -1) {
                        dispatch({
                          type: SearchActions.SAVE_SELECTED_ROOMS,
                          payload: {
                            selectedRooms: selectedRooms,
                            hotelDetail: hotelDetail,
                          },
                        });
                        navigate(Routers.BookingCheckPage);
                      } else {
                        dispatch({
                          type: SearchActions.SAVE_SELECTED_ROOMS,
                          payload: {
                            selectedRooms: selectedRooms,
                            hotelDetail: hotelDetail,
                          },
                        });
                        navigate(Routers.LoginPage);
                      }
                    }
                  }
                }}
                style={{
                  padding: "0.8rem 4rem",
                  borderRadius: "30px",
                  backgroundColor: "#1a2b49",
                  border: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2c4373")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1a2b49")
                }
              >
                Book Now
              </Button>
            </div>
            <ErrorModal
              show={showModal}
              onClose={() => {
                setShowModal(false);
              }}
              message={errorMessage}
            />
            <HotelClosedModal
              show={showModalStatusBooking}
              onClose={() => {
                setShowModalStatusBooking(false);
              }}
            />
          </>
        )}
      </Container>
      {/* Other Hotels */}
      {/* Map Modal */}
      <Modal
        show={showModalMap}
        onHide={() => {
          setShowModalMap(false);
          setAddressMap("");
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Map Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MapComponent addressMap={addressMap} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModalMap(false);
              setAddressMap("");
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {searchRoom ? (
        <div></div>
      ) : (
        <Container className="other-hotels-section position-relative">
          <h1 className="section-title" style={{ fontSize: "2.5rem" }}>
            Special Offers Just For You
          </h1>
          <div style={{ position: "relative" }}>
            {/* Nút trái */}
            <Button
              variant="light"
              onClick={scrollLeft}
              style={{
                position: "absolute",
                top: "50%",
                left: "-20px",
                transform: "translateY(-50%)",
                zIndex: 10,
                borderRadius: "50%",
                padding: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <FaChevronLeft />
            </Button>

            {/* Nút phải */}
            <Button
              variant="light"
              onClick={scrollRight}
              style={{
                position: "absolute",
                top: "50%",
                right: "-20px",
                transform: "translateY(-50%)",
                zIndex: 10,
                borderRadius: "50%",
                padding: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <FaChevronRight />
            </Button>

            {/* Danh sách khách sạn */}
            <div
              ref={scrollRef}
              className="horizontal-scroll mt-5"
              style={{
                display: "flex",
                overflowX: "hidden", // ❌ ẩn scroll
                scrollSnapType: "x mandatory",
                gap: "20px",
                paddingBottom: "20px",
              }}
            >
              {shuffledHotels.map((hotel) => {
                const rooms = roomsByHotel[hotel.hotel._id] || [];
                const firstRoom = rooms[0];

                return (
                  <Card
                    key={hotel.hotel._id}
                    className="hotel-card"
                    style={{
                      minWidth: "400px",
                      scrollSnapAlign: "start",
                      flexShrink: 0,
                      borderRadius: "20px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        padding: "20px",
                        height: "250px",
                        paddingRight: "40px",
                        position: "relative",
                      }}
                    >
                      <Image
                        variant="top"
                        src={
                          hotel.hotel.images && hotel.hotel.images.length > 0
                            ? hotel.hotel.images[0]
                            : "/images/default-hotel.jpg"
                        }
                        className="hotel-image"
                        style={{
                          borderRadius: "20px",
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                        }}
                      />

                      <div
                        className="rating-overlay"
                        style={{ paddingTop: "10px", marginRight: "28px" }}
                      >
                        {[...Array(hotel.hotel.star)].map((_, index) => (
                          <FaStar key={index} className="star-filled" />
                        ))}
                      </div>

                      <span
                        className="sale-tag"
                        style={{
                          color: "gray",
                          position: "absolute",
                          transform: "rotate(90deg)",
                          transformOrigin: "left bottom",
                          letterSpacing: "6px",
                          top: 10,
                          right: -110,
                          fontSize: "25px",
                        }}
                      >
                        Sale 10%
                      </span>
                    </div>
                    <Card.Body style={{ marginLeft: "10px" }}>
                      <Card.Title className="hotel-name">
                        {hotel.hotel.hotelName}
                      </Card.Title>
                      <div className="room-info">
                        {firstRoom?.price && (
                          <>
                            <span className="room-type">
                              {firstRoom?.type || "Standard Room"}
                            </span>
                            <span className="guests-count">
                              <FaUser /> {firstRoom?.capacity || 2}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="price-container">
                        {firstRoom?.price && (
                          <>
                            <span className="price">
                              {Utils.formatCurrency(firstRoom.price)}
                            </span>
                            <span className="per-day">/Day</span>
                          </>
                        )}
                        <Button
                          variant="outline-primary"
                          style={{
                            marginLeft: "auto",
                            padding: "0.7rem 4.5rem",
                            fontWeight: "500",
                          }}
                          onClick={() => {
                            navigate(
                              `${Routers.Home_detail}/${hotel.hotel._id}`
                            );
                          }}
                        >
                          Book Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      )}
      <div
        className="d-flex flex-column"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container className="py-4">
          <h1 className="section-title" style={{ fontSize: "2.5rem" }}>
            Reviews from travelers about {hotelDetail.hotelName}
          </h1>
          {/* Rating Overview */}
          <Row
            className="mb-4"
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <Col md={2} />
            <Col
              md={4}
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              <Row>
                <Col xs="auto">
                  <Card
                    style={{
                      background:
                        "linear-gradient(to bottom right, #e6f3ff, #ffffff)",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 0 8px rgba(0, 123, 255, 0.15)",
                      border: "6px solid rgba(0, 123, 255, 0.15)",
                    }}
                  >
                    <Card.Body className="d-flex align-items-center justify-content-center">
                      <span
                        style={{
                          fontSize: "60px",
                          fontWeight: 600,
                          color: "#0099ff",
                        }}
                      >
                        {Number(averageRating).toFixed(1)}
                      </span>
                    </Card.Body>
                  </Card>
                </Col>
                <Col>
                  <h2
                    style={{
                      color: "#007bff",
                      fontWeight: "700",
                      marginBottom: "0",
                      fontSize: "30px",
                    }}
                  >
                    {averageRating === 5
                      ? "Excellent"
                      : averageRating > 4
                      ? "Good"
                      : averageRating > 3
                      ? "Average"
                      : averageRating > 2
                      ? "Poor"
                      : averageRating > 1
                      ? "Very Poor"
                      : averageRating == 0
                      ? "No Average"
                      : ""}
                  </h2>

                  <p
                    style={{
                      marginBottom: "4px",
                      fontWeight: "500",
                      fontSize: "24px",
                      color: "#000",
                    }}
                  >
                    From {totalFeedback} feedbacks
                  </p>

                  <div
                    style={{
                      fontSize: "18px",
                      color: "gray",
                    }}
                  >
                    By domestic travelers in{" "}
                    <span style={{ fontWeight: "600", color: "#6c757d" }}>
                      uroom
                    </span>
                    <sup>®</sup>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col md={4}>
              <div className="rating-details">
                <div className="rating-item mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Terrible experience (1 star)</span>
                    <span>{ratingBreakdown.oneStar}</span>
                  </div>
                  <ProgressBar
                    now={(ratingBreakdown.oneStar / totalFeedback) * 100}
                  />
                </div>
                <div className="rating-item mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Not great (2 stars)</span>
                    <span>{ratingBreakdown.twoStar}</span>
                  </div>
                  <ProgressBar
                    now={(ratingBreakdown.twoStar / totalFeedback) * 100}
                  />
                </div>
                <div className="rating-item mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Okay/Decent (3 stars)</span>
                    <span>{ratingBreakdown.threeStar}</span>
                  </div>
                  <ProgressBar
                    now={(ratingBreakdown.threeStar / totalFeedback) * 100}
                  />
                </div>
                <div className="rating-item mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Really good (4 stars)</span>
                    <span>{ratingBreakdown.fourStar}</span>
                  </div>
                  <ProgressBar
                    now={(ratingBreakdown.fourStar / totalFeedback) * 100}
                  />
                </div>
                <div className="rating-item mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Perfect/Amazing (5 stars)</span>
                    <span>{ratingBreakdown.fiveStar}</span>
                  </div>
                  <ProgressBar
                    now={(ratingBreakdown.fiveStar / totalFeedback) * 100}
                  />
                </div>
              </div>
            </Col>
            <Col md={2} />
          </Row>

          <h2 className="fw-bold mb-4">
            Visitor feedback for {hotelDetail.hotelName}
          </h2>

          <Row className="mb-4 align-items-center">
            <Col xs="auto">
              <span className="me-2">Filter:</span>
            </Col>
            <Col xs="auto">
              <Form.Select
                className="border-primary"
                style={{ width: "200px" }}
                value={sort}
                onChange={(e) => {
                  setSort(Number(e.target.value));
                  setFilterParams({
                    ...filterParams,
                    sort: e.target.value,
                    page: 1,
                  });
                  setCurrentPage(1);
                }}
              >
                <option value={0}>Date (Newest first)</option>
                <option value={1}>Date (Oldest first)</option>
                <option value={2}>Score (High to low)</option>
                <option value={3}>Score (Low to high)</option>
              </Form.Select>
            </Col>
            <Col xs="auto">
              <Form.Select
                style={{ width: "120px" }}
                value={star}
                onChange={(e) => {
                  setStar(Number(e.target.value));
                  setFilterParams({
                    ...filterParams,
                    star: e.target.value,
                    page: 1,
                  });
                }}
              >
                <option value={0}>All star</option>
                <option value={1}>1 star</option>
                <option value={2}>2 stars</option>
                <option value={3}>3 stars</option>
                <option value={4}>4 stars</option>
                <option value={5}>5 stars</option>
              </Form.Select>
            </Col>
          </Row>

          {feedbacks.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
              <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center mb-4"
                style={{
                  width: 140,
                  height: 140,
                  transition: "transform 0.3s",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <img
                  src="/empty-state.svg"
                  alt="No data"
                  style={{ width: 80, height: 80, opacity: 0.75 }}
                />
              </div>
              <h5 className="text-muted fw-semibold">No Reviews Yet</h5>
              <p className="text-secondary mb-0" style={{ maxWidth: 300 }}>
                This hotel hasn’t received any reviews yet. Be the first to
                share your experience!
              </p>
            </div>
          ) : (
            feedbacks.map((review) => (
              <Card key={review.id} className="mb-3 border-0 shadow-sm">
                <Card.Body className="p-0">
                  <Row
                    className="g-0"
                    style={{ justifyContent: "space-between" }}
                  >
                    <Col md={12}>
                      <Card className="border-0">
                        {/* <h1>{review._id}</h1> */}
                        <Button
                          variant="link"
                          className="text-dark p-0"
                          style={{ position: "absolute", top: 15, right: 15 }}
                          onClick={() => {
                            if (Auth._id != -1) {
                              navigate(
                                `${Routers.ReportedFeedback}/${review._id}`
                              );
                            } else {
                              navigate(Routers.LoginPage);
                            }
                          }}
                        >
                          <ExclamationTriangleFill size={20} color="red" />
                        </Button>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center">
                              <Image
                                src={
                                  review.user?.image?.url ||
                                  "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
                                }
                                roundedCircle
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  marginRight: "10px",
                                }}
                              />
                              <div>
                                <h6 className="mb-0">{review.user?.name}</h6>
                                <div>
                                  {renderStars(review.rating)}
                                  <small className="text-muted ms-2">
                                    {Utils.getDate(review.createdAt, 4)}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p>{review.content}</p>
                          <div>
                            <span
                              className="p-0 me-3"
                              style={{
                                textDecoration: "none",
                                cursor: review.likedBy.includes(Auth._id)
                                  ? "pointer"
                                  : "pointer",
                                color: review.likedBy.includes(Auth._id)
                                  ? "blue"
                                  : "black",
                                userSelect: "none",
                              }}
                              onMouseEnter={(e) => {
                                if (!review.likedBy.includes(Auth._id)) {
                                  e.currentTarget.style.color = "#0d6efd";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!review.likedBy.includes(Auth._id)) {
                                  e.currentTarget.style.color = "black";
                                }
                              }}
                              onClick={() => {
                                if (Auth._id !== -1) {
                                  handleLike(review._id);
                                } else {
                                  navigate(Routers.LoginPage);
                                }
                              }}
                            >
                              <FaThumbsUp className="me-2" />
                              {review.likedBy.length} like
                            </span>

                            <span
                              className="p-0"
                              style={{
                                textDecoration: "none",
                                cursor: review.dislikedBy.includes(Auth._id)
                                  ? "pointer"
                                  : "pointer",
                                color: review.dislikedBy.includes(Auth._id)
                                  ? "red"
                                  : "black",
                                userSelect: "none",
                              }}
                              onMouseEnter={(e) => {
                                if (!review.dislikedBy.includes(Auth._id)) {
                                  e.currentTarget.style.color = "#dc3545";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!review.dislikedBy.includes(Auth._id)) {
                                  e.currentTarget.style.color = "black";
                                }
                              }}
                              onClick={() => {
                                if (Auth._id !== -1) {
                                  handleDisLike(review._id);
                                } else {
                                  navigate(Routers.LoginPage);
                                }
                              }}
                            >
                              <FaThumbsDown className="me-2" />
                              {review.dislikedBy.length} dislike
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          )}
          {/* Pagination */}
          {totalPages >= 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Container>
        <div>
          <ChatBox />
        </div>
      </div>
      <Footer />
      <Modal
        show={showModalService}
        onHide={handleCloseModalService}
        centered // Giúp modal hiện ở giữa màn hình
        size="lg" // Có thể chọn "sm", "lg", "xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Service: {selectedService?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <b>Description:</b> {selectedService?.description}
          </p>
          <p>
            <b>Price: </b>
            {selectedService ? Utils.formatCurrency(selectedService.price) : ""}
            /{selectedService?.type ?? "person"}
          </p>
          <p>
            <b>Note: </b>
            <a style={{ color: "red" }}>Accompanying</a> services can be ordered
            once you check in. <a style={{ color: "red" }}>Alternatively</a>,
            you may message the hotel host after booking torequest the service
            in advance.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModalService}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
