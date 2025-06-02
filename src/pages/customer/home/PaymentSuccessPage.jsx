import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { CheckCircle, ArrowLeft, ArrowRight } from 'react-feather';
import 'bootstrap/dist/css/bootstrap.min.css';
import Banner from '../../../images/banner.jpg';
import { useLocation, useNavigate } from "react-router-dom";
import Footer from '../Footer';
import Header from '../Header';
import * as Routers from "../../../utils/Routes";

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const totalPrice = location.state?.totalPrice ?? 0;
    const id = location.state?.id ?? 0;

    const goToMyAccount = () => {
        navigate(`${Routers.BookingBill}/${id}`);
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "$0";
        return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        }).format(amount);
    };
    return (
    <div 
      className="d-flex flex-column min-vh-100"
      style={{
        backgroundImage: `url(${Banner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Header/>
      <div className="flex-grow-1 d-flex align-items-center justify-content-center content-wrapper" style={{paddingTop: "50px", paddingBottom: "50px"}}>
            <Card className="text-center" style={{
                maxWidth: '800px',
                height: '500px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '15px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: 'none',
                padding: '2rem'
            }}>
                <Card.Body>
                    <div className="mb-4">
                        <CheckCircle 
                            size={150} 
                            style={{
                                color: '#2ecc71',
                                strokeWidth: 2
                            }}
                        />
                    </div>

                    <h2 className="mb-3" style={{ fontWeight: '700' }}>
                        Payment Success!
                    </h2>

                    <p className="text-muted mb-2" style={{ fontWeight: '600', fontSize: 20}}>
                        Hello! You have completed your payment
                    </p>
                    <p className="mb-4" style={{ fontSize: '1.2rem', fontWeight: '500' }}>
                        Amount Paid: <span style={{ color: '#2ecc71' }}>{formatCurrency(totalPrice)}</span>
                    </p>

                    <div className="d-flex justify-content-between gap-3 mt-5">
                        <Button 
                            variant="dark" 
                            className="px-4 py-3 d-flex align-items-center justify-content-center"
                            style={{
                                flex: 1,
                                borderRadius: '8px',
                                backgroundColor: '#000',
                                border: 'none',
                            }}
                            onClick={() => {
                                navigate(Routers.Home)
                            }}
                        >
                            <ArrowLeft size={20} className="me-2" />
                            Go to home page
                        </Button>

                        <Button
                            variant='success'
                            className="px-4 py-2 d-flex align-items-center justify-content-center"
                            style={{
                                flex: 1,
                                borderRadius: '8px',
                                border: 'none',
                            }}
                           onClick={goToMyAccount}
                        >
                            Go to detail transaction
                            <ArrowRight size={20} className="ms-2" />
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
        <Footer/>
    </div>
    );
};

export default PaymentSuccessPage;