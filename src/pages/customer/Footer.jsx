import { Container, Row, Col, Image } from "react-bootstrap";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import "../../css/customer/Footer.css";
import { useNavigate } from "react-router-dom";
import * as Routers from "../../utils/Routes";
import image from "../../images/image-removebg-preview.png";
import { useAppSelector } from "@redux/store";

function Footer() {
  const navigate = useNavigate();
  const Auth = useAppSelector((state) => state.Auth.Auth);

  return (
    <footer className="footer">
      <Container>
        <Row className="align-items-center justify-content-between">
          <Col md={3}>
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
          </Col>
          <Col md={3}>
            <div className="footer-links">
              <a href="#about_us">About Us</a>
              <a
                href=""
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
              </a>
              <a href="#">Terms & Conditions</a>
            </div>
          </Col>
          <Col md={3}>
            <div className="social-links">
              <a href="https://www.facebook.com" className="social-link">
                <FaFacebookF /> Facebook
              </a>
              <a href="https://www.youtube.com" className="social-link">
                <FaTwitter /> Youtube
              </a>
              <a href="https://www.instagram.com" className="social-link">
                <FaInstagram /> Instagram
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
export default Footer;
