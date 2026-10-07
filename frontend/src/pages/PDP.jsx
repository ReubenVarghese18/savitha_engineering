import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import RFQFooter from '../components/RFQFooter';
import { products as fallbackProducts } from '../data/products';
import { useQuote } from '../context/QuoteContext';
import { apiFetch } from '../api/client';

// ── BLUEPRINT IMAGE PLACEHOLDER FOR PDP ───────────────────────────────
function PDPBlueprintPlaceholder({ title }) {
  return (
    <div className="relative w-full h-full bg-[#0d2a4a] overflow-hidden flex flex-col items-center justify-center font-mono text-white/50 p-6 min-h-[350px] border-2 border-black">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }}></div>
      {/* Hatching */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pdpBlueprintHatch" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="20" stroke="#ffffff" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pdpBlueprintHatch)" />
      </svg>
      {/* CAD Markings */}
      <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-[#00E5FF] font-bold">SAVITHA_ENG // CAD_REF_PDP</div>
      <div className="absolute bottom-4 right-4 text-[10px] uppercase tracking-widest text-[#00E5FF] font-bold">SCALE: N.T.S. // VERIFIED</div>
      <div className="border-2 border-dashed border-white/30 p-8 flex flex-col items-center justify-center max-w-[80%] text-center bg-[#0d2a4a]/50 backdrop-blur-xs">
        <span className="material-symbols-outlined text-5xl text-[#00E5FF] mb-3 animate-pulse">schema</span>
        <span className="text-sm uppercase font-bold tracking-widest text-white mb-2">SCHEMATIC DIAGRAM PENDING</span>
        <span className="text-xs text-white/60 lowercase italic max-w-full truncate">{title}</span>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="no-roundness bg-[#0A0A0B] text-white min-h-screen flex flex-col antialiased selection:bg-[#FF4D00] selection:text-black stark-grid">
      <Helmet>
        <title>Product Not Found | Savitha Engineering</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="max-w-xl w-full border-[3px] border-white p-10 shadow-[8px_8px_0px_0px_#FF4D00]">
          <p className="font-mono text-xs tracking-[0.2em] text-[#FF4D00] mb-4">ERROR // 404</p>
          <h1 className="text-5xl font-black uppercase leading-none mb-6">Product not found</h1>
          <p className="text-gray-300 mb-8">
            This product doesn&apos;t exist or is no longer listed in our catalog.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/products" className="px-6 py-3 bg-[#FF4D00] text-black font-black uppercase tracking-widest border-[3px] border-white hover:bg-white transition-colors">
              Browse catalog
            </Link>
            <Link to="/" className="px-6 py-3 bg-transparent text-white font-black uppercase tracking-widest border-[3px] border-white hover:bg-white hover:text-black transition-colors">
              Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PDPPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addProductToQuote, removeProductFromQuote, isProductInQuote } = useQuote();

  // ── DATA LAYER: Local-first with full API sync ────────────────────────
  const [products, setProducts] = useState(fallbackProducts);
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
        // API offline — fallbackProducts already in state
        console.warn('[PDP] API unavailable — using local data.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadProducts();
    return () => { cancelled = true; };
  }, []);
  // ─────────────────────────────────────────────────────────────────────

  // Resolve the current product from state (works with both API and fallback data)
  const matchedProduct = products.find(p => p.id === productId || p.sku === productId);
  const product = matchedProduct || products[0];

  const isAdded = product ? isProductInQuote(product.id) : false;

  // Define Stitch design images as fallbacks
  const stitchImages = {
    main: "https://lh3.googleusercontent.com/aida-public/AB6AXuCskBtt9nfvKxam6XK3b5GcI_QUf3lAceCuRSyu-0jvNhdikuZtE5hTXJwz0KG5JOZjs2WdJe4Ae1NCZ3kuUxjkDmnX4xTTPXC5y5ZwtsAnsfn3944YEzXO0tifflWexKUBTOR8_qfQvTPUGC-wiA4koYclAZs6Lhajlc4-8OGXZjP8LseYMBz3rdf77k5hgqmogCi2THFtZIgSBgJwHAJxCN-DaSKGPfaUklON4Ifxlub_2FUpzdVcCJ62_go60_tqYL2msDRPL4w",
    element: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2dhu72Yf5drn22D1tScJCVJ99lwfvflu9ddvPxMfcVw-y6C9pX-nHt92uXW55vmR-6pYsRBwe3uFL5nvoSZzc2o27XkcdQ5lJgPqy_eyxcuwXQX5ytFE1oq5_7h7KEHY0keo364OV1P3WuMt5UFPU26RFTrvVHTkXKW4YBVtlyKd-XOCC_egMVJ6qzcMqMGCdwigazYU0F-xnN2ARLhJPmDHlaXsKl5n4Wt6K2jU2-tGUYr21dTxpj1NK4a7_1JSjtCTfOJoLwZo",
    control: "https://lh3.googleusercontent.com/aida-public/AB6AXuAi_sqr5ZL3fwjOlndUKP2eM7IN6FKRdDOf4-w4tmt0jtGFxhNIaQryKH46g_y3nGk2irvLhbQ35-Lp8BsDsn11MQsK1qKnduJntJZcakGPUJGlMW1Z3_-djZ1IdSeiNxWPhhGnzTR8vPOnvAy76AuVWAl74yDfd9F1I89zKh7N7widkwYuZ0Btcb9WVsM2CzJUnCcKtblCRSIZ0Q1ZZ7SKp-NhBwrTJh9eaT7pfPmbCN5xhcdl42B56e_hDTZ_zmyjh1VKOMNy4gI",
    hinges: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9Vj4lvnKgpWpYsgHNtLehhSRx44rdT8Dy75nEx8CuAp4opYZ1Z1c4WClCWH4QaFsojIGlmD96LzG3Y8Z86jltZLg1ZFogD1X9LvSR8pwYBS51bt6-UFO_GyYRE9IIipH-d9MmWSAK006-spHzK_GzpKBfXBglXehPwVd7DSoKxl55UXZWkXvXXqZs_VfWIinqBGIPNvfQJpjcJeY9TQsIqly8Hj_YtwHfvGJ3EDlQ-7nekkDWgMIyWoaXqG9FlP95so1phyU4fg4"
  };

  const isMuffleCategory = product.category === "Industrial Batch & Box Furnaces";
  const [activeImage, setActiveImage] = useState(isMuffleCategory ? stitchImages.main : null);

  useEffect(() => {
    // Reset active image if product changes
    setActiveImage(isMuffleCategory ? stitchImages.main : null);
    window.scrollTo(0, 0);
  }, [product.id, isMuffleCategory]);

  const handleQuoteToggle = () => {
    if (!product) return;
    if (isAdded) {
      removeProductFromQuote(product.id);
    } else {
      addProductToQuote(product);
    }
  };

  // ── BRUTALIST LOADING SCREEN ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="no-roundness bg-[#0A0A0B] text-white min-h-screen flex flex-col antialiased selection:bg-[#FF4D00] selection:text-black stark-grid">
        <Navbar />
        <div className="plp-page-content flex-grow w-full bg-[#fff8f6] text-[#281813] font-space pb-24 relative">
          <main className="max-w-[1600px] mx-auto min-h-screen px-6 lg:px-12 py-10">
            {/* Breadcrumb Skeleton */}
            <div className="w-64 h-4 bg-[#e5e5e5] mb-8"></div>
            
            {/* Header Skeleton */}
            <div className="mb-10">
              <div className="w-3/4 md:w-1/2 h-16 bg-[#e5e5e5] mb-4"></div>
              <div className="w-48 h-6 bg-[#e5e5e5]"></div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Left Gallery Skeleton */}
              <div className="xl:col-span-7">
                <div className="border-2 border-black w-full aspect-square bg-[repeating-linear-gradient(45deg,#f4f4f4,#f4f4f4_10px,#ffffff_10px,#ffffff_20px)] brutal-shadow-stitch p-4">
                   <div className="w-full h-full border-2 border-black bg-white"></div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-2 border-black aspect-square bg-[repeating-linear-gradient(45deg,#f4f4f4,#f4f4f4_10px,#ffffff_10px,#ffffff_20px)] p-1">
                       <div className="w-full h-full bg-white border border-gray-200"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel Skeleton */}
              <div className="xl:col-span-5 flex flex-col gap-8">
                <div className="border-2 border-black h-[400px] bg-[repeating-linear-gradient(45deg,#f4f4f4,#f4f4f4_10px,#ffffff_10px,#ffffff_20px)] brutal-shadow-stitch p-6 flex flex-col justify-between">
                   <div className="w-1/3 h-6 bg-black mb-4"></div>
                   <div className="w-full h-24 bg-white border-2 border-black"></div>
                   <div className="w-full h-16 bg-black mt-4"></div>
                </div>
                <div className="border-2 border-black h-[300px] bg-[repeating-linear-gradient(45deg,#f4f4f4,#f4f4f4_10px,#ffffff_10px,#ffffff_20px)] brutal-shadow-stitch p-6">
                   <div className="w-1/2 h-6 bg-black mb-6"></div>
                   <div className="space-y-4">
                     <div className="w-full h-12 bg-white border-2 border-black"></div>
                     <div className="w-full h-12 bg-white border-2 border-black"></div>
                     <div className="w-full h-12 bg-white border-2 border-black"></div>
                   </div>
                </div>
              </div>
            </div>
          </main>

          {/* Loading Overlay */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="bg-white border-2 border-black px-8 py-4 shadow-[4px_4px_0px_0px_#f24a0d] flex items-center gap-3">
              <span className="text-[#f24a0d] font-mono font-bold text-2xl tracking-widest uppercase">Acquiring Specs</span>
              <span className="text-[#f24a0d] font-mono font-bold text-2xl animate-blink w-4">_</span>
            </div>
          </div>
        </div>
        <RFQFooter />
      </div>
    );
  }

  if (!matchedProduct) return <ProductNotFound />;
  // ─────────────────────────────────────────────────────────────────────

  const metaDesc = `${product.title} (${product.category}). Max temp: ${product.tempText}. ${product.specifications?.shortDescription || product.description || ''}`.substring(0, 155) + '...';

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description,
    "sku": product.sku,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Max Temperature",
        "value": product.tempText || "N/A"
      },
      {
        "@type": "PropertyValue",
        "name": "Heating Element",
        "value": product.specifications?.heatingElement || "N/A"
      },
      {
        "@type": "PropertyValue",
        "name": "Precision Control",
        "value": product.specifications?.precisionControl || "N/A"
      },
      {
        "@type": "PropertyValue",
        "name": "Fuel Source",
        "value": product.fuel || "N/A"
      }
    ]
  };

  return (
    <div className="no-roundness bg-[#0A0A0B] text-white min-h-screen flex flex-col antialiased selection:bg-[#FF4D00] selection:text-black stark-grid">
      <Helmet>
        <title>{`${product.title} - ${product.sku} | Savitha Engineering`}</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:title" content={`${product.title} - ${product.sku} | Savitha Engineering`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      <Navbar />

      <div className="plp-page-content flex-grow w-full bg-[#fff8f6] text-[#281813] font-space pb-24">
        <main className="max-w-[1600px] mx-auto min-h-screen px-6 lg:px-12 py-10">

          {/* Breadcrumbs */}
          <nav className="mb-8 font-mono text-[11px] uppercase flex flex-wrap items-center gap-2 text-gray-500 tracking-wider">
            <Link to="/" className="hover:text-stitch-primary hover:underline">HOME</Link>
            <span>/</span>
            <Link to="/catalog" className="hover:text-stitch-primary hover:underline">CATALOG</Link>
            <span>/</span>
            <Link
              to="/products"
              state={{ category: product.category }}
              className="hover:text-stitch-primary hover:underline"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-stitch-on-background font-bold">{product.sku}</span>
          </nav>

          {/* Product Header */}
          <div className="mb-10">
            <h1 className="font-sans text-4xl md:text-[64px] font-extrabold uppercase leading-none tracking-tighter mb-4 text-stitch-on-background">
              {product.title.split(' ').map((word, i, arr) => (
                <span key={i}>
                  {i === arr.length - 1 ? <span className="text-stitch-primary">{word}</span> : word + ' '}
                </span>
              ))}
            </h1>
            <div className="inline-block bg-stitch-on-background text-stitch-surface-container-lowest px-4 py-1 font-mono text-xs uppercase tracking-widest">
              {product.material.toUpperCase()} | HEAVY DUTY CONSTRUCT
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* Left: Gallery Column */}
            <div className="xl:col-span-7">
              <div className="border-2 border-stitch-on-background p-4 brutal-shadow-stitch bg-stitch-surface-white">
                <div className="relative w-full aspect-square bg-stitch-industrial-gray overflow-hidden">
                  {activeImage ? (
                    <img
                      alt={product.title}
                      className="w-full h-full object-cover grayscale contrast-125 transition-all duration-300"
                      src={activeImage}
                    />
                  ) : (
                    <PDPBlueprintPlaceholder title={product.title} />
                  )}
                  <div className="absolute top-4 left-4 bg-stitch-primary text-white px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                    MODEL: {product.sku}
                  </div>
                </div>
              </div>

              {/* Thumbnail Selector Grid */}
              <div className="grid grid-cols-4 gap-4 mt-8">
                {isMuffleCategory ? (
                  <>
                    <button
                      onClick={() => setActiveImage(stitchImages.main)}
                      className={`border-2 border-stitch-on-background aspect-square bg-stitch-surface-white overflow-hidden p-1 transition-all ${activeImage === stitchImages.main ? 'border-stitch-primary scale-95 ring-2 ring-stitch-primary' : 'grayscale hover:grayscale-0'
                        }`}
                    >
                      <img className="w-full h-full object-cover" src={stitchImages.main} alt="Chassis Profile" />
                    </button>
                    <button
                      onClick={() => setActiveImage(stitchImages.element)}
                      className={`border-2 border-stitch-on-background aspect-square bg-stitch-surface-white overflow-hidden p-1 transition-all ${activeImage === stitchImages.element ? 'border-stitch-primary scale-95 ring-2 ring-stitch-primary' : 'grayscale hover:grayscale-0'
                        }`}
                    >
                      <img className="w-full h-full object-cover" src={stitchImages.element} alt="Element Detail" />
                    </button>
                    <button
                      onClick={() => setActiveImage(stitchImages.control)}
                      className={`border-2 border-stitch-on-background aspect-square bg-stitch-surface-white overflow-hidden p-1 transition-all ${activeImage === stitchImages.control ? 'border-stitch-primary scale-95 ring-2 ring-stitch-primary' : 'grayscale hover:grayscale-0'
                        }`}
                    >
                      <img className="w-full h-full object-cover" src={stitchImages.control} alt="Control Systems" />
                    </button>
                    <button
                      onClick={() => setActiveImage(stitchImages.hinges)}
                      className={`border-2 border-stitch-on-background aspect-square bg-stitch-surface-white overflow-hidden p-1 transition-all ${activeImage === stitchImages.hinges ? 'border-stitch-primary scale-95 ring-2 ring-stitch-primary' : 'grayscale hover:grayscale-0'
                        }`}
                    >
                      <img className="w-full h-full object-cover" src={stitchImages.hinges} alt="Structural Hinges" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveImage(null)}
                      className={`border-2 border-stitch-on-background aspect-square bg-stitch-surface-white flex items-center justify-center p-1 transition-all font-mono text-[10px] ${activeImage === null ? 'border-stitch-primary ring-2 ring-stitch-primary' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                      SCHEMATIC
                    </button>
                    <button
                      onClick={() => setActiveImage(stitchImages.main)}
                      className={`border-2 border-stitch-on-background aspect-square bg-stitch-surface-white overflow-hidden p-1 transition-all ${activeImage === stitchImages.main ? 'border-stitch-primary ring-2 ring-stitch-primary' : 'grayscale hover:grayscale-0'
                        }`}
                    >
                      <img className="w-full h-full object-cover" src={stitchImages.main} alt="Generic Ref" />
                    </button>
                    <div className="border-2 border-dashed border-gray-400 aspect-square flex items-center justify-center text-gray-400 font-mono text-[9px] uppercase p-2 text-center select-none">
                      IMG_02 PENDING
                    </div>
                    <div className="border-2 border-dashed border-gray-400 aspect-square flex items-center justify-center text-gray-400 font-mono text-[9px] uppercase p-2 text-center select-none">
                      IMG_03 PENDING
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Specs & Action Panel */}
            <div className="xl:col-span-5 flex flex-col gap-8">

              {/* Primary Actions Card */}
              <div className="border-2 border-stitch-on-background p-8 bg-stitch-surface-white brutal-shadow-stitch flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="bg-stitch-on-background text-white font-mono text-[10px] px-3 py-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    IN STOCK / READY TO SHIP
                  </div>
                  <div className="font-mono text-xs text-stitch-primary font-bold uppercase">SKU: {product.sku}</div>
                </div>

                <div className="bg-stitch-surface-container-low border-l-4 border-stitch-primary p-4">
                  <h3 className="font-sans text-[15px] font-bold mb-1 uppercase text-stitch-on-background">Custom Engineering Available</h3>
                  <p className="text-[13px] text-gray-700 leading-relaxed">
                    Standard configurations ship within 14 business days. For specialized thermal profiles, atmospheric controls, or dimensions, consult our engineering department.
                  </p>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed font-sans border-b border-gray-200 pb-4">
                  {product.description}
                </p>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleQuoteToggle}
                    className={`w-full text-white border-2 border-stitch-on-background py-6 px-4 font-sans text-sm font-bold uppercase tracking-widest brutal-shadow-stitch brutal-shadow-hover-stitch brutal-shadow-active-stitch transition-all flex items-center justify-center gap-4 cursor-pointer ${isAdded ? 'bg-black hover:bg-white hover:text-black' : 'bg-stitch-primary'
                      }`}
                  >
                    <span className="material-symbols-outlined">{isAdded ? 'check_circle' : 'add_shopping_cart'}</span>
                    {isAdded ? '[ REMOVE FROM QUOTE ]' : 'ADD TO QUOTE'}
                  </button>

                  <a
                    href="#contact"
                    className="w-full bg-white text-stitch-on-background border-2 border-stitch-on-background py-4 px-4 font-mono text-xs uppercase font-bold hover:bg-stitch-industrial-gray transition-colors flex items-center justify-center gap-2 text-center decoration-none"
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                    CONTACT SALES FOR CUSTOM SPECS
                  </a>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="border-2 border-stitch-on-background bg-stitch-surface-white brutal-shadow-stitch overflow-hidden">
                <div className="bg-stitch-on-background p-3 flex justify-between items-center">
                  <h3 className="font-mono text-xs text-stitch-surface-container-lowest uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">analytics</span>
                    TECHNICAL_DATA_REPORT // {product.sku}
                  </h3>
                  <span className="font-mono text-[10px] text-stitch-primary font-bold uppercase">VERIFIED_2026</span>
                </div>

                <div className="grid grid-cols-1 font-mono text-xs">
                  {/* Dynamic Temp Value */}
                  <div className="border-b border-stitch-on-background/10 p-4 flex justify-between items-center hover:bg-stitch-surface-container-low transition-colors">
                    <div className="flex flex-col">
                      <span className="text-stitch-primary font-bold text-[9px] leading-none mb-1">[01]</span>
                      <span className="text-gray-500 uppercase text-[10px]">MAX TEMP RANGE</span>
                    </div>
                    <span className="font-bold text-stitch-on-background">{product.tempText}</span>
                  </div>

                  {/* Dynamic Fuel Value */}
                  <div className="border-b border-stitch-on-background/10 p-4 flex justify-between items-center hover:bg-stitch-surface-container-low transition-colors">
                    <div className="flex flex-col">
                      <span className="text-stitch-primary font-bold text-[9px] leading-none mb-1">[02]</span>
                      <span className="text-gray-500 uppercase text-[10px]">FUEL SOURCE</span>
                    </div>
                    <span className="font-bold text-stitch-on-background">{product.fuel}</span>
                  </div>

                  {/* Dynamic Operation Value */}
                  <div className="border-b border-stitch-on-background/10 p-4 flex justify-between items-center hover:bg-stitch-surface-container-low transition-colors">
                    <div className="flex flex-col">
                      <span className="text-stitch-primary font-bold text-[9px] leading-none mb-1">[03]</span>
                      <span className="text-gray-500 uppercase text-[10px]">HEARTH OPERATION</span>
                    </div>
                    <span className="font-bold text-stitch-on-background">{product.operation}</span>
                  </div>

                  {/* Dynamic Spec: Heating Element */}
                  <div className="border-b border-stitch-on-background/10 p-4 flex justify-between items-center hover:bg-stitch-surface-container-low transition-colors">
                    <div className="flex flex-col">
                      <span className="text-stitch-primary font-bold text-[9px] leading-none mb-1">[04]</span>
                      <span className="text-gray-500 uppercase text-[10px]">HEATING SOURCE</span>
                    </div>
                    <span className="font-bold text-stitch-on-background">{product.specifications?.heatingElement || 'Data Pending'}</span>
                  </div>

                  {/* Dynamic Spec: Thermocouple */}
                  <div className="border-b border-stitch-on-background/10 p-4 flex justify-between items-center hover:bg-stitch-surface-container-low transition-colors">
                    <div className="flex flex-col">
                      <span className="text-stitch-primary font-bold text-[9px] leading-none mb-1">[05]</span>
                      <span className="text-gray-500 uppercase text-[10px]">THERMOCOUPLE TYPE</span>
                    </div>
                    <span className="font-bold text-stitch-on-background">{product.specifications?.thermocouple || 'Data Pending'}</span>
                  </div>

                  {/* Dynamic Spec: Electrical Phase */}
                  <div className="border-b border-stitch-on-background/10 p-4 flex justify-between items-center hover:bg-stitch-surface-container-low transition-colors">
                    <div className="flex flex-col">
                      <span className="text-stitch-primary font-bold text-[9px] leading-none mb-1">[06]</span>
                      <span className="text-gray-500 uppercase text-[10px]">ELECTRICAL PHASE</span>
                    </div>
                    <span className="font-bold text-stitch-on-background">{product.specifications?.electricalPhase || 'Data Pending'}</span>
                  </div>

                  {/* Dynamic Spec: Insulation */}
                  <div className="border-b border-stitch-on-background/10 p-4 flex justify-between items-center hover:bg-stitch-surface-container-low transition-colors">
                    <div className="flex flex-col">
                      <span className="text-stitch-primary font-bold text-[9px] leading-none mb-1">[07]</span>
                      <span className="text-gray-500 uppercase text-[10px]">INSULATION</span>
                    </div>
                    <span className="font-bold text-stitch-on-background">{product.specifications?.insulation || 'Data Pending'}</span>
                  </div>

                  {/* Dynamic Spec: Dimensions */}
                  <div className="p-4 flex justify-between items-center hover:bg-stitch-surface-container-low transition-colors">
                    <div className="flex flex-col">
                      <span className="text-stitch-primary font-bold text-[9px] leading-none mb-1">[08]</span>
                      <span className="text-gray-500 uppercase text-[10px]">DIMENSIONS</span>
                    </div>
                    <span className="font-bold text-stitch-on-background">{product.specifications?.dimensions || 'Consult Engineering'}</span>
                  </div>
                </div>

                <div className="bg-stitch-industrial-gray p-2 border-t-2 border-stitch-on-background flex justify-center">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">// END OF SPECIFICATION REPORT //</span>
                </div>
              </div>

            </div>
          </div>

          {/* Secondary Info Sections */}
          <section className="mt-20 border-4 border-stitch-on-background bg-stitch-surface-white overflow-hidden brutal-shadow-stitch">
            <div className="grid grid-cols-1 md:grid-cols-2 border-b-4 border-stitch-on-background">

              {/* Precision Control Section */}
              <div className="p-10 border-r-0 md:border-r-4 border-stitch-on-background">
                <h4 className="font-sans text-lg font-bold uppercase mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-stitch-primary block"></span> Precision Control System
                </h4>
                <p className="text-base text-gray-700 mb-8 leading-relaxed font-sans">
                  Equipped with the SAVITHA-PX9 Microprocessor, offering 32-step programmable PID control. Real-time data logging via RS-485 interface allows for seamless integration into existing industrial SCADA networks.
                </p>
                <ul className="grid grid-cols-1 gap-4 font-mono text-[11px] uppercase">
                  {product.specifications?.precisionControl
                    ? product.specifications.precisionControl.split(';').map((item, i) => (
                        <li key={i} className="flex items-center gap-3 bg-stitch-surface-container-low p-3 border-2 border-stitch-on-background">
                          <span className="material-symbols-outlined text-stitch-primary text-sm">check_circle</span> {item.trim()}
                        </li>
                      ))
                    : (
                        <li className="flex items-center gap-3 bg-stitch-surface-container-low p-3 border-2 border-stitch-on-background">
                          <span className="material-symbols-outlined text-stitch-primary text-sm">check_circle</span> Data Pending
                        </li>
                      )
                  }
                </ul>
              </div>

              {/* Structural Integrity Section */}
              <div className="p-10">
                <h4 className="font-sans text-lg font-bold uppercase mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-stitch-on-background block"></span> Structural Integrity
                </h4>
                <p className="text-base text-gray-700 mb-8 leading-relaxed font-sans">
                  Double-walled construction with fan-assisted air cooling ensures the outer shell remains safe to touch even at maximum operating temperatures. Triple-layer high-density ceramic fiber insulation minimizes heat loss.
                </p>
                <ul className="grid grid-cols-1 gap-4 font-mono text-[11px] uppercase">
                  {product.specifications?.structuralIntegrity
                    ? product.specifications.structuralIntegrity.split(';').map((item, i) => (
                        <li key={i} className="flex items-center gap-3 bg-stitch-surface-container-low p-3 border-2 border-stitch-on-background">
                          <span className="material-symbols-outlined text-stitch-primary text-sm">check_circle</span> {item.trim()}
                        </li>
                      ))
                    : (
                        <li className="flex items-center gap-3 bg-stitch-surface-container-low p-3 border-2 border-stitch-on-background">
                          <span className="material-symbols-outlined text-stitch-primary text-sm">check_circle</span> Data Pending
                        </li>
                      )
                  }
                </ul>
              </div>

            </div>

            <div className="bg-stitch-surface-variant p-6 text-center font-sans text-sm font-bold text-gray-800 uppercase tracking-wider">
              Verification status: Certified for ISO 9001:2015 Industrial Heating Applications.
            </div>
          </section>

          {/* Dimensions & Logistics */}
          <div className="mt-12 border-2 border-stitch-on-background bg-stitch-on-background p-1 brutal-shadow-stitch">
            <div className="bg-stitch-surface-white p-6 border-b-2 border-stitch-on-background">
              <h3 className="font-sans text-lg font-bold uppercase text-stitch-on-background">Dimensions &amp; Logistics // CAD blueprint</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 bg-stitch-on-background gap-[2px]">
              <div className="bg-stitch-surface-white p-6 flex flex-col justify-between">
                <span className="font-mono text-[10px] text-gray-500 uppercase block mb-2">Internal Chamber (WxDxH)</span>
                <span className="font-sans text-lg font-bold text-stitch-on-background">{product.specifications?.dimensions || 'Consult Engineering'}</span>
              </div>
              <div className="bg-stitch-surface-white p-6 flex flex-col justify-between">
                <span className="font-mono text-[10px] text-gray-500 uppercase block mb-2">External Footprint (WxDxH)</span>
                <span className="font-sans text-lg font-bold text-stitch-on-background">{product.specifications?.dimensions || 'Consult Engineering'}</span>
              </div>
              <div className="bg-stitch-surface-white p-6 flex flex-col justify-between">
                <span className="font-mono text-[10px] text-gray-500 uppercase block mb-2">Shipping Weight</span>
                <span className="font-sans text-lg font-bold text-stitch-on-background">Consult Engineering</span>
              </div>
            </div>
          </div>

          {/* Technical Consultation Section */}
          <div className="mt-12 bg-stitch-primary p-8 border-2 border-stitch-on-background brutal-shadow-stitch flex flex-col md:flex-row justify-between items-center gap-8 text-white">
            <div>
              <h3 className="font-sans text-xl md:text-2xl font-bold uppercase mb-2">Have Technical Questions?</h3>
              <p className="text-sm opacity-90 leading-relaxed font-sans">
                Our engineering team is available for direct consultation on custom thermal profiles, material compatibility, and power considerations.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <a
                href="https://wa.me/918044464594"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-black px-8 py-4 font-mono text-xs uppercase font-bold border-2 border-stitch-on-background shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 decoration-none text-center"
              >
                <span className="material-symbols-outlined text-sm">chat</span> WHATSAPP ENGINEER
              </a>
              <a
                href="mailto:info@savithaeng.com"
                className="bg-stitch-surface-white text-stitch-on-background px-8 py-4 font-mono text-xs uppercase font-bold border-2 border-stitch-on-background shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 decoration-none text-center"
              >
                <span className="material-symbols-outlined text-sm">mail</span> EMAIL SUPPORT
              </a>
            </div>
          </div>

        </main>
      </div>

      <RFQFooter />
    </div>
  );
}
