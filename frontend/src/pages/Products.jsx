import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RFQFooter from '../components/RFQFooter';
import { products as dummyProducts } from '../data/products';
import { useQuote } from '../context/QuoteContext';
import { apiFetch } from '../api/client';
import { Helmet } from 'react-helmet-async';

// ── BLUEPRINT IMAGE PLACEHOLDER SUB-COMPONENT ────────────────────────
function BlueprintPlaceholder({ title }) {
  return (
    <div className="relative w-full h-full bg-[#0d2a4a] overflow-hidden flex flex-col items-center justify-center font-mono text-white/50 p-4 min-h-[200px]">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }}></div>
      {/* Diagonal hatching */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="blueprintHatch" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="20" stroke="#ffffff" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprintHatch)" />
      </svg>
      {/* Crosshairs / Blueprint details */}
      <div className="absolute top-2 left-2 text-[9px] uppercase tracking-widest text-[#00E5FF] font-bold">SAVITHA_ENG // CAD_REF</div>
      <div className="absolute bottom-2 right-2 text-[9px] uppercase tracking-widest text-[#00E5FF] font-bold">SCALE: N.T.S.</div>
      <div className="border border-dashed border-white/30 p-4 flex flex-col items-center justify-center max-w-[80%] text-center bg-[#0d2a4a]/50 backdrop-blur-xs">
        <span className="material-symbols-outlined text-4xl text-[#00E5FF] mb-2 animate-pulse">schema</span>
        <span className="text-xs uppercase font-bold tracking-widest text-white mb-1">IMAGE PENDING</span>
        <span className="text-[10px] text-white/60 lowercase italic max-w-full truncate">{title}</span>
      </div>
    </div>
  );
}

// ── PRODUCT CARD GRID SUB-COMPONENT (From Stitch Grid View) ───────────
function ProductCardGrid({ title, specs, imagePlaceholder, sku }) {
  const { addProductToQuote, removeProductFromQuote, isProductInQuote } = useQuote();
  const product = dummyProducts.find(p => p.sku === sku);
  const isAdded = product ? isProductInQuote(product.id) : false;

  const handleQuoteClick = () => {
    if (!product) return;
    if (isAdded) {
      removeProductFromQuote(product.id);
    } else {
      addProductToQuote(product);
    }
  };

  return (
    <article className="product-card brutal-border bg-white flex flex-col shadow-brutal rounded-sm relative">
      <div className="relative h-64 overflow-hidden border-b-2 border-black bg-[#0d2a4a]">
        {imagePlaceholder ? (
          <img className="product-img w-full h-full object-cover" src={imagePlaceholder} alt={title} />
        ) : (
          <BlueprintPlaceholder title={title} />
        )}
        <span className="absolute top-0 left-0 bg-black text-white font-mono text-[10px] px-2 py-1 uppercase z-10">{sku}</span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold uppercase mb-4 leading-tight">{title}</h3>
        <div className="grid grid-cols-2 gap-2 mb-8 bg-[#F4F4F4] p-3 border border-black/10">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase">Max Temp</span>
            <span className="font-mono text-[13px] font-bold">{specs.maxTemp}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase">Mode</span>
            <span className="font-mono text-[13px] font-bold">{specs.operation}</span>
          </div>
          <div className="col-span-2 mt-1 pt-1 border-t border-black/5">
            <span className="text-[10px] text-gray-500 uppercase">Fuel Type</span>
            <span className="font-mono text-[13px] font-bold">{specs.fuel}</span>
          </div>
        </div>
        <div className="mt-auto flex flex-col space-y-3">
          <button
            onClick={handleQuoteClick}
            className={`w-full border-2 border-black py-3 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${isAdded
                ? 'bg-black text-white hover:bg-white hover:text-black'
                : 'bg-primary text-white hover:bg-black hover:text-white'
              }`}
          >
            {isAdded ? '[ ADDED TO QUOTE ]' : 'ADD TO QUOTE'}
          </button>
          <Link
            to={`/products/${sku}`}
            className="w-full text-center bg-white text-black border-2 border-black py-2 font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-[#F4F4F4] transition-colors cursor-pointer block no-underline"
          >
            VIEW SPECS
          </Link>
        </div>
      </div>
    </article>
  );
}

