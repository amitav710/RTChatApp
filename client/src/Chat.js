import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isPending, setIsPending] = useState(true);

  const isSameMessage = (newMessage, lastMessage) => {
    return lastMessage && newMessage.author === lastMessage.author && newMessage.message === lastMessage.message && newMessage.time === lastMessage.time;
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      // Only add message if it's not the same as the last one
      if (!isSameMessage(messageData, messageList[messageList.length - 1])) {
        await socket.emit("send_message", messageData);
        setMessageList((list) => [...list, messageData]);
      }
      setCurrentMessage("");
      setIsPending(false);
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      // Only add message if it's not the same as the last one
      setMessageList((list) => {
        if (!isSameMessage(data, list[list.length - 1])) {
          return [...list, data];
        }
        return list;
      });
      setIsPending(true);
    });

    // Cleanup to remove event listeners
    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  return (
    <div className="chat-window">
      {isPending && <div>Loading...</div>}
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => ( 
            <div
              className="message"
              key={index}
              id={username === messageContent.author ? "you" : "other"}
            >
              <div>
                <div className="message-content">
                  <p>{messageContent.message}</p>
                </div>
                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                  <p id="author">{messageContent.author}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
