import React, { useEffect, useState } from "react";
import { Card, Form, Button, ListGroup } from "react-bootstrap";
import axios from "axios";
import { initializeSocket } from "@redux/socket/socketSlice";
import { useAppDispatch, useAppSelector } from "@redux/store";
import Factories from "@redux/message/factories";

const ChatBox = () => {
  const dispatch = useAppDispatch();
  const Socket = useAppSelector((state) => state.Socket.socket);
  const Auth = useAppSelector((state) => state.Auth.Auth); // current user
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId]= useState(Auth._id === 12 ? 11 : 12);
  // 🔌 Khởi tạo socket và đăng ký userId
  useEffect(() => {
    dispatch(initializeSocket());
  }, [dispatch]);

  useEffect(() => {
    if (!Socket || !Auth?._id) return;

    // Gửi userId cho server
    Socket.emit("register", Auth._id);

    // Lắng nghe nhận tin nhắn riêng
    Socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      Socket.off("receive-message");
    };
  }, [Socket, Auth]);

  // 📜 Lấy lịch sử tin nhắn
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await Factories.fetch_chat(Auth._id, receiverId);
        setMessages(res.data);
        console.log(res.data)
      } catch (err) {
        console.error("Lỗi khi lấy tin nhắn", err);
      }
    };

    if (Auth?._id && receiverId) {
      fetchMessages();
    }
  }, [Auth, receiverId]);

  // 📤 Gửi tin nhắn
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msgData = {
      senderId: Auth._id,
      receiverId,
      message: input,
    };

    Socket.emit("private-message", msgData);

    // Cập nhật UI ngay lập tức
    setMessages((prev) => [
      ...prev,
      {
        ...msgData,
        timestamp: new Date().toISOString(),
      },
    ]);

    setInput("");
  };

  return (
    <Card style={{ width: "100%", maxWidth: "500px", margin: "0 auto", marginTop: "50px" }}>
      <Card.Header className="bg-primary text-white">Live Chat Of {Auth.name}</Card.Header>
      <Card.Body style={{ height: "300px", overflowY: "auto", backgroundColor: "#f8f9fa" }}>
        <ListGroup variant="flush">
          {messages.map((msg, idx) => (
            <ListGroup.Item
              key={idx}
              className={msg.senderId === Auth._id ? "text-end" : "text-start"}
            >
              <span className={`badge ${msg.senderId === Auth._id ? "bg-primary" : "bg-secondary"}`}>
                {msg.message}
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
      <Card.Footer>
        <Form onSubmit={handleSend}>
          <Form.Group className="d-flex">
            <Form.Control
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button variant="primary" type="submit" className="ms-2">
              Send
            </Button>
          </Form.Group>
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default ChatBox;
