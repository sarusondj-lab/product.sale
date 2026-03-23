import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import bgImage from "../asset/1431622.jpg";

export default function Hero() {

  const navigate = useNavigate();

  const handleExplore = () => {
    console.log("Explore clicked");
    navigate("/Products");
  };

  return (
    <section
      className="h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >

      {/* overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

      <motion.div
        className="text-center text-white p-6 rounded-lg z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >

        <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
          Discover the Power of Tulasi
        </h1>

       <motion.button
        onClick={handleExplore}
          whileHover={{ scale: 1.1 }}
          className="px-8 py-3 rounded-lg bg-lightGreen text-primaryGreen font-semibold shadow-lg
           hover:bg-primaryGreen hover:text-white transition transform hover:scale-105"
        >
  Explore
       </motion.button>
      </motion.div>

    </section>
  );
}