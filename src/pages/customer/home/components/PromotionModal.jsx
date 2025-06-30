import React, { useState, useEffect } from "react";
import { Modal, Button, Card, Badge, Spinner } from "react-bootstrap";
import { FaTag, FaTimes, FaCheck } from "react-icons/fa";
import axios from "axios";
import Utils from "../../../../utils/Utils";
import "../../../../css/PromotionModal.css";

const PromotionModal = ({ show, onHide, totalPrice, onApplyPromotion, currentPromotionId }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (show && totalPrice > 0) {
      fetchPromotions();
    }
  }, [show, totalPrice]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      // Thử fetch từ API trước
      let promotionList = [];
      try {
        console.log("Fetching promotions from API...");
        const response = await axios.get("http://localhost:5000/api/promotions");
        console.log("API Response:", response.data);
        
        // Thử nhiều cách để lấy data từ response
        promotionList = response.data.promotions || response.data.data || response.data || [];
        console.log("Promotion list from API:", promotionList);
        
        // Nếu API trả về nhưng không có data, sử dụng mock
        if (!Array.isArray(promotionList) || promotionList.length === 0) {
          console.log("API returned empty or invalid data, using mock data");
          throw new Error("No promotions from API");
        }
      } catch (apiError) {
        // Nếu API không có, sử dụng mock data
        console.log("API Error:", apiError.message, "- Using mock promotion data");
        promotionList = [
          {
            _id: "1",
            code: "SAVE20",
            description: "Save $20 on orders over $100",
            discountType: "fixed",
            discountValue: 20,
            minOrderAmount: 100,
            maxDiscount: 20,
            expiryDate: "2025-12-31",
            isActive: true
          },
          {
            _id: "2", 
            code: "PERCENT10",
            description: "10% off on all bookings",
            discountType: "percentage",
            discountValue: 10,
            minOrderAmount: 50,
            maxDiscount: 50,
            expiryDate: "2025-12-31",
            isActive: true
          },
          {
            _id: "3",
            code: "NEWUSER50",
            description: "Special discount for new users",
            discountType: "fixed", 
            discountValue: 50,
            minOrderAmount: 200,
            maxDiscount: 50,
            expiryDate: "2025-06-30",
            isActive: true
          },
          {
            _id: "4",
            code: "EXPIRED",
            description: "This promotion has expired",
            discountType: "fixed",
            discountValue: 30,
            minOrderAmount: 80,
            maxDiscount: 30,
            expiryDate: "2024-12-31",
            isActive: false
          }
        ];
      }
      
      console.log("Total price for validation:", totalPrice);
      console.log("Processing", promotionList.length, "promotions");
      
      // Validate từng promotion với totalPrice hiện tại
      const validatedPromotions = await Promise.all(
        promotionList.map(async (promo, index) => {
          console.log(`Validating promotion ${index + 1}:`, promo.code);
          
          try {
            const validateRes = await axios.post("http://localhost:5000/api/promotions/apply", {
              code: promo.code,
              orderAmount: totalPrice,
            });
            console.log(`API validation result for ${promo.code}:`, validateRes.data);
            
            return {
              ...promo,
              isValid: validateRes.data.valid,
              discount: validateRes.data.discount || 0,
              message: validateRes.data.message || "",
            };
          } catch (err) {
            console.log(`API validation failed for ${promo.code}, using mock validation`);
            
            // Mock validation logic nếu API không có
            const now = new Date();
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            
            const isInTimeRange = now >= startDate && now <= endDate;
            const meetsMinOrder = totalPrice >= (promo.minOrderAmount || 0);
            const isActive = promo.isActive !== false;
            
            const isValid = isInTimeRange && meetsMinOrder && isActive;
            
            let discount = 0;
            let message = "";
            
            if (isValid) {
              if (promo.discountType === "percentage") {
                discount = Math.min((totalPrice * promo.discountValue) / 100, promo.maxDiscount || Infinity);
              } else {
                discount = Math.min(promo.discountValue, promo.maxDiscount || Infinity);
              }
              message = `Save ${discount}`;
            } else {
              if (!isInTimeRange) {
                if (now < startDate) message = "Promotion has not started yet";
                else if (now > endDate) message = "Promotion has expired";
                else message = "Promotion is not available";
              } else if (!meetsMinOrder) message = `Minimum order $${promo.minOrderAmount} required`;
              else if (!isActive) message = "Promotion is not active";
              else message = "Not applicable";
            }
            
            console.log(`Mock validation for ${promo.code}:`, { isValid, discount, message });
            
            return {
              ...promo,
              isValid,
              discount,
              message,
            };
          }
        })
      );
      
      console.log("Final validated promotions:", validatedPromotions);
      
      // Chỉ hiển thị promotion có thể dùng được hoặc sắp có thể dùng (chưa bắt đầu)
      // Ẩn những promotion đã hết hạn, không đủ điều kiện, hoặc không active
      const displayPromotions = validatedPromotions.filter(promo => {
        const now = new Date();
        const startDate = new Date(promo.startDate || promo.expiryDate || '2025-01-01');
        const endDate = new Date(promo.endDate || promo.expiryDate || '2025-12-31');
        
        // Chỉ hiển thị nếu: promotion chưa hết hạn và đang active
        const notExpired = now <= endDate;
        const isActive = promo.isActive !== false;
        
        return notExpired && isActive;
      });
      
      console.log("Display promotions:", displayPromotions.length, "of", validatedPromotions.length);
      console.log("Available now:", displayPromotions.filter(p => p.isValid).length);
      console.log("Starting soon:", displayPromotions.filter(p => !p.isValid && p.message?.includes("not started")).length);
      
      // Sắp xếp promotions: Available trước, starting soon sau, và theo discount giảm dần
      const sortedPromotions = displayPromotions.sort((a, b) => {
        // Available promotions lên trước
        if (a.isValid && !b.isValid) return -1;
        if (!a.isValid && b.isValid) return 1;
        
        // Trong cùng loại, sắp xếp theo discount giảm dần
        return b.discount - a.discount;
      });
      
      setPromotions(sortedPromotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setPromotions([]);
    }
    setLoading(false);
  };

  const handleApplyPromotion = async (promotion) => {
    if (!promotion.isValid) return;
    
    setApplying(true);
    try {
      // Thử apply qua API trước
      try {
        const response = await axios.post("http://localhost:5000/api/promotions/apply", {
          code: promotion.code,
          orderAmount: totalPrice,
        });
        
        if (response.data.valid) {
          onApplyPromotion({
            code: promotion.code,
            discount: response.data.discount,
            message: `Promotion applied: -${Utils.formatCurrency(response.data.discount)}`,
            promotionId: response.data.promotionId,
          });
          onHide();
        }
      } catch (apiError) {
        // Nếu API không có, sử dụng mock logic
        console.log("Using mock promotion application");
        onApplyPromotion({
          code: promotion.code,
          discount: promotion.discount,
          message: `Promotion applied: -${Utils.formatCurrency(promotion.discount)}`,
          promotionId: promotion._id,
        });
        onHide();
      }
    } catch (error) {
      console.error("Error applying promotion:", error);
    }
    setApplying(false);
  };

  const handleRemovePromotion = () => {
    onApplyPromotion({
      code: "",
      discount: 0,
      message: "",
      promotionId: null,
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header 
        closeButton 
        style={{ 
          backgroundColor: "rgba(20, 30, 70, 0.95)", 
          borderColor: "rgba(255,255,255,0.2)",
          color: "white"
        }}
      >
        <Modal.Title className="d-flex align-items-center">
          <FaTag className="me-2" />
          Select Promotion
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body 
        style={{ 
          backgroundColor: "rgba(20, 30, 70, 0.95)", 
          color: "white",
          maxHeight: "60vh",
          overflowY: "auto"
        }}
      >
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="light" />
            <div className="mt-2">Loading promotions...</div>
          </div>
        ) : (
          <>
            {/* Current promotion section */}
            {currentPromotionId && (
              <div className="mb-4">
                <h6 className="mb-3">Current Applied Promotion</h6>
                <Card 
                  className="promotion-card current-promotion"
                  style={{ 
                    backgroundColor: "rgba(40, 167, 69, 0.2)", 
                    borderColor: "#28a745",
                    border: "2px solid #28a745"
                  }}
                >
                  <Card.Body className="py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <FaCheck className="text-success me-2" />
                        <span className="text-success fw-bold">Applied</span>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleRemovePromotion}
                        disabled={applying}
                      >
                        <FaTimes className="me-1" />
                        Remove
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}

            {/* Promotions section */}
            <h6 className="mb-3">
              Available Promotions 
              <span className="small ms-2" style={{color: 'rgba(255,255,255,0.6)'}}>
                ({promotions.filter(p => p.isValid).length} ready, {promotions.filter(p => !p.isValid).length} starting soon)
              </span>
            </h6>
            {promotions.length === 0 ? (
              <div className="text-center py-4" style={{color: 'rgba(255,255,255,0.7)'}}>
                <FaTag size={48} className="mb-3" style={{opacity: 0.5}} />
                <div>No promotions available</div>
              </div>
            ) : (
              <>
                {/* Available promotions */}
                {promotions.filter(p => p.isValid).length > 0 && (
                  <div className="row g-3 mb-4">
                    {promotions.filter(p => p.isValid).map((promotion) => (
                      <div key={promotion._id} className="col-12">
                        <Card 
                          className={`promotion-card ${currentPromotionId === promotion._id ? 'current' : ''}`}
                          style={{ 
                            backgroundColor: currentPromotionId === promotion._id ? "rgba(40, 167, 69, 0.2)" : "rgba(255,255,255,0.1)",
                            borderColor: currentPromotionId === promotion._id ? "#28a745" : "rgba(255,255,255,0.3)",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                          onClick={() => handleApplyPromotion(promotion)}
                        >
                          <Card.Body className="py-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-2">
                                  <FaTag className="me-2 text-primary" />
                                  <h6 className="mb-0 fw-bold">{promotion.code}</h6>
                                  {currentPromotionId === promotion._id && (
                                    <Badge bg="success" className="ms-2">Applied</Badge>
                                  )}
                                  <Badge bg="success" className="ms-2">Available</Badge>
                                </div>
                                
                                <p className="mb-2 small" style={{color: 'rgba(255,255,255,0.7)'}}>{promotion.description}</p>
                                
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <span className="text-success fw-bold">
                                      Save {Utils.formatCurrency(promotion.discount)}
                                    </span>
                                  </div>
                                  
                                  <div className="text-end">
                                    <div className="small">
                                      {promotion.minOrderAmount && (
                                        <div className="text-success">
                                          Min: {Utils.formatCurrency(promotion.minOrderAmount)} ✓
                                        </div>
                                      )}
                                      {promotion.maxDiscount && (
                                        <div style={{color: 'rgba(255,255,255,0.6)'}}>
                                          Max: {Utils.formatCurrency(promotion.maxDiscount)}
                                        </div>
                                      )}
                                      {promotion.expiryDate && (
                                        <div className="text-success">
                                          Expires: {new Date(promotion.expiryDate).toLocaleDateString()} ✓
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}

                {/* Starting soon promotions */}
                {promotions.filter(p => !p.isValid).length > 0 && (
                  <>
                    <h6 className="mb-3 text-warning">
                      Starting Soon ({promotions.filter(p => !p.isValid).length})
                    </h6>
                    <div className="row g-3">
                      {promotions.filter(p => !p.isValid).map((promotion) => (
                        <div key={promotion._id} className="col-12">
                          <Card 
                            className="promotion-card disabled"
                            style={{ 
                              backgroundColor: "rgba(255, 193, 7, 0.1)",
                              borderColor: "rgba(255, 193, 7, 0.5)",
                              cursor: "not-allowed",
                              opacity: 0.8,
                              transition: "all 0.3s ease"
                            }}
                          >
                            <Card.Body className="py-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center mb-2">
                                    <FaTag className="me-2 text-warning" />
                                    <h6 className="mb-0 fw-bold">{promotion.code}</h6>
                                    <Badge bg="warning" className="ms-2" style={{color: 'white'}}>Starting Soon</Badge>
                                  </div>
                                  
                                  <p className="mb-2 small" style={{color: 'rgba(255,255,255,0.7)'}}>{promotion.description}</p>
                                  
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <span className="text-warning small fw-bold">
                                        {promotion.message}
                                      </span>
                                    </div>
                                    
                                    <div className="text-end">
                                      <div className="small">
                                        {promotion.minOrderAmount && (
                                          <div className={`${totalPrice >= promotion.minOrderAmount ? 'text-success' : 'text-warning'}`}>
                                            Min: {Utils.formatCurrency(promotion.minOrderAmount)}
                                            {totalPrice >= promotion.minOrderAmount ? ' ✓' : ' ✗'}
                                          </div>
                                        )}
                                        {promotion.maxDiscount && (
                                          <div style={{color: 'rgba(255,255,255,0.6)'}}>
                                            Max: {Utils.formatCurrency(promotion.maxDiscount)}
                                          </div>
                                        )}
                                        {(promotion.startDate || promotion.expiryDate) && (
                                          <div className="text-warning">
                                            Starts: {new Date(promotion.startDate || promotion.expiryDate).toLocaleDateString()}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer 
        style={{ 
          backgroundColor: "rgba(20, 30, 70, 0.95)", 
          borderColor: "rgba(255,255,255,0.2)"
        }}
      >
        <Button variant="outline-light" onClick={onHide} disabled={applying}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PromotionModal;
