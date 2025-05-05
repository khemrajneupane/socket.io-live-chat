import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./socketui.css"; // Add your own styles or use this as a reference

const socket = io("http://localhost:3001");

const SocketUI = () => {
  const [username, setUsername] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [users, setUsers] = useState([]);

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

    return () => {
      socket.off("privateMessage");
      socket.off("publicMessage");
      socket.off("usersList");
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
  };

  const handleRecipientClick = () => {
    socket.emit("getUsers");
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
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </section>
    </div>
  );
};
export default SocketUI;
