import { FaPaperPlane } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAppSelector } from "@redux/store";
import { useDispatch } from "react-redux";
import MessageActions from "@redux/message/actions";
import Utils from "@utils/Utils";
import { initializeSocket } from "@redux/socket/socketSlice";
import moment from "moment-timezone";
import "@css/customer/ChatPage.css";

function CustomerChat() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location?.state?.receiver) {
      setSelectedUser(location.state.receiver);

      // Xóa dữ liệu trong location.state (tránh truyền lại receiver)
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const Auth = useAppSelector((state) => state.Auth.Auth);
  const Socket = useAppSelector((state) => state.Socket.socket);
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [showSidebar, setShowSidebar] = useState(true);
  const [userMessages, setUserMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isReadLast, setIsReadLast] = useState(false);
  // Ref cho container tin nhắn để scroll xuống cuối
  const messagesEndRef = useRef(null);

  const fetchAllUser = () => {
    dispatch({
      type: MessageActions.FETCH_ALL_USERS_BY_USERID,
      payload: {
        onSuccess: (users) => {
          setUsers(users);
          setSelectedUser((prevSelectedUser) => {
            if (!prevSelectedUser && users.length >= 1) {
              return users[0];
            } else if (prevSelectedUser?._id === users[0]?._id) {
              return users[0];
            }
            return prevSelectedUser;
          });
        },
        onFailed: (msg) => console.error("Failed to fetch rooms:", msg),
        onError: (err) => console.error("Server error:", err),
      },
    });
  };

  const fetchHistoryChat = () => {
    if (selectedUser?._id) {
      dispatch({
        type: MessageActions.FETCH_HISTORY_MESSAGE,
        payload: {
          receiverId: selectedUser?._id,
          onSuccess: (messages) => {
            setUserMessages(messages);
            setIsReadLast(messages[messages.length - 1].isRead);
          },
          onFailed: (msg) => console.error("Failed to fetch rooms:", msg),
          onError: (err) => console.error("Server error:", err),
        },
      });
    }
  };

  useEffect(() => {
    dispatch(initializeSocket());
  }, [dispatch]);

  useEffect(() => {
    fetchAllUser();
  }, []);

  useEffect(() => {
    fetchHistoryChat();
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [userMessages, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("Socket ABC:", Socket?.id);
    if (!Socket) return;
    if (Auth?._id === -1) return;
    if (!selectedUser?._id) return;

    Socket.emit("join-room", {
      userId: Auth._id,
      partnerId: selectedUser._id,
    });
  }, [Socket, Auth?._id, selectedUser?._id]);

  // Nhận message và markAsRead
  useEffect(() => {
    if (!Socket || !Auth?._id) return;

    const handleReceiveMessage = (msg) => {
      if (Auth._id === msg.receiverId && msg.senderId === selectedUser?._id) {
        setUserMessages((prev) => [...prev, msg]);
      }
      fetchAllUser();
    };

    const handleMarkAsRead = (msg) => {
      if (selectedUser?._id == msg.senderId) {
        setUserMessages((prevMessages) =>
          prevMessages.map((message) => {
            if (
              message.senderId === msg.receiverId &&
              message.receiverId === msg.senderId &&
              !message.isRead
            ) {
              return { ...message, isRead: true };
            }
            return message;
          })
        );
      }
    };

    Socket.on("receive-message", handleReceiveMessage);
    Socket.on("receive-markAsRead", handleMarkAsRead);

    return () => {
      Socket.off("receive-message", handleReceiveMessage);
      Socket.off("receive-markAsRead", handleMarkAsRead);
    };
  }, [Socket, Auth?._id, selectedUser?._id]);

  console.log("users: ", users);
  // Gửi tin nhắn
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const msgData = {
      senderId: Auth._id,
      receiverId: selectedUser?._id,
      message: newMessage,
      timestamp: Date.now(), // timestamp phía client (tuỳ bạn)
    };

    Socket.emit("send-message", msgData);

    // Thêm tin nhắn vào giao diện tạm thời
    setUserMessages((prev) => [...prev, msgData]);
    setNewMessage("");
    fetchAllUser();
  };

  // Chọn người dùng
  const selectUser = (user) => {
    setSelectedUser(user);
    setShowSidebar(false);
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === user.id ? { ...u, unread: 0 } : u))
    );
  };

  // Tìm kiếm người dùng
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = users.filter((user) =>
    user?.name?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Check if we're on mobile
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (isMobile()) {
        setShowSidebar(true);
      } else {
        setShowSidebar(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSeen = () => {
    if (selectedUser) {
      Socket.emit("markAsRead", {
        senderId: selectedUser._id,
        receiverId: Auth._id,
      });
      fetchAllUser();
    }
  };
  return (
    <div style={styles.container}>
      {/* Sidebar - Danh sách người dùng */}
      {(showSidebar || !isMobile()) && (
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h5 style={styles.sidebarTitle}>Chat Box</h5>
            <div style={styles.search}>
              <i style={styles.searchIcon} className="bi bi-search"></i>
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div style={styles.hotelList}>
            {filteredUsers.map((user) => {
              return (
                <div
                  key={user._id}
                  style={{
                    ...styles.hotelItem,
                    ...(selectedUser?._id === user?._id
                      ? styles.hotelItemActive
                      : {}),
                  }}
                  onClick={() => {
                    selectUser(user);
                    if (user) {
                      Socket.emit("markAsRead", {
                        senderId: user._id,
                        receiverId: Auth._id,
                      });
                      fetchAllUser();
                    }
                  }}
                >
                  <div style={styles.hotelAvatar}>
                    <img
                      style={styles.hotelAvatarImg}
                      src={
                        user?.image?.url ||
                        "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
                      }
                      alt={user.name}
                    />
                    <div
                      style={{
                        ...styles.onlineIndicator,
                        ...(user.status !== "online"
                          ? styles.onlineIndicatorOnline
                          : styles.onlineIndicatorOffline),
                      }}
                    ></div>
                  </div>
                  <div style={styles.hotelInfo}>
                    <div style={styles.hotelName}>
                      {user?.role === "OWNER"
                        ? user?.ownedHotels[0]?.hotelName ?? user?.name
                        : user?.name}
                    </div>
                    <div
                      style={{
                        ...styles.hotelLastMessage,
                        fontWeight:
                          !user.lastMessageIsRead && !user.isLastMessageFromMe
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {" "}
                      {user.isLastMessageFromMe && "You: "}
                      {user.lastMessage}
                    </div>
                  </div>
                  <div style={styles.hotelMeta}>
                    <div style={styles.hotelTime}>
                      {Utils.getFormattedMessageTime(user?.lastMessageAt)}
                    </div>
                    {!user.lastMessageIsRead && !user.isLastMessageFromMe && (
                      <div style={styles.hotelUnread}>
                        {user.lastMessageIsRead}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div style={styles.main}>
        {/* Header - Thông tin người dùng */}
        {selectedUser ? (
          <div style={styles.header}>
            <div style={styles.headerInfo}>
              {isMobile() && (
                <button style={styles.backButton} onClick={toggleSidebar}>
                  <IoArrowBack />
                </button>
              )}
              <div style={styles.avatar}>
                <img
                  style={styles.avatarImg}
                  src={
                    selectedUser?.image?.url ||
                    "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
                  }
                  alt={selectedUser?.name}
                />
                <div
                  style={{
                    ...styles.onlineIndicator,
                    ...(selectedUser?.status !== "online"
                      ? styles.onlineIndicatorOnline
                      : styles.onlineIndicatorOffline),
                  }}
                ></div>
              </div>
              <div>
                <h5 style={{ margin: 0 }}>
                  {" "}
                  {selectedUser?.role === "OWNER"
                    ? selectedUser?.ownedHotels[0]?.hotelName ??
                      selectedUser?.name
                    : selectedUser?.name}
                </h5>
                <small style={{ color: "#6c757d" }}>
                  Last seen a few minutes ago
                </small>
              </div>
            </div>

            <div style={styles.headerActions}>
              <button style={styles.headerActionsButton} title="Gọi điện">
                <i className="bi bi-telephone"></i>
              </button>
              <button style={styles.headerActionsButton} title="Thông tin">
                <i className="bi bi-info-circle"></i>
              </button>
              <button style={styles.headerActionsButton} title="Tùy chọn khác">
                <i className="bi bi-three-dots-vertical"></i>
              </button>
            </div>
          </div>
        ) : (
          <></>
        )}
        {/* Khu vực tin nhắn */}
        <div style={styles.messages}>
          {userMessages && userMessages.length > 0 ? (
            userMessages.map((message, index) => {
              const currentTime = moment(message.timestamp);
              const prevTime =
                index > 0 ? moment(userMessages[index - 1].timestamp) : null;
              const shouldShowDivider =
                index === 0 ||
                (prevTime && currentTime.diff(prevTime, "minutes") >= 60);
              return (
                <>
                  {shouldShowDivider && (
                    <div style={styles.dateDivider}>
                      <span style={styles.dateDividerSpan}>
                        {Utils.getFormattedMessageTime(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <div
                    key={message._id}
                    style={{
                      ...styles.message,
                      ...(message.senderId === Auth._id
                        ? styles.messageCustomer
                        : styles.messageHotel),
                    }}
                  >
                    <div
                      style={{
                        ...styles.messageContent,
                        ...(message.senderId === Auth._id
                          ? styles.messageContentCustomer
                          : styles.messageContentHotel),
                      }}
                    >
                      <div
                        className="message-container"
                        style={{
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            whiteSpace: "pre-line",
                            cursor: "default",
                          }}
                          className="message-bubble"
                        >
                          {message.message}
                        </div>

                        <span
                          className={
                            message.senderId == Auth._id
                              ? "hover-left"
                              : "hover-right"
                          }
                        >
                          {Utils.getFormattedMessageTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message status (only for the last message from current user) */}
                  {index === userMessages.length - 1 &&
                    message.senderId == Auth._id && (
                      <div style={styles.messageStatus}>
                        {message.isRead ? (
                          <>
                            Seen{" "}
                            <i
                              className="bi bi-check-all"
                              style={styles.messageStatusIcon}
                            ></i>
                          </>
                        ) : (
                          <>
                            Sent{" "}
                            <i
                              className="bi bi-check"
                              style={styles.messageStatusIcon}
                            ></i>
                          </>
                        )}
                      </div>
                    )}
                </>
              );
            })
          ) : (
            <div style={styles.emptyState}>
              <i style={styles.emptyStateIcon} className="bi bi-chat-dots"></i>
              <h3 style={styles.emptyStateTitle}>No have message</h3>
              <p style={styles.emptyStateText}>
                Start the conversation by sending the first message.
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Khu vực nhập tin nhắn */}
        <div style={styles.input}>
          <form style={styles.inputForm} onSubmit={sendMessage}>
            <div style={styles.inputField}>
              <textarea
                style={styles.inputFieldTextarea}
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onClick={handleSeen}
                onChange={(e) => {
                  if (selectedUser) {
                    Socket.emit("markAsRead", {
                      senderId: selectedUser._id,
                      receiverId: Auth._id,
                    });
                    fetchAllUser();
                  }
                  setNewMessage(e.target.value);
                }}
                rows="1"
              ></textarea>
            </div>
            <div style={styles.inputActions}>
              <button
                style={styles.inputActionsButton}
                type="button"
                title="Đính kèm file"
              >
                <i className="bi bi-paperclip"></i>
              </button>
              <button
                style={styles.inputActionsButton}
                type="button"
                title="Gửi hình ảnh"
              >
                <i className="bi bi-image"></i>
              </button>
              <button
                style={styles.inputActionsButton}
                type="button"
                title="Gửi vị trí"
              >
                <i className="bi bi-geo-alt"></i>
              </button>
            </div>
            <button
              style={styles.sendButton}
              type="submit"
              disabled={selectedUser === undefined}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Styles object
const styles = {
  body: {
    margin: 0,
    fontFamily:
      "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    backgroundColor: "#f8f9fa",
    overflowX: "hidden",
  },
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#fff",
  },
  sidebar: {
    width: "320px",
    borderRight: "1px solid #e9ecef",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  sidebarHeader: {
    padding: "15px",
    borderBottom: "1px solid #e9ecef",
  },
  sidebarTitle: {
    fontSize: "1.2rem",
    fontWeight: 600,
    marginBottom: "15px",
  },
  search: {
    position: "relative",
  },
  searchInput: {
    width: "100%",
    padding: "10px 15px 10px 40px",
    border: "1px solid #e9ecef",
    borderRadius: "50px",
    backgroundColor: "#f8f9fa",
  },
  searchInputFocus: {
    outline: "none",
    borderColor: "#0d6efd",
  },
  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6c757d",
  },
  hotelList: {
    flex: 1,
    overflowY: "auto",
    padding: "10px 0",
  },
  hotelItem: {
    padding: "12px 15px",
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #f8f9fa",
    cursor: "pointer",
    transition: "background-color 0.2s",
    position: "relative",
  },
  hotelItemHover: {
    backgroundColor: "#f8f9fa",
  },
  hotelItemActive: {
    backgroundColor: "#e9f5ff",
    borderLeft: "3px solid #0d6efd",
  },
  hotelAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    marginRight: "15px",
    position: "relative",
  },
  hotelAvatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  onlineIndicator: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "2px solid #fff",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  onlineIndicatorOnline: {
    backgroundColor: "#20c997",
  },
  onlineIndicatorOffline: {
    backgroundColor: "#6c757d",
  },
  hotelInfo: {
    flex: 1,
    minWidth: 0,
  },
  hotelName: {
    fontWeight: 600,
    marginBottom: "3px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  hotelLastMessage: {
    fontSize: "0.85rem",
    color: "#6c757d",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  hotelMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    marginLeft: "10px",
  },
  hotelTime: {
    fontSize: "0.75rem",
    color: "#6c757d",
    marginBottom: "5px",
  },
  hotelUnread: {
    backgroundColor: "#0d6efd",
    color: "#fff",
    fontSize: "0.7rem",
    fontWeight: 600,
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "15px 20px",
    borderBottom: "1px solid #e9ecef",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  headerInfo: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    marginRight: "15px",
    position: "relative",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  headerActions: {
    display: "flex",
    gap: "15px",
  },
  headerActionsButton: {
    background: "none",
    border: "none",
    color: "#6c757d",
    fontSize: "1.2rem",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  headerActionsButtonHover: {
    color: "#0d6efd",
  },
  messages: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    backgroundColor: "#f8f9fa",
  },
  dateDivider: {
    textAlign: "center",
    margin: "20px 0",
    position: "relative",
  },
  dateDividerSpan: {
    backgroundColor: "#f8f9fa",
    padding: "0 10px",
    fontSize: "0.8rem",
    color: "#6c757d",
    position: "relative",
    zIndex: 1,
  },
  dateDividerBefore: {
    content: "''",
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: "1px",
    backgroundColor: "#e9ecef",
    zIndex: 0,
  },
  message: {
    display: "flex",
    marginBottom: "8px",
  },
  messageCustomer: {
    justifyContent: "flex-end",
  },
  messageHotel: {
    justifyContent: "flex-start",
  },
  messageContent: {
    maxWidth: "70%",
    padding: "12px 15px",
    borderRadius: "18px",
    position: "relative",
  },
  messageContentCustomer: {
    backgroundColor: "#0d6efd",
    color: "#fff",
    borderBottomRightRadius: "4px",
  },
  messageContentHotel: {
    backgroundColor: "#e9ecef",
    color: "#212529",
    borderBottomLeftRadius: "4px",
  },
  messageTime: {
    fontSize: "0.7rem",
    marginTop: "5px",
    textAlign: "right",
    opacity: 0.8,
  },
  messageStatus: {
    display: "flex",
    justifyContent: "flex-end",
    fontSize: "0.7rem",
    marginTop: "2px",
    color: "#6c757d",
  },
  messageStatusIcon: {
    fontSize: "0.8rem",
    marginLeft: "3px",
  },
  input: {
    padding: "15px 20px",
    borderTop: "1px solid #e9ecef",
    backgroundColor: "#fff",
  },
  inputForm: {
    display: "flex",
    alignItems: "center",
  },
  inputActions: {
    display: "flex",
    gap: "10px",
    marginRight: "15px",
  },
  inputActionsButton: {
    background: "none",
    border: "none",
    color: "#6c757d",
    fontSize: "1.2rem",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  inputActionsButtonHover: {
    color: "#0d6efd",
  },
  inputField: {
    flex: 1,
    position: "relative",
  },
  inputFieldTextarea: {
    width: "100%",
    padding: "12px 15px",
    border: "1px solid #e9ecef",
    borderRadius: "24px",
    resize: "none",
    maxHeight: "100px",
    backgroundColor: "#f8f9fa",
  },
  inputFieldTextareaFocus: {
    outline: "none",
    borderColor: "#0d6efd",
  },
  sendButton: {
    marginLeft: "15px",
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    backgroundColor: "#0d6efd",
    color: "#fff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  sendButtonHover: {
    backgroundColor: "#0b5ed7",
  },
  sendButtonIcon: {
    fontSize: "1.2rem",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: "20px",
    textAlign: "center",
    color: "#6c757d",
  },
  emptyStateIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
    color: "#e9ecef",
  },
  emptyStateTitle: {
    fontSize: "1.5rem",
    marginBottom: "10px",
  },
  emptyStateText: {
    maxWidth: "400px",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#6c757d",
    fontSize: "1.5rem",
    cursor: "pointer",
    marginRight: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Media queries would be handled in CSS or with conditional styling in React
};

export default CustomerChat;
