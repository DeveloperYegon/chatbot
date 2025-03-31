import React from 'react'

function Footer() {

  const year = new Date().getFullYear();
  return (
    <footer className=' bottom-0 w-full fixed py-2'>
      <p className='text-center text-black'> &copy; {year}. Chatty . All rights reserved. </p>
    </footer>
  )
}

export default Footer