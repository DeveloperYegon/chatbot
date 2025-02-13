const express = require('express');
const app = express();
const port = 5000;
const cors =require('cors');
const bodyParser = require('body-parser');
// const {ChatOpenAI} =require("@langchain/openai")
const {ChatGoogleGenerativeAI}=require("@langchain/google-genai")
require("dotenv").config();
const {START, END, MessagesAnnotation, StateGraph,MemorySaver}= require("@langchain/langgraph");
const {v4:uuidv4}= require("uuid");

//middleware
app.use(cors());
app.use(bodyParser.json());

//langchain setup
const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-1.5-flash",
    temperature: 0,
    streaming: true,
  });

  const callModel = async (state) => {
    try {
    const response = await llm.invoke(state.messages);


    if (!response || !response.content) {
      throw new Error("Invalid response from Gemini API");
  }

    const formattedResponse = {
      role: "ai",  // Ensuring correct role
      content: response.content || "No response generated",// Extracting content correctly
  };
    return { messages: [...state.messages, formattedResponse]  }; // Append to conversation history
  }catch (error) {
    console.error("Error calling LLM:", error);
    throw new Error("Failed to generate response");
  }
};


  const workflow = new StateGraph(MessagesAnnotation)
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

  const memory = new MemorySaver();
const appWorkflow = workflow.compile({ checkpointer: memory });

// Endpoint for chatbot
app.post("/chat", async (req, res) => {
  const { messages } = req.body;
  console.log("Received messages:", messages);

  if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid input format" });
  }

  try {
    const config = { configurable: { thread_id: uuidv4() } };
    const output = await appWorkflow.invoke({ messages }, config);

    if (!output || !output.messages || output.messages.length === 0) {
      throw new Error("Invalid chatbot response");
  }
    const aiResponse = output.messages[output.messages.length - 1];
    console.log("AI Response:", aiResponse); // Debugging
    return res.json({ kwargs: { content: aiResponse.content } });

  } catch (error) {
    console.error("Error during chatbot processing:", error);
    return res.status(500).json({ error: "Failed to process the request" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


