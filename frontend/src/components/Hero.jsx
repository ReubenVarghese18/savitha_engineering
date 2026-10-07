import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const [precision, setPrecision] = useState(0.5);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const fluctuation = (0.4 + Math.random() * 0.2).toFixed(1);
      setPrecision(Number(fluctuation));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const badgeVariants = {
    hidden: { x: -40, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  const lineVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  const descriptionVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 70, damping: 14, delay: 0.35 },
    },
  };

  const imageVariants = {
    hidden: { scale: 0.96, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 },
    },
  };

  const diagnosticVariants = {
    hidden: { x: 40, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 70, damping: 12, delay: 0.8 },
    },
  };

  return (
    <div>
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen relative pb-20 px-6 max-w-6xl mx-auto py-32 pt-20"
      >
        <div className="overlap-grid gap-y-12">
          <div className="col-span-12 lg:col-span-8 z-10">
            <motion.div 
              variants={badgeVariants}
              className="inline-block bg-white text-black px-4 py-1 font-black mb-8 brutalist-shadow"
            >
              ESTABLISHED 1976 | MUMBAI, INDIA
            </motion.div>
            <h1 className="font-brutal-head text-[clamp(2rem,6.5vw,6rem)] leading-[0.85] mb-12 relative z-10 overflow-hidden">
              <motion.span variants={lineVariants} className="block">Engineering</motion.span>
              <motion.span variants={lineVariants} className="block text-primary">excellence</motion.span>
              <motion.span variants={lineVariants} className="block">since</motion.span>
              <motion.span variants={lineVariants} className="block">1976</motion.span>
            </h1>
          </div>

          <motion.div 
            variants={descriptionVariants}
            className="col-span-12 lg:col-span-5 lg:col-start-8 lg:-mt-12 z-20"
          >
            <div className="brutalist-border bg-black p-10 brutalist-shadow">
              <p className="font-bold text-xl leading-tight border-l-8 border-neon pl-6 mb-8 uppercase">
                Manufacturing extreme-performance industrial furnaces, specialized melting systems, and heavy-duty thermal ovens to international standards since 1976.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="bg-primary text-white p-6 font-brutal-head text-lg flex-1 hover:translate-x-2 transition-transform cursor-pointer border-none"
                >
                  EXPLORE PRODUCTS
                </button>
                <button
                  onClick={() => handleScroll('contact')}
                  className="bg-white text-black p-6 font-brutal-head text-lg flex-1 hover:-translate-y-2 transition-transform cursor-pointer border-none"
                >
                  SPEAK TO ENGINEER
                </button>
              </div>
            </div>
          </motion.div>

          <div className="hidden md:block absolute right-0 top-1/4 vertical-text font-brutal-head text-[10rem] opacity-5 pointer-events-none">
            MUMBAI INDUSTRIAL
          </div>
        </div>

        <div className="mt-32 relative">
          <motion.div 
            variants={imageVariants}
            className="brutalist-border overflow-hidden h-[500px]"
          >
            <img
              alt="Industrial Hero"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQYfiVXCxs3xuKANYO3ermf7dVPXvwJc-UF5rt768PmD6zPWLFF00P1uxyFGI5Y_1NW2W-YkVEsPTxsSDtdBL_C7TRuSZMAvmMfYk7p837XJz_pcF_NMhKiDzPDi0LRcY66g0gv0ptIQIJzsWHMd6MUMmLZKzylgnrie4lx5DL2ff6OQXySQYrjhfADM7JvG-IqPPPj-pe9FsmfK2nQIpvwaANALn9xLk1Xj3S3EyEcSgCi_OAClK_HdpYFpjMDRnvx2T9mrmX1Co"
            />
          </motion.div>

          {/* Absolute-positioned Live Diagnostic Box */}
          <motion.div 
            variants={diagnosticVariants}
            className="absolute -bottom-10 right-10 border border-[#FA5D19] p-6 w-80 shadow-2xl z-30 backdrop-blur-xl bg-black/80"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#FA5D19] rounded-full animate-ping absolute"></span>
                <span className="w-2.5 h-2.5 bg-[#FA5D19] rounded-full relative"></span>
                <span className="font-mono text-[10px] font-bold text-[#FA5D19] tracking-[0.2em]">STATUS: LIVE_DIAGNOSTIC</span>
              </div>
              <span className="material-symbols-outlined text-[#FA5D19] text-2xl animate-spin" style={{ animationDuration: '10s' }}>settings_suggest</span>
            </div>

            <div className="space-y-6">
              <div className="border-l-2 border-[#FA5D19]/30 pl-4">
                <p className="font-mono text-[10px] text-gray-400 tracking-widest uppercase mb-1">Thermal Precision</p>
                <div className="flex items-baseline gap-1">
                  <p className="font-brutal-head text-4xl text-white">±{precision.toFixed(1)}</p>
                  <span className="font-mono text-xl text-[#FA5D19] font-bold">°C</span>
                </div>
              </div>

              <div className="border-l-2 border-[#FA5D19]/30 pl-4">
                <p className="font-mono text-[10px] text-gray-400 tracking-widest uppercase mb-1">Operational Life</p>
                <div className="flex items-baseline gap-1">
                  <p className="font-brutal-head text-4xl text-white">30+</p>
                  <span className="font-mono text-xl text-[#FA5D19] font-bold">YRS</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-tighter">Build_Ref: V4.2_SVT_ENG</span>
              <div className="flex gap-1">
                <div className="w-1 h-3 bg-[#FA5D19]/20"></div>
                <div className="w-1 h-3 bg-[#FA5D19]/40"></div>
                <div className="w-1 h-3 bg-[#FA5D19]/60"></div>
                <div className="w-1 h-3 bg-[#FA5D19]"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Redesigned Savitha Advantage Section */}
      <section className="px-6 max-w-6xl mx-auto py-24">
        <div className="mb-24">
          <h2 className="font-brutal-head text-[clamp(2rem,6.5vw,6rem)] leading-[0.85]">THE SAVITHA<br/><span className="text-primary">ADVANTAGE</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-black border-4 border-white/20 hover:border-[#FA5D19] transition-all duration-300 cursor-default group text-center py-16 px-8 min-h-[500px] flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-primary mb-10 group-hover:scale-110 transition-transform block" style={{ fontSize: '4rem' }}>shield</span>            <h3 className="font-brutal-head text-xl lg:text-2xl mb-6">45+ Years of Mastery</h3>
            <p className="font-bold opacity-70 uppercase leading-relaxed text-sm">Four decades of specialized domain expertise in thermal dynamics, metallurgy, and heavy structural engineering since 1976.</p>
          </div>
          <div className="bg-black border-4 border-white/20 hover:border-[#FA5D19] transition-all duration-300 cursor-default group text-center py-16 px-8 min-h-[500px] flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-primary mb-10 group-hover:scale-110 transition-transform block" style={{ fontSize: '4rem' }}>verified_user</span>            <h3 className="font-brutal-head text-xl lg:text-2xl mb-6">Uncompromising Quality</h3>
            <p className="font-bold opacity-70 uppercase leading-relaxed text-sm">Every unit undergoes rigorous multi-parameter testing for thermal mapping, leak detection, and operational durability before deployment.</p>
          </div>
          <div className="bg-black border-4 border-white/20 hover:border-[#FA5D19] transition-all duration-300 cursor-default group text-center py-16 px-8 min-h-[500px] flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-primary mb-10 group-hover:scale-110 transition-transform block" style={{ fontSize: '4rem' }}>settings</span>            <h3 className="font-brutal-head text-xl lg:text-2xl mb-6">100% OEM Customization</h3>
            <p className="font-bold opacity-70 uppercase leading-relaxed text-sm">From initial CAD design to final factory-floor installation, we deliver bespoke heating solutions tailored to your unique industrial requirements.</p>
          </div>
        </div>
      </section>

      {/* Marquee Divider */}
      <div className="bg-black text-white px-6 text-center border-b-4 border-white">
        <h2 className="font-brutal-head bg-black text-white text-4xl py-6 px-10">TRUSTED BY INDUSTRY GIANTS</h2>
      </div>
      <section className="text-black brutalist-border border-x-0 overflow-hidden py-20 bg-white">
        <div className="flex kinetic-marquee whitespace-nowrap">
          <div className="flex items-center gap-20 px-10">
            <span className="font-brutal-head text-5xl">EXIDE INDUSTRIES LTD.</span><span className="font-brutal-head text-5xl text-neon">★</span>
            <span className="font-brutal-head text-5xl">CROMPTON GREAVES</span><span className="font-brutal-head text-5xl text-neon">★</span>
            <span className="font-brutal-head text-5xl">HINDUSTAN PENCILS PVT. LTD.</span><span className="font-brutal-head text-5xl text-neon">★</span>
            <span className="font-brutal-head text-5xl">MEHTA TUBES PVT. LTD.</span><span className="font-brutal-head text-5xl text-neon">★</span>
            <span className="font-brutal-head text-5xl">MULTIMETALS LTD.</span><span className="font-brutal-head text-5xl text-neon">★</span>
          </div>
          <div className="flex items-center gap-20 px-10">
            <span className="font-brutal-head text-5xl">EXIDE INDUSTRIES LTD.</span><span className="font-brutal-head text-5xl text-neon">★</span>
            <span className="font-brutal-head text-5xl">CROMPTON GREAVES</span><span className="font-brutal-head text-5xl text-neon">★</span>
            <span className="font-brutal-head text-5xl">HINDUSTAN PENCILS PVT. LTD.</span><span className="font-brutal-head text-5xl text-neon">★</span>
            <span className="font-brutal-head text-5xl">MEHTA TUBES PVT. LTD.</span><span className="font-brutal-head text-5xl text-neon">★</span>
            <span className="font-brutal-head text-5xl">MULTIMETALS LTD.</span><span className="font-brutal-head text-5xl text-neon">★</span>
          </div>
        </div>
      </section>
    </div>
  );
}