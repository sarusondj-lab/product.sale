import { motion } from "framer-motion";

export default function About() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* --- Background Image Layer --- */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('src/asset/1431622.jpg')",
        }}
      >
        {/* Dark overlay to make text readable */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>

      {/* --- Content Layer --- */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 drop-shadow-md">
            About <span className="text-green-400">Tulasi</span>🌿
          </h1>
          
          <div className="max-w-3xl bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl">
            <p className="text-gray-100 text-lg md:text-xl leading-relaxed">
              Tulasi, also known as Holy Basil, is revered for its medicinal properties. 
              Our products are sustainably sourced and carefully processed to maintain natural benefits. 
              From enhancing immunity to reducing stress, Tulasi has been used for centuries in wellness and holistic healing.
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}