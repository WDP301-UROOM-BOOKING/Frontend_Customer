"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import RoomActions from "../../../redux/room/actions";
import { showToast } from "@components/ToastContainer";
import NavigationBar from "../Header";
import Footer from "../Footer";
import * as Routers from "../../../utils/Routes";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as GiIcons from "react-icons/gi";
import Banner from "../../../images/banner.jpg";
import Utils from "../../../utils/Utils";
import SearchActions from "../../../redux/search/actions";
import { Modal, Button } from "react-bootstrap";
import HotelActions from "../../../redux/hotel/actions";

// CSS Styles
const styles = {
  pageContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  mainContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1.5rem 1rem",
    position: "relative",
    zIndex: "10",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    margin: "0 auto",
    border: "1px solid rgba(0, 0, 0, 0.05)",
  },
  cardContent: {
    padding: "1.5rem",
  },
  horizontalLayout: {
    display: "flex",
    flexDirection: "row",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  imageSection: {
    flex: "0 0 400px", 
    maxWidth: "400px", 
  },
  infoSection: {
    flex: "1 1 400px", 
  },
  imageGallery: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr", 
    gridTemplateRows: "auto auto",
    gap: "0.5rem",
    gridTemplateAreas: `
      "main thumb1"
      "main thumb2"
    `,
  },
  mainImageContainer: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    gridArea: "main",
    height: "320px", 
  },
  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.4) 100%)",
  },
  thumbnailContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "2px solid transparent",
  },
  thumbnailActive: {
    border: "2px solid #1a2b49",
    boxShadow: "0 0 0 2px rgba(26, 43, 73, 0.3)",
  },
  thumbnailSmall: {
    height: "155px", 
    borderRadius: "8px",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
  },
  thumb1: {
    gridArea: "thumb1",
  },
  thumb2: {
    gridArea: "thumb2",
  },
  morePhotos: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  contentSection: {
    marginBottom: "1.25rem",
  },
  heading1: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "0.5rem",
    fontFamily: "'Poppins', sans-serif",
  },
  heading3: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#1a2b49",
    marginBottom: "0.5rem",
    marginTop: "1rem",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  heading4: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1a2b49",
    marginBottom: "0.5rem",
    fontFamily: "'Poppins', sans-serif",
  },
  description: {
    color: "#666666",
    lineHeight: "1.6",
    marginBottom: "1rem",
    fontSize: "0.95rem",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "0.75rem",
    flexWrap: "wrap",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: "0.4rem 0.75rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    fontSize: "0.9rem",
  },
  icon: {
    color: "#1a2b49",
    fontSize: "1.1rem",
    marginRight: "0.5rem",
  },
  facilitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  facilityItem: {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    fontSize: "0.9rem",
  },
  bedList: {
    listStyle: "none",
    padding: "0",
    margin: "0.5rem 0 0 0",
  },
  bedItem: {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    marginBottom: "0.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    fontSize: "0.9rem",
  },
  priceCard: {
    backgroundColor: "#f8f9fa",
    padding: "1.25rem",
    borderRadius: "12px",
    marginTop: "1rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid rgba(0,0,0,0.03)",
  },
  priceSection: {
    backgroundColor: "#f8f9fa",
    padding: "1rem",
    borderRadius: "12px",
    marginTop: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1a2b49",
    display: "flex",
    alignItems: "baseline",
  },
  priceUnit: {
    fontSize: "0.875rem",
    fontWeight: "400",
    color: "#666666",
    marginLeft: "0.25rem",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#333333",
    marginBottom: "0.25rem",
  },
  input: {
    width: "100%",
    padding: "0.6rem 0.75rem",
    border: "1px solid #dddddd",
    borderRadius: "8px",
    fontSize: "0.95rem",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    outline: "none",
  },
  inputFocus: {
    borderColor: "#1a2b49",
    boxShadow: "0 0 0 3px rgba(26, 43, 73, 0.15)",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "1rem",
  },
  button: {
    backgroundColor: "#1a2b49",
    color: "#ffffff",
    fontWeight: "600",
    padding: "0.75rem 2rem",
    borderRadius: "9999px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.95rem",
    boxShadow: "0 4px 12px rgba(26, 43, 73, 0.25)",
  },

  noData: {
    color: "#999999",
    fontStyle: "italic",
    fontSize: "0.9rem",
  },
  divider: {
    height: "1px",
    backgroundColor: "#eeeeee",
    margin: "1rem 0",
    width: "100%",
  },
  badge: {
    display: "inline-block",
    padding: "0.2rem 0.6rem",
    backgroundColor: "#e6f0ff",
    color: "#1a2b49",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: "500",
    position: "absolute",
    top: "0.75rem",
    left: "0.75rem",
    zIndex: "5",
  },
  quantitySelector: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
  },
  quantityLabel: {
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#333333",
    marginRight: "0.75rem",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #dddddd",
    borderRadius: "8px",
    overflow: "hidden",
  },
  quantityButton: {
    border: "none",
    backgroundColor: "#f0f0f0",
    color: "#333333",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    fontSize: "0.95rem",
    fontWeight: "bold",
  },
  quantityInput: {
    width: "40px",
    height: "32px",
    border: "none",
    borderLeft: "1px solid #dddddd",
    borderRight: "1px solid #dddddd",
    textAlign: "center",
    fontSize: "0.95rem",
    fontWeight: "500",
    outline: "none",
  },
  totalPrice: {
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#333333",
    marginTop: "0.75rem",
    textAlign: "right",
  },
  totalPriceValue: {
    fontWeight: "700",
    color: "#1a2b49",
    fontSize: "1.1rem",
  },
  amenityIcon: {
    fontSize: "1.1rem",
    color: "#1a2b49",
    marginRight: "0.5rem",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  sectionIcon: {
    fontSize: "1.1rem",
    color: "#1a2b49",
  },
  twoColumnsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  bookingSection: {
    flex: "0 0 400px", 
    maxWidth: "400px",
    backgroundColor: "#f8f9fa",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid rgba(0,0,0,0.03)",
  },
  servicesContainer: {
    marginTop: "1rem",
    maxHeight: "none", 
    overflowY: "visible", 
  },
  serviceItem: {
    padding: "0.75rem",
    marginBottom: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "white",
    "&:hover": {
      borderColor: "#1a2b49",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
  },
  serviceItemSelected: {
    borderColor: "#1a2b49",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    backgroundColor: "#f8f9fa",
  },
  totalPriceSection: {
    marginTop: "1.5rem",
    paddingTop: "1rem",
    borderTop: "1px solid #ddd",
  },
  totalPriceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  totalPriceLabel: {
    fontSize: "1rem",
    color: "#666",
  },
  totalPriceSubtext: {
    fontSize: "0.875rem",
    color: "#666666",
    textAlign: "right",
  },
  viewAllPhotos: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.5rem",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    marginTop: "0.5rem",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  ratingBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    backgroundColor: "#1a2b49",
    color: "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  
  fullWidthImageSection: {
    marginBottom: "1.5rem",
    width: "100%",
  },
  largeImageContainer: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    height: "400px", 
    width: "100%",
  },
  thumbnailRow: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
    overflowX: "auto",
    padding: "0.25rem",
    scrollbarWidth: "thin",
    scrollbarColor: "#1a2b49 #f0f0f0",
  },
  thumbnailLarge: {
    width: "200px", 
    height: "150px",
    flexShrink: 0,
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "2px solid transparent",
    objectFit: "cover",
  },
};

