import React, { useState, useEffect } from "react";
import { Modal, Button, Card, Badge, Spinner, Form, ProgressBar } from "react-bootstrap";
import { FaTag, FaTimes, FaCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPromotions, applyPromotion, clearAppliedPromotion } from "../../../../redux/promotion/actions";
import Utils from "../../../../utils/Utils";
import "../../../../css/PromotionModal.css";

const PromotionModal = ({ show, onHide, totalPrice, onApplyPromotion, currentPromotionId }) => {
  const dispatch = useDispatch();
  const {
    allPromotions: promotions,
    allPromotionsLoading: loading,
    allPromotionsError,
    applyLoading: applying,
    applyError,
    appliedPromotion
  } = useSelector(state => state.Promotion);

  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    if (show && totalPrice > 0) {
      dispatch(fetchAllPromotions({
        totalPrice,
        onSuccess: (data) => {
          console.log("✅ Promotions fetched successfully:", data);
        },
        onFailed: (error) => {
          console.error("❌ Failed to fetch promotions:", error);
        }
      }));
    }
  }, [show, totalPrice, dispatch]);

  // Handle apply promotion success
  useEffect(() => {
    if (appliedPromotion && selectedPromotion) {
      onApplyPromotion({
        code: selectedPromotion.code, // Use code from selected promotion
        discount: appliedPromotion.discount,
        message: `Promotion applied: -${Utils.formatCurrency(appliedPromotion.discount)}`,
        promotionId: appliedPromotion.promotionId || appliedPromotion._id,
      });
      onHide();
      // Reset selected promotion and clear applied promotion from Redux
      setSelectedPromotion(null);
      dispatch(clearAppliedPromotion());
    }
  }, [appliedPromotion, selectedPromotion, onApplyPromotion, onHide, dispatch]);

  const handleApplyPromotion = (promotion) => {
    // Check if promotion is valid based on current data
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    const isInTimeRange = now >= startDate && now <= endDate;
    const meetsMinOrder = totalPrice >= (promotion.minOrderValue || promotion.minOrderAmount || 0);
    const isActive = promotion.isActive !== false;
    const isValid = isInTimeRange && meetsMinOrder && isActive;

    if (!isValid) {
      console.log("Promotion is not valid:", promotion.code);
      return;
    }

    // Set selected promotion so we can use it when apply succeeds
    setSelectedPromotion(promotion);

    dispatch(applyPromotion({
      code: promotion.code,
      orderAmount: totalPrice,
      onSuccess: (data) => {
        console.log("✅ Promotion applied successfully:", data);
      },
      onFailed: (error) => {
        console.error("❌ Failed to apply promotion:", error);
        // Reset selected promotion on failure
        setSelectedPromotion(null);
      }
    }));
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



  const handleApplyManualCode = () => {
    if (!manualCode.trim()) return;

    // Create a fake promotion object for manual code
    const manualPromotion = {
      code: manualCode.trim(),
      _id: 'manual-' + manualCode.trim()
    };

    setSelectedPromotion(manualPromotion);
    handleApplyPromotion(manualPromotion);
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
        ) : allPromotionsError ? (
          <div className="text-center py-4">
            <div className="text-danger mb-2">Failed to load promotions</div>
            <div className="text-muted small">{allPromotionsError}</div>
            <Button
              variant="outline-light"
              size="sm"
              className="mt-2"
              onClick={() => dispatch(fetchAllPromotions({ totalPrice }))}
            >
              Retry
            </Button>
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

            {/* Manual promotion code input */}
            <div className="mb-4">
              <h6 className="mb-3">Enter Promotion Code</h6>
              <Card style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)" }}>
                <Card.Body className="py-3">
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      placeholder="Enter promotion code..."
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white"
                      }}
                      disabled={applying}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && manualCode.trim() && !applying) {
                          handleApplyManualCode();
                        }
                      }}
                    />
                    <Button
                      variant="primary"
                      onClick={handleApplyManualCode}
                      disabled={applying || !manualCode.trim()}
                    >
                      {applying ? (
                        <>
                          <Spinner size="sm" className="me-1" />
                          Applying...
                        </>
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                  <small className="text-muted mt-2 d-block">
                    Enter a promotion code to apply it to your order
                  </small>
                </Card.Body>
              </Card>
            </div>

            {/* Promotions section */}
            <h6 className="mb-3">
              Available Promotions
              <span className="small ms-2" style={{color: 'rgba(255,255,255,0.6)'}}>
                ({promotions.filter(p => {
                  const now = new Date();
                  const startDate = new Date(p.startDate);
                  const endDate = new Date(p.endDate);
                  const isInTimeRange = now >= startDate && now <= endDate;
                  const meetsMinOrder = totalPrice >= (p.minOrderValue || p.minOrderAmount || 0);
                  return isInTimeRange && meetsMinOrder && p.isActive && p.userCanUse !== false;
                }).length} ready, {promotions.filter(p => {
                  const now = new Date();
                  const startDate = new Date(p.startDate);
                  const endDate = new Date(p.endDate);
                  const isInTimeRange = now >= startDate && now <= endDate;
                  const meetsMinOrder = totalPrice >= (p.minOrderValue || p.minOrderAmount || 0);
                  return isInTimeRange && meetsMinOrder && p.isActive && p.userCanUse === false;
                }).length} used up, {promotions.filter(p => {
                  const now = new Date();
                  const startDate = new Date(p.startDate);
                  return now < startDate && p.isActive;
                }).length} starting soon)
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
                {promotions.filter(p => {
                  const now = new Date();
                  const startDate = new Date(p.startDate);
                  const endDate = new Date(p.endDate);
                  const isInTimeRange = now >= startDate && now <= endDate;
                  const meetsMinOrder = totalPrice >= (p.minOrderValue || p.minOrderAmount || 0);
                  return isInTimeRange && meetsMinOrder && p.isActive;
                }).length > 0 && (
                  <div className="row g-3 mb-4">
                    {promotions.filter(p => {
                      const now = new Date();
                      const startDate = new Date(p.startDate);
                      const endDate = new Date(p.endDate);
                      const isInTimeRange = now >= startDate && now <= endDate;
                      const meetsMinOrder = totalPrice >= (p.minOrderValue || p.minOrderAmount || 0);
                      return isInTimeRange && meetsMinOrder && p.isActive;
                    }).map((promotion) => {
                      // Calculate discount for display
                      let discount = 0;
                      if (promotion.discountType === "PERCENTAGE") {
                        discount = Math.min((totalPrice * promotion.discountValue) / 100, promotion.maxDiscountAmount || Infinity);
                      } else {
                        discount = Math.min(promotion.discountValue, promotion.maxDiscountAmount || Infinity);
                      }

                      return (
                      <div key={promotion._id} className="col-12">
                        <Card
                          className={`promotion-card ${currentPromotionId === promotion._id ? 'current' : ''} ${promotion.userCanUse === false ? 'disabled' : ''}`}
                          style={{
                            backgroundColor: promotion.userCanUse === false
                              ? "rgba(108, 117, 125, 0.2)"
                              : currentPromotionId === promotion._id
                                ? "rgba(40, 167, 69, 0.2)"
                                : "rgba(255,255,255,0.1)",
                            borderColor: promotion.userCanUse === false
                              ? "rgba(108, 117, 125, 0.5)"
                              : currentPromotionId === promotion._id
                                ? "#28a745"
                                : "rgba(255,255,255,0.3)",
                            cursor: promotion.userCanUse === false ? "not-allowed" : "pointer",
                            opacity: promotion.userCanUse === false ? 0.6 : 1,
                            transition: "all 0.3s ease"
                          }}
                          onClick={() => promotion.userCanUse !== false && handleApplyPromotion(promotion)}
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
                                  {promotion.userCanUse !== false && (
                                    <Badge bg="success" className="ms-2">Available</Badge>
                                  )}
                                  {promotion.userCanUse === false && (
                                    <Badge bg="secondary" className="ms-2">Used Up</Badge>
                                  )}
                                </div>

                                {/* Usage information */}
                                {promotion.maxUsagePerUser && (
                                  <div className="mb-2">
                                    <small style={{color: 'rgba(255,255,255,0.8)'}}>
                                      <strong>Your Usage:</strong> {promotion.userUsedCount || 0}/{promotion.maxUsagePerUser}
                                      {promotion.userCanUse === false && (
                                        <span className="text-warning ms-1">(Limit reached)</span>
                                      )}
                                    </small>
                                  </div>
                                )}

                                {/* Global usage information with progress bar */}
                                {promotion.usageLimit && (
                                  <div className="mb-2">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                      <small style={{color: 'rgba(255,255,255,0.7)'}}>
                                        <strong>Global Usage:</strong>
                                      </small>
                                      <small style={{color: 'rgba(255,255,255,0.7)'}}>
                                        {Math.round(((promotion.usedCount || 0) / promotion.usageLimit) * 100)}%
                                      </small>
                                    </div>
                                    <ProgressBar
                                      now={Math.min(((promotion.usedCount || 0) / promotion.usageLimit) * 100, 100)}
                                      variant={
                                        ((promotion.usedCount || 0) / promotion.usageLimit) >= 1.0 ? 'danger' :
                                        ((promotion.usedCount || 0) / promotion.usageLimit) >= 0.9 ? 'danger' :
                                        ((promotion.usedCount || 0) / promotion.usageLimit) >= 0.7 ? 'warning' :
                                        ((promotion.usedCount || 0) / promotion.usageLimit) >= 0.5 ? 'info' : 'success'
                                      }
                                      style={{
                                        height: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                      }}
                                      animated={((promotion.usedCount || 0) / promotion.usageLimit) >= 0.9}
                                    />
                                    {(() => {
                                      const usagePercent = ((promotion.usedCount || 0) / promotion.usageLimit) * 100;
                                      if (promotion.usedCount >= promotion.usageLimit) {
                                        return (
                                          <small className="text-danger mt-1 d-block">
                                            <strong>🚫 Exhausted</strong>
                                          </small>
                                        );
                                      } else if (usagePercent >= 90) {
                                        return (
                                          <small className="text-warning mt-1 d-block">
                                            <strong>⚠️ Almost full</strong>
                                          </small>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                )}

                                {/* Show unlimited usage info */}
                                {!promotion.usageLimit && (
                                  <div className="mb-2">
                                    <small style={{color: 'rgba(255,255,255,0.7)'}}>
                                      <strong>Global Usage:</strong> Unlimited
                                    </small>
                                  </div>
                                )}
                                
                                <p className="mb-2 small" style={{color: 'rgba(255,255,255,0.7)'}}>{promotion.description}</p>
                                
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <span className="text-success fw-bold">
                                      Save {Utils.formatCurrency(discount)}
                                    </span>
                                  </div>

                                  <div className="text-end">
                                    <div className="small">
                                      {(promotion.minOrderValue || promotion.minOrderAmount) && (
                                        <div className="text-success">
                                          Min: {Utils.formatCurrency(promotion.minOrderValue || promotion.minOrderAmount)} ✓
                                        </div>
                                      )}
                                      {(promotion.maxDiscountAmount || promotion.maxDiscount) && (
                                        <div style={{color: 'rgba(255,255,255,0.6)'}}>
                                          Max: {Utils.formatCurrency(promotion.maxDiscountAmount || promotion.maxDiscount)}
                                        </div>
                                      )}
                                      {(promotion.endDate || promotion.expiryDate) && (
                                        <div className="text-success">
                                          Expires: {new Date(promotion.endDate || promotion.expiryDate).toLocaleDateString()} ✓
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
                      );
                    })}
                  </div>
                )}

                {/* Starting soon promotions */}
                {promotions.filter(p => {
                  const now = new Date();
                  const startDate = new Date(p.startDate);
                  return now < startDate && p.isActive;
                }).length > 0 && (
                  <>
                    <h6 className="mb-3 text-warning">
                      Starting Soon ({promotions.filter(p => {
                        const now = new Date();
                        const startDate = new Date(p.startDate);
                        return now < startDate && p.isActive;
                      }).length})
                    </h6>
                    <div className="row g-3">
                      {promotions.filter(p => {
                        const now = new Date();
                        const startDate = new Date(p.startDate);
                        return now < startDate && p.isActive;
                      }).map((promotion) => (
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
