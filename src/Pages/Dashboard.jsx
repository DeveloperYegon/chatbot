import React,{useState} from 'react'
import Chatbot from './Chatbot'
import Sidebar from '../Components/Sidebar'
function Dashboard() {
    const [isCollapsed, setIsCollapsed] = useState(false);
  return (

    <main className='flex h-screen'>
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)}/>
        <Chatbot/>



    </main>
  )
}

export default Dashboard