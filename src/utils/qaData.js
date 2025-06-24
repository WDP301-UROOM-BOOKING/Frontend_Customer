import { Button, Card } from "react-bootstrap";
import { BsChatDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import * as Routers from "@utils/Routes";
import Factories from "@redux/search/factories";
import { useEffect, useState } from "react";
import { useAppSelector } from "@redux/store";

const ChatSupportCard = () => {
  const navigate = useNavigate();
  return (
    <Card
      className="p-3 rounded-4 shadow-sm"
      style={{ maxWidth: "300px", border: "none" }}
    >
      <div className="mb-2">Please click here.</div>
      <Button
        variant="light"
        className="d-flex align-items-center justify-content-start text-danger fw-semibold"
        style={{ gap: "6px" }}
        onClick={() => {
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
        }}
      >
        <BsChatDots size={18} />
        Support Employee
      </Button>
    </Card>
  );
};

const CancellationPolicy = () => {
  return (
    <div className="policy-details mt-2">
      <h4>Cancellation Policy</h4>

      <ul>
        <li style={{ listStyle: "none", fontSize: 16, marginLeft: "-24px" }}>
          For reservation with status: <code>BOOKED</code>
        </li>
        <li>
          Less than 1 day before check-in: <strong>50% penalty</strong>
        </li>
        <li>
          Less than 3 days before check-in: <strong>20% penalty</strong>
        </li>
        <li>
          3 or more days before check-in: <strong>Full refund</strong>
        </li>
      </ul>
      <ul>
        <li style={{ listStyle: "none", fontSize: 16, marginLeft: "-24px" }}>
          For reservation with status: <code>PENDING</code>
        </li>
        <li>
          Any time: <strong>Full refund</strong>
        </li>
      </ul>
    </div>
  );
};

const ListHotel = ({ address }) => {
  const SearchInformation = useAppSelector(
    (state) => state.Search.SearchInformation
  );
  const [searchParamsObj, setSearchParamsObj] = useState({
    address: address,
    checkinDate: SearchInformation.checkinDate,
    checkoutDate: SearchInformation.checkoutDate,
    numberOfPeople: 2,
    page: 1,
    limit: 5,
  });
  const [loading, setLoading] = useState(true);
  const [searchHotel, setSearchHotel] = useState([]);
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await Factories.searchHotel(searchParamsObj);
        if (response?.status === 200) {
          setSearchHotel(response?.data.hotels);
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParamsObj]);
  console.log("searchHotel: ", searchHotel);
  return (
    <div>
      <p>These are the hotels in {address}:</p>
      {loading ? (
        <p>Đang tải danh sách khách sạn...</p>
      ) : searchHotel.length === 0 ? (
        <p>No hotels found.</p>
      ) : (
        <ol>
          {searchHotel.map((hotel, index) => (
            <li key={hotel.hotel.id || index} className="mb-2">
              <a
                href={`${
                  process.env.REACT_APP_ENVIRONMENT === "development"
                    ? process.env.REACT_APP_FRONTEND_CUSTOMER_URL_DEVELOPMENT
                    : process.env.REACT_APP_FRONTEND_CUSTOMER_URL_PRODUCT
                }/home_detail/${hotel.hotel._id}?sort=0&star=0&page=1`}
                className="hotel-link"
              >
                {hotel.hotel.hotelName}
              </a>
              <br></br>
              Address: {hotel.hotel.address}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

// qaData.js
const qaData = [
  {
    questions: ["Ho Chi Minh", "Hotels in Ho Chi Minh", "Ho Chi Minh hotels","Top 5 khách sạn Hồ Chí Minh"],
    answer: ["ListHotelHoChiMinh"],
  },
  {
    questions: ["Da Nang", "Hotels in Da Nang", "Da Nang hotels","Top 5 khách sạn Đà Nẵng"],
    answer: ["ListHotelDaNang"],
  },
  {
    questions: ["Ha Noi", "Hotels in Ha Noi", "Ha Noi hotels", "Top 5 khách sạn Hà Nội"],
    answer: ["ListHotelHaNoi"],
  },
  {
    questions: [
      "Cancel room",
      "Cancellation policy",
      "Refund",
      "Cancellation",
      "Policty",
      "Cancel",
    ],
    answer: ["CancellationPolicy"],
  },
  {
    questions: [
      "Chat",
      "Chat with staff",
      "Staff chat",
      "Chat with support staff",
    ],
    answer: ["ChatSupportCard"],
  },
  {
    questions: [
      "Thank you",
      "Thanks",
      "Thanks a lot",
      "Thank you very much",
      "Appreciate it",
      "Thank you so much",
      "Thanks, admin",
      "Appreciate your help",
    ],
    answer: ["Thank you for reaching out!"],
  },
  {
    questions: ["Hello", "Hi"],
    answer: ["Hello! How can I assist you today?"],
  },
  {
    questions: ["What is your name?", "Who are you?"],
    answer: ["I am a virtual assistant here to help you."],
  },
  {
    questions: ["What can you do?", "How can you help me?", "help me"],
    answer: [
      "I can answer your questions, provide information, and assist you whenever needed.",
    ],
  },
  {
    questions: [
      "How do I book a room",
      "Booking process",
      "How to reserve?",
      "Make a reservation",
      "Book hotel",
      "Reserve room",
    ],
    answer: [
      "To book a room, browse our hotel listings, select your desired dates and room type, then click the 'Book Now' button to proceed with the reservation.",
    ],
  },
  {
    questions: [
      "Payment methods",
      "How can I pay?",
      "Payment options",
      "Accepted payment",
      "Ways to pay",
    ],
    answer: [
      "We accept various payment methods including credit/debit cards and online banking transfers. All payments are processed securely.",
    ],
  },
  {
    questions: [
      "Check-in time",
      "Check-out time",
      "When can I check in?",
      "When should I check out?",
      "Hotel timing",
    ],
    answer: [
      "Standard check-in time is 2:00 PM and check-out time is 12:00 PM (noon). Early check-in and late check-out may be available upon request.",
    ],
  },
  {
    questions: [
      "Forgot password",
      "Reset password",
      "Can't login",
      "Password reset",
      "Login problems",
    ],
    answer: [
      "To reset your password, click the 'Forgot Password' link on the login page and follow the instructions sent to your email.",
    ],
  },
  {
    questions: [
      "Contact support",
      "Need help",
      "Customer service",
      "Support contact",
      "How to get help",
    ],
    answer: ["ChatSupportCard"],
  },
  {
    questions: [
      "Room amenities",
      "What's included",
      "Room facilities",
      "Hotel features",
      "Available services",
    ],
    answer: [
      "Our rooms typically include Wi-Fi, air conditioning, private bathroom, TV, and daily housekeeping. Specific amenities vary by hotel and room type.",
    ],
  },
  {
    questions: [
      "Modify booking",
      "Change reservation",
      "Edit booking",
      "Update reservation",
      "Change dates",
    ],
    answer: [
      "To modify your booking, please go to 'My Bookings' in your account or contact our support team for assistance.",
    ],
  },
  {
    questions: [
      "Is breakfast included?",
      "Breakfast service",
      "Meal options",
      "Food service",
      "Dining options",
    ],
    answer: [
      "Breakfast availability varies by hotel and room package. Please check the specific hotel details for meal inclusions.",
    ],
  },
  {
    questions: [
      "Pet policy",
      "Are pets allowed?",
      "Can I bring my dog?",
      "Pet friendly hotels",
      "Animals allowed?",
    ],
    answer: [
      "Pet policies vary by hotel. Please check the specific hotel's policy or contact them directly for their pet guidelines and any additional fees.",
    ],
  },
  {
    questions: [
      "Extra bed",
      "Additional bed",
      "Crib available",
      "Baby cot",
      "Need extra mattress",
    ],
    answer: [
      "Extra beds or cribs may be available upon request for an additional charge. Please contact the hotel directly to arrange this.",
    ],
  },
  {
    questions: [
      "Internet access",
      "Wifi password",
      "Is there wifi?",
      "Internet connection",
      "Free wifi",
    ],
    answer: [
      "All our hotels provide WiFi access. The password and connection details will be provided during check-in.",
    ],
  },
  {
    questions: [
      "Parking available?",
      "Car park",
      "Where to park?",
      "Parking facilities",
      "Is parking free?",
    ],
    answer: [
      "Parking availability and fees vary by hotel location. Please check the specific hotel details for parking information.",
    ],
  },
  {
    questions: [
      "Group booking",
      "Book multiple rooms",
      "Corporate booking",
      "Bulk reservation",
      "Group rates",
    ],
    answer: [
      "For group bookings (5 or more rooms), please contact our support team directly for special rates and arrangements.",
    ],
  },
  {
    questions: [
      "Special requests",
      "Room preferences",
      "Specific requirements",
      "Additional requests",
      "Special arrangements",
    ],
    answer: [
      "You can add special requests during the booking process. While we'll try our best to accommodate them, they are subject to availability.",
    ],
  },
  {
    questions: [
      "Airport transfer",
      "Hotel shuttle",
      "Transportation service",
      "Pick up service",
      "How to get there",
    ],
    answer: [
      "Airport transfer services vary by hotel. Please check with the specific hotel for availability and rates.",
    ],
  },
  {
    questions: [
      "Late check-out",
      "Extended stay",
      "Late checkout possible?",
      "Stay longer",
      "Need more time",
    ],
    answer: [
      "Late check-out may be possible subject to availability. Please contact the hotel directly to request this service. Additional charges may apply.",
    ],
  },
];

export { ChatSupportCard, CancellationPolicy, ListHotel };
export default qaData;
