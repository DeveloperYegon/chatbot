import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { db, collection, addDoc, query, orderBy, where, onSnapshot } from "../firebase";
import { v4 as uuidv4 } from "uuid"; // For generating unique chat IDs
import { useNavigate } from "react-router-dom";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "ai", content: "**Hello!** I'm here to chat with you." },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);



  // fetch messages for the current chat
  useEffect(() => {
    if (currentChatId) {
      const q = query(
        collection(db, "chats", currentChatId, "messages"),
        orderBy("createdAt")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          messages.push(doc.data());
        });
        setMessages(messages);
      });
      return unsubscribe;
    }
  }
  , [currentChatId]);



  // Function to truncate messages (keep last 10)
  const truncateMessages = (msgs, limit = 10) => {
    const systemMessage = { role: "system", content: "You are a helpful AI assistant trained by Tilt Technologies." };
    const truncated = msgs.slice(-limit); 
    return [systemMessage, ...truncated];
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!userMessage.trim()) return;

  // Create user message object
  const userMsgObj = {
    role: "user",
    content: userMessage,
    createdAt: Date.now(),
  };

  // Update UI immediately
  setMessages((prev) => [...prev, userMsgObj]);
  setUserMessage("");
  setLoading(true);

  try {
    // Save user message to Firestore
    if (currentChatId) {
      const chatRef = collection(db, "chats", currentChatId, "messages");
      await addDoc(chatRef, userMsgObj);
    }

    // Send message to backend
    const response = await axios.post("http://localhost:5000/chat", {
      messages: truncateMessages([...messages, userMsgObj]),
    });

    console.log("Received response from backend:", response.data);

    // Validate AI response
    const responseContent = response?.data?.kwargs?.content;
    if (responseContent) {
      const aiMsgObj = {
        role: "ai",
        content: responseContent,
        createdAt: Date.now(),
      };

      // Save AI response to Firebase
      if (currentChatId) {
        const chatRef = collection(db, "chats", currentChatId, "messages");
        await addDoc(chatRef, aiMsgObj);
      }

      // Update UI with AI response
      setMessages((prev) => [...prev, aiMsgObj]);
    } else {
      console.error("Invalid response from backend:", response);
    }
  } catch (error) {
    console.error("Error communicating with chatbot:", error.response?.data || error.message);
  } finally {
    setLoading(false);
  }
};


  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

    // If a chat is initiated but no message is sent within 5 minutes, you can automatically delete
  useEffect(() => {
    if (!currentChatId || messages.length > 1) return;
  
    const timer = setTimeout(async () => {
      await deleteDoc(doc(db, "chats", currentChatId)); // Delete the unsent chat
      setCurrentChatId(null);
    }, 5 * 60 * 1000); // 5-minute timeout
  
    return () => clearTimeout(timer);
  }, [currentChatId, messages]);


  return (
    <main className="flex flex-col w-full gap-1 md:mx-5 mx-2 p-3 bg-gray-100  overflow-auto">
  


    {/* Chatbot */}
 

      <div className="md:p-10 bg-white rounded-2xl mb-10 overflow-auto flex flex-col">
       
        {/* Displaying Messages */}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{  
              margin: "5px 0",
              padding: "8px",
              borderRadius: "5px",
              background: msg.role === "user" ? "#413542" : "#EAEAEA",
              color: msg.role === "user" ? "white" : "black",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
        {loading && <p style={{ textAlign: "center", color:"green", marginTop: "10px" }}>Generating Answer...</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Form to submit user messages */}
      <form onSubmit={handleSubmit} noValidate 
     className="md:mx-20 sticky bottom-20 bg-white my-5 flex flex-row border border-slate-300 gap-2 rounded-lg p-3">
        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Type your message..."
          name="message"
          className="w-full p-2 rounded-lg bg-[#fff] focus:outline-none focus:ring focus:ring-blue-300"
        ></textarea>
        <button
          type="submit"
          className="bg-[#000] font-bold text-white px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          style={{
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          Send
        </button>
      </form> 
  </main> 
  );
};

export default Chatbot;

