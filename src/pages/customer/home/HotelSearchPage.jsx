import { useCallback, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  InputGroup,
  Alert,
  Modal,
} from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaCheck,
  FaSearch,
  FaHotel,
  FaArrowRight,
  FaHeart,
  FaChild,
  FaUser,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../css/customer/HotelSearchPage.css";
import Footer from "../Footer";
import Header from "../Header";
import Banner from "../../../images/banner.jpg";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import * as Routers from "../../../utils/Routes";
import Select from "react-select";
import {
  cityOptionSelect,
  districtsByCity,
  listFacilities,
} from "../../../utils/data";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../redux/store";
import SearchActions from "../../../redux/search/actions";
import Factories from "../../../redux/search/factories";
import { showToast, ToastProvider } from "../../../components/ToastContainer";
import Pagination from "@components/Pagination";
import MapComponent from "@pages/MapLocation";
import AuthActions from "../../../redux/auth/actions";
import { ChatBox } from "./HomePage";
import { getWeatherForCity } from "src/utils/chatAI";
import axios from "axios";
// Options for adults and children select
const adultsOptions = Array.from({ length: 20 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} Adults`,
}));

const childrenOptions = Array.from({ length: 11 }, (_, i) => ({
  value: i,
  label: `${i} Childrens`,
}));

// Custom hook for managing URL parameters
const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateUrlParams = useCallback(
    (updates) => {
      const newParams = new URLSearchParams(searchParams);

      // Process each parameter update
      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          (typeof value === "string" && value === "") ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === "number" && value <= 0)
        ) {
          newParams.delete(key);
        } else if (Array.isArray(value)) {
          newParams.set(key, value.join(","));
        } else if (
          typeof value === "object" &&
          value !== null &&
          "value" in value
        ) {
          newParams.set(key, value.value);
        } else {
          newParams.set(key, String(value));
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const getParam = useCallback(
    (key, defaultValue) => {
      const value = searchParams.get(key);
      return value !== null ? value : defaultValue;
    },
    [searchParams]
  );

  const getNumberParam = useCallback(
    (key, defaultValue) => {
      const value = searchParams.get(key);
      return value !== null ? Number(value) : defaultValue;
    },
    [searchParams]
  );

  const getArrayParam = useCallback(
    (key, defaultValue = []) => {
      const value = searchParams.get(key);
      return value !== null ? value.split(",") : defaultValue;
    },
    [searchParams]
  );

  return {
    searchParams,
    updateUrlParams,
    getParam,
    getNumberParam,
    getArrayParam,
  };
};

const HotelSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const SearchInformation = useAppSelector(
    (state) => state.Search.SearchInformation
  );
  const today = new Date().toISOString().split("T")[0];

  // Use our custom URL params hook
  const {
    searchParams,
    updateUrlParams,
    getParam,
    getNumberParam,
    getArrayParam,
  } = useUrlParams();

  // Helper functions to get initial values from URL params
  const getInitialStarFilter = () => getNumberParam("star", 0);
  const getInitialFacilities = () => getArrayParam("facilities", []);
  const getInitialPage = () => getNumberParam("page", 1);
  const getInitialDistrict = () => {
    const districtParam = getParam("district", null);
    if (!districtParam) return null;
    const districtOptions = districtsByCity[SearchInformation.address] || [];
    return (
      districtOptions.find((option) => option.value === districtParam) || null
    );
  };

  // State for search form
  const [selectedCity, setSelectedCity] = useState(
    cityOptionSelect.find(
      (option) => option.value === SearchInformation.address
    ) || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    getInitialDistrict()
  );
  const [checkinDate, setCheckinDate] = useState(SearchInformation.checkinDate);
  const [checkoutDate, setCheckoutDate] = useState(
    SearchInformation.checkoutDate
  );
  const [selectedAdults, setSelectedAdults] = useState(
    adultsOptions.find((option) => option.value === SearchInformation.adults) ||
    adultsOptions[0]
  );
  const [selectedChildren, setSelectedChildren] = useState(
    childrenOptions.find(
      (option) => option.value === SearchInformation.childrens
    ) || childrenOptions[0]
  );

  // Thêm state cho weather
  const [weather, setWeather] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  // Hàm lấy dữ liệu thời tiết
  // const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
  const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

  useEffect(() => {
    if (!selectedCity?.label) return;

    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeatherError("");
      try {
        // B1: Lấy lat/lon từ city name
        let cityName = selectedCity.label;
        if (cityName === "Hà Nội") cityName = "Hanoi";
        if (cityName === "Đà Nẵng") cityName = "Da Nang";
        if (cityName === "TP Hồ Chí Minh" || cityName === "Hồ Chí Minh") cityName = "Ho Chi Minh City";
        const geoUrl = `https://pro.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=0214f2585550f3b9f85bdd44ca9e60e2`;
        const geoRes = await axios.get(geoUrl);
        if (!geoRes.data || geoRes.data.length === 0) throw new Error("Không tìm thấy vị trí thành phố.");
        const { lat, lon } = geoRes.data[0];
        console.log("City coordinates:", lat, lon);
        // Lấy 7-day forecast từ lat/lon (dùng endpoint pro)
        const weatherUrl = `https://pro.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&appid=0214f2585550f3b9f85bdd44ca9e60e2&lang=vi`;
        const weatherRes = await axios.get(weatherUrl);
        const forecastDays = weatherRes.data.list.slice(0, 7); // Lấy 7 ngày
        console.log("Weather forecast data:", forecastDays);
        setWeather(forecastDays);
      } catch (err) {
        setWeatherError("Không lấy được dữ liệu thời tiết.");
        setWeather([]);
      }
      setWeatherLoading(false);
    };

    fetchWeather();
  }, [selectedCity]);

  // State for search results and filters
  const [loading, setLoading] = useState(true);
  const [searchHotel, setSearchHotel] = useState([]);
  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [totalPages, setTotalPages] = useState(1);
  const [starFilter, setStarFilter] = useState(getInitialStarFilter());
  const [selectedFacilities, setSelectedFacilities] = useState(
    getInitialFacilities()
  );
  const [formErrors, setFormErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [showModalMap, setShowModalMap] = useState(false);
  const [addressMap, setAddressMap] = useState("");

  // Search parameters object for API calls
  const [searchParamsObj, setSearchParamsObj] = useState({
    address: SearchInformation.address,
    checkinDate: SearchInformation.checkinDate,
    checkoutDate: SearchInformation.checkoutDate,
    numberOfPeople: SearchInformation.adults + SearchInformation.childrens,
    page: currentPage,
    star: starFilter,
    district: selectedDistrict?.value || "",
    selectedFacilities: selectedFacilities,
  });

  // Update search parameters when filters change
  useEffect(() => {
    setSearchParamsObj((prev) => ({
      ...prev,
      page: currentPage,
      star: starFilter,
      district: selectedDistrict?.value || "",
      selectedFacilities: selectedFacilities,
    }));
  }, [currentPage, starFilter, selectedFacilities, selectedDistrict]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch hotels when search parameters change
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await Factories.searchHotel(searchParamsObj);
        if (response?.status === 200) {
          setSearchHotel(response?.data.hotels);
          setCurrentPage(response?.data.currentPage);
          setTotalPages(response?.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParamsObj]);

  // Handle page change in pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Update URL params directly
    updateUrlParams({ page: page > 1 ? page : null });
  };

  // Handle star filter change
  const handleStarFilterChange = (star) => {
    setStarFilter(star);
    setCurrentPage(1); // Reset to page 1 when changing filters
    // Update URL params directly
    updateUrlParams({
      star: star > 0 ? star : null,
      page: null, // Reset page param
    });
  };

  // Handle district filter change
  const handleDistrictChange = (option) => {
    setSelectedDistrict(option);
    setCurrentPage(1); // Reset to page 1 when changing filters
    // Update URL params directly
    updateUrlParams({
      district: option ? option.value : null,
      page: null, // Reset page param
    });
  };

  // Handle facility filter changes
  const handleFacilityChange = (e, name) => {
    const isChecked = e.target.checked;
    const updatedFacilities = isChecked
      ? [...selectedFacilities, name]
      : selectedFacilities.filter((item) => item !== name);

    setSelectedFacilities(updatedFacilities);
    setCurrentPage(1); // Reset to page 1 when changing filters
    // Update URL params directly
    updateUrlParams({
      facilities: updatedFacilities.length > 0 ? updatedFacilities : null,
      page: null, // Reset page param
    });
  };

  // Handle search form submission
  const handleSearch = () => {
    // Reset district filter
    setSelectedDistrict(null);

    // Validate check-in date is before check-out date
    if (
      checkinDate &&
      checkoutDate &&
      new Date(checkinDate) >= new Date(checkoutDate)
    ) {
      showToast.warning("Check-in date cannot be later than check-out date.");
      return;
    }

    // Clear previous errors and set loading state
    setFormErrors({});
    setIsSearching(true);

    // Get values from form
    const adults = selectedAdults?.value || 1;
    const childrens = selectedChildren?.value || 0;
    const numberOfPeople = adults + childrens;
    const address = selectedCity?.value || "";

    // Create search information object
    const searchInfo = {
      address,
      checkinDate,
      checkoutDate,
      adults,
      childrens,
    };

    // Simulate loading delay (1 second)
    setTimeout(() => {
      // Save search to Redux
      dispatch({
        type: SearchActions.SAVE_SEARCH,
        payload: { SearchInformation: searchInfo },
      });

      // Reset filters and page
      setCurrentPage(1);
      setStarFilter(0);
      setSelectedFacilities([]);

      // Update search parameters
      setSearchParamsObj({
        address,
        checkinDate,
        checkoutDate,
        numberOfPeople,
        page: 1,
        star: 0,
        district: "",
        selectedFacilities: [],
      });

      // Reset URL params directly
      updateUrlParams({
        page: null,
        star: null,
        facilities: null,
        district: null,
      });

      setIsSearching(false);
    }, 1000);
  };

  // Handle favorite hotel toggle
  const handleChangeFavorite = (isFavorite, hotelId) => {
    const actionType = isFavorite
      ? AuthActions.REMOVE_FAVORITE_HOTEL_REQUEST
      : AuthActions.ADD_FAVORITE_HOTEL_REQUEST;

    dispatch({
      type: actionType,
      payload: {
        hotelId,
        onSuccess: () => {
          // Refresh hotel list to update favorite status
          const fetchHotels = async () => {
            try {
              const response = await Factories.searchHotel(searchParamsObj);
              if (response?.status === 200) {
                setSearchHotel(response?.data.hotels);
              }
            } catch (error) {
              console.error("Error fetching hotels:", error);
            }
          };
          fetchHotels();
        },
        onFailed: (msg) => { },
        onError: (error) => console.error(error),
      },
    });
  };

  // Navigate to hotel detail with return URL params
  const navigateToHotelDetail = (hotelId) => {
    dispatch({
      type: SearchActions.SAVE_SELECTED_ROOMS,
      payload: { selectedRooms: [] },
    });
    navigate(`${Routers.Home_detail}/${hotelId}`, {
      state: {
        returnTo: location.pathname,
        returnParams: searchParams.toString(),
      },
    });
  };

  // Render star rating
  const renderStars = (count) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <FaStar
          key={i}
          className={i < count ? "text-warning" : "text-muted"}
          size={23}
        />
      ));
  };

  // Select component styles
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      border: "none",
      background: "transparent",
      boxShadow: "none",
      width: "100%",
    }),
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{
        backgroundImage: `url(${Banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "1600px",
      }}
    >
      <Header />
      <div
        className="flex-grow-1 d-flex justify-content-center"
        style={{ paddingTop: "50px", paddingBottom: "50px" }}
      >
        <Container
          style={{
            paddingTop: "50px",
            paddingBottom: "50px",
            marginTop: "50px",
          }}
        >
          <ToastProvider />

          {/* Search Bar Container */}
          <div
            style={{
              maxWidth: "100%",
              margin: "0 auto",
              marginTop: "-4.5%",
              marginBottom: "50px",
            }}
          >
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
                  borderTopLeftRadius: "20px",
                  borderTopRightRadius: "20px",
                  borderBottomRightRadius: "5px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  width: "fit-content",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  paddingLeft: "20px",
                  marginBottom: "-1%",
                  marginLeft: "-0.9%",
                }}
              >
                <FaHotel style={{ color: "#2D74FF", fontSize: "24px" }} />
                <span style={{ color: "black", marginLeft: "10px" }}>
                  Hotel
                </span>
              </div>

              {/* Search Bar */}
              <Row
                className="d-flex align-items-center bg-white px-4 py-4"
                style={{
                  borderBottomRightRadius: "20px",
                  borderBottomLeftRadius: "20px",
                  borderTopRightRadius: "20px",
                }}
              >
                {/* Location Input */}
                <Col md={3}>
                  <InputGroup
                    className="border"
                    style={{ borderRadius: "10px" }}
                  >
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
                  {formErrors.location && (
                    <div
                      className="text-danger mt-1"
                      style={{ fontSize: "0.875rem" }}
                    >
                      {formErrors.location}
                    </div>
                  )}
                </Col>

                {/* Date Range Input */}
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
                          required
                          min={today}
                        />
                      </InputGroup>
                      {formErrors.checkinDate && (
                        <div
                          className="text-danger mt-1"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {formErrors.checkinDate}
                        </div>
                      )}
                    </Col>

                    <Col
                      xs="auto"
                      className="d-flex align-items-center justify-content-center"
                    >
                      <FaArrowRight
                        style={{ fontSize: "1.2rem", color: "#555" }}
                      />
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
                          required
                        />
                      </InputGroup>
                      {formErrors.checkoutDate && (
                        <div
                          className="text-danger mt-1"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {formErrors.checkoutDate}
                        </div>
                      )}
                    </Col>
                  </Row>
                </Col>

                {/* Guests Input */}
                <Col md={4} className="px-3">
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
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    <FaSearch />
                  </Button>
                </Col>
              </Row>
            </div>
          </div>

          {/* Weather Forecast */}
          <div className="mb-4">
            <h5>
              <span role="img" aria-label="weather">🌤️</span> Dự báo thời tiết 7 ngày tại {selectedCity?.label}
            </h5>
            {weatherLoading ? (
              <div>Đang tải thời tiết...</div>
            ) : weatherError ? (
              <div className="text-danger">{weatherError}</div>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  overflowX: "auto",
                  paddingBottom: 8,
                  marginTop: 8,
                }}
              >
                {weather.map((day, idx) => (
                  <div
                    key={idx}
                    style={{
                      minWidth: 160,
                      background: "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)",
                      border: "1px solid #dbeafe",
                      borderRadius: 18,
                      padding: 18,
                      textAlign: "center",
                      boxShadow: "0 2px 12px #e0e7ef",
                      flex: "0 0 auto",
                      transition: "transform 0.2s",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#2563eb" }}>
                      {new Date(day.dt * 1000).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </div>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt={day.weather[0].description}
                      style={{ width: 60, margin: "8px 0" }}
                    />
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb" }}>
                      {Math.round(day.temp.day - 273.15)}°C
                    </div>
                    <div style={{ fontSize: 14, color: "#64748b", minHeight: 24 }}>
                      {day.weather[0].description.charAt(0).toUpperCase() + day.weather[0].description.slice(1)}
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>
                      🌡️ {Math.round(day.temp.min - 273.15)}°C - {Math.round(day.temp.max - 273.15)}°C
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* End Weather Forecast */}

          {/* Main Content */}
          <Row>
            {/* Filters Sidebar */}
            <Col md={3}>
              <div
                className="shadow-sm mb-4"
                style={{
                  backgroundColor: "white",
                  padding: "16px",
                  borderRadius: "10px",
                }}
              >
                <h5 className="mb-3">Filter Hotels</h5>

                {/* Star Rating Filter */}
                <div className="mb-4">
                  <h6 className="mb-2">Star Range</h6>
                  <Form>
                    <Form.Check
                      type="radio"
                      id="star-all"
                      name="starRating"
                      label="All stars"
                      onChange={() => handleStarFilterChange(0)}
                      checked={starFilter === 0}
                    />
                    {[5, 4, 3, 2, 1].map((star) => (
                      <Form.Check
                        key={star}
                        type="radio"
                        id={`star-${star}`}
                        name="starRating"
                        label={
                          <div className="d-flex align-items-center">
                            {[...Array(star)].map((_, i) => (
                              <FaStar key={i} className="text-warning me-1" />
                            ))}
                          </div>
                        }
                        onChange={() => handleStarFilterChange(star)}
                        checked={starFilter === star}
                      />
                    ))}
                  </Form>

                  {/* District Filter */}
                  <h6 className="mt-2">District select</h6>
                  <InputGroup
                    className="border"
                    style={{ borderRadius: "10px" }}
                  >
                    <InputGroup.Text className="bg-transparent border-0">
                      <FaMapMarkerAlt />
                    </InputGroup.Text>
                    <div style={{ flex: 1 }}>
                      <Select
                        options={districtsByCity[selectedCity.value]}
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        placeholder="Search District"
                        isSearchable
                        styles={selectStyles}
                      />
                    </div>
                    <InputGroup.Text className="bg-transparent border-0">
                      <FaSearch />
                    </InputGroup.Text>
                  </InputGroup>

                  {/* Facilities Filter */}
                  <h6 className="mt-4">Facilities select</h6>
                  {listFacilities.map((item, index) => {
                    const FacilityIcon = item.iconTemp;
                    return (
                      <div className="form-check" key={index}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`facility-${index}`}
                          value={item.name}
                          checked={selectedFacilities.includes(item.name)}
                          onChange={(e) => handleFacilityChange(e, item.name)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`facility-${index}`}
                        >
                          {FacilityIcon && (
                            <FacilityIcon style={{ marginRight: "8px" }} />
                          )}
                          {item.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Col>

            {/* Hotel Results */}
            <Col md={9}>
              {isSearching || loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "300px" }}
                >
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : searchHotel.length > 0 ? (
                <>
                  {/* Hotel Cards */}
                  {searchHotel.map((hotel, index) => {
                    const inforHotel = hotel.hotel;
                    return (
                      <Card key={hotel.id || index} className="mb-3 shadow-sm">
                        <Row className="g-0" style={{ height: "360px" }}>
                          {/* Hotel Image */}
                          <Col md={4}>
                            <div className="position-relative">
                              <div
                                style={{
                                  width: "35px",
                                  height: "35px",
                                  borderRadius: "50%",
                                  borderWidth: "2px",
                                  borderColor: hotel.isFavorite
                                    ? "red"
                                    : "white",
                                  borderStyle: "solid",
                                  position: "absolute",
                                  top: 10,
                                  left: 10,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <FaHeart
                                  onClick={() =>
                                    handleChangeFavorite(
                                      hotel.isFavorite,
                                      inforHotel._id
                                    )
                                  }
                                  style={{
                                    fontSize: "20px",
                                    color: hotel.isFavorite ? "red" : "white",
                                    cursor: "pointer",
                                  }}
                                />
                              </div>
                              <img
                                src={
                                  inforHotel.images
                                    ? inforHotel.images[0].url
                                    : "/placeholder.svg"
                                }
                                alt={hotel.name || "Unnamed Hotel"}
                                className="img-fluid rounded-start hotel-image"
                                style={{
                                  height: "360px",
                                  objectFit: "cover",
                                  userSelect: "none",
                                }}
                              />
                            </div>
                          </Col>

                          {/* Hotel Details */}
                          <Col md={8}>
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  {/* Hotel Name and Location */}
                                  <h5 className="card-title">
                                    {inforHotel.hotelName || "No Name"}
                                  </h5>
                                  <p className="text-muted mb-1">
                                    {selectedCity.value || "Unknown Location"} -{" "}
                                    <a
                                      onClick={() => {
                                        setAddressMap(inforHotel.address);
                                        setShowModalMap(true);
                                      }}
                                      className="text-primary"
                                      style={{ cursor: "pointer" }}
                                    >
                                      Show on map
                                    </a>
                                  </p>
                                  <p className="text-muted small mb-2">
                                    <FaMapMarkerAlt className="me-1 text-secondary" />
                                    {inforHotel.address ||
                                      "No Address Provided"}
                                  </p>

                                  {/* Rating */}
                                  <p style={{ marginTop: "15px" }}>
                                    {hotel.totalFeedbacks > 0 ? (
                                      <>
                                        <span
                                          className="rating-box p-2"
                                          style={{
                                            display: "inline-flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            width: "30px",
                                            height: "30px",
                                            backgroundColor: "#FFC107",
                                            borderRadius: "20%",
                                            color: "white",
                                            fontWeight: "bold",
                                            fontSize: "14px",
                                            textAlign: "center",
                                            marginRight: "8px",
                                          }}
                                        >
                                          {hotel.avgValueRating.toFixed(1)}
                                        </span>
                                        <span className="text-muted">
                                          {hotel.totalFeedbacks} feedbacks about
                                          hotel
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-muted">
                                        No feedback about hotel
                                      </span>
                                    )}
                                  </p>

                                  {/* Facilities */}
                                  <div className="mt-3 d-flex flex-wrap gap-2">
                                    {inforHotel.facilities &&
                                      inforHotel.facilities.length > 0 ? (
                                      inforHotel.facilities
                                        .map((feature, i) => {
                                          const matchedFeature =
                                            listFacilities.find(
                                              (f) =>
                                                f.name.toLowerCase() ===
                                                feature.name.toLowerCase()
                                            );
                                          const FacilityIcon =
                                            matchedFeature?.iconTemp;

                                          return (
                                            <span
                                              key={feature._id || i}
                                              className="badge bg-light text-dark border"
                                              style={{
                                                fontSize: "14px",
                                                padding: "8px 12px",
                                                borderRadius: "20px",
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              {FacilityIcon && (
                                                <FacilityIcon
                                                  style={{ marginRight: "8px" }}
                                                />
                                              )}
                                              {feature.name}
                                            </span>
                                          );
                                        })
                                    ) : (
                                      <p className="text-muted small">
                                        No features available
                                      </p>
                                    )}
                                  </div>

                                  {/* Benefits */}
                                  <div className="d-flex flex-wrap align-items-center gap-3 mt-2">
                                    <p
                                      className="text-success mb-0"
                                      style={{
                                        fontSize: 16,
                                        padding: "8px 12px",
                                      }}
                                    >
                                      <FaCheck className="me-1" /> Free
                                      cancellation
                                    </p>
                                    <p
                                      className="text-success mb-0"
                                      style={{
                                        fontSize: 16,
                                        padding: "8px 12px",
                                      }}
                                    >
                                      <FaCheck className="me-1" /> No immediate
                                      payment
                                    </p>
                                  </div>
                                </div>

                                {/* Star Rating */}
                                <div className="d-flex">
                                  {inforHotel.star
                                    ? renderStars(inforHotel.star)
                                    : "No Rating"}
                                </div>
                              </div>

                              {/* Booking Button */}
                              <div className="text-end mt-3">
                                <Button
                                  style={{
                                    position: "absolute",
                                    bottom: 20,
                                    right: 20,
                                  }}
                                  variant="primary"
                                  onClick={() =>
                                    navigateToHotelDetail(inforHotel._id)
                                  }
                                >
                                  Booking Room
                                </Button>
                              </div>
                            </Card.Body>
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}

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
                </>
              ) : (
                <Alert variant="danger" style={{ textAlign: "center" }}>
                  No hotels available
                </Alert>
              )}
            </Col>
          </Row>

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
        </Container>
        <div>
          <ChatBox />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HotelSearchPage;
