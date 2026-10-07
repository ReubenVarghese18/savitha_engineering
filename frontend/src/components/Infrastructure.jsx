import React from 'react';

const stats = [
  { value: '1976', label: 'Year Established' },
  { value: '100%', label: 'Customizable Solutions' },
  { value: '20%', label: 'Export Volume' },
  { value: 'ISO', label: 'Compliance Standards' },
];

export default function Infrastructure() {
  return (
    <div>
      <section className="py-20 bg-neon brutalist-border border-x-0" id="infrastructure">
        <div className="px-6 max-w-6xl mx-auto">
          <div className="brutalist-border border-black bg-black p-1 overflow-hidden">
            <div className="bg-black border-b-4 border-white overflow-hidden py-6">
              <div className="flex marquee-fast whitespace-nowrap">
                <div className="flex items-center gap-16 px-10">
                  <span className="font-brutal-head text-2xl text-white">PROPRIETARY MS/SS STRUCTURAL FRAMEWORKS</span>
                  <span className="text-neon font-black">/</span>
                  <span className="font-brutal-head text-2xl text-white">ADVANCED REFRACTORY SYSTEMS</span>
                  <span className="text-neon font-black">/</span>
                  <span className="font-brutal-head text-2xl text-white">PRECISION SWITCH GEAR INTEGRATION</span>
                  <span className="text-neon font-black">/</span>
                  <span className="font-brutal-head text-2xl text-white">HIGH-EFFICIENCY THERMAL CORE DYNAMICS</span>
                  <span className="text-neon font-black">/</span>
                </div>
                <div className="flex items-center gap-16 px-10">
                  <span className="font-brutal-head text-2xl text-white">PROPRIETARY MS/SS STRUCTURAL FRAMEWORKS</span>
                  <span className="text-neon font-black">/</span>
                  <span className="font-brutal-head text-2xl text-white">ADVANCED REFRACTORY SYSTEMS</span>
                  <span className="text-neon font-black">/</span>
                  <span className="font-brutal-head text-2xl text-white">PRECISION SWITCH GEAR INTEGRATION</span>
                  <span className="text-neon font-black">/</span>
                  <span className="font-brutal-head text-2xl text-white">HIGH-EFFICIENCY THERMAL CORE DYNAMICS</span>
                  <span className="text-neon font-black">/</span>
                </div>
              </div>
            </div>
            <div className="p-12 text-white bg-black/90">
              <div className="mb-12 text-center">
                <h2 className="font-brutal-head text-4xl md:text-6xl lg:text-8xl uppercase tracking-tighter mb-4">Global Scale &amp; <span className="text-primary">Infrastructure</span></h2>
                <p className="font-black uppercase tracking-[0.2em] text-sm opacity-50">Strategic Industrial Operations &amp; Compliance Matrix</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="p-6 brutalist-border bg-white/5 group hover:border-primary transition-colors text-center flex flex-col items-center justify-center min-h-[160px] py-4">
                    <div className="font-brutal-head text-primary mb-2 text-5xl md:text-6xl leading-none">{stat.value}</div>
                    <div className="font-black uppercase tracking-widest text-[10px] opacity-60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="px-6 max-w-6xl mx-auto py-24" id="founders-legacy">
        <div className="overlap-grid gap-y-12 lg:gap-x-12 items-center">
          <div className="col-span-12 lg:col-span-6 brutalist-border p-4 bg-white brutalist-shadow">
            <img alt="Industrial Leadership" className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMMhHgW1B83VcC0GaoBeAlCFV2FU5_h2PafoG76kX5ezqo0ENJpQR3p1JJUa4bbNi8DV8k53GF0Ud5QFPscyazIP1jYhKTuu6h-NLW6unQ_1SoTHmnA5ZGTCupo4kaB8dg7-9HCvb3aE3kU_Qsypc2iFab5Sj2bthe_FJsAaCp5h-_Z75v5SHjnSA9VxeZA3WrqPjZLhkB2zZev1_1PIU6ohnruldaSYMlIMeEAtIGTnBBfKHWC4N2OcjrDfud1oLGD3rVZJzeyk4" />
          </div>
          <div className="col-span-12 lg:col-span-6 space-y-12">
            <div className="border-l-8 border-neon pl-8">
              <h2 className="font-brutal-head leading-[0.9] text-white text-4xl lg:text-6xl">Guided by<br /><span className="text-primary">Vision</span>,<br />Built on<br /><span className="text-primary">Integrity</span>.</h2>
            </div>
            <div className="max-w-xl">
              <p className="font-bold text-xl lg:text-2xl leading-relaxed uppercase opacity-90">Under the visionary guidance of Mr. Sajith Daniel Varghese, Savitha Engineering has grown from a local Mumbai workshop into a premier subcontinent exporter.</p>
              <p className="mt-8 font-medium text-lg leading-relaxed text-white/70">Our transparent business practices and client-centric approach are why industry giants like Exide and Crompton Greaves trust us with their most critical thermal infrastructure.</p>
            </div>
            <div className="pt-8">
              <div className="inline-block bg-white text-black px-8 py-2 font-black brutalist-shadow uppercase tracking-widest">Engineering Leadership Since 1976</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}