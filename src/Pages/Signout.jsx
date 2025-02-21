import React from 'react'
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

function SignOut() {
  const auth = getAuth();
  const navigate = useNavigate();

  // Function to handle sign-out
  const handleSignOut = async () => {
      try {
          await signOut(auth);
          toast.success("Logged out successfully!");
          navigate("/login"); // Redirect to login page
      } catch (error) {
          console.error(error);
          toast.error("Error signing out. Please try again.");
      }
  };
  return (

    <main className=' h-[50vh] border m-3 items-center justify-center flex border-slate-600'>

            <button
                className="mt-5 px-5 py-2 bg-[#F13934] text-white rounded-lg"
                onClick={handleSignOut}
            >
                Logout
            </button>
            <ToastContainer autoClose={3000} position="top-center" />
    </main>
  
  )
}

export default SignOut