// Media query styles for responsive design
const mediaStyles = `
  @media (min-width: 768px) {
    .card-content {
      padding: 1.5rem;
    }
  }
  
  @media (max-width: 767px) {
    .horizontal-layout {
      flex-direction: column;
    }
    
    .image-section {
      max-width: 100%;
    }
    
    .facilities-grid {
      grid-template-columns: 1fr;
    }
    
    .two-columns-grid {
      grid-template-columns: 1fr;
    }
    
    .large-image-container {
      height: 300px;
    }
  }

  .facility-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0,0,0,0.1);
  }

  .main-image:hover {
    transform: scale(1.02);
  }
  
  .thumbnail-small:hover img {
    opacity: 0.9;
  }
  
  .thumbnail-large:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }

  input:focus {
    border-color: #1a2b49;
    box-shadow: 0 0 0 3px rgba(26, 43, 73, 0.15);
  }

  .quantity-button:hover {
    background-color: #e0e0e0;
  }
  
  .view-all-photos:hover {
    background-color: #e0e0e0;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }


  
  .thumbnail-row::-webkit-scrollbar {
    height: 6px;
  }
  
  .thumbnail-row::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 10px;
  }
  
  .thumbnail-row::-webkit-scrollbar-thumb {
    background: #1a2b49;
    border-radius: 10px;
  }
`;

