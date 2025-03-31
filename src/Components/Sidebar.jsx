import React,{useState, useEffect} from 'react'
import { db, collection, addDoc, query, orderBy, where, onSnapshot } from "../firebase";
import { v4 as uuidv4 } from "uuid"; // For generating unique chat IDs
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { MdAdd } from "react-icons/md";




function Sidebar({ isCollapsed, toggleSidebar }) {
  const [userId, setUserId] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);

  // Start a new chat
  const startNewChat = async () => {
    const newChatId = uuidv4(); // Generate new chat ID
    await addDoc(collection(db, "chats"), { id: newChatId, createdAt: Date.now(), userId });
    setCurrentChatId(newChatId);
    setMessages([{ role: "ai", content: "**Hello!** I'm here to chat with you." }]);
  };

  

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

    console.log("Current user:", auth.currentUser);


      //fetching chats
      useEffect(() => {
        const q = query(collection(db, "chats"), where("userId", "==", userId), orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const chats = [];
          querySnapshot.forEach((doc) => {
            chats.push(doc.data());
          });
          setChats(chats);
        });
        return unsubscribe;
      }, [userId]);

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
  return (
    <main className={`bg-[#fff] text-black p-4 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      <button
        className="text-black text-2xl mb-4 cursor-pointer focus:outline-none"
        onClick={toggleSidebar}
      >
        <HiMiniBars3BottomLeft className="text-4xl" />
      </button>

      <div onClick={startNewChat} className=" px-2 flex gap-3 items-center border border-black font-bold  cursor-pointer rounded-lg" >
      <MdAdd className='text-4xl' /> {isCollapsed?"":"New Chat"}
      </div>

       


        <h4 className="pt-5 font-bold underline">Chat History </h4>
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
    </main>
  )
}

export default Sidebar
