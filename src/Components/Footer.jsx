import React from 'react'

function Footer() {

  const year = new Date().getFullYear();
  return (
    <footer className='bg-[#413542]  py-5'>
      <p className='text-center text-white'> &copy; {year}. Chatty . All rights reserved. </p>
    </footer>
  )
}

export default Footer