function App() {
  return (
    <>
      <style>{mediaStyles}</style>
      <div
        style={{
          ...styles.pageContainer,
          backgroundImage: `url(${Banner})`,
        }}
      >
        <NavigationBar className="custom-navbar" />
        <MainContent />
        <Footer />
      </div>
    </>
  );
}

function MainContent() {
  const SearchInformation = useAppSelector(
    (state) => state.Search.SearchInformation
  );
  const selectedRoomsTemps = useAppSelector(
    (state) => state.Search.selectedRooms
  );
  console.log("selectedRoomsTemps: ", selectedRoomsTemps)
  const Auth = useAppSelector(
    (state) => state.Auth.Auth
  );

  const [searchParams, setSearchParams] = useState({
    address: SearchInformation.address,
    checkinDate: SearchInformation.checkinDate,
    checkoutDate: SearchInformation.checkoutDate,
    numberOfPeople: SearchInformation.adults + SearchInformation.childrens,
    page: 1,
    limit: 10,
  });

  const { id: roomId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [roomDetail, setRoomDetail] = useState({
    images: [],
    facilities: [],
    bed: [],
    name: "",
    description: "",
    type: "",
    capacity: 0,
    quantity: 0,
    price: 0,
    hotel: {
      services: []
    }
  });
  const [mainImage, setMainImage] = useState("");
  const [roomQuantity, setRoomQuantity] = useState(selectedRoomsTemps[0]?.room?._id == roomId ? selectedRoomsTemps[0]?.amount : 1);
  const [checkInDate, setCheckInDate] = useState(SearchInformation.checkinDate);
  const [checkOutDate, setCheckOutDate] = useState(
    SearchInformation.checkoutDate
  );
  const [nights, setNights] = useState(1);

  // Add new state variables for services
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceQuantities, setServiceQuantities] = useState({});
  const [serviceSelectedDates, setServiceSelectedDates] = useState({});
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  // Add state for hotel detail
  const [hotelDetail, setHotelDetail] = useState(null);

  // Update state for modal
  const [showDateValidationModal, setShowDateValidationModal] = useState(false);
  const [servicesWithoutDates, setServicesWithoutDates] = useState([]);

  // Add new state for warning modal
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const renderIcon = (iconName) => {
    const iconLibraries = { ...FaIcons, ...MdIcons, ...GiIcons };
    const IconComponent = iconLibraries[iconName];
    return IconComponent ? (
      <IconComponent style={{ fontSize: "18px", color: "#1a2b49" }} />
    ) : null;
  };
  useEffect(() => {
    if (roomId) {
      dispatch({
        type: RoomActions.FETCH_ROOM_DETAIL,
        payload: {
          roomId,
          onSuccess: (room) => {
            console.log("room detail fetched:", room);
            setRoomDetail({
              ...room,
              images: room?.images || [],
              facilities: room?.facilities || [],
              bed: room?.bed || [],
            });
            if (room?.images?.length > 0) {
              setMainImage(room.images[0]);
            }

            // Fetch hotel detail to get services
            if (room?.hotel?._id) {
              dispatch({
                type: HotelActions.FETCH_DETAIL_HOTEL,
                payload: {
                  hotelId: room.hotel._id,
                  userId: Auth._id,
                  onSuccess: (hotel) => {
                    console.log("Hotel detail fetched:", hotel);
                    setHotelDetail(hotel);
                  },
                  onFailed: (msg) => {
                    console.error("Failed to fetch hotel detail:", msg);
                  },
                  onError: (err) => {
                    console.error("Error fetching hotel detail:", err);
                  }
                }
              });
            }

            setSelectedRooms([{ amount: 1, room: room }]);
          },
          onFailed: (msg) => {
            showToast.warning("Get room details failed!");
            console.error("Get room details failed:", msg);
          },
          onError: (err) => {
            showToast.error("Server error.");
            console.error("Server error:", err);
          },
        },
      });
    }
  }, [roomId, dispatch, Auth._id]);

  const [selectedRooms, setSelectedRooms] = useState([
    { amount: 1, room: roomDetail },
  ]);

  console.log("selectRooms: ", selectedRooms);
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays || 1);
    }
  }, [checkInDate, checkOutDate]);

  const imageList = roomDetail.images || [];

  const incrementQuantity = () => {
    if (roomQuantity < (roomDetail.quantity || 10)) {
      setRoomQuantity(roomQuantity + 1);
      setSelectedRooms([{ amount: roomQuantity + 1, room: roomDetail }]);
    } else {
      showToast.warning(`Maximum available rooms: ${roomDetail.quantity}`);
    }
  };

  const decrementQuantity = () => {
    if (roomQuantity > 1) {
      setRoomQuantity(roomQuantity - 1);
      setSelectedRooms([{ amount: roomQuantity - 1, room: roomDetail }]);
    }
  };

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= (roomDetail.quantity || 10)) {
      setRoomQuantity(value);
      setSelectedRooms([{ amount: value, room: roomDetail }]);
    }
  };

  // Update the service selection handlers
  const handleServiceSelection = (service) => {
    setSelectedServices((prev) => {
      const isSelected = prev.some((s) => s._id === service._id);
      if (isSelected) {
        // Remove only this specific service
        const newSelected = prev.filter((s) => s._id !== service._id);
        // Remove only this service's quantity and dates
        setServiceQuantities((prev) => {
          const newQuantities = { ...prev };
          delete newQuantities[service._id];
          return newQuantities;
        });
        setServiceSelectedDates((prev) => {
          const newDates = { ...prev };
          delete newDates[service._id];
          return newDates;
        });
        return newSelected;
      } else {
        // Add only this specific service
        setServiceQuantities((prev) => ({
          ...prev,
          [service._id]: 1
        }));
        return [...prev, service];
      }
    });
  };

  const handleServiceQuantityChange = (service, amount) => {
    if (amount < 1) return;

    setServiceQuantities((prev) => ({
      ...prev,
      [service._id]: amount
    }));
  };

  const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate < lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const handleDateSelection = (service, date) => {
    setServiceSelectedDates((prev) => {
      const currentDates = prev[service._id] || [];
      const dateStr = date.toISOString();

      if (currentDates.includes(dateStr)) {
        return {
          ...prev,
          [service._id]: currentDates.filter(d => d !== dateStr)
        };
      } else {
        return {
          ...prev,
          [service._id]: [...currentDates, dateStr]
        };
      }
    });
  };

  const handleShowDateSelector = (service) => {
    setCurrentService(service);
    setShowDateSelector(true);
  };

  const handleCloseDateSelector = () => {
    setShowDateSelector(false);
    setCurrentService(null);
    setCurrentServiceIndex(0);
  };

  const calculateServicePrice = (service) => {
    const quantity = serviceQuantities[service._id] || 1;
    const selectedDates = serviceSelectedDates[service._id] || [];
    // Only calculate price for selected dates, not all nights
    const numberOfDays = selectedDates.length;
    return service.price * quantity * numberOfDays;
  };

  const totalPrice = roomDetail.price * roomQuantity * nights;

  return (
    <div style={styles.mainContainer} className="mt-5">
      <div style={styles.card}>
        <div style={styles.cardContent} className="card-content">
          {/* Full-width image section for larger images */}
          <div style={styles.fullWidthImageSection}>
            <div
              style={styles.largeImageContainer}
              className="large-image-container"
            >
              <div style={styles.badge}>
                <h4>{roomDetail.type || ""}</h4>
              </div>

              <img
                src={mainImage || "https://via.placeholder.com/800x500"}
                alt="Main Room View"
                style={styles.mainImage}
                className="main-image"
              />
              {/* <div style={styles.imageOverlay}></div> */}
            </div>

            {/* Horizontal scrollable thumbnail row */}
            <div style={styles.thumbnailRow} className="thumbnail-row">
              {Array.isArray(imageList) &&
                imageList.map((image, index) => (
                  <img
                    key={index}
                    src={
                      image ||
                      `https://via.placeholder.com/200x150?text=Image+${index + 1
                      }`
                    }
                    alt={`Room view ${index + 1}`}
                    style={{
                      ...styles.thumbnailLarge,
                      ...(mainImage === image ? styles.thumbnailActive : {}),
                    }}
                    className="thumbnail-large"
                    onClick={() => setMainImage(image)}
                  />
                ))}
            </div>
          </div>

          {/* Main horizontal layout for info and booking */}
          <div style={styles.horizontalLayout} className="horizontal-layout">
            {/* Left side - Info section */}
            <div style={styles.infoSection} className="info-section">
              <div style={styles.contentSection}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h1 style={styles.heading1}>
                    {roomDetail.name || "Luxury Room"}
                  </h1>
                </div>
                <div style={styles.price}>
                  {Utils.formatCurrency(roomDetail.price)}
                  <span style={styles.priceUnit}>/day</span>
                </div>

                <p style={styles.description}>
                  {roomDetail.description ||
                    "Experience luxury and comfort in our beautifully designed room with modern amenities and stunning views."}
                </p>
              </div>

              <div style={styles.contentSection}>
                <div style={styles.infoRow}>
                  <div style={styles.infoItem}>
                    <FaIcons.FaUsers style={styles.icon} />
                    <span>Capacity: {roomDetail.capacity} people</span>
                  </div>
                  <div style={styles.infoItem}>
                    <FaIcons.FaDoorOpen style={styles.icon} />
                    <span>Available: {roomDetail.quantity} rooms</span>
                  </div>
                </div>
              </div>

              <div style={styles.twoColumnsGrid} className="two-columns-grid">
                {/* Facilities */}
                <div style={styles.contentSection}>
                  <div style={styles.sectionTitle}>
                    <FaIcons.FaConciergeBell style={styles.sectionIcon} />
                    <h3 style={styles.heading3}>Facilities</h3>
                  </div>
                  <div
                    style={styles.facilitiesGrid}
                    className="facilities-grid"
                  >
                    {roomDetail.facilities?.map((facility, index) => (
                      <div
                        key={index}
                        style={styles.facilityItem}
                        className="facility-item"
                      >
                        <span style={{ marginRight: "0.5rem" }}>
                          {renderIcon(facility.icon)}
                        </span>
                        <span style={{ color: "#333333" }}>
                          {facility.name}
                        </span>
                      </div>
                    )) || (
                        <div style={styles.noData}>No amenities available.</div>
                      )}
                  </div>
                </div>

                {/* Beds */}
                <div style={styles.contentSection}>
                  <div style={styles.sectionTitle}>
                    <FaIcons.FaBed style={styles.sectionIcon} />
                    <h3 style={styles.heading3}>Beds</h3>
                  </div>
                  <ul style={styles.bedList}>
                    {roomDetail.bed.length > 0 ? (
                      roomDetail.bed.map((b, index) => (
                        <li key={index} style={styles.bedItem}>
                          <FaIcons.FaBed style={styles.icon} />
                          <span style={{ color: "#333333", cursor: "pointer" }} title={b.bed?.description ?? ""}>
                            {b.quantity} x {b.bed?.name || "Unknown Bed Type"}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li style={styles.noData}>
                        No bed information available.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right side - Booking section */}
            <div style={styles.bookingSection}>
              <div style={styles.quantitySelector}>
                <span style={styles.quantityLabel}>Number of rooms:</span>
                <div style={styles.quantityControls}>
                  <button
                    style={styles.quantityButton}
                    className="quantity-button"
                    onClick={decrementQuantity}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={roomQuantity}
                    onChange={handleQuantityChange}
                    style={styles.quantityInput}
                    max={location.state.availableQuantity}
                  />
                  <button
                    style={styles.quantityButton}
                    className="quantity-button"
                    onClick={incrementQuantity}
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                {location.state.availableQuantity <= 3 ? (
                  <div
                    className="text-danger fw-semibold"
                    style={{
                      fontSize: "0.95rem",
                      marginBottom: "10px",
                    }}
                  >
                    Only {location.state.availableQuantity} rooms left for
                    this room type!
                  </div>
                ) : (
                  <div
                    className="fw-semibold"
                    style={{
                      fontSize: "0.95rem",
                      marginBottom: "10px",
                    }}
                  >
                    Have {location.state.availableQuantity} rooms left for
                    this room type!
                  </div>
                )}
              </div>

              {/* Services Section */}
              {hotelDetail?.services && hotelDetail.services.length > 0 && (
                <div style={styles.servicesContainer}>
                  <h5 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Available Services</h5>
                  {hotelDetail.services.map((service) => {
                    const isSelected = selectedServices.some((s) => s._id === service._id);
                    const quantity = serviceQuantities[service._id] || 1;
                    const selectedDates = serviceSelectedDates[service._id] || [];

                    return (
                      <div
                        key={service._id}
                        style={{
                          ...styles.serviceItem,
                          ...(isSelected ? styles.serviceItemSelected : {}),
                          borderColor: isSelected ? "#1a2b49" : "#ddd",
                          backgroundColor: isSelected ? "#f8f9fa" : "white",
                          boxShadow: isSelected ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                        }}
                        onClick={() => handleServiceSelection(service)}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "#1a2b49";
                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "#ddd";
                            e.currentTarget.style.boxShadow = "none";
                          }
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h6 style={{ margin: 0 }}>{service.name}</h6>
                          <span style={{ color: "#1a2b49", fontWeight: "600" }}>
                            {Utils.formatCurrency(service.price)}/{service.type}
                          </span>
                        </div>
                        {isSelected && (
                          <div style={{ marginTop: "0.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <button
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  backgroundColor: "white",
                                  cursor: "pointer",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleServiceQuantityChange(service, quantity - 1);
                                }}
                                disabled={quantity <= 1}
                              >
                                -
                              </button>
                              <span>{quantity}</span>
                              <button
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  backgroundColor: "white",
                                  cursor: "pointer",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleServiceQuantityChange(service, quantity + 1);
                                }}
                              >
                                +
                              </button>
                              <button
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  backgroundColor: "white",
                                  cursor: "pointer",
                                  marginLeft: "auto",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowDateSelector(service);
                                }}
                              >
                                Select Dates
                              </button>
                            </div>
                            {selectedDates.length > 0 && (
                              <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
                                Selected dates: {selectedDates.map(date =>
                                  new Date(date).toLocaleDateString()
                                ).join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Check-in Date</label>
                <input
                  type="date"
                  style={styles.input}
                  className="input"
                  value={checkInDate}
                  onChange={(e) => {
                    setCheckInDate(e.target.value);
                    setSearchParams({
                      ...searchParams,
                      checkinDate: e.target.value,
                    });
                  }}
                  disabled
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Check-out Date</label>
                <input
                  type="date"
                  style={styles.input}
                  className="input"
                  value={checkOutDate}
                  onChange={(e) => {
                    setCheckOutDate(e.target.value);
                    setSearchParams({
                      ...searchParams,
                      checkoutDate: e.target.value,
                    });
                  }}
                  disabled
                  min={checkInDate || new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Total Price Section */}
              <div style={styles.totalPriceSection}>
                <div style={styles.totalPriceRow}>
                  <span style={styles.totalPriceLabel}>Room Price:</span>
                  <span style={styles.totalPriceValue}>
                    {Utils.formatCurrency(roomDetail.price * roomQuantity * nights)}
                  </span>
                </div>
                {selectedServices.length > 0 && (
                  <div style={styles.totalPriceRow}>
                    <span style={styles.totalPriceLabel}>Services Price:</span>
                    <span style={styles.totalPriceValue}>
                      {Utils.formatCurrency(
                        selectedServices.reduce((total, service) => {
                          return total + calculateServicePrice(service);
                        }, 0)
                      )}
                    </span>
                  </div>
                )}
                <div style={styles.totalPriceRow}>
                  <span style={styles.totalPriceLabel}>Total:</span>
                  <span style={styles.totalPriceValue}>
                    {Utils.formatCurrency(
                      roomDetail.price * roomQuantity * nights +
                      selectedServices.reduce((total, service) => {
                        return total + calculateServicePrice(service);
                      }, 0)
                    )}
                  </span>
                </div>
                <div style={styles.totalPriceSubtext}>
                  {roomQuantity} {roomQuantity > 1 ? "rooms" : "room"} × {nights} {nights > 1 ? "days" : "day"}
                </div>
              </div>

              <div style={styles.buttonContainer}>
                <button
                  onClick={() => {
                    if (selectedRooms.length == 0) {
                      setWarningMessage("Please select at least one room");
                      setShowWarningModal(true);
                    } else {
                      // Validate service dates
                      const servicesNeedingDates = selectedServices.filter(service => {
                        const selectedDates = serviceSelectedDates[service._id] || [];
                        return selectedDates.length === 0;
                      });

                      if (servicesNeedingDates.length > 0) {
                        setServicesWithoutDates(servicesNeedingDates);
                        setShowDateValidationModal(true);
                        return;
                      }

                      // Prepare services data with quantities and dates
                      const servicesWithDetails = selectedServices.map(service => ({
                        ...service,
                        quantity: serviceQuantities[service._id] || 1,
                        selectedDates: serviceSelectedDates[service._id] || []
                      }));

                      // Save booking data to sessionStorage stack
                      const bookingData = {
                        selectedRooms: selectedRooms,
                        selectedServices: servicesWithDetails,
                        hotelDetail: {
                          ...hotelDetail,
                          star: hotelDetail.star || 0 // Ensure star property exists
                        },
                        searchInfo: {
                          checkinDate: checkInDate,
                          checkoutDate: checkOutDate,
                          adults: SearchInformation.adults,
                          childrens: SearchInformation.childrens
                        }
                      };

                      // Get existing stack or initialize new one
                      const bookingStack = JSON.parse(sessionStorage.getItem('bookingStack') || '[]');
                      bookingStack.push(bookingData);
                      sessionStorage.setItem('bookingStack', JSON.stringify(bookingStack));

                      if (Auth._id != -1) {
                        dispatch({
                          type: SearchActions.SAVE_SELECTED_ROOMS,
                          payload: {
                            selectedRooms: selectedRooms,
                            selectedServices: servicesWithDetails,
                            hotelDetail: {
                              ...hotelDetail,
                              star: hotelDetail.star || 0 // Ensure star property exists
                            },
                          },
                        });
                        navigate(Routers.BookingCheckPage);
                      } else {
                        dispatch({
                          type: SearchActions.SAVE_SELECTED_ROOMS,
                          payload: {
                            selectedRooms: selectedRooms,
                            selectedServices: servicesWithDetails,
                            hotelDetail: {
                              ...hotelDetail,
                              star: hotelDetail.star || 0 // Ensure star property exists
                            },
                          },
                        });
                        navigate(Routers.LoginPage);
                      }
                    }
                  }}
                  style={styles.button}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2c4373";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#1a2b49";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Date Validation Modal */}
      <Modal show={showDateValidationModal} onHide={() => setShowDateValidationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Dates Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <i className="fas fa-calendar-alt fa-3x text-primary mb-3"></i>
            <h5>Please Select Dates for Services</h5>
            <p className="text-muted">You need to select dates for the following services before proceeding with the booking:</p>
          </div>
          <div className="services-list">
            {servicesWithoutDates.map(service => {
              const hasSelectedDates = (serviceSelectedDates[service._id] || []).length > 0;
              return (
                <div key={service._id} className="service-item d-flex justify-content-between align-items-center p-3 mb-2 border rounded">
                  <div>
                    <h6 className="mb-1">{service.name}</h6>
                    <small className="text-muted">{Utils.formatCurrency(service.price)}/{service.type}</small>
                    {hasSelectedDates && (
                      <div className="mt-2">
                        <small className="text-success">
                          <i className="fas fa-check-circle me-1"></i>
                          Dates selected
                        </small>
                      </div>
                    )}
                  </div>
                  <button
                    className={`btn ${hasSelectedDates ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => {
                      handleShowDateSelector(service);
                      setShowDateValidationModal(false);
                    }}
                  >
                    {hasSelectedDates ? 'Change Dates' : 'Select Dates'}
                  </button>
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDateValidationModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Date Selection Modal */}
      <Modal show={showDateSelector} onHide={handleCloseDateSelector}>
        <Modal.Header closeButton>
          <Modal.Title>Select Service Dates</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentService && (
            <div>
              <div className="text-center mb-4">
                <h5>{currentService.name}</h5>
                <p className="text-muted">Select dates for this service:</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {getDatesBetween(
                  new Date(SearchInformation.checkinDate),
                  new Date(SearchInformation.checkoutDate)
                ).map((date) => {
                  const dateStr = date.toISOString();
                  const isSelected = (serviceSelectedDates[currentService._id] || []).includes(dateStr);
                  return (
                    <div
                      key={dateStr}
                      className={`date-option p-2 border rounded ${isSelected ? "bg-primary text-white" : ""
                        }`}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: isSelected ? "#0056b3" : "#f8f9fa"
                        }
                      }}
                      onClick={() => handleDateSelection(currentService, date)}
                    >
                      {date.toLocaleDateString()}
                    </div>
                  );
                })}
              </div>
              {serviceSelectedDates[currentService._id]?.length > 0 && (
                <div className="mt-3">
                  <h6>Selected Dates:</h6>
                  <div className="selected-dates d-flex flex-wrap gap-2">
                    {serviceSelectedDates[currentService._id].map(dateStr => (
                      <div
                        key={dateStr}
                        className="selected-date p-2 rounded"
                        style={{
                          backgroundColor: "#f8f9fa",
                          color: "#666666",
                          border: "1px solid #ddd"
                        }}
                      >
                        {new Date(dateStr).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {servicesWithoutDates.length > 1 ? (
            <Button variant="secondary" onClick={() => {
              handleCloseDateSelector();
              setShowDateValidationModal(true);
            }}>
              Back to Services
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleCloseDateSelector}>
              Close
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Add Warning Modal */}
      <Modal show={showWarningModal} onHide={() => setShowWarningModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <h5>{warningMessage}</h5>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWarningModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
