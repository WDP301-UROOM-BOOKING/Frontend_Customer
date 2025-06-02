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
    flex: "0 0 400px", // Increased from 320px to 400px for larger images
    maxWidth: "400px", // Increased from 320px to 400px
  },
  infoSection: {
    flex: "1 1 400px", // Flexible width for info section, minimum 400px
  },
  imageGallery: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr", // Main image takes 2/3, thumbnails 1/3
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
    height: "320px", // Increased from 240px to 320px
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
    height: "155px", // Increased from 115px to 155px (half height of main image minus gap)
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
    marginTop: "1rem",
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
  // New styles for larger image display
  fullWidthImageSection: {
    marginBottom: "1.5rem",
    width: "100%",
  },
  largeImageContainer: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    height: "400px", // Much larger main image
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
    width: "200px", // Larger thumbnails
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
  });
  const [mainImage, setMainImage] = useState("");
  const [roomQuantity, setRoomQuantity] = useState(selectedRoomsTemps[0]?.room?._id == roomId ? selectedRoomsTemps[0]?.amount : 1);
  const [checkInDate, setCheckInDate] = useState(SearchInformation.checkinDate);
  const [checkOutDate, setCheckOutDate] = useState(
    SearchInformation.checkoutDate
  );
  const [nights, setNights] = useState(1);

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
  }, [roomId, dispatch]);

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
                      `https://via.placeholder.com/200x150?text=Image+${
                        index + 1
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
                          <span style={{ color: "#333333", cursor: "pointer"}} title={b.bed?.description ?? ""}>
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
            <div style={{ flex: "0 0 350px", maxWidth: "350px" }}>
              <div style={styles.priceCard}>
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

                <div style={styles.totalPrice}>
                  Total:{" "}
                  <span style={styles.totalPriceValue}>
                    {Utils.formatCurrency(totalPrice)}
                  </span>
                  <div style={{ fontSize: "0.875rem", color: "#666666" }}>
                    {roomQuantity} {roomQuantity > 1 ? "rooms" : "room"} ×{" "}
                    {nights} {nights > 1 ? "days" : "day"}
                  </div>
                </div>

                <div style={styles.buttonContainer}>
                  <button
                    onClick={() => {
                      if (selectedRooms.length == 0) {
                      } else {
                        if (Auth._id != -1) {
                          dispatch({
                            type: SearchActions.SAVE_SELECTED_ROOMS,
                            payload: {
                              selectedRooms: selectedRooms,
                              hotelDetail: roomDetail.hotel,
                            },
                          });
                          navigate(Routers.BookingCheckPage);
                        } else {
                          dispatch({
                            type: SearchActions.SAVE_SELECTED_ROOMS,
                            payload: {
                              selectedRooms: selectedRooms,
                              hotelDetail: roomDetail.hotel,
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
      </div>
    </div>
  );
}

export default App;
