import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom, #ffe4e6, #ffffff)",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff0f3",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: "0",
            marginBottom: "20px",
            color: "#ff6b81",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
        >
          DuetVibe
        </h1>
        <form
          onSubmit={handleSubmitForm}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <label htmlFor="email" style={{ fontWeight: "bold" }}>
            Email ID
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          />
          <label htmlFor="room" style={{ fontWeight: "bold" }}>
            Room Number
          </label>
          <input
            type="text"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#ff6b81",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default LobbyScreen;
