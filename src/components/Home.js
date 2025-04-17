import React from 'react';
import Notes from './Notes';
// import { motion } from 'framer-motion';

// // Bounce animation transition
// const bounceTransition = {
//   y: {
//     duration: 0.4,
//     yoyo: Infinity,
//     ease: 'easeOut',
//   },
// };

// // Single letter bounce animation
// const BounceLetter = ({ letter }) => (
//   <motion.span
//     whileHover={{ y: [-2, -8, 0] }}
//     transition={bounceTransition}
//     style={{ display: 'inline-block' }}
//   >
//     {letter}
//   </motion.span>
// );

// // Bouncy text wrapper
// const BouncyText = ({ text }) => (
//   <h1 style={{ fontSize: '2rem', cursor: 'pointer' }}>
//     {text.split('').map((char, idx) => (
//       <BounceLetter key={idx} letter={char} />
//     ))}
//   </h1>
// );

// Home component
const Home = () => {
  return (
    <>
      <div className="container my-4">
        {/* This is for the bouncing animation for the Login screen */}
        {/* <BouncyText text="Login" /> */}
        <Notes />
      </div>
    </>
  );
};

export default Home;
