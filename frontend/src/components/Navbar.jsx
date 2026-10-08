import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuote } from '../context/QuoteContext';

export default function Navbar() {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [activeSection, setActiveSection] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedProducts } = useQuote();
  const quoteCount = selectedProducts ? selectedProducts.length : 0;
  const isPDP = location.pathname.startsWith('/products/') && location.pathname !== '/products';

  // Determine button text and styling based on 3-tier contextual logic
  let ctaText = '';
  let ctaClasses = '';

  if (quoteCount > 0) {
    // State A: Active Cart (Global)
    ctaText = `[ QUOTE CART (${quoteCount}) ]`;
    ctaClasses = 'bg-[#FA5D19] text-white brutalist-border hover:bg-white hover:text-black border-white hover:brightness-110';
  } else if (isPDP) {
    // State B: Empty Cart (on PDP)
    ctaText = '[ QUOTE CART (0) ]';
    ctaClasses = 'bg-transparent border-2 border-black text-black hover:bg-black hover:text-white';
  } else {
    // State C: Empty Cart (OG Landing/PLP)
    ctaText = '[ REQUEST QUOTE ]';
    ctaClasses = 'bg-[#FA5D19] text-white brutalist-border hover:bg-white hover:text-black border-white hover:brightness-110';
  }

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const handleScrollActive = () => {
      const sections = ['infrastructure', 'services', 'founders-legacy'];
      let currentActive = '';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            currentActive = sectionId;
            break;
          }
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScrollActive);
    handleScrollActive(); // Run once initially
    return () => window.removeEventListener('scroll', handleScrollActive);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/products') {
      setVisible(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/products') {
        setVisible(true);
        return;
      }
      const currentScrollPos = window.scrollY;

      // Ignore scroll event if it's bounce scroll (iOS)
      if (currentScrollPos < 0) return;

      // Show navbar if scrolling up or if close to the top
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 50;

      setVisible(isVisible);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos, location.pathname]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (id) => {
    if (id === 'contact' || location.pathname === '/') {
      scrollToSection(id);
    } else {
      navigate('/#' + id);
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };


  return (
    <nav aria-label="Main" className={`sticky top-0 w-full p-6 z-50 bg-surface border-b border-white/10 transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex justify-between items-center max-w-6xl mx-auto w-full">
        {/* Left: Logo */}
        <div className="flex items-center gap-4 cursor-pointer justify-start" onClick={handleLogoClick}>
          <div className="w-12 h-12 bg-white flex items-center justify-center brutalist-border">
            <svg className="w-8 h-8 text-black fill-current" viewBox="0 0 24 24">
              <path d="M12,2C10.5,5.5,12.5,8.5,13.5,10c1.2,1.8,1.2,3.5,0.5,5c-0.8,1.8-3,2.5-4.5,1.5c-1-0.7-1.5-2-1-3.5c0.5-1.5,1.5-2.5,1.5-2.5s-4,2.5-4,6.5c0,4,3,7,7,7s7-3,7-7C20,7,12,2,12,2z" />
            </svg>
          </div>
          <span className="font-brutal-head text-white tracking-tighter text-xl">SAVITHA</span>
        </div>

        {/* Right Group: Navigation links and CTA button */}
        <div className="hidden lg:flex items-center gap-12">
          <div className="flex justify-start gap-12 items-center">
            <button 
              className={`uppercase text-sm font-semibold tracking-wider transition-colors cursor-pointer bg-transparent border-none ${
                location.pathname === '/products' ? 'text-[#FA5D19]' : 'text-gray-300 hover:text-white'
              }`} 
              onClick={() => navigate('/products')}
            >
              PRODUCTS
            </button>

            {/* COMPANY Dropdown */}
            <div className="relative group py-2">
              <button 
                className={`uppercase text-sm font-semibold tracking-wider transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1 focus:outline-none ${
                  ['infrastructure', 'services', 'founders-legacy'].includes(activeSection) ? 'text-[#FA5D19]' : 'text-gray-300 hover:text-white'
                }`}
              >
                COMPANY
                <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:rotate-180">keyboard_arrow_down</span>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 bg-black border-2 border-black hidden group-hover:block z-50 shadow-brutal text-left">
                <button 
                  className={`w-full text-left px-6 py-3 hover:bg-[#FA5D19] hover:text-black transition-colors text-sm font-semibold tracking-wider uppercase cursor-pointer border-none bg-transparent ${
                    activeSection === 'infrastructure' ? 'text-[#FA5D19] font-bold' : 'text-gray-300'
                  }`}
                  onClick={() => handleNavClick('infrastructure')}
                >
                  INFRASTRUCTURE
                </button>
                <div className="border-t border-white/10 w-full"></div>
                <button 
                  className={`w-full text-left px-6 py-3 hover:bg-[#FA5D19] hover:text-black transition-colors text-sm font-semibold tracking-wider uppercase cursor-pointer border-none bg-transparent ${
                    activeSection === 'services' ? 'text-[#FA5D19] font-bold' : 'text-gray-300'
                  }`}
                  onClick={() => handleNavClick('services')}
                >
                  QUALITY (TQM)
                </button>
                <div className="border-t border-white/10 w-full"></div>
                <button 
                  className={`w-full text-left px-6 py-3 hover:bg-[#FA5D19] hover:text-black transition-colors text-sm font-semibold tracking-wider uppercase cursor-pointer border-none bg-transparent ${
                    activeSection === 'founders-legacy' ? 'text-[#FA5D19] font-bold' : 'text-gray-300'
                  }`}
                  onClick={() => handleNavClick('founders-legacy')}
                >
                  OUR LEGACY
                </button>
              </div>
            </div>
          </div>

          <button 
            className={`px-8 py-3 transition-all cursor-pointer font-sans font-bold uppercase tracking-wide ${ctaClasses}`}
            onClick={() => handleNavClick('contact')}
          >
            {ctaText}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden w-12 h-12 flex items-center justify-center bg-transparent border-2 border-white text-white cursor-pointer"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
            {menuOpen ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="lg:hidden max-w-6xl mx-auto w-full mt-6 pt-2 border-t border-white/10 flex flex-col">
          {[
            ['PRODUCTS', () => navigate('/products')],
            ['INFRASTRUCTURE', () => handleNavClick('infrastructure')],
            ['QUALITY (TQM)', () => handleNavClick('services')],
            ['OUR LEGACY', () => handleNavClick('founders-legacy')],
          ].map(([label, go]) => (
            <button
              key={label}
              className="text-left uppercase text-base font-semibold tracking-wider text-gray-200 py-4 bg-transparent border-0 border-b border-white/10 cursor-pointer"
              onClick={() => { setMenuOpen(false); go(); }}
            >
              {label}
            </button>
          ))}
          <button
            className={`mt-6 px-8 py-4 cursor-pointer font-sans font-bold uppercase tracking-wide ${ctaClasses}`}
            onClick={() => { setMenuOpen(false); handleNavClick('contact'); }}
          >
            {ctaText}
          </button>
        </div>
      )}
    </nav>
  );
}