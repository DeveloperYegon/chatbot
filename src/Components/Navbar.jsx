import React,{ useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Navbar() {

  const [user, setUser] = useState(null);
  const [initials, setInitials] = useState("");

  useEffect(() => {
    const auth = getAuth();

    // Authentication state observer
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set user data
        extractInitials(user.displayName || user.email); // Get initials
      } else {
        setUser(null); // No user is signed in
        setInitials(""); // Reset initials
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Function to extract initials from the user's name or email
const extractInitials = (nameOrEmail) => {
  if (!nameOrEmail) return "";

  const nameParts = nameOrEmail.split(" ");
  if (nameParts.length >= 2) {
    // If it's a full name, take the first letter of the first and last name
    const firstInitial = nameParts[0][0];
    const lastInitial = nameParts[1][0];
    setInitials(`${firstInitial}${lastInitial}`.toUpperCase());
  } else {
    // If it's an email, take the first two letters of the email prefix
    const emailPrefix = nameOrEmail.split("@")[0];
    setInitials(emailPrefix.slice(0, 2).toUpperCase());
  }
};

  return (
   <nav className='flex justify-between sticky top-0 items-center px-5 h-16 bg-[#413542]  shadow-sm font-mono'>
    <Link to='/'>

    <h1 className='font-bold text-4xl text-white'>Chatty</h1>
    </Link>
    <ul>
    {user ? (
        // If user is logged in, display user's initials
        <Link className='bg-[#ffffff] text-black p-3 font-bold rounded-full' to="/profile">{initials}</Link>
      ) : (
     
      <li className='rounded-full border border-white px-5 text-white font-bold py-3'>
         <Link to='/login'>
        login
         </Link>
        </li>
         )}
    </ul>
   </nav>
  )
}

export default Navbar