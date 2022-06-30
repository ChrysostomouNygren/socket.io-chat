import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// resurser
import logoutSymbol from "./resources/logout.png";
import addSymbol from "./resources/add.png";
import deleteSymbol from "./resources/delete.png";
import sendSymbol from "./resources/send.png";

let socket = io("http://localhost:4000");

function App() {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [room, setRoom] = useState("default");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);

  function joinRoom(roomName) {
    socket.emit("join_room", roomName, (response) => {
      console.log(response.status);
    });
    setRoom(roomName);
  }

  function leaveRoom(roomName) {
    socket.emit("leave_room", roomName, (response) => {
      console.log(response.status);
    });
    setRoom("default");
  }

  function createRoom() {
    let validRoom = rooms.some((name) => name.name === newRoom);
    if (validRoom) {
      alert("ey, room already exists!");
    } else if (newRoom) {
      socket.emit("create_room", newRoom, (response) => {
        console.log(`${response.status}`);
      });
    } else {
      alert("Ey, enter a valid name");
    }
  }

  function postMessage() {
    if (newMessage) {
      socket.emit("post_message", newMessage, socket.id, (response) => {
        console.log(response.status);
      });
    } else {
      alert("u must enter a message bitch");
    }
  }

  function deleteRoom(id, room) {
    console.log(id, room);
    socket.emit("delete_room", id, room, (response) => {
      console.log(response.status);
    });
  }

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("ready", (response) => {
        console.log(response.status);
      });
      socket.on("get_rooms", (data) => {
        setRooms(data);
      });
      socket.on("get_messages", (data) => {
        setMessages(data);
      });
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [messages]);

  const boxStyle = {
    boxSizing: "contentBox",
    width: "50%",
    backgroundColor: "#c9c9c9",
    borderRadius: "5%",
    padding: "30px 30px 0px 30px",
    border: "solid",
    borderColor: "#a8a8a8",
    margin: "20px",
  };
  const inputRoomStyle = {
    display: "flex",
    justifyContent: "center",
  };
  const roomStyle = {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.44)",
    margin: "3px",
    paddingLeft: "7px",
    paddingRight: "7px",
  };
  const roomListStyle = {
    display: "flex",
    flexGrow: "3",
    flexWrap: "wrap",
    flexDirection: "column",
    justifyContent: "space-evenly",
    minHeight: "130px",
    maxHeight: "200px",
    alignItems: "center",
    boxSizing: "contentBox",
    backgroundColor: "rgba(255, 255, 255, 0.44)",
    borderRadius: "5%",
    border: "solid",
    borderColor: "#a8a8a8",
    overflow: "auto",
    marginTop: "8px",
  };
  const inputMessageStyle = {
    display: "flex",
    justifyContent: "center",
  };
  const inputStyle = {
    width: "100%",
  };
  const imgStyle = {
    width: "40%",
  };
  const buttonStyle = {
    backgroundColor: "transparent",
    borderWidth: "0px",
  };

  const chatBoxStyle = {
    boxSizing: "contentBox",
    backgroundColor: "white",
    height: "200px",
    borderRadius: "5%",
    border: "solid",
    borderColor: "#a8a8a8",
    padding: "10px",
    overflow: "auto",
  };
  const messageStyle = {
    marginTop: "0px",
  };
  const paragraphStyle = {
    backgroundColor: "white",
    padding: "10px",
    borderRadius: "5%",
    border: "solid",
    borderColor: "#a8a8a8",
    marginBottom: "5px",
    marginTop: "0px",
  };
  const dateStyle = {
    fontSize: "0.5em",
    marginTop: "0px",
    marginBottom: "2px",
    color: "rgba(0, 0, 0, 0.44)",
  };
  const userInfoStyle = {
    fontSize: "0.7em",
    marginTop: "0px",
    marginBottom: "2px",
  };

  return (
    <div style={boxStyle}>
      <form
        style={inputRoomStyle}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          type="text"
          onChange={(event) => [setNewRoom(event.target.value)]}
          placeholder="new room"
        />
        <button onClick={() => [createRoom()]}>
          <img src={addSymbol} alt="add button" style={imgStyle} />
        </button>
      </form>
      <div style={roomListStyle}>
        {rooms.map((room) => (
          <div className="room" style={roomStyle}>
            <h5
              onClick={() => {
                [joinRoom(room.name)];
              }}
            >
              {room.name}
            </h5>
            <button
              onClick={() => {
                leaveRoom(room.name);
              }}
              style={buttonStyle}
            >
              <img src={logoutSymbol} alt="logout button" style={imgStyle} />
            </button>
            <button
              onClick={() => [deleteRoom(room.id, room.name)]}
              style={buttonStyle}
            >
              <img src={deleteSymbol} alt="delete button" style={imgStyle} />
            </button>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <hr />
      <p style={paragraphStyle}>You are currently in {room}</p>
      <div style={chatBoxStyle}>
        {messages.map((message) => (
          <div>
            <div>
              <p style={dateStyle}>{message.date}</p>
              <p style={userInfoStyle}>{message.user} says:</p>
            </div>
            <p style={messageStyle}>{message.value}</p>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        style={inputMessageStyle}
      >
        <input
          type="text"
          onChange={(event) => setNewMessage(event.target.value)}
          placeholder="message"
          style={inputStyle}
        />
        <button onClick={() => [postMessage()]}>
          <img src={sendSymbol} alt="send button" style={imgStyle} />
        </button>
      </form>
    </div>
  );
}

export default App;
