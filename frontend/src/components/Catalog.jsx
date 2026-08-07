import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Catalog() {
  const navigate = useNavigate();

  const goToCatalog = () => {
    navigate('/products');
  };

  const handleCardClick = (categoryName) => {
    navigate('/products', { state: { category: categoryName } });
  };

  return (
    <section className="px-6 max-w-6xl mx-auto py-24" id="products">
      <div className="mb-32 flex flex-col lg:flex-row justify-between items-end gap-12">
        <h2 className="font-brutal-head text-[clamp(2rem,6.5vw,6rem)] flex-1 leading-[0.85]">PRECISION<br/>CATALOG</h2>
        <div className="brutalist-border p-8 bg-neon text-white brutalist-shadow max-w-xl">
          <p className="font-black text-lg uppercase leading-tight">
            A comprehensive range of high-performance thermal systems designed for modern industrial scale.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Card 1 */}
        <div 
          onClick={() => handleCardClick('Heavy-Duty Melting Furnaces')}
          className="group relative bg-white text-black brutalist-border hover:-translate-y-4 transition-transform duration-300 min-h-[500px] py-16 px-10 flex flex-col justify-between cursor-pointer"
        >
          <div className="absolute -top-6 -right-6 bg-primary text-white w-16 h-16 flex items-center justify-center font-brutal-head text-xl">01</div>
          <div>
            <span className="material-symbols-outlined text-7xl block text-primary mb-16">factory</span>
            <h3 className="font-brutal-head text-3xl mb-10 leading-tight">Heavy-Duty Melting Furnaces</h3>
            <p className="font-bold leading-relaxed opacity-80 uppercase text-sm">High-efficiency Ferrous, Non-Ferrous, Rotary, and Skelner melting furnaces engineered for heavy industrial and foundry applications.</p>
          </div>
          <div className="h-2 w-full bg-black group-hover:bg-primary transition-colors"></div>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => handleCardClick('Precision Annealing Systems')}
          className="group relative bg-black text-white brutalist-border border-white hover:-translate-y-4 transition-transform duration-300 min-h-[500px] py-16 px-10 flex flex-col justify-between text-center cursor-pointer"
        >
          <div className="absolute -top-6 -right-6 bg-white text-black w-16 h-16 flex items-center justify-center font-brutal-head text-xl">02</div>
          <div>
            <span className="material-symbols-outlined text-7xl block text-primary mb-16">thermostat</span>
            <h3 className="font-brutal-head text-3xl mb-10 leading-tight">Precision Annealing Systems</h3>
            <p className="font-bold leading-relaxed opacity-80 uppercase text-sm">Advanced Pit Type, Tube, Roller Hearth, and Bright Annealing furnaces designed for precise heat treatment and metallurgical control.</p>
          </div>
          <div className="h-2 w-full bg-white group-hover:bg-primary transition-colors"></div>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => handleCardClick('Industrial Batch & Box Furnaces')}
          className="group relative bg-white text-black brutalist-border hover:-translate-y-4 transition-transform duration-300 min-h-[500px] py-16 px-10 flex flex-col justify-between cursor-pointer"
        >
          <div className="absolute -top-6 -right-6 bg-primary text-white w-16 h-16 flex items-center justify-center font-brutal-head text-xl">03</div>
          <div>
            <span className="material-symbols-outlined text-7xl block text-primary mb-16">view_in_ar</span>
            <h3 className="font-brutal-head text-3xl mb-10 leading-tight">Industrial Batch &amp; Box Furnaces</h3>
            <p className="font-bold leading-relaxed opacity-80 uppercase text-sm">Rugged Box Type, Pusher Type, and Muffle furnaces built for controlled, consistent batch processing environments.</p>
          </div>
          <div className="h-2 w-full bg-black group-hover:bg-primary transition-colors"></div>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => handleCardClick('High-Temperature Forging Furnaces')}
          className="group relative bg-black text-white brutalist-border border-white hover:-translate-y-4 transition-transform duration-300 min-h-[500px] py-16 px-10 flex flex-col justify-between text-center cursor-pointer"
        >
          <div className="absolute -top-6 -right-6 bg-white text-black w-16 h-16 flex items-center justify-center font-brutal-head text-xl">04</div>
          <div>
            <span className="material-symbols-outlined text-7xl block text-primary mb-16">hardware</span>
            <h3 className="font-brutal-head text-3xl mb-10 leading-tight">High-Temperature Forging Furnaces</h3>
            <p className="font-bold leading-relaxed opacity-80 uppercase text-sm">Heavy-duty metal forging and Billet Heating furnaces manufactured for extreme temperature resilience and dimensional accuracy.</p>
          </div>
          <div className="h-2 w-full bg-white group-hover:bg-primary transition-colors"></div>
        </div>

        {/* Card 5 */}
        <div 
          onClick={() => handleCardClick('Industrial Electrode Ovens')}
          className="group relative bg-white text-black brutalist-border hover:-translate-y-4 transition-transform duration-300 min-h-[500px] py-16 px-10 flex flex-col justify-between cursor-pointer"
        >
          <div className="absolute -top-6 -right-6 bg-primary text-white w-16 h-16 flex items-center justify-center font-brutal-head text-xl">05</div>
          <div>
            <span className="material-symbols-outlined text-7xl block text-primary mb-16">oven</span>
            <h3 className="font-brutal-head text-3xl mb-10 leading-tight">Industrial &amp; Electrode Ovens</h3>
            <p className="font-bold leading-relaxed opacity-80 uppercase text-sm">Custom-designed industrial batch ovens and electrode drying ovens built for uniform heat distribution and long-term durability.</p>
          </div>
          <div className="h-2 w-full bg-black group-hover:bg-primary transition-colors"></div>
        </div>

        {/* Card 6 */}
        <div 
          onClick={() => handleCardClick('Custom & Special Purpose Solutions')}
          className="group relative bg-black text-white brutalist-border border-white hover:-translate-y-4 transition-transform duration-300 min-h-[500px] py-16 px-10 flex flex-col justify-between text-center cursor-pointer"
        >
          <div className="absolute -top-6 -right-6 bg-white text-black w-16 h-16 flex items-center justify-center font-brutal-head text-xl">06</div>
          <div>
            <span className="material-symbols-outlined text-7xl block text-primary mb-16">architecture</span>
            <h3 className="font-brutal-head text-3xl mb-10 leading-tight">Custom &amp; Special Purpose Solutions</h3>
            <p className="font-bold leading-relaxed opacity-80 uppercase text-sm">Tailor-made setups including Electrically Heated Bogie Hearth Furnaces, High-Temperature Ceramic Tube Furnaces, and Heat Exchange Equipment.</p>
          </div>
          <div className="h-2 w-full bg-white group-hover:bg-primary transition-colors"></div>
        </div>
      </div>

      <div className="flex w-full justify-center mt-20 mb-20">
        <button
          onClick={goToCatalog}
          className="border-[#f24a0d] bg-[#f24a0d] text-white hover:bg-white hover:text-[#f24a0d] px-12 py-6 font-brutal-head text-2xl tracking-widest uppercase transition-colors duration-300 w-full max-w-[600px] mx-auto brutalist-shadow cursor-pointer rounded-none"
        >
          EXPLORE COMPLETE PRODUCT CATALOG
        </button>
      </div>
    </section>
  );
}