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
        onClick={() => navigate(Routers.ChatPage)}
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
  console.log("searchHotel: ", searchHotel)
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
                href={`https://uroom.vercel.app/home_detail/${hotel.hotel._id}?sort=0&star=0&page=1`}
                className="hotel-link"
              >
                {hotel.hotel.hotelName}
              </a><br></br>
              Address: {hotel.hotel.address}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
};

// qaData.js
const qaData = [
  {
    questions: [
      "Ho Chi Minh",
      "Hotels in Ho Chi Minh",
      "Ho Chi Minh hotels",
    ],
    answer: ["ListHotelHoChiMinh"],
  },
  {
    questions: ["Ha Noi", "Hotels in Ha Noi", "Ha Noi hotels"],
    answer: ["ListHotelHaNoi"],
  },
  {
    questions: ["Cancel room", "Cancellation policy", "Refund", "Cancellation", "Policty", "Cancel", ],
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
    answer: [
      "Thank you for reaching out!"
    ],
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
    questions: ["Da Nang", "Hotels in Da Nang", "Da Nang hotels"],
    answer: ["ListHotelDaNang"],
  },
];

export { ChatSupportCard, CancellationPolicy, ListHotel};
export default qaData;
