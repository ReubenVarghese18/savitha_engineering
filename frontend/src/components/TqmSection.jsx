import { useState, useEffect } from 'react';

const tqmDetails = {
  "01": {
    number: "01",
    title: "PREMIUM MATERIAL INTEGRITY",
    subheading: "MATERIAL COMPOSITION & RAW SOURCING",
    points: [
      "Premium Procurement: All industrial furnaces and ovens are constructed using premium raw materials, specifically high-grade MS/SS sheets and structures.",
      "Refractory Components: Structural cores are insulated using premium refractory material and top-tier electrical switch gears sourced directly from reputed vendors in the market.",
      "Physical Durability: Materials are selected specifically to ensure extreme functional longevity, abrasion resistance, and absolute dimensional accuracy.",
      "Customization Base: Raw materials can be adapted to custom-built furnaces to suit required production rates and available shop space."
    ]
  },
  "02": {
    number: "02",
    title: "ZERO-DEFECT TESTING",
    subheading: "NDT & TOTAL QUALITY MANAGEMENT",
    points: [
      "TQM Policy: We strictly enforce a total quality management (TQM) policy during manufacturing, serving as our primary competitive advantage.",
      "Quality Controllers: A dedicated team of expert quality controllers, working alongside research associates and technocrats, rigorously checks all finished products across multiple parameters to ensure complete flawlessness.",
      "Testing Facilities: We maintain dedicated in-house testing facilities to verify that all products strictly meet international quality norms and standards.",
      "Corrosion Resistance: Final assemblies are tested to verify high corrosion and abrasion resistance before deployment."
    ]
  },
  "03": {
    number: "03",
    title: "ADVANCED THERMAL ANALYSIS",
    subheading: "REAL-TIME OPERATION & EFFICIENCY METRICS",
    points: [
      "Air Re-circulation Systems: Thermal chambers utilize highly efficient, powerful air re-circulation systems using gas, oil, or electrical elements.",
      "Uniform Heating: Furnaces are equipped with invertors to control fans, enabling reversing air flow and perfectly uniform heating across all multiple control zones.",
      "Temperature Measurement: Advanced contact thermocouple probes are automated to measure the actual billet temperature inside the chamber in real-time.",
      "Cooling Systems: Forced air cooling chambers operate simultaneously with optional water quench systems to manage the thermal lifecycle."
    ]
  }
};

export default function TqmSection() {
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [activeModal]);

  const splitText = (text) => {
    const colonIndex = text.indexOf(':');
    if (colonIndex !== -1) {
      const boldPart = text.substring(0, colonIndex + 1);
      const regularPart = text.substring(colonIndex + 1);
      return (
        <>
          <strong>{boldPart}</strong>{regularPart}
        </>
      );
    }
    return text;
  };

  const activeDetails = activeModal ? tqmDetails[activeModal] : null;

  return (
    <section className="bg-white text-black overflow-hidden py-24 min-h-[850px] flex items-center justify-center" id="services">
      <div className="px-6 max-w-6xl mx-auto w-full text-center flex flex-col items-center justify-center">
        <div className="my-auto px-8 md:px-16">
          <h2 className="font-brutal-head text-[clamp(2.2rem,7vw,7rem)] leading-[0.85] flex flex-col lg:text-[9.5rem] xl:text-[11rem] text-center">
            <span>TOTAL QUALITY</span>
            <span className="text-neon">MANAGEMENT</span>
          </h2>
        </div>

        {/*
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 brutalist-border border-black items-stretch lg:p-8 bg-white">
          <div className="bg-white border-b-4 lg:border-b-0 lg:border-r-4 border-black group hover:bg-black hover:text-white transition-colors duration-300 flex flex-col p-16">
            <span className="font-brutal-head text-4xl text-neon/40 mb-4 block group-hover:text-primary transition-colors">01</span>
            <h3 className="font-brutal-head text-2xl mb-6">PREMIUM MATERIAL INTEGRITY</h3>
            <p className="font-bold text-sm uppercase opacity-80 mb-8 leading-relaxed">High-grade MS/SS sheets and structures combined with advanced refractory materials for maximum thermal efficiency.</p>
            <a onClick={(e) => handleOpenModal(e, '01')} className="inline-block bg-black text-white px-6 py-3 font-black group-hover:bg-neon mt-auto text-center cursor-pointer" href="#">PROCESS →</a>
          </div>

          <div className="bg-white border-b-4 lg:border-b-0 lg:border-r-4 border-black group hover:bg-black hover:text-white transition-colors duration-300 flex flex-col p-16">
            <span className="font-brutal-head text-4xl text-neon/40 mb-4 block group-hover:text-primary transition-colors">02</span>
            <h3 className="font-brutal-head text-2xl mb-6">ZERO-DEFECT TESTING</h3>
            <p className="font-bold text-sm uppercase opacity-80 mb-8 leading-relaxed">Rigorous multi-parameter evaluation including thermal mapping, leak detection, and stress tests for international standards compliance.</p>
            <a onClick={(e) => handleOpenModal(e, '02')} className="inline-block bg-black text-white px-6 py-3 font-black group-hover:bg-neon mt-auto text-center cursor-pointer" href="#">CONSULT →</a>
          </div>

          <div className="bg-white group hover:bg-black hover:text-white transition-colors duration-300 flex flex-col p-16">
            <span className="font-brutal-head text-4xl text-neon/40 mb-4 block group-hover:text-primary transition-colors">03</span>
            <h3 className="font-brutal-head text-2xl mb-6">ADVANCED THERMAL ANALYSIS</h3>
            <p className="font-bold text-sm uppercase opacity-80 mb-8 leading-relaxed">Real-time spectral analysis of molten alloys to guarantee exact chemical compositions and precision heating core dynamics.</p>
            <a onClick={(e) => handleOpenModal(e, '03')} className="inline-block bg-black text-white px-6 py-3 font-black group-hover:bg-neon mt-auto text-center cursor-pointer" href="#">ANALYZE →</a>
          </div>
        </div>
        */}
      </div>

      {/* TQM Detail Modal */}
      {activeDetails && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full p-12 relative max-h-[90vh] overflow-y-auto text-black">
            {/* Close Button */}
            <div
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-8 text-4xl font-black cursor-pointer hover:text-orange-500 select-none text-black"
            >
              ✕
            </div>

            {/* Process Number */}
            <span className="text-orange-500 font-sans font-black text-6xl md:text-8xl leading-none">
              {activeDetails.number}
            </span>

            {/* Title */}
            <h2 className="font-sans font-black uppercase text-4xl md:text-5xl mt-2 border-b-8 border-black pb-6 text-black">
              {activeDetails.title}
            </h2>

            {/* Subheading */}
            <span className="font-mono font-bold text-orange-500 uppercase block text-lg tracking-widest mt-8 mb-6">
              {activeDetails.subheading}
            </span>

            {/* Points List */}
            <div className="space-y-6 text-left">
              {activeDetails.points.map((point, index) => (
                <div className="flex items-start mb-6" key={index}>
                  <div className="w-3 h-3 bg-black mt-2 mr-6 flex-shrink-0"></div>
                  <p className="font-sans font-normal text-xl text-gray-900 leading-relaxed">
                    {splitText(point)}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="bg-black text-white font-sans font-black uppercase text-xl px-8 py-5 mt-10 w-full md:w-auto hover:bg-orange-500 hover:text-black transition-colors duration-200 border-2 border-transparent hover:border-black cursor-pointer block"
            >
              CLOSE SPECIFICATION
            </button>
          </div>
        </div>
      )}
    </section>
  );
}