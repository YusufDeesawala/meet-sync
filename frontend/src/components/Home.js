import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdNote, MdCheckCircle, MdSearch } from 'react-icons/md';
import '../static/css/Home.css';

const Home = () => {
  const navigate = useNavigate();

  const cards = [
    {
      icon: <MdNote size={80} color="#333" />,
      label: 'Notes',
      path: '/notes',
    },
    {
      icon: <MdCheckCircle size={80} color="#333" />,
      label: 'Todos',
      path: '/todo',
    },
    {
        icon:<MdSearch size={80} color='#333'/>,
        label:'Web Search',
        path:'/websearch'
    }
  ];

  return (
    <div className="home-container">
      {/* Floating doodles */}
      <motion.div className="floating doodle doodle-1" animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 6 }} />
      <motion.div className="floating doodle doodle-2" animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 7 }} />
      <motion.div className="floating doodle doodle-3" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5 }} />
      <motion.div className="floating doodle doodle-4" animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6 }} />
      <motion.div className="floating doodle doodle-5" animate={{ y: [0, 25, 0] }} transition={{ repeat: Infinity, duration: 7 }} />
      <motion.div className="floating doodle doodle-6" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }} />
      <motion.div className="floating doodle doodle-7" animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 8 }} />
      <motion.div className="floating doodle doodle-8" animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 6 }} />
      <motion.div className="floating doodle doodle-9" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 7 }} />
      <motion.div className="floating doodle doodle-10" animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 9 }} />
      <motion.div className="floating doodle doodle-11" animate={{ y: [0, 25, 0] }} transition={{ repeat: Infinity, duration: 10 }} />
      <motion.div className="floating doodle doodle-12" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 8 }} />

      {/* Main Grid */}
      <motion.div
        className="card-grid"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            className="card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, delay: index * 0.2 }}
            onClick={() => navigate(card.path)}
          >
            <div className="card-icon">{card.icon}</div>
            <h2 className="card-label">{card.label}</h2>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;