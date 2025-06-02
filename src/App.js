import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as Routers from "./utils/Routes";
import Utils from "@utils/Utils";

// Customer pages
import BannedPage from "./pages/BannedPage";
import ErrorPage from "./pages/ErrorPage";
import LoginPage from "./pages/customer/login_register/LoginPage";
import RegisterPage from "./pages/customer/login_register/RegisterPage";
import ForgetPasswordPage from "./pages/customer/login_register/ForgetPasswordPage";
import VerifyCodePage from "./pages/customer/login_register/VerifyCodePage";
import ResetPasswordPage from "./pages/customer/login_register/ResetPasswordPage";
import VerifyCodeRegisterPage from "./pages/customer/login_register/VerifyCodeRegisterPage";

import MyAccountPage from "./pages/customer/information/MyAccountPage";
import BookingBill from "./pages/customer/information/BookingBill";
import CreateFeedback from "./pages/customer/information/CreateFeedback";

import Home from "./pages/customer/home/HomePage.jsx";
import Home_detail from "./pages/customer/home/HomeDetailPage";
import HotelSearchPage from "./pages/customer/home/HotelSearchPage";
import RoomDetailPage from "./pages/customer/home/RoomDetailPage";
import BookingCheckPage from "./pages/customer/home/BookingCheckPage";
import PaymentPage from "./pages/customer/home/PaymentPage";
import PaymentSuccessPage from "./pages/customer/home/PaymentSuccessPage";
import PaymentFailedPage from "./pages/customer/home/PaymentFailedPage";
import ReportedFeedback from "./pages/customer/home/ReportedFeedback";
import ChatPage from "./pages/customer/home/ChatPage";

import { useEffect } from "react";
import ChatBox from "@pages/ChatMessage";
import { useAppSelector } from "@redux/store";

function App() {
  useEffect(() => {
    document.title = "My Uroom";
  }, []);

  const Socket = useAppSelector((state) => state.Socket.socket);
  const Auth = useAppSelector((state) => state.Auth.Auth);

  useEffect(() => {
    if (!Socket || !Auth?._id) return;

    Socket.emit("register", Auth._id);

    const handleForceJoinRoom = ({ roomId, partnerId }) => {
      Socket.emit("join-room", {
        userId: Auth._id,
        partnerId,
      });

      // Optional: tự mở khung chat với partnerId nếu chưa mở
      // dispatch(setSelectedUser(partnerId)); hoặc setSelectedUser(partnerId)
    };

    Socket.on("force-join-room", handleForceJoinRoom);

    return () => {
      Socket.off("force-join-room", handleForceJoinRoom);
    };
  }, [Socket, Auth?._id]);
  
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path={Routers.LoginPage} element={<LoginPage />} />
        <Route path={Routers.RegisterPage} element={<RegisterPage />} />
        <Route
          path={Routers.VerifyCodeRegisterPage}
          element={<VerifyCodeRegisterPage />}
        />
        <Route
          path={Routers.ForgetPasswordPage}
          element={<ForgetPasswordPage />}
        />
        <Route path={Routers.VerifyCodePage} element={<VerifyCodePage />} />
        <Route
          path={Routers.ResetPasswordPage}
          element={<ResetPasswordPage />}
        />

        {/* User Info */}
        <Route
          path={`${Routers.MyAccountPage}/:section`}
          element={<MyAccountPage />}
        />
        <Route path={`${Routers.BookingBill}/:id`} element={<BookingBill />} />
        <Route
          path={`${Routers.CreateFeedback}/:id`}
          element={<CreateFeedback />}
        />

        {/* Home */}
        <Route path={Routers.Home} element={<Home />} />
        <Route path={Routers.HotelSearchPage} element={<HotelSearchPage />} />
        <Route path={`${Routers.Home_detail}/:id`} element={<Home_detail />} />
        <Route
          path={`${Routers.RoomDetailPage}/:id`}
          element={<RoomDetailPage />}
        />
        <Route path={Routers.BookingCheckPage} element={<BookingCheckPage />} />
        <Route
          path={`${Routers.ReportedFeedback}/:id`}
          element={<ReportedFeedback />}
        />
        <Route path={Routers.PaymentPage} element={<PaymentPage />} />
        <Route
          path={Routers.PaymentSuccessPage}
          element={<PaymentSuccessPage />}
        />
        <Route
          path={Routers.PaymentFailedPage}
          element={<PaymentFailedPage />}
        />

        {/* Others */}
        <Route path={Routers.BannedPage} element={<BannedPage />} />
        <Route path={Routers.ErrorPage} element={<ErrorPage />} />
        <Route path={Routers.ChatPage} element={<ChatPage />} />
        <Route path="Message" element={<ChatBox />} />
        {/* <Route path="/test" element={<TestTailwindCss />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
