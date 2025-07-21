import React, { useState, useEffect, useCallback } from "react";
import { Card, Badge, Button, Row, Col, Alert, Form, Container, Pagination } from "react-bootstrap";
import { FaCopy, FaCalendarAlt, FaPercentage, FaDollarSign } from "react-icons/fa";
import { useAppSelector, useAppDispatch } from "../../../../redux/store";
import PromotionActions from "../../../../redux/promotion/actions";
import Utils from "../../../../utils/Utils";
import "../../../../css/MyPromotion.css";
import { useSearchParams } from "react-router-dom";
import { showToast, ToastProvider } from "@components/ToastContainer";

const MyPromotion = () => {
  const dispatch = useAppDispatch();
  const { promotions, loading, error } = useAppSelector((state) => state.Promotion);
  const [searchParams, setSearchParams] = useSearchParams();

  // Debug Redux state
  console.log("🔍 Component: Redux state:", { promotions, loading, error });
  console.log("🔍 Component: promotions type:", typeof promotions, "isArray:", Array.isArray(promotions));

  // Ensure promotions is always an array and filter promotions for My Promotions
  const allPromotions = Array.isArray(promotions) ? promotions : [];
  const safePromotions = allPromotions.filter(promotion => {
    // Filter out expired promotions
    const now = new Date();
    const endDate = new Date(promotion.endDate);
    if (now > endDate) {
      return false; // Don't show expired promotions
    }

    // PUBLIC promotions are available to all users (no need to claim)
    if (promotion.type === 'PUBLIC') {
      return true;
    }
    // PRIVATE promotions must be claimed
    return promotion.isClaimed === true;
  });
  
  // Pagination states
  const pageParam = searchParams.get("page");
  const sortParam = searchParams.get("sort");
  const statusParam = searchParams.get("status");
  const typeParam = searchParams.get("type");
  const searchParam = searchParams.get("search");
  
  const [activePage, setActivePage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 4;
  
  // Filter states
  const [filters, setFilters] = useState({
    status: statusParam || "all",
    promotionType: searchParams.get("promotionType") || "all", // PUBLIC/PRIVATE filter
    searchCode: searchParam || "",
    sortOption: sortParam || "availability" // Default to availability sort
  });

  // Function to update URL with current filters and page
  const updateURL = useCallback((params) => {
    const newParams = new URLSearchParams(searchParams);

    // Update or add parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== "all") {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });

    // Update URL without reloading the page
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Sync component state with URL parameters when URL changes
  useEffect(() => {
    const newPage = pageParam ? parseInt(pageParam) : 1;
    const newSort = sortParam || "date-desc";
    const newStatus = statusParam || "all";
    const newType = typeParam || "all";
    const newSearch = searchParam || "";

    setActivePage(newPage);
    setFilters(prev => ({
      ...prev,
      status: newStatus,
      discountType: newType,
      searchCode: newSearch,
      sortOption: newSort
    }));
  }, [pageParam, sortParam, statusParam, typeParam, searchParam]);

  // Apply filters and pagination to promotions
  const getFilteredPromotions = useCallback((data = safePromotions) => {
    // Ensure data is always an array
    if (!Array.isArray(data)) {
      console.warn("🚨 Component: promotions is not an array:", data);
      return {
        paginatedPromotions: [],
        totalFilteredCount: 0,
      };
    }

    let filtered = [...data];

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(promo => {
        const status = getPromotionStatus(promo).status;
        return status === filters.status;
      });
    }

    // Filter by promotion type (PUBLIC/PRIVATE)
    if (filters.promotionType !== "all") {
      filtered = filtered.filter(promo => promo.type === filters.promotionType);
    }

    // Filter by code search
    if (filters.searchCode) {
      filtered = filtered.filter(promo => 
        promo.code.toLowerCase().includes(filters.searchCode.toLowerCase()) ||
        promo.name?.toLowerCase().includes(filters.searchCode.toLowerCase()) ||
        promo.description.toLowerCase().includes(filters.searchCode.toLowerCase())
      );
    }

    // Apply sort
    switch (filters.sortOption) {
      case "availability":
        filtered.sort((a, b) => {
          // Priority 1: Sort by status only (ignore PUBLIC/PRIVATE)
          const statusA = getPromotionStatus(a).status;
          const statusB = getPromotionStatus(b).status;

          // Status priority: active (available) > upcoming (coming soon) > used up
          const statusPriority = {
            'active': 1,        // Available first
            'upcoming': 2,      // Coming soon second
            'used up': 3,       // Used up last
            'expired': 4,       // Expired (should be filtered out but just in case)
            'inactive': 5       // Inactive (should be filtered out but just in case)
          };
          const priorityA = statusPriority[statusA] || 6;
          const priorityB = statusPriority[statusB] || 6;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // Priority 2: Within same status, sort by claimed date (newest first)
          return new Date(b.claimedAt || b.createdAt) - new Date(a.claimedAt || a.createdAt);
        });
        break;
      case "discount-high":
        filtered.sort((a, b) => {
          // Priority 1: Sort by status first (available > coming soon > used up)
          const statusA = getPromotionStatus(a).status;
          const statusB = getPromotionStatus(b).status;

          const statusPriority = {
            'active': 1,        // Available first
            'upcoming': 2,      // Coming soon second
            'used up': 3,       // Used up last
            'expired': 4,       // Expired
            'inactive': 5       // Inactive
          };
          const priorityA = statusPriority[statusA] || 6;
          const priorityB = statusPriority[statusB] || 6;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // Priority 2: Within same status, sort by discount value (high to low)
          return b.discountValue - a.discountValue;
        });
        break;
      case "discount-low":
        filtered.sort((a, b) => {
          // Priority 1: Sort by status first (available > coming soon > used up)
          const statusA = getPromotionStatus(a).status;
          const statusB = getPromotionStatus(b).status;

          const statusPriority = {
            'active': 1,        // Available first
            'upcoming': 2,      // Coming soon second
            'used up': 3,       // Used up last
            'expired': 4,       // Expired
            'inactive': 5       // Inactive
          };
          const priorityA = statusPriority[statusA] || 6;
          const priorityB = statusPriority[statusB] || 6;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // Priority 2: Within same status, sort by discount value (low to high)
          return a.discountValue - b.discountValue;
        });
        break;
      case "date-desc":
        filtered.sort((a, b) => {
          // Priority 1: Sort by status first (available > coming soon > used up)
          const statusA = getPromotionStatus(a).status;
          const statusB = getPromotionStatus(b).status;

          const statusPriority = {
            'active': 1,        // Available first
            'upcoming': 2,      // Coming soon second
            'used up': 3,       // Used up last
            'expired': 4,       // Expired
            'inactive': 5       // Inactive
          };
          const priorityA = statusPriority[statusA] || 6;
          const priorityB = statusPriority[statusB] || 6;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // Priority 2: Within same status, PUBLIC first, then PRIVATE
          if (a.type === 'PUBLIC' && b.type === 'PRIVATE') return -1;
          if (a.type === 'PRIVATE' && b.type === 'PUBLIC') return 1;

          // Priority 3: Then by claimed date (newest first)
          return new Date(b.claimedAt || b.createdAt) - new Date(a.claimedAt || a.createdAt);
        });
        break;
      case "date-asc":
        filtered.sort((a, b) => {
          // Priority 1: Sort by status first (available > coming soon > used up)
          const statusA = getPromotionStatus(a).status;
          const statusB = getPromotionStatus(b).status;

          const statusPriority = {
            'active': 1,        // Available first
            'upcoming': 2,      // Coming soon second
            'used up': 3,       // Used up last
            'expired': 4,       // Expired
            'inactive': 5       // Inactive
          };
          const priorityA = statusPriority[statusA] || 6;
          const priorityB = statusPriority[statusB] || 6;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // Priority 2: Within same status, sort by end date (oldest first)
          return new Date(a.endDate) - new Date(b.endDate);
        });
        break;
      case "name-asc":
        filtered.sort((a, b) => {
          // Priority 1: Sort by status first (available > coming soon > used up)
          const statusA = getPromotionStatus(a).status;
          const statusB = getPromotionStatus(b).status;

          const statusPriority = {
            'active': 1,        // Available first
            'upcoming': 2,      // Coming soon second
            'used up': 3,       // Used up last
            'expired': 4,       // Expired
            'inactive': 5       // Inactive
          };
          const priorityA = statusPriority[statusA] || 6;
          const priorityB = statusPriority[statusB] || 6;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // Priority 2: Within same status, sort by name (A to Z)
          return (a.name || a.code).localeCompare(b.name || b.code);
        });
        break;
      default:
        // Default: Sort by availability (available > coming soon > used up)
        filtered.sort((a, b) => {
          const statusA = getPromotionStatus(a).status;
          const statusB = getPromotionStatus(b).status;

          const statusPriority = {
            'active': 1,        // Available first
            'upcoming': 2,      // Coming soon second
            'used up': 3,       // Used up last
            'expired': 4,       // Expired
            'inactive': 5       // Inactive
          };
          const priorityA = statusPriority[statusA] || 6;
          const priorityB = statusPriority[statusB] || 6;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // Within same status, sort by end date (newest first)
          return new Date(b.endDate) - new Date(a.endDate);
        });
        break;
    }

    // Apply pagination
    const startIndex = (activePage - 1) * itemsPerPage;
    return {
      paginatedPromotions: filtered.slice(startIndex, startIndex + itemsPerPage),
      totalFilteredCount: filtered.length,
    };
  }, [safePromotions, filters, activePage, itemsPerPage]);

  useEffect(() => {
    const fetchPromotions = () => {
      console.log("🎯 Component: Dispatching FETCH_USER_PROMOTIONS action");
      dispatch({
        type: PromotionActions.FETCH_USER_PROMOTIONS,
        payload: {
          onSuccess: (data) => {
            console.log("✅ Component: Fetched promotions successfully:", data);
          },
          onFailed: (msg) => {
            console.error("❌ Component: Failed to fetch promotions:", msg);
          },
          onError: (error) => {
            console.error("💥 Component: Error fetching promotions:", error);
          }
        }
      });
    };

    fetchPromotions();
  }, [dispatch]);

  useEffect(() => {
    if (safePromotions.length > 0) {
      const { totalFilteredCount } = getFilteredPromotions();
      const newTotalPages = Math.ceil(totalFilteredCount / itemsPerPage);
      setTotalPages(newTotalPages);

      // If current page is greater than total pages, adjust it
      if (activePage > newTotalPages && newTotalPages > 0) {
        setActivePage(newTotalPages);
        updateURL({ page: newTotalPages });
      }
    }
  }, [safePromotions, filters, activePage, getFilteredPromotions, updateURL]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setActivePage(newPage);
    updateURL({ page: newPage });
  };

  // Handle filter changes
  const handleSortChange = (newSort) => {
    setFilters(prev => ({ ...prev, sortOption: newSort }));
    setActivePage(1);
    updateURL({ sort: newSort, page: 1 });
  };

  const handleStatusFilterChange = (newStatus) => {
    setFilters(prev => ({ ...prev, status: newStatus }));
    setActivePage(1);
    updateURL({ status: newStatus, page: 1 });
  };



  const handlePromotionTypeFilterChange = (newPromotionType) => {
    setFilters(prev => ({ ...prev, promotionType: newPromotionType }));
    setActivePage(1);
    updateURL({ promotionType: newPromotionType, page: 1 });
  };

  const handleSearchChange = (newSearch) => {
    setFilters(prev => ({ ...prev, searchCode: newSearch }));
    setActivePage(1);
    updateURL({ search: newSearch, page: 1 });
  };





  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // Có thể thêm toast notification ở đây
    showToast.success(`Promotion code "${code}" copied to clipboard!`);
  };

  const getPromotionStatusHelper = (promotion, now = new Date(), startDate = null, endDate = null) => {
    if (!startDate) startDate = new Date(promotion.startDate);
    if (!endDate) endDate = new Date(promotion.endDate);
    
    if (now < startDate) {
      return "upcoming";
    } else if (now > endDate) {
      return "expired";
    } else if (!promotion.isActive) {
      return "inactive";
    } else if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return "used_up";
    } else {
      return "active";
    }
  };

  const getPromotionStatus = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    // Check user-specific usage first
    if (promotion.userUsedCount >= (promotion.maxUsagePerUser || 1)) {
      return { status: "used up", label: "Used Up", variant: "warning" };
    }

    const status = getPromotionStatusHelper(promotion, now, startDate, endDate);

    switch (status) {
      case "upcoming":
        return { status: "upcoming", label: "Starting Soon", variant: "info" };
      case "expired":
        return { status: "expired", label: "Expired", variant: "secondary" };
      case "inactive":
        return { status: "inactive", label: "Inactive", variant: "secondary" };
      case "used_up":
        return { status: "used up", label: "Limit Reached", variant: "danger" };
      default:
        return { status: "active", label: "Available", variant: "success" };
    }
  };

  const formatDiscount = (promotion) => {
    if (promotion.discountType === "PERCENTAGE") {
      return `${promotion.discountValue}% OFF`;
    } else {
      return `${Utils.formatCurrency(promotion.discountValue)} OFF`;
    }
  };

  const { paginatedPromotions } = getFilteredPromotions();

  return (
    <Container fluid className="bg-light py-4">
      <h2 className="fw-bold mb-4">My Promotions</h2>
      <ToastProvider/>
      {/* Filter and Sort Controls */}
      <Row className="mb-4 align-items-center">
        <Col xs="auto">
          <span className="me-2">Filter:</span>
        </Col>
        <Col xs="auto">
          <Form.Select
            className="border-primary"
            style={{ width: "200px" }}
            value={filters.sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="availability">Availability (Available → Coming Soon → Used Up)</option>
            <option value="date-desc">Date (Newest first)</option>
            <option value="date-asc">Date (Oldest first)</option>
            <option value="discount-high">Discount (High to low)</option>
            <option value="discount-low">Discount (Low to high)</option>
            <option value="name-asc">Name (A to Z)</option>
          </Form.Select>
        </Col>
        <Col xs="auto">
          <Form.Select
            style={{ width: "140px" }}
            value={filters.status}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
          </Form.Select>
        </Col>
        <Col xs="auto">
          <Form.Select
            style={{ width: "120px" }}
            value={filters.promotionType}
            onChange={(e) => handlePromotionTypeFilterChange(e.target.value)}
          >
            <option value="all">All</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </Form.Select>
        </Col>
        <Col className="ms-auto">
          <Form.Control
            type="text"
            placeholder="Search promotions..."
            style={{ width: "200px" }}
            value={filters.searchCode}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      ) : paginatedPromotions.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">
            {safePromotions.length === 0
              ? "No promotions available at the moment."
              : "No promotions found matching your criteria."
            }
          </p>

        </div>
      ) : (
        paginatedPromotions.map((promotion) => {
          const statusInfo = getPromotionStatus(promotion);
          const isUsable = statusInfo.status === "active";
          
          return (
            <Card 
              key={promotion._id} 
              className="mb-3 border-0 shadow-sm"
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="p-0">
                <Row className="g-0" style={{ justifyContent: "space-between" }}>
                  {/* Left side - Promotion info */}
                  <Col md={8} className="border-end">
                    <Card className="border-0">
                      <Row className="g-0 p-3">
                        <Col xs={2} className="d-flex align-items-center justify-content-center">
                          {promotion.discountType === "PERCENTAGE" ? (
                            <FaPercentage size={32} className="text-primary" />
                          ) : (
                            <FaDollarSign size={32} className="text-success" />
                          )}
                        </Col>
                        <Col xs={10} className="ps-3">
                          <div className="d-flex align-items-center mb-2">
                            <h5 className="fw-bold mb-0 me-3">{promotion.name || promotion.code}</h5>
                            <Badge bg={statusInfo.variant} className="me-2">{statusInfo.label}</Badge>
                            {promotion.type && (
                              <Badge bg={promotion.type === 'PRIVATE' ? 'warning' : 'info'} variant="outline">
                                {promotion.type}
                              </Badge>
                            )}
                          </div>
                          <p className="mb-2 text-muted">{promotion.description}</p>
                          <div className="d-flex flex-wrap gap-3 small text-muted">
                            <span>
                              <strong>Code:</strong> {promotion.code}
                            </span>
                            <span>
                              <strong>Min Order:</strong> {Utils.formatCurrency(promotion.minOrderAmount)}
                            </span>
                            {promotion.maxDiscountAmount && (
                              <span>
                                <strong>Max Discount:</strong> {Utils.formatCurrency(promotion.maxDiscountAmount)}
                              </span>
                            )}
                            <span>
                              <FaCalendarAlt className="me-1" />
                              {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                            </span>
                            {promotion.claimedAt && (
                              <span>
                                <strong>Claimed:</strong> {new Date(promotion.claimedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Right side - Discount & Action */}
                  <Col md={4}>
                    <Card className="border-0">
                      <Card.Body className="text-center">
                        <div className="mb-3">
                          <h3 className="text-primary fw-bold mb-1">
                            {formatDiscount(promotion)}
                          </h3>
                          <small className="text-muted">Discount</small>
                        </div>
                        
                        <div className="mb-3 p-2 bg-light rounded">
                          <small className="text-muted d-block">Promotion Code</small>
                          <strong className="text-dark">{promotion.code}</strong>
                        </div>
                        
                        <Button
                          variant={isUsable ? "primary" : "outline-secondary"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(promotion.code);
                          }}
                          disabled={!isUsable}
                          className="w-100"
                        >
                          <FaCopy className="me-1" />
                          {isUsable ? "Copy Code" : "Not Available"}
                        </Button>
                        
                        <div className="mt-2 small text-muted">
                          <div>
                            <strong>Your Usage:</strong> {promotion.userUsedCount || 0}/{promotion.maxUsagePerUser || 1}
                          </div>
                          <div>
                            <strong>Global Usage:</strong> {promotion.usageLimit ? `${promotion.usedCount || 0}/${promotion.usageLimit}` : 'Unlimited'}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First onClick={() => handlePageChange(1)} disabled={activePage === 1} />
            <Pagination.Prev
              onClick={() => handlePageChange(Math.max(1, activePage - 1))}
              disabled={activePage === 1}
            />

            {(() => {
              // Logic to show 5 pages at a time
              const pageBuffer = 2; // Show 2 pages before and after current page
              let startPage = Math.max(1, activePage - pageBuffer);
              let endPage = Math.min(totalPages, activePage + pageBuffer);

              // Adjust if we're at the beginning or end
              if (endPage - startPage + 1 < 5 && totalPages > 5) {
                if (activePage <= 3) {
                  // Near the beginning
                  endPage = Math.min(5, totalPages);
                } else if (activePage >= totalPages - 2) {
                  // Near the end
                  startPage = Math.max(1, totalPages - 4);
                }
              }

              const pages = [];

              // Add first page with ellipsis if needed
              if (startPage > 1) {
                pages.push(
                  <Pagination.Item key={1} active={1 === activePage} onClick={() => handlePageChange(1)}>
                    <b style={{ color: 1 === activePage ? "white" : "#0d6efd" }}>1</b>
                  </Pagination.Item>
                );
                if (startPage > 2) {
                  pages.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
                }
              }

              // Add page numbers
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <Pagination.Item key={i} active={i === activePage} onClick={() => handlePageChange(i)}>
                    <b style={{ color: i === activePage ? "white" : "#0d6efd" }}>{i}</b>
                  </Pagination.Item>
                );
              }

              // Add last page with ellipsis if needed
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
                }
                pages.push(
                  <Pagination.Item
                    key={totalPages}
                    active={totalPages === activePage}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    <b
                      style={{
                        color: totalPages === activePage ? "white" : "#0d6efd",
                      }}
                    >
                      {totalPages}
                    </b>
                  </Pagination.Item>
                );
              }

              return pages;
            })()}

            <Pagination.Next
              onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
              disabled={activePage === totalPages}
            />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={activePage === totalPages} />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default MyPromotion;
