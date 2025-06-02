import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import {
  FaKey,
  FaImage,
  FaHistory,
  FaHeart,
  FaComment,
  FaExclamationTriangle,
  FaMoneyBillWave,
} from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../css/customer/MyAccountPage.css";
import ChangePassword from "./components/ChangePassword";
import ViewInformation from "./components/ViewInformation";
import ViewAvatar from "./components/ViewAvatar";
import MyFeedback from "./components/MyFeedback";
import FavoriteHotel from "./components/MyFavoriteHotel";
import Banner from "../../../images/banner.jpg";
import BookingHistory from "./components/BookingHistory";
import MyReportFeedBack from "./components/MyReportFeedBack";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { useAppSelector } from "../../../redux/store";
import * as Routers from "../../../utils/Routes";
import RefundReservations from "./components/RefundReservation";
import { ChatBox } from "../home/HomePage";


function MyAccountPage() {
  const Auth = useAppSelector((state) => state.Auth.Auth);
  const { section } = useParams();
  const navigate = useNavigate(); // cần thêm dòng này

  const menuItems = [
    { name: "My Account", icon: <IoSettingsSharp />, link: "view_information" },
    { name: "Change Password", icon: <FaKey />, link: "change_password" },
    { name: "View Avatar", icon: <FaImage />, link: "view_avatar" },
    { name: "Booking History", icon: <FaHistory />, link: "booking_history" },
    { name: "Favorite Hotel", icon: <FaHeart />, link: "favorite_hotel" },
    { name: "My Feedback", icon: <FaComment />, link: "my_feedback" },
    { name: "My Report", icon: <FaExclamationTriangle />, link: "my_report" }, // báo cáo
    { name: "My Refund", icon: <FaMoneyBillWave />, link: "my_refund" }, // hoàn tiền
  ];

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{
        backgroundImage: `url(${Banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header />
      <div
        className="flex-grow-1 d-flex justify-content-center content-wrapper"
        style={{ paddingTop: "100px", paddingBottom: "50px" }}
      >
        <Container className="mt-4">
          <Row>
            <Col md={3} className="mb-4">
              <Card className="sidebar">
                <div className="user-profile text-center p-3 border-bottom">
                  <div className="avatar-circle">
                    <img
                      src={
                        Auth?.image?.url && Auth?.image?.url !== ""
                          ? Auth?.image?.url
                          : "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
                      }
                      className="rounded-circle mb-2"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <h5 className="mt-2 mb-0">{Auth.name}</h5>
                  <small className="text-muted">Google</small>
                </div>
                <ListGroup variant="flush">
                  {menuItems.map((item, index) => (
                    <ListGroup.Item
                      key={item.name}
                      className={`menu-item ${
                        item.link === section ? "active" : ""
                      }`}
                      onClick={() => {
                        if (item.link == "favorite_hotel") {
                          navigate(
                            `${Routers.MyAccountPage}/${item.link}?page=1`
                          );
                        } else {
                          navigate(`${Routers.MyAccountPage}/${item.link}`);
                        }
                      }}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.name}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>
            <Col md={9}>
              <Card style={{ backgroundColor: "rgba(255, 255, 255,0.9)" }}>
                {section == "view_information" && <ViewInformation />}
                {section == "change_password" && <ChangePassword />}
                {section === "view_avatar" && <ViewAvatar />}
                {section == "booking_history" && <BookingHistory />}
                {section == "favorite_hotel" && <FavoriteHotel />}
                {section == "my_feedback" && <MyFeedback />}
                {section == "my_report" && <MyReportFeedBack />}
                {section == "my_refund" && <RefundReservations />}
              </Card>
            </Col>
          </Row>
        </Container>
        <div>
          <ChatBox />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MyAccountPage;
