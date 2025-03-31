import React,{useState} from 'react'
import Chatbot from './Chatbot'
import Sidebar from '../Components/Sidebar'
function Dashboard() {
    const [isCollapsed, setIsCollapsed] = useState(false);
  return (

    <main className='flex border w-[100%] fixed h-full '>
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)}/>
        <Chatbot/>



    </main>
  )
}

export default Dashboard