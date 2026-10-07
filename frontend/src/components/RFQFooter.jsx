import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuote } from '../context/QuoteContext';
import { apiFetch } from '../api/client';

export default function RFQFooter() {
  const { selectedProducts, removeProductFromQuote, clearQuote } = useQuote();
  const location = useLocation();
  const [full_name, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [requirement_details, setRequirementDetails] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (selectedProducts.length > 0) {
      setErrorMessage('');
    }
  }, [selectedProducts.length]);

  const handleButtonClick = (e) => {
    if (selectedProducts.length === 0) {
      e.preventDefault();
      if (location.pathname === '/products') {
        setErrorMessage("[ ERROR: NO ASSET SELECTED. PLEASE CLICK 'ADD TO QUOTE' ON A PRODUCT ABOVE. ]");
      } else {
        setErrorMessage("[ ERROR: NO ASSET SELECTED. ]");
      }
    }
  };

  const validateForm = () => {
    if (!full_name.trim() || !company.trim()) return 'PLEASE ENTER YOUR NAME AND COMPANY.';
    if (!email.trim() && !phone.trim()) return 'PLEASE ENTER AN EMAIL OR PHONE NUMBER SO WE CAN REPLY.';
    if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return 'PLEASE ENTER A VALID EMAIL ADDRESS.';
    if (phone.trim() && !/^\+?[0-9][0-9\s\-().]{5,28}$/.test(phone.trim())) return 'PLEASE ENTER A VALID PHONE NUMBER.';
    if (!requirement_details.trim()) return 'PLEASE DESCRIBE YOUR REQUIREMENT.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      if (location.pathname === '/products') {
        setErrorMessage("[ ERROR: NO ASSET SELECTED. PLEASE CLICK 'ADD TO QUOTE' ON A PRODUCT ABOVE. ]");
      } else {
        setErrorMessage("[ ERROR: NO ASSET SELECTED. ]");
      }
      return;
    }

    const problem = validateForm();
    if (problem) {
      setErrorMessage(`[ ERROR: ${problem} ]`);
      return;
    }
    setErrorMessage('');

    try {
      await apiFetch('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({
          full_name: full_name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          category: "Multi-Product Quote",
          requirement_details,
          requested_assets: selectedProducts.map(p => p.id),
        }),
      });

      alert(`RFQ TRANSMITTED.\nNAME: ${full_name.toUpperCase()}\nCOMPANY: ${company.toUpperCase()}\n\nOUR TECHNICAL TEAM WILL CONTACT YOU WITHIN 4 HOURS.`);
      setFullName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setRequirementDetails('');
      clearQuote();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('AN ERROR OCCURRED while sending request.');
    }
  };
  
  const scrollToForm = () => { 
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' }); 
    }
  };

  const scrollToTop = () => { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };
  
  return (
    <>
      <footer className="mt-24 bg-[#0A0A0B]" id="contact">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-0 pb-12">
          <div className="w-full border-t-2 border-white/20 relative">
            <div className="absolute -top-2.5 left-8 lg:left-12 bg-[#0A0A0B] px-4 font-mono text-[10px] md:text-xs text-white/40 tracking-[0.2em] uppercase">
              0x04 :: END_LEGACY_FILE // INITIATE_INQUIRY
            </div>
          </div>
        </div>
        <section className="px-6 max-w-6xl mx-auto py-24 pb-32">
          <div className="overlap-grid gap-8">
            <div className="col-span-12 lg:col-span-7 bg-white text-black shadow-[12px_12px_0px_0px_#FA5D19] p-10 lg:p-12">
              <h2 className="font-brutal-head leading-none mb-12 lg:mb-16 text-3xl lg:text-4xl">REQUEST<br />TECHNICAL<br />QUOTE</h2>
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="w-full">
                    <input name="fullName" value={full_name} onChange={(e) => setFullName(e.target.value)} className="w-full bg-gray-100 border-2 border-gray-300 p-3 uppercase text-sm focus:ring-0 focus:border-black placeholder:text-black/30 font-semibold" placeholder="FULL NAME" type="text" required />
                  </div>
                  <div className="w-full">
                    <input name="company" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-gray-100 border-2 border-gray-300 p-3 uppercase text-sm focus:ring-0 focus:border-black placeholder:text-black/30 font-semibold" placeholder="COMPANY" type="text" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="w-full">
                    <input name="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-100 border-2 border-gray-300 p-3 text-sm focus:ring-0 focus:border-black placeholder:text-black/30 font-semibold" placeholder="EMAIL" type="email" autoComplete="email" maxLength={254} />
                  </div>
                  <div className="w-full">
                    <input name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-100 border-2 border-gray-300 p-3 text-sm focus:ring-0 focus:border-black placeholder:text-black/30 font-semibold" placeholder="PHONE" type="tel" autoComplete="tel" maxLength={30} />
                  </div>
                </div>
                <p className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest -mt-4">EMAIL OR PHONE REQUIRED SO OUR TEAM CAN REPLY</p>
                <div className="w-full text-left space-y-3">
                  <label className="block font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    SELECTED ASSETS FOR QUOTE
                  </label>
                  <div className="flex flex-wrap gap-3 p-4 bg-gray-100 border-2 border-gray-300">
                    {selectedProducts.length > 0 ? (
                      selectedProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white border-2 border-black px-4 py-2 shadow-brutal-sm font-mono text-xs font-bold text-black uppercase flex items-center gap-2"
                        >
                          <span>[ {p.title} (ID: {p.sku}) ]</span>
                          <button
                            type="button"
                            onClick={() => removeProductFromQuote(p.id)}
                            className="text-[#FA5D19] hover:text-black font-black font-mono cursor-pointer ml-1 focus:outline-none bg-transparent border-none text-xs"
                          >
                            [X]
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="font-mono text-xs font-bold text-gray-400 uppercase">
                        [ NO ASSETS SELECTED ]
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full">
                  <textarea name="requirements" value={requirement_details} onChange={(e) => setRequirementDetails(e.target.value)} className="w-full bg-gray-100 border-2 border-gray-300 p-3 uppercase text-sm focus:ring-0 focus:border-black placeholder:text-black/30 font-semibold" placeholder="REQUIREMENT DETAILS" rows="3" maxLength={5000} required></textarea>
                </div>
                {errorMessage && (
                  <div className="border-4 border-black bg-[#FF3333] text-white p-6 font-mono font-bold uppercase tracking-wider shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-2xl">error</span>
                      <span>{errorMessage}</span>
                    </div>
                    {location.pathname === '/' && (
                      <div>
                        <Link
                          to="/products"
                          className="inline-block bg-white text-black border-2 border-black px-4 py-2 hover:bg-black hover:text-white font-mono text-xs font-black tracking-widest transition-colors cursor-pointer uppercase rounded-none shadow-brutal-sm hover:shadow-none"
                        >
                          [ BROWSE PRODUCT CATALOG ]
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                <button type="submit" onClick={handleButtonClick} className="w-full bg-neon text-white font-brutal-head text-xl hover:bg-black hover:text-primary transition-colors py-3 brutalist-border border-black cursor-pointer">SUBMIT QUOTE REQUEST</button>
              </form>
            </div>
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
              <div className="bg-black border-4 border-white shadow-[12px_12px_0px_0px_#FA5D19] p-12 flex-1 text-left text-white">
                <h3 className="font-brutal-head text-lg text-neon mb-4">HEADQUARTERS</h3>
                <p className="font-brutal-head text-2xl mb-8">MUMBAI - 400080,<br />MAHARASHTRA, INDIA.</p>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/20 pb-2"><span className="font-bold opacity-50 uppercase text-xs">Compliance</span><span className="font-bold">GSTIN: 27**********1ZP</span></div>
                  <div className="flex justify-between border-b border-white/20 pb-2"><span className="font-bold opacity-50 uppercase text-xs">Hours</span><span className="font-bold">09:00 - 18:00 IST</span></div>
                  <div className="flex justify-between border-b border-white/20 pb-2"><span className="font-bold opacity-50 uppercase text-xs">Direct Line</span><span className="font-bold">+91 8044464594</span></div>
                </div>
              </div>
              <a className="bg-[#25D366] text-black p-4 flex items-center justify-center gap-3 border-4 border-white shadow-[12px_12px_0px_0px_#FA5D19] hover:translate-x-2 transition-transform cursor-pointer" href="https://wa.me/918044464594" target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined text-3xl block">chat</span><span className="font-brutal-head text-lg">WHATSAPP SUPPORT</span>
              </a>
              <a className="bg-[#FA5D19] text-white p-4 flex items-center justify-center gap-3 border-4 border-white shadow-[12px_12px_0px_0px_#FA5D19] hover:translate-x-2 transition-transform cursor-pointer" href="mailto:info@savithaeng.com">
                <span className="material-symbols-outlined text-3xl block">mail</span><span className="font-brutal-head text-lg">EMAIL TECHNICAL TEAM</span>
              </a>
            </div>
          </div>
        </section>
        <div className="bg-white text-black py-20 px-6 border-t-4 border-black">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-20 mb-20">
              <div className="max-w-2xl">
                <div className="flex items-center gap-6 mb-8 cursor-pointer" onClick={scrollToTop}>
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center brutalist-border">
                    <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M12,2C10.5,5.5,12.5,8.5,13.5,10c1.2,1.8,1.2,3.5,0.5,5c-0.8,1.8-3,2.5-4.5,1.5c-1-0.7-1.5-2-1-3.5c0.5-1.5,1.5-2.5,1.5-2.5s-4,2.5-4,6.5c0,4,3,7,7,7s7-3,7-7C20,7,12,2,12,2z"></path></svg>
                  </div>
                  <span className="font-brutal-head text-5xl">SAVITHA ENGINEERING</span>
                </div>
                <p className="font-bold text-2xl leading-tight uppercase">Engineering precision heating solutions since 1976. Custom-built excellence for the nation's most critical industries.</p>
              </div>
              <div className="grid grid-cols-2 gap-20">
                <div className="space-y-6">
                  <h4 className="font-brutal-head text-xl text-neon">LINKS</h4>
                  <ul className="font-black space-y-2 uppercase text-lg">
                    <li><a className="hover:text-neon" href="#products">Products</a></li>
                    <li><a className="hover:text-neon" href="#services">Services</a></li>
                    <li><a className="hover:text-neon" href="#infrastructure">Infrastructure</a></li>
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="font-brutal-head text-xl text-neon">LEGAL</h4>
                  <ul className="font-black space-y-2 uppercase text-lg">
                    <li><Link className="hover:text-neon" to="/privacy">Privacy</Link></li>
                    <li><Link className="hover:text-neon" to="/terms">Terms</Link></li>
                    <li><Link className="hover:text-neon" to="/contact">Contact</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-20 border-t-4 border-black flex flex-col md:flex-row justify-between gap-10 font-black uppercase">
              <span>© 2026 SAVITHA ENGINEERING. NO COMPROMISE.</span><span>MUMBAI HQ | GSTIN: 27**********1ZP</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Requisition Tracker */}
      {selectedProducts.length > 0 && (
        <button
          onClick={scrollToForm}
          className="fixed bottom-8 right-8 z-50 bg-[#FA5D19] text-white border-4 border-black px-6 py-4 font-mono text-sm font-bold uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-3 cursor-pointer"
        >
          <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
          <span>ACTIVE QUOTE: {selectedProducts.length} {selectedProducts.length === 1 ? 'ASSET' : 'ASSETS'} SELECTED</span>
          <span className="material-symbols-outlined text-lg">arrow_downward</span>
        </button>
      )}
    </>
  );
}