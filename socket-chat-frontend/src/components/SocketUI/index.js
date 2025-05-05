import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./socketui.css";

const socket = io("https://socket-io-live-chat.onrender.com/");

const SocketUI = () => {
  const [username, setUsername] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  const typingTimeoutRef = useRef(null);
  const isTyping = useRef(false);

  useEffect(() => {
    socket.on("privateMessage", ({ from, message }) => {
      setChatLog((prev) => [...prev, `${from} (private): ${message}`]);
    });

    socket.on("publicMessage", ({ from, message }) => {
      setChatLog((prev) => [...prev, `${from} (to all): ${message}`]);
    });

    socket.on("usersList", (usernames) => {
      setUsers(usernames);
    });

    socket.on("typing", (user) => {
      setTypingUser(`${user} is typing...`);
    });

    socket.on("stopTyping", () => {
      setTypingUser("");
    });

    return () => {
      socket.off("privateMessage");
      socket.off("publicMessage");
      socket.off("usersList");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, []);

  const handleRegister = () => {
    if (username) {
      socket.emit("register", username);
    }
  };

  const handleSend = () => {
    if (!message) return;

    if (recipient) {
      socket.emit("privateMessage", {
        from: username,
        to: recipient,
        message,
      });
      setChatLog((prev) => [...prev, `You (to ${recipient}): ${message}`]);
    } else {
      socket.emit("publicMessage", {
        from: username,
        message,
      });
      setChatLog((prev) => [...prev, `You (to all): ${message}`]);
    }

    setMessage("");
    socket.emit("stopTyping");
    isTyping.current = false;
    clearTimeout(typingTimeoutRef.current);
  };

  const handleRecipientClick = () => {
    socket.emit("getUsers");
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!isTyping.current && username) {
      socket.emit("typing", username);
      isTyping.current = true;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping");
      isTyping.current = false;
    }, 1000);
  };

  return (
    <div className="chat-container">
      <header>
        <h2>Live Chat App with Socket.IO</h2>
      </header>

      <section className="chat-log">
        <ul>
          {chatLog.map((msg, idx) => (
            <li key={idx} className={msg.includes("You") ? "you" : ""}>
              {msg}
            </li>
          ))}
        </ul>
        {typingUser && <div className="typing-indicator">{typingUser}</div>}
      </section>

      <section className="user-inputs">
        <div className="input-group">
          <label>Your name (optional):</label>
          <input
            type="text"
            placeholder="e.g. Khem"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={handleRegister}
          />
        </div>

        <div className="input-group">
          <label>Send to (optional):</label>
          <input
            type="text"
            placeholder="Choose recipient"
            value={recipient}
            onClick={handleRecipientClick}
            onChange={(e) => setRecipient(e.target.value)}
            list="usernames"
          />
          <datalist id="usernames">
            {users.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>

        <div className="input-group message-box">
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </section>
    </div>
  );
};

export default SocketUI;
