// Login.js
import React, { useState } from "react";
import { auth, signInWithEmailAndPassword,sendPasswordResetEmail } from "../firebase";
import { useNavigate,Link } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [errorMessages, setErrorMessages] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const notifySuccess = () => toast.success("Logged In Successfully!");
  const notifyError = (message) => toast.error(message);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const { email, password } = data;


    try {
      await signInWithEmailAndPassword(auth, email, password);
      notifySuccess();
            reset();
            setTimeout(() => navigate('/'), 2000);

    } catch (error) {
     setErrorMessages("Invalid Email/Password");
            notifyError("Invalid Email/Password");
            setIsLoading(false);
    }
  };

   // Function to handle password reset
   const handlePasswordReset = async () => {
    if (!email) {
        toast.error("Please enter your email");
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        toast.success("Password reset email sent!");
    } catch (error) {
        console.error(error);
        toast.error("Failed to send password reset email. Please try again.");
    }
};

  return (
    <main className='h-full p-5 rounded-[10px] bg-white'>
    <div className='border md:w-1/2 rounded-[10px] m-auto p-5 border-slate-500'>
        <h3 className='text-center py-5 font-bold text-[#F13934] text-2xl'>LOGIN</h3>
        <hr className='w-[80%] h-1 m-auto bg-black' />

        {errorMessages && (
            <div id="authmessage" className='text-center py-3 text-red-600'>
                {errorMessages}
            </div>
        )}

        <form className="flex flex-col" noValidate onSubmit={handleSubmit(onSubmit)}>
            <label className='my-4 font-bold' htmlFor="uname">Email:</label>
            <input
                autoFocus
                className="border border-slate-700 py-2 px-5 rounded-full"
                {...register("email", {
                    required: "Email is required",
                    pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                        message: "Invalid email address"
                    }
                })}
                placeholder="Enter Your Email"
                type="email"
                id="uname"
                onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="text-red-600 text-sm">{errors.email.message}</span>}

            <label className='my-4 font-bold' htmlFor="password">Password:</label>
            <input
                type="password"
                {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters long" }
                })}
                placeholder="Password"
                className="border py-2 px-5 border-slate-700 rounded-full"
                id="password"
            />
            {errors.password && <span className="text-red-600 text-sm">{errors.password.message}</span>}

            <input
                type="submit"
                className='border border-slate-950 text-white font-bold rounded-full p-3 mt-7 bg-black'
                value={isLoading ? 'Submitting...' : 'Submit'}
                disabled={isLoading}
            />
        </form>

        <p className='text-center mt-3'>
                Forgot your password? <span onClick={handlePasswordReset} className='text-[#F13934] font-bold cursor-pointer'>Reset Password</span>
            </p>


            <p className='text-center mt-3'>
                Don't have an account? <Link to="/signup" className='text-[#F13934] font-bold'>Sign Up</Link>
            </p>
    </div>

    <ToastContainer
        autoClose={3000}
        position="top-center"
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
    />
</main>
  );
};

export default Login;
