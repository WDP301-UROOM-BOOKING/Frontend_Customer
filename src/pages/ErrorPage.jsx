import React from 'react';
import { Container, Button } from 'react-bootstrap';
import '../css/ErrorPage.css';
import { useNavigate } from 'react-router-dom';
import * as Routers from "../utils/Routes"

const ErrorPage = () => {
  const navigate = useNavigate() // cần thêm dòng này

  return (
    <div className="not-found-container">
      
      <Container className="content-container">
        <div className="number-container">
          <h1 className="error-number" style={{fontSize: '220px'}}>404</h1>
        </div>
        
        <div className="text-container">
          <h2 className="error-title">Sorry, Page Not Found</h2>
          <p className="error-description">
            The page you requested could not be found
          </p>
          
          <div className="button-container">
            <Button 
              variant="light" 
              className="action-button" 
              style={{width: '170px'}}
              onClick={() => {
                navigate(Routers.Home)
              }}
            >
              Home Page
            </Button>
            <Button variant="light" className="action-button" style={{width: '170px'}}>
              Contact Admin
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ErrorPage;
