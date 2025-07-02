// utils/apiConfig.js
const getApiBackendUrl = () => {
  const environment = process.env.REACT_APP_ENVIRONMENT;
  
  if (environment === 'development') {
    return process.env.REACT_APP_BACKEND_CUSTOMER_URL_DEVELOPMENT;
  } else {
    return process.env.REACT_APP_BACKEND_CUSTOMER_URL_PRODUCT;
  }
};

export default getApiBackendUrl;