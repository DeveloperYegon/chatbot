import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { db, collection, addDoc, query, orderBy, where, onSnapshot } from "../firebase";
import { v4 as uuidv4 } from "uuid"; // For generating unique chat IDs
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
const Chatbot = () => {


  const [messages, setMessages] = useState([
    { role: "ai", content: "**Hello!** I'm here to chat with you." },
  ]);

  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Handling user authentication and redirect to login if not authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUserId(user.uid); // Store the actual user ID
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetching past user chat sessions once user is authenticated
  useEffect(() => {
    if (userId) {
      const q = query(
        collection(db, "chats"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setChats(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [userId]);

  // Fetching messages for selected chat
  useEffect(() => {
    if (currentChatId) {
      const q = query(
        collection(db, "messages"),
        where("chatId", "==", currentChatId),
        orderBy("timestamp", "asc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
      });
      return () => unsubscribe();
    }
  }, [currentChatId]);

  // Automatically start a new chat if no active chat is found
  useEffect(() => {
    const initializeChat = async () => {
      if (!currentChatId && userId) {
        const newChatId = uuidv4();
        await addDoc(collection(db, "chats"), {
          id: newChatId,
          createdAt: Date.now(),
          userId,
        });
        setCurrentChatId(newChatId);
        setMessages([{ role: "ai", content: "**Hello!** I'm here to chat with you." }]);
      }
    };
    initializeChat();
  }, [currentChatId, userId]);

  // Function to truncate messages (keep last 10)
  const truncateMessages = (msgs, limit = 10) => {
    const systemMessage = {
      role: "system",
      content: "You are a helpful AI assistant trained by Tilt Technologies.",
    };
    const truncated = msgs.slice(-limit);
     // Ensure the AI's first message is always included
  // const aiGreeting = msgs.find((msg) => msg.role === "ai" && msg.content.includes("Hello!"));
    return  [systemMessage, ...truncated];
    // aiGreeting ? [systemMessage, aiGreeting, ...truncated] :
  };

  // Handling message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || !currentChatId) return;

    // const newUserMessage = {
    //   id: uuidv4(),
    //   chatId: currentChatId,
    //   role: "user",
    //   content: userMessage,
    //   timestamp: Date.now(),
    // };

    const updatedMessages = messages.length
  ? [...messages, { role: "user", content: userMessage }]
  : [{ role: "ai", content: "**Hello!** I'm here to chat with you." }, { role: "user", content: userMessage }];

    setMessages(updatedMessages);
    setUserMessage("");
    setLoading(true);


    try {
      // Add user message to Firestore
    // await addDoc(collection(db, "messages"), newUserMessage);
      
      // Send message to backend for AI response
      const response = await axios.post("http://localhost:5000/chat", {
        messages: truncateMessages(updatedMessages),
      });
      
      console.log("Received response from backend:", response.data);
  
  
      // Validate AI response
      const responseContent = response?.data?.kwargs?.content;
      console.log(responseContent);

      setMessages((prev) => [...prev,{role:"ai",content:responseContent}]);

      if (responseContent) {
        const aiMessage = {
          id: uuidv4(),
          chatId: currentChatId,
          sender: "ai",
          content: responseContent,
          timestamp: Date.now(),
        };

        await addDoc(collection(db, "messages"), aiMessage); // Store AI response
      } else {
        console.error("Invalid response from backend:", response);
      }
    } catch (error) {
      console.error("Error communicating with chatbot:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log(messages);
  

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start a new chat
  const startNewChat = async () => {
    const newChatId = uuidv4(); // Generate new chat ID
    await addDoc(collection(db, "chats"), { id: newChatId, createdAt: Date.now(), userId });
    setCurrentChatId(newChatId);
    // setMessages([{ role: "ai", content: "**Hello!** I'm here to chat with you." }]);
  };

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
    <main className="flex gap-1 h-screen bg-[#8a8888]">
      {/* //Sidebar */}
      <div className="w-1/4 hidden md:flex  flex-col px-4 py-7 bg-amber-50 h-screen">
        
        <div className="flex justify-between  gap-2  fixed top-20 left-1  bg-black text-white rounded-2xl ">
      <HiMiniBars3BottomLeft className="m-3  text-4xl" />
      <button
            onClick={startNewChat}
            
            className="bg-[#000] px-2 border-white border-2 font-bold  rounded-lg "
          >
            New Chat
          </button>
        </div>
      
         {/* Chat List */}
         <div className="overflow-auto pt-20">
            <h4 className="text-center font-bold underline">Chat History </h4>
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setCurrentChatId(chat.id)}
                style={{
                  display: "block",
                  margin: "5px 0",
                  padding: "5px",
                  background: currentChatId === chat.id ? "#28a745" : "#ccc",
                  color: "white",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Chat {chat.id.substring(0, 6)}...
              </button>
            ))}
          </div>
      </div>


      {/* Chatbot */}
      <div className=" border w-full border-slate-500 rounded-2xl p-5 m-1 flex flex-col gap-3">

        <div className="md:p-10 border border-slate-500 rounded-2xl overflow-auto flex flex-col">
         
          {/* Displaying Messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                margin: "5px 0",
                padding: "8px",
                borderRadius: "5px",
                background: msg.role === "user" ? "#0078FF" : "#EAEAEA",
                color: msg.role === "user" ? "white" : "black",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              {loading && <p style={{ textAlign: "center", marginTop: "10px" }}>AI is thinking...</p>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Form to submit user messages */}
        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-3">
          <textarea
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            cols={5}
            rows={5}
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
      </div>
    </main>
  );
};

export default Chatbot;