// ── PRODUCT LIST ITEM SUB-COMPONENT (From Stitch List View) ───────────
function ProductListItem({ title, specs, imagePlaceholder, sku, status }) {
  const { addProductToQuote, removeProductFromQuote, isProductInQuote } = useQuote();
  const product = dummyProducts.find(p => p.sku === sku);
  const isAdded = product ? isProductInQuote(product.id) : false;

  const handleQuoteClick = () => {
    if (!product) return;
    if (isAdded) {
      removeProductFromQuote(product.id);
    } else {
      addProductToQuote(product);
    }
  };

  return (
    <article className="product-card brutal-border bg-white p-6 flex flex-col shadow-brutal rounded-sm relative">
      <div className="absolute top-2 left-2 px-2 py-1 bg-black text-white font-mono text-[10px] uppercase z-10">
        {status || 'IN_STOCK'}
      </div>
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Left: Image container (approx 40% to 45% width) */}
        <div className="w-full md:w-2/5 shrink-0">
          <div className="brutal-border-light bg-[#F4F4F4] overflow-hidden h-64 w-full relative">
            {imagePlaceholder ? (
              <img alt={title} className="product-img w-full h-full object-cover" src={imagePlaceholder} />
            ) : (
              <BlueprintPlaceholder title={title} />
            )}
          </div>
        </div>

        {/* Right: Content container (remaining space) */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 justify-between">
          <div className="flex-1 flex flex-col justify-center">
            <span className="font-mono text-xs text-gray-500 block mb-1">{sku}</span>
            <h2 className="text-xl font-bold uppercase mb-2 tracking-tight">{title}</h2>
            <div className="grid grid-cols-3 gap-4 font-mono text-[13px] border-y border-black py-3">
              <div className="flex flex-col">
                <span className="text-gray-500 uppercase text-[10px]">Max Temp</span>
                <span className="font-bold">{specs.maxTemp}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 uppercase text-[10px]">Mode</span>
                <span className="font-bold">{specs.operation}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 uppercase text-[10px]">Fuel Type</span>
                <span className="font-bold">{specs.fuel}</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-48 shrink-0 flex flex-col gap-2 justify-center">
            <button
              onClick={handleQuoteClick}
              className={`w-full brutal-border font-bold uppercase py-2 text-sm shadow-brutal transition-all focus:outline-none rounded-sm cursor-pointer ${isAdded
                  ? 'bg-black text-white hover:bg-white hover:text-black shadow-brutal-sm'
                  : 'bg-primary text-black hover:bg-black hover:text-white hover:shadow-brutal-sm'
                }`}
            >
              {isAdded ? '[ Added to Quote ]' : 'Add to Quote'}
            </button>
            <Link
              to={`/products/${sku}`}
              className="w-full text-center brutal-border bg-white text-black font-bold uppercase py-2 text-sm hover:bg-[#F4F4F4] transition-colors focus:outline-none rounded-sm cursor-pointer block no-underline"
            >
              View Specs
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── LOADING STATE COMPONENT ───────────────────────────────────────────
function LoadingState() {
  return (
    <div className="relative flex-grow min-h-[600px] w-full bg-white p-6 md:p-8 border-2 border-black rounded-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-2 border-black rounded-sm h-[380px] bg-[repeating-linear-gradient(45deg,#f4f4f4,#f4f4f4_10px,#ffffff_10px,#ffffff_20px)] shadow-brutal flex flex-col p-4">
            <div className="h-48 border-2 border-black bg-white mb-4 rounded-none"></div>
            <div className="h-6 bg-black w-3/4 mb-4 rounded-none"></div>
            <div className="space-y-2 mt-auto">
              <div className="h-4 bg-black w-full rounded-none"></div>
              <div className="h-4 bg-black w-5/6 rounded-none"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center">
        <div className="bg-white border-2 border-black px-8 py-4 shadow-brutal flex items-center gap-3 rounded-sm">
          <span className="text-primary font-mono font-bold text-2xl tracking-widest uppercase">Calculating Specs</span>
          <span className="text-primary font-mono font-bold text-2xl animate-blink w-4">_</span>
        </div>
      </div>
    </div>
  );
}

// ── EMPTY STATE COMPONENT ─────────────────────────────────────────────
function EmptyState({ onClearFilters }) {
  return (
    <div className="flex-grow flex items-center justify-center bg-[#F9F9F9] px-4 py-20 w-full border-2 border-black rounded-sm">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="atmospheric-glow"></div>
          <div className="border border-black bg-white flex items-center justify-center relative mb-4 w-80 h-80 overflow-hidden rounded-sm">
            <div className="scanline animate-scanline"></div>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#E5E5E5" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#diagonalHatch)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <span className="material-symbols-outlined text-primary font-light" style={{ fontVariationSettings: '"wght" 100', fontSize: "140px", opacity: 0.9 }}>block</span>
            </div>
            <div className="absolute top-0 left-0 w-8 h-8">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-primary"></div>
              <div className="absolute top-0 left-0 w-[1px] h-full bg-primary"></div>
            </div>
            <div className="absolute top-0 right-0 w-8 h-8">
              <div className="absolute top-0 right-0 w-full h-[1px] bg-primary"></div>
              <div className="absolute top-0 right-0 w-[1px] h-full bg-primary"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-8 h-8">
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-primary"></div>
              <div className="absolute bottom-0 left-0 w-[1px] h-full bg-primary"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8">
              <div className="absolute bottom-0 right-0 w-full h-[1px] bg-primary"></div>
              <div className="absolute bottom-0 right-0 w-[1px] h-full bg-primary"></div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
            No Exact Matches Found
          </h1>
          <p className="text-[15px] text-[#737373] max-w-[320px] mx-auto leading-relaxed">
            Adjust your requirements or contact engineering for custom fabrication.
          </p>
        </div>
        <div className="pt-4">
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 text-primary font-medium hover:text-[#d83a00] transition-none bg-transparent border-none cursor-pointer"
          >
            <span className="border-b border-primary group-hover:border-[#d83a00] pb-0.5 font-mono uppercase text-sm font-bold">Clear Filters</span>
            <span className="material-symbols-outlined text-sm sharp-transition group-hover:translate-x-1" style={{ fontVariationSettings: '"FILL" 0' }}>arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState('list');

  // ── DATA LAYER: Local-first with full API sync ────────────────────────
  const [products, setProducts] = useState(dummyProducts); // instant local render
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadProducts = async () => {
      try {
        const apiData = await apiFetch('/furnaces/');
        if (!cancelled && apiData && apiData.length > 0) {
          // Normalize the API shape into the camelCase shape the render expects.
          const normalized = apiData.filter(p => p.is_active !== false).map(p => ({
            id:            p.sku || String(p.id),
            sku:           p.sku || String(p.id),
            productId:     p.sku || String(p.id),
            title:         p.name,
            category:      p.category,
            material:      p.material,
            fuel:          p.fuel,
            operation:     p.operation,
            tempText:      p.temp_text,
            maxTempVal:    p.max_temp_val,
            description:   p.description,
            imagePlaceholder: null, // images not yet in DB
            specifications: {
              specificMaxTemp:    p.specs?.specific_max_temp   ?? null,
              heatingElement:    p.specs?.heating_element     ?? null,
              thermocouple:      p.specs?.thermocouple        ?? null,
              electricalPhase:   p.specs?.electrical_phase    ?? null,
              insulation:        p.specs?.insulation          ?? null,
              dimensions:        p.specs?.dimensions          ?? null,
              precisionControl:  p.specs?.precision_control   ?? null,
              structuralIntegrity: p.specs?.structural_integrity ?? null,
              shortDescription:  p.short_description          ?? null,
            },
          }));
          setProducts(normalized);
        }
      } catch {
        // API offline — dummyProducts already in state, nothing to do
        console.warn('[Products] API unavailable — using local data.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadProducts();
    return () => { cancelled = true; };
  }, []);
  // ─────────────────────────────────────────────────────────────────────

  // Set initial selectedCategory from router state if present
  const [selectedCategory, setSelectedCategory] = useState(
    (location.state && location.state.category) || 'All Products'
  );

  const [tempFilters, setTempFilters] = useState([]);
  const [fuelFilters, setFuelFilters] = useState([]);
  const [materialFilters, setMaterialFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Listen to routing state changes and pre-select category
  useEffect(() => {
    if (location.state && location.state.category) {
      setSelectedCategory(location.state.category);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleClearFilters = () => {
    setTempFilters([]);
    setFuelFilters([]);
    setMaterialFilters([]);
    setSelectedCategory("All Products");
    setSearchQuery("");
  };

  const filteredProducts = products.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (selectedCategory !== "All Products" && p.category !== selectedCategory) {
      return false;
    }

    if (tempFilters.length > 0) {
      let match = false;
      if (tempFilters.includes("< 500°C") && p.maxTempVal < 500) match = true;
      if (tempFilters.includes("500°C - 1000°C") && p.maxTempVal >= 500 && p.maxTempVal <= 1000) match = true;
      if (tempFilters.includes("> 1000°C") && p.maxTempVal > 1000) match = true;
      if (!match) return false;
    }

    if (fuelFilters.length > 0) {
      const matchesFuel = fuelFilters.some(filter => {
        if (filter === "Electric") return p.fuel.toLowerCase().includes("electric");
        if (filter === "Gas (Natural/LPG)") return p.fuel.toLowerCase().includes("gas");
        if (filter === "Oil") return p.fuel.toLowerCase().includes("oil");
        return false;
      });
      if (!matchesFuel) return false;
    }

    if (materialFilters.length > 0) {
      // If the product is Universal / Multi-Metal, it matches all material selections
      const isUniversal = p.material.toLowerCase().includes("universal") || p.material.toLowerCase().includes("multi-metal");
      if (!isUniversal) {
        const matchesMaterial = materialFilters.some(filter => {
          const lowerMat = p.material.toLowerCase();
          const lowerFlt = filter.toLowerCase();

          if (lowerFlt === "ferrous") {
            return lowerMat.includes("ferrous") || lowerMat.includes("steel");
          }
          if (lowerFlt === "aluminium") {
            return lowerMat.includes("aluminium") || lowerMat.includes("aluminum");
          }
          if (lowerFlt === "copper") {
            return lowerMat.includes("copper");
          }
          if (lowerFlt === "brass") {
            return lowerMat.includes("brass");
          }
          return lowerMat.includes(lowerFlt);
        });
        if (!matchesMaterial) return false;
      }
    }

    return true;
  });

  return (
    <div className="no-roundness bg-[#0A0A0B] text-white min-h-screen flex flex-col antialiased selection:bg-[#f24a0d] selection:text-black stark-grid">
      <Helmet>
        <title>Industrial Furnaces &amp; Ovens Catalog | Savitha Engineering</title>
        <meta name="description" content="Browse Savitha Engineering's range of melting furnaces, annealing systems, batch and box furnaces and industrial ovens. Request a quote online." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Industrial Furnaces &amp; Ovens Catalog | Savitha Engineering" />
        <meta property="og:description" content="Browse Savitha Engineering's range of melting furnaces, annealing systems, batch and box furnaces and industrial ovens. Request a quote online." />
      </Helmet>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap');

        .plp-page-content {
          font-family: 'Space Grotesk', sans-serif;
          background-color: #ffffff;
          color: #000000;
        }

        .plp-page-content .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .plp-page-content .brutal-border {
          border: 2px solid #000000 !important;
        }

        .plp-page-content .brutal-border-light {
          border: 1px solid #000000 !important;
        }

        .plp-page-content .brutal-checkbox {
          appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid #000000;
          border-radius: 0px !important;
          outline: none;
          cursor: pointer;
          position: relative;
          background-color: #ffffff;
        }

        .plp-page-content .brutal-checkbox:checked {
          background-color: #f24a0d !important;
          border-color: #000000 !important;
        }

        .plp-page-content .brutal-checkbox:checked::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 6px;
          width: 6px;
          height: 10px;
          border: solid #000000;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .plp-page-content .product-card {
          transition: all 0.2s ease;
          border-radius: 0.125rem !important;
        }

        .plp-page-content .product-card:hover {
          box-shadow: 6px 6px 0px 0px #f24a0d !important;
          transform: translate(-2px, -2px);
        }

        .plp-page-content .product-img {
          filter: grayscale(100%);
          transition: filter 0.3s ease;
        }

        .plp-page-content .product-card:hover .product-img {
          filter: grayscale(0%);
        }

        .plp-page-content .scanline {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, transparent, #f24a0d, transparent);
          box-shadow: 0 0 12px #f24a0d;
          z-index: 10;
          pointer-events: none;
        }

        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        .plp-page-content .animate-scanline {
          animation: scan 4s linear infinite;
        }

        .plp-page-content .atmospheric-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 120%;
          height: 120%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(242, 74, 13, 0.1) 0%, rgba(242, 74, 13, 0) 70%);
          pointer-events: none;
          z-index: -1;
        }

        .plp-page-content .sharp-transition {
          transition: transform 0.1s steps(1);
        }

        .plp-page-content .shadow-brutal {
          box-shadow: 4px 4px 0px 0px #000000 !important;
        }

        .plp-page-content .shadow-brutal-sm {
          box-shadow: 2px 2px 0px 0px #000000 !important;
        }

        @keyframes custom-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .plp-page-content .animate-blink {
          animation: custom-blink 1s step-end infinite;
        }

        .plp-page-content .bg-primary {
          background-color: #f24a0d !important;
        }
        .plp-page-content .text-primary {
          color: #f24a0d !important;
        }
        .plp-page-content .border-primary {
          border-color: #f24a0d !important;
        }

        @media (min-width: 768px) {
          .products-sidebar-sticky {
            position: sticky !important;
            top: 97px !important;
            max-height: calc(100vh - 97px) !important;
            overflow-y: auto !important;
          }
        }
      `}} />

      <Navbar />

      <div className="plp-page-content flex-grow w-full bg-white text-black">
        <div className="flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
          {/* Mobile filter toggle */}
          <button
            type="button"
            className="md:hidden w-full flex justify-between items-center px-6 py-4 bg-black text-white font-mono text-sm font-bold uppercase tracking-widest border-0 cursor-pointer"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <span>[ FILTERS ]</span>
            <span>{filtersOpen ? '−' : '+'}</span>
          </button>

          {/* Sidebar */}
          <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-full md:w-[280px] shrink-0 border-b-[2px] md:border-b-0 md:border-r-[2px] border-black bg-white p-6 products-sidebar-sticky`}>
            <div className="mb-8">
              <h3 className="text-lg font-bold uppercase border-b-[2px] border-black pb-2 mb-4">Technical Filters</h3>
              <p className="font-mono text-xs text-gray-600 uppercase">SYS_REF: FLT_01A</p>
            </div>

            {/* Filter Group 1: Temp Range */}
            <div className="mb-8">
              <h4 className="font-bold uppercase text-sm mb-3">Temperature Range</h4>
              <div className="space-y-3 font-mono text-sm">
                {[
                  { id: "< 500°C", label: "< 500°C" },
                  { id: "500°C - 1000°C", label: "500°C - 1000°C" },
                  { id: "> 1000°C", label: "> 1000°C" }
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="brutal-checkbox group-hover:border-primary"
                      checked={tempFilters.includes(opt.id)}
                      onChange={() => setTempFilters(prev => prev.includes(opt.id) ? prev.filter(x => x !== opt.id) : [...prev, opt.id])}
                    />
                    <span className="group-hover:text-primary transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group 2: Fuel Type */}
            <div className="mb-8">
              <h4 className="font-bold uppercase text-sm mb-3">Fuel Type</h4>
              <div className="space-y-3 font-mono text-sm">
                {[
                  { id: "Electric", label: "Electric" },
                  { id: "Gas (Natural/LPG)", label: "Gas (Natural/LPG)" },
                  { id: "Oil", label: "Oil" }
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="brutal-checkbox group-hover:border-primary"
                      checked={fuelFilters.includes(opt.id)}
                      onChange={() => setFuelFilters(prev => prev.includes(opt.id) ? prev.filter(x => x !== opt.id) : [...prev, opt.id])}
                    />
                    <span className="group-hover:text-primary transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group 3: Chamber Material */}
            <div className="mb-8">
              <h4 className="font-bold uppercase text-sm mb-3">Chamber Material</h4>
              <div className="space-y-3 font-mono text-sm">
                {[
                  { id: "Ferrous", label: "Ferrous" },
                  { id: "Non-Ferrous", label: "Non-Ferrous" },
                  { id: "Aluminium", label: "Aluminium" },
                  { id: "Copper", label: "Copper" },
                  { id: "Brass", label: "Brass" }
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="brutal-checkbox group-hover:border-primary"
                      checked={materialFilters.includes(opt.id)}
                      onChange={() => setMaterialFilters(prev => prev.includes(opt.id) ? prev.filter(x => x !== opt.id) : [...prev, opt.id])}
                    />
                    <span className="group-hover:text-primary transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleClearFilters}
              className="w-full brutal-border bg-[#F4F4F4] px-4 py-3 text-xs font-mono font-bold uppercase hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              [ Clear Filters ]
            </button>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 bg-white p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:flex-wrap md:justify-between md:items-center gap-4 mb-8 border-b-[2px] border-black pb-4">
              <h1 className="text-2xl md:text-3xl font-bold uppercase">{selectedCategory}</h1>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-6 w-full md:w-auto">
                {/* Search Bar */}
                <div className="relative w-full sm:w-auto">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">search</span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border-2 border-black py-2 pl-10 pr-4 font-mono text-xs focus:outline-none focus:border-primary focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full sm:w-[200px] uppercase tracking-wider transition-all rounded-none"
                    placeholder="Search Catalog..."
                    type="text"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="relative w-full sm:w-[340px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 appearance-none bg-white border-[4px] border-black rounded-none px-3 text-xs font-mono font-bold uppercase text-black cursor-pointer focus:outline-none focus:ring-0"
                  >
                    <option value="All Products">All Products</option>
                    <option value="Industrial Furnaces">Industrial Furnaces</option>
                    <option value="Heavy-Duty Melting Furnaces">Heavy-Duty Melting Furnaces</option>
                    <option value="Precision Annealing Systems">Precision Annealing Systems</option>
                    <option value="Industrial Batch & Box Furnaces">Industrial Batch & Box Furnaces</option>
                    <option value="High-Temperature Forging Furnaces">High-Temperature Forging Furnaces</option>
                    <option value="Industrial Electrode Ovens">Industrial Electrode Ovens</option>
                    <option value="Custom & Special Purpose Solutions">Custom & Special Purpose Solutions</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-black" style={{ fontSize: "20px" }}>keyboard_arrow_down</span>
                  </div>
                </div>

                {/* Grid vs List View Mode Toggle */}
                <div className="flex gap-2">
                  <button
                    className={`p-1 flex items-center justify-center cursor-pointer brutal-border transition-colors ${viewMode === 'grid' ? 'bg-primary shadow-brutal-sm' : 'bg-white hover:bg-[#F4F4F4]'}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <span className="material-symbols-outlined text-lg text-black">grid_view</span>
                  </button>
                  <button
                    className={`p-1 flex items-center justify-center cursor-pointer brutal-border transition-colors ${viewMode === 'list' ? 'bg-primary shadow-brutal-sm' : 'bg-white hover:bg-[#F4F4F4]'}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <span className="material-symbols-outlined text-lg text-black">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Render Stateful Views */}
            {isLoading ? (
              <LoadingState />
            ) : filteredProducts.length === 0 ? (
              <EmptyState onClearFilters={handleClearFilters} />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((p, idx) => (
                  <ProductCardGrid
                    key={idx}
                    title={p.title}
                    specs={{ maxTemp: p.tempText, operation: p.operation, fuel: p.fuel }}
                    imagePlaceholder={p.imagePlaceholder}
                    sku={p.sku}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {filteredProducts.map((p, idx) => (
                  <ProductListItem
                    key={idx}
                    title={p.title}
                    specs={{ maxTemp: p.tempText, operation: p.operation, fuel: p.fuel }}
                    imagePlaceholder={p.imagePlaceholder}
                    sku={p.sku}
                    status={p.status}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <RFQFooter />
    </div>
  );
}
