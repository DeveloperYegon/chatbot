import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "ai", content: "**Hello!** I'm here to chat with you." },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Function to truncate messages (keep last 10)
  const truncateMessages = (msgs, limit = 10) => {
    const systemMessage = { role: "system", content: "You are a helpful AI assistant." };
    const truncated = msgs.slice(-limit); 
    return [systemMessage, ...truncated];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    // Add user message
    const updatedMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(updatedMessages);
    setUserMessage("");
    setLoading(true);

    try {
      // Send messages to backend
      const response = await axios.post("http://localhost:5000/chat", {
        messages: truncateMessages(updatedMessages),
      });

      console.log("Received response from backend:", response.data);

      // Validate AI response
      const responseContent = response?.data?.kwargs?.content;
      if (responseContent) {
        setMessages((prev) => [...prev, { role: "ai", content: responseContent }]);
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

  return (
    <div style={{ padding: "20px" }}>
      <div 
        style={{
          border: "1px solid #ccc", 
          padding: "10px", 
          height: "300px", 
          overflowY: "auto", 
          display: "flex", 
          flexDirection: "column"
        }}
      >
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
              maxWidth: "70%",
            }}

          >

            <strong>{msg.role === "user" ? "You" : "AI"}:</strong>  <ReactMarkdown>{msg.content}</ReactMarkdown>
      {loading && <p style={{ textAlign: "center", marginTop: "10px" }}>AI is thinking...</p>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      
      <form onSubmit={handleSubmit} style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: "1", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: "10px", 
            backgroundColor: "#0078FF", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
