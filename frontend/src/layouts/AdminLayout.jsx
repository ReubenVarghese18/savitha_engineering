import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/products';
import { apiFetch } from '../api/client';

const JOBS_DATA = [
  { id: 'JOB-1042', company: 'Wayne Enterprises', po: '45009210', status: 'QUEUED' },
  { id: 'JOB-1045', company: 'LexCorp Industries', po: 'LX-8822', status: 'QUEUED' },
  { id: 'JOB-1039', company: 'Stark Industries', po: 'MARK-85', status: 'IN ASSEMBLY' },
  { id: 'JOB-1031', company: 'Pym Tech', po: 'SUB-001', status: 'TESTING' },
  { id: 'JOB-1028', company: 'Oscorp', po: 'GLIDER-X', status: 'READY FOR DISPATCH' },
  { id: 'JOB-1025', company: 'S.H.I.E.L.D.', po: 'HELI-STRK', status: 'READY FOR DISPATCH' }
];

const CLIENTS_DATA = [
  { id: 'SE-C101', company: 'Wayne Enterprises', contact: 'Bruce Wayne' },
  { id: 'SE-C102', company: 'Stark Industries', contact: 'Tony Stark' },
  { id: 'SE-C103', company: 'LexCorp', contact: 'Lex Luthor' },
  { id: 'SE-C104', company: 'Pym Tech', contact: 'Hank Pym' }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState(false);
  const [inquiryRefreshTrigger, setInquiryRefreshTrigger] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const headerRef = useRef(null);

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalQuery, setTerminalQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const terminalInputRef = useRef(null);

  const uniqueCategories = [...new Set(products.map(p => p.category))];
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    email: '',
    phone: '',
    category: '',
    timeline: '',
    requirement_details: '',
    requested_asset: '',
    custom_details: '',
    equipment_serial_number: ''
  });

  const availableProducts = products.filter(p => p.category === formData.category);

  const handleCategoryChange = (e) => {
    setFormData({ ...formData, category: e.target.value, requested_asset: '' });
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() && !formData.phone.trim()) {
      alert('Enter an email or a phone number so the customer can be contacted.');
      return;
    }
    try {
      await apiFetch('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({
          full_name: formData.full_name,
          company: formData.company,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          category: formData.category,
          requirement_details: `Timeline: ${formData.timeline} | ${formData.requirement_details}`,
          requested_assets: formData.requested_asset ? [formData.requested_asset] : [],
          is_custom_request: formData.category === "Custom Build / Spare Parts",
          custom_details: formData.category === "Custom Build / Spare Parts" ? formData.custom_details : null,
          equipment_serial_number: formData.category === "Custom Build / Spare Parts" ? formData.equipment_serial_number : null
        })
      });
      alert("Inquiry saved successfully!");
      setIsNewInquiryOpen(false);
      setInquiryRefreshTrigger(prev => prev + 1);
      setFormData({
          full_name: '',
          company: '',
          email: '',
          phone: '',
          category: '',
          timeline: '',
          requirement_details: '',
          requested_asset: '',
          custom_details: '',
          equipment_serial_number: ''
        });
    } catch (err) {
      alert("Failed to save inquiry.");
    }
  };

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Autofocus input on open
  useEffect(() => {
    if (isTerminalOpen && terminalInputRef.current) {
      setTimeout(() => {
        terminalInputRef.current.focus();
      }, 50);
    } else {
      setTerminalQuery('');
      setSelectedIndex(0);
    }
  }, [isTerminalOpen]);

  const getSearchResults = () => {
    const q = terminalQuery.trim().toLowerCase();

    // Command Mode: go to pages
    if (q.startsWith('go ') || q === 'go') {
      const target = q.replace(/^go\s+/, '');
      const goCommands = [
        { type: 'ACTION', label: 'GO TO LIVE FEED', path: '/admin/live-feed' },
        { type: 'ACTION', label: 'GO TO PRODUCTION PIPELINE', path: '/admin/production' },
        { type: 'ACTION', label: 'GO TO PRECISION CATALOG', path: '/admin/catalog' },
        { type: 'ACTION', label: 'GO TO CLIENT DIRECTORY', path: '/admin/clients' },
        { type: 'ACTION', label: 'GO TO SERVICE & WARRANTY', path: '/admin/service' }
      ];
      return goCommands.filter(c => c.label.toLowerCase().includes(target));
    }

    // Command Mode: trigger actions
    if (q.startsWith('new ') || q === 'new') {
      const target = q.replace(/^new\s+/, '');
      const newCommands = [
        { type: 'ACTION', label: 'NEW INQUIRY (LOG NEW INQUIRY)', action: 'NEW_INQUIRY' }
      ];
      return newCommands.filter(c => c.label.toLowerCase().includes(target));
    }

    // Default quick actions if query is empty
    if (!q) {
      return [
        { type: 'ACTION', label: 'GO TO LIVE FEED', path: '/admin/live-feed' },
        { type: 'ACTION', label: 'GO TO PRODUCTION PIPELINE', path: '/admin/production' },
        { type: 'ACTION', label: 'GO TO PRECISION CATALOG', path: '/admin/catalog' },
        { type: 'ACTION', label: 'GO TO CLIENT DIRECTORY', path: '/admin/clients' },
        { type: 'ACTION', label: 'GO TO SERVICE & WARRANTY', path: '/admin/service' },
        { type: 'ACTION', label: 'LOG NEW INQUIRY', action: 'NEW_INQUIRY' }
      ];
    }

    // Fuzzy Spotlight Match Mode
    const matchedActions = [
      { type: 'ACTION', label: 'GO TO LIVE FEED', path: '/admin/live-feed' },
      { type: 'ACTION', label: 'GO TO PRODUCTION PIPELINE', path: '/admin/production' },
      { type: 'ACTION', label: 'GO TO PRECISION CATALOG', path: '/admin/catalog' },
      { type: 'ACTION', label: 'GO TO CLIENT DIRECTORY', path: '/admin/clients' },
      { type: 'ACTION', label: 'GO TO SERVICE & WARRANTY', path: '/admin/service' },
      { type: 'ACTION', label: 'LOG NEW INQUIRY', action: 'NEW_INQUIRY' }
    ].filter(a => a.label.toLowerCase().includes(q));

    const matchedJobs = JOBS_DATA.filter(j => 
      j.id.toLowerCase().includes(q) || 
      j.company.toLowerCase().includes(q) ||
      (j.po && j.po.toLowerCase().includes(q))
    ).map(j => ({ type: 'JOBS', label: `${j.id} // ${j.company.toUpperCase()}`, job: j }));

    const matchedProducts = products.filter(p => 
      (p.sku && p.sku.toLowerCase().includes(q)) || 
      (p.title && p.title.toLowerCase().includes(q))
    ).map(p => ({ type: 'PRODUCTS', label: `${p.sku} // ${p.title.toUpperCase()}`, product: p }));

    const matchedClients = CLIENTS_DATA.filter(c => 
      c.id.toLowerCase().includes(q) || 
      c.company.toLowerCase().includes(q) || 
      c.contact.toLowerCase().includes(q)
    ).map(c => ({ type: 'CLIENTS', label: `${c.id} // ${c.company.toUpperCase()} (${c.contact.toUpperCase()})`, client: c }));

    return [
      ...matchedActions,
      ...matchedJobs,
      ...matchedProducts,
      ...matchedClients
    ];
  };

  const results = getSearchResults();

  const executeResult = (item) => {
    setIsTerminalOpen(false);
    if (item.type === 'ACTION') {
      if (item.action === 'NEW_INQUIRY') {
        setIsNewInquiryOpen(true);
      } else if (item.path) {
        navigate(item.path);
      }
    } else if (item.type === 'JOBS') {
      navigate('/admin/production', { state: { highlightJobId: item.job.id } });
    } else if (item.type === 'PRODUCTS') {
      navigate('/admin/catalog', { state: { activeTab: 'PRODUCTS' } });
    } else if (item.type === 'CLIENTS') {
      navigate('/admin/clients', { state: { highlightClientId: item.client.id } });
    }
  };

  const handleTerminalKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        executeResult(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsTerminalOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowNotifs(false);
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isTerminalOpen) {
      interval = setInterval(() => {
        setLogs(prev => [...prev, generateMockLog()]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isTerminalOpen]);

  useEffect(() => {
    if (isNewInquiryOpen || isTerminalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isNewInquiryOpen, isTerminalOpen]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Live Feed', path: '/admin/live-feed', icon: 'sensors' },
    { name: 'Production Pipeline', path: '/admin/production', icon: 'precision_manufacturing' },
    { name: 'Precision Catalog', path: '/admin/catalog', icon: 'inventory_2' },
    { name: 'Client Directory', path: '/admin/clients', icon: 'contact_page' },
    { name: 'Service & Warranty', path: '/admin/service', icon: 'build_circle' },
  ];

  const getActiveTabName = () => {
    const activeItem = navItems.find(item => item.path === location.pathname);
    return activeItem ? activeItem.name : 'Live Feed';
  };

  return (
    <div className="min-h-screen flex bg-[#F2F0E9] text-[#131315] font-sans no-roundness overflow-x-hidden">
      {/* 1. SIDEBAR (SideNavBar Shell) */}
      <aside className="w-56 bg-[#1F1F21] text-white flex flex-col h-screen fixed left-0 top-0 py-6 border-r-2 border-black shrink-0 z-40">
        {/* Brand Header */}
        <div className="px-4 mb-10 flex items-center gap-3 h-16">
          <svg className="flame-path animate-pulse" fill="#FA5D19" height="32" viewBox="0 0 24 24" width="32">
            <path d="M12,2C12,2 7,7 7,12C7,14.76 9.24,17 12,17C14.76,17 17,14.76 17,12C17,7 12,2 12,2M12,15C10.34,15 9,13.66 9,12C9,10.34 10.34,9 12,9C13.66,9 15,10.34 15,12C15,13.66 13.66,15 12,15Z"></path>
          </svg>
          <div>
            <h1 className="font-brutal-head text-[18px] leading-tight font-black uppercase text-[#FA5D19]">Savitha Engineering</h1>
            <p className="font-mono text-[9px] opacity-60 text-[#FA5D19] uppercase tracking-wider mt-0.5">INQUIRY TERMINAL</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 space-y-2 flex flex-col">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 font-mono text-[11px] uppercase tracking-wider transition-all ${
                  isActive
                    ? 'border-l-2 border-[#FA5D19] text-white font-bold'
                    : 'text-[#C8C6C9] hover:bg-white/5 hover:text-white'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      boxShadow: 'rgb(250, 93, 25) 0px 0px 15px 2px',
                      borderColor: 'rgb(250, 93, 25)',
                    }
                  : {}
              }
            >
              <span className="material-symbols-outlined scale-125">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* CTA - New Inquiry (Non-functional but matches design) */}
        <div className="px-4 py-4">
          <button 
            onClick={() => setIsNewInquiryOpen(true)}
            className="w-full bg-[#FA5D19] text-zinc-950 font-mono text-xs py-3 font-bold active:scale-95 transition-transform uppercase border border-black hover:brightness-110"
          >
            New Inquiry
          </button>
        </div>

        {/* Footer Tabs */}
        <div className="mt-auto px-4 space-y-1">
          <div className="flex items-center gap-4 px-4 py-2 text-xs font-mono text-[#C8C6C9] select-none">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>SYS.ADMIN</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-2 w-full hover:text-white font-mono text-[11px] uppercase text-[#C8C6C9] transition-all cursor-pointer text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Terminate</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN APP BAR & CONTENT AREA */}
      <div className="flex-1 pl-56 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        {/* TopAppBar */}
        <header ref={headerRef} className="sticky top-0 z-30 w-full h-16 bg-white border-b-2 border-black flex justify-between items-center px-8 shrink-0 shadow-md">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-4 h-full border-r-2 border-black pr-8">
            <div className="flex items-center gap-2 font-mono text-xs tracking-widest">
              <span className="opacity-40 text-zinc-950 uppercase">Dashboard</span>
              <span className="opacity-40 text-zinc-950">/</span>
              <span className="font-black text-zinc-950 uppercase">{getActiveTabName()}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex justify-center px-12">
            <div className="relative group max-w-4xl w-[500px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
              <input
                type="text"
                readOnly
                placeholder="PRESS CTRL+K TO OPEN TERMINAL..."
                onClick={() => setIsTerminalOpen(true)}
                className="w-full bg-zinc-100 border-2 border-black py-2 pl-12 pr-4 font-mono text-[11px] focus:outline-none focus:bg-white transition-all placeholder:text-zinc-400 uppercase tracking-wider cursor-pointer"
              />
            </div>
          </div>

          {/* Clock & Action Items */}
          <div className="flex items-center gap-6 pl-8 h-full">
            <div className="hidden lg:flex items-center gap-4 font-mono text-[10px] font-bold text-zinc-950 uppercase">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>{time}</span>
            </div>
            <div className="h-8 w-[1px] bg-black/10"></div>
            
            {/* Notification Bell Wrapper */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  setShowProfile(false);
                }}
                className="relative flex items-center justify-center cursor-pointer group focus:outline-none p-1"
              >
                <span className="material-symbols-outlined text-zinc-950 group-hover:text-[#FA5D19] transition-colors">notifications</span>
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#FA5D19] rounded-full border border-white"></span>
              </button>
              
              {showNotifs && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 p-4 text-left">
                  <h4 className="font-mono text-xs font-bold tracking-widest text-black uppercase mb-2">NOTIFICATIONS</h4>
                  <p className="font-mono text-[11px] text-gray-500 uppercase tracking-wider leading-relaxed">
                    System online. No new alerts at this time.
                  </p>
                </div>
              )}
            </div>

            {/* Profile Wrapper */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifs(false);
                }}
                className="w-10 h-10 bg-zinc-950 text-white flex items-center justify-center font-black text-xs border-2 border-black hover:bg-[#FA5D19] hover:text-black transition-colors cursor-pointer focus:outline-none"
              >
                SE
              </button>

              {showProfile && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 p-2 text-left">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-mono font-bold tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-colors uppercase rounded-none"
                  >
                    SIGN OUT
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 p-8 bg-[#F2F0E9] overflow-x-hidden overflow-y-auto">
          <div className="w-full">
            <Outlet context={{ setIsNewInquiryOpen, inquiryRefreshTrigger }} />
          </div>
        </main>
      </div>

      {isNewInquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-4xl p-10 flex flex-col text-black">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8 border-b-[3px] border-black pb-4 text-left">
              <h2 className="text-2xl font-black uppercase tracking-widest font-mono text-black">LOG NEW INQUIRY</h2>
              <button 
                onClick={() => setIsNewInquiryOpen(false)} 
                className="text-black hover:text-[#FA5D19] transition-colors focus:outline-none"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmitInquiry} className="flex flex-col gap-6">
              {/* Row 1: Company Name & Contact Person */}
              <div className="grid grid-cols-2 gap-8 text-left">
                <div className="flex flex-col">
                  <label className="block text-sm font-mono font-bold tracking-widest text-black uppercase mb-2">
                    COMPANY NAME
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="E.G. WAYNE ENTERPRISES"
                    className="w-full px-4 py-3 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-lg uppercase tracking-wider transition-all"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-mono font-bold tracking-widest text-black uppercase mb-2">
                    CONTACT PERSON
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="E.G. BRUCE WAYNE"
                    className="w-full px-4 py-3 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-lg uppercase tracking-wider transition-all"
                  />
                </div>
              </div>

              {/* Contact: email and/or phone */}
              <div className="grid grid-cols-2 gap-8 text-left">
                <div className="flex flex-col">
                  <label className="block text-sm font-mono font-bold tracking-widest text-black uppercase mb-2">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="NAME@COMPANY.COM"
                    className="w-full px-4 py-3 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-lg tracking-wider transition-all"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-mono font-bold tracking-widest text-black uppercase mb-2">
                    PHONE
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 ..."
                    className="w-full px-4 py-3 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-lg tracking-wider transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Equipment Category & Requested Product */}
              <div className="grid grid-cols-2 gap-8 text-left">
                <div className="flex flex-col">
                  <label className="block text-sm font-mono font-bold tracking-widest text-black uppercase mb-2">
                    EQUIPMENT CATEGORY
                  </label>
                  <div className="relative">
                    <select 
                      required
                      value={formData.category}
                      onChange={handleCategoryChange}
                      className={`w-full appearance-none px-4 py-3 pr-10 border-2 border-black bg-white font-mono text-lg font-bold tracking-widest uppercase cursor-pointer focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none transition-all ${!formData.category ? 'text-zinc-400' : 'text-black'}`}
                    >
                      <option value="" disabled>SELECT CATEGORY</option>
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat} className="text-black">{cat}</option>
                      ))}
                      <option value="Custom Build / Spare Parts" className="text-black font-black bg-yellow-300">CUSTOM BUILD / SPARE PARTS</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {formData.category !== "Custom Build / Spare Parts" && (
                  <div className="flex flex-col">
                    <label className={`block text-sm font-mono font-bold tracking-widest uppercase mb-2 ${!formData.category ? 'text-zinc-400' : 'text-black'}`}>
                      REQUESTED PRODUCT
                    </label>
                    <div className="relative">
                      <select 
                        required
                        disabled={!formData.category}
                        value={formData.requested_asset}
                        onChange={(e) => setFormData({...formData, requested_asset: e.target.value})}
                        className={`w-full appearance-none px-4 py-3 pr-10 border-2 border-black bg-white font-mono text-lg font-bold tracking-widest uppercase cursor-pointer focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none transition-all ${!formData.requested_asset ? 'text-zinc-400' : 'text-black'} ${!formData.category ? 'cursor-not-allowed opacity-60' : ''}`}
                      >
                        <option value="" disabled>{formData.category ? 'SELECT PRODUCT' : 'SELECT CATEGORY FIRST'}</option>
                        {availableProducts.map(p => (
                          <option key={p.id} value={p.id} className="text-black">{p.title}</option>
                        ))}
                      </select>
                      <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${!formData.category ? 'text-zinc-400' : 'text-black'}`}>
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 3: Expected Timeline */}
              <div className="flex flex-col text-left">
                <label className="block text-sm font-mono font-bold tracking-widest text-black uppercase mb-2">
                  EXPECTED TIMELINE / URGENCY
                </label>
                <div className="relative">
                  <select 
                    required
                    value={formData.timeline}
                    onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                    className={`w-full appearance-none px-4 py-3 pr-10 border-2 border-black bg-white font-mono text-lg font-bold tracking-widest uppercase cursor-pointer focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none transition-all ${!formData.timeline ? 'text-zinc-400' : 'text-black'}`}
                  >
                    <option value="" disabled>SELECT TIMELINE</option>
                    <option value="Standard" className="text-black">STANDARD TIMELINE</option>
                    <option value="Urgent" className="text-black">URGENT PRODUCTION</option>
                    <option value="R&D" className="text-black">R&D / PROTOTYPING</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Row 4: Requirement Details */}
              {formData.category !== "Custom Build / Spare Parts" ? (
                <div className="flex flex-col text-left">
                  <label className="block text-sm font-mono font-bold tracking-widest text-black uppercase mb-2">
                    REQUIREMENT DETAILS
                  </label>
                  <textarea 
                    rows="3" 
                    value={formData.requirement_details}
                    onChange={(e) => setFormData({...formData, requirement_details: e.target.value})}
                    placeholder="SPECIFY TEMPERATURE, SIZE, AND ADDITIONAL REQUIREMENTS..."
                    className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg font-mono rounded-none resize-none transition-all"
                  ></textarea>
                </div>
              ) : (
                <>
                  <div className="flex flex-col text-left bg-yellow-100 p-4 border-2 border-yellow-400">
                    <label className="block text-sm font-mono font-bold tracking-widest text-black uppercase mb-2">
                      CUSTOM BUILD / SPARE PARTS DETAILS
                    </label>
                    <textarea 
                      required
                      rows="4" 
                      value={formData.custom_details}
                      onChange={(e) => setFormData({...formData, custom_details: e.target.value})}
                      placeholder="DESCRIBE THE CUSTOM BUILD OR LEGACY SPARE PART REQUIREMENTS IN DETAIL..."
                      className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg font-mono rounded-none resize-none transition-all mb-4"
                    ></textarea>
                    
                    <label className="block text-sm font-mono font-bold tracking-widest text-black uppercase mb-2">
                      EQUIPMENT SERIAL NUMBER (OPTIONAL)
                    </label>
                    <input 
                      type="text" 
                      value={formData.equipment_serial_number}
                      onChange={(e) => setFormData({...formData, equipment_serial_number: e.target.value})}
                      placeholder="E.G. SE-1994-0012"
                      className="w-full px-4 py-3 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-lg uppercase tracking-wider transition-all"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-6 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsNewInquiryOpen(false)} 
                  className="text-sm font-mono font-bold tracking-widest uppercase hover:text-[#FA5D19] transition-colors py-2 px-4 focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-4 bg-[#FA5D19] text-white border-[3px] border-black font-mono text-sm font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer focus:outline-none"
                >
                  SAVE INQUIRY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTerminalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-xs p-12 md:p-24 overflow-y-auto">
          <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-4xl flex flex-col text-black no-roundness relative mt-12">
            
            {/* Input Bar */}
            <div className="flex items-center gap-4 border-b-4 border-black p-6 bg-zinc-100">
              <span className="font-mono text-3xl font-black animate-pulse text-[#FA5D19]">&gt;</span>
              <input
                type="text"
                ref={terminalInputRef}
                value={terminalQuery}
                onChange={(e) => {
                  setTerminalQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleTerminalKeyDown}
                placeholder="TYPE A COMMAND (e.g. 'go production') OR SEARCH TERM..."
                className="flex-grow bg-transparent border-none focus:outline-none font-mono text-2xl font-bold uppercase tracking-wider text-black placeholder:text-zinc-400"
              />
              <button 
                onClick={() => setIsTerminalOpen(false)}
                className="font-mono text-sm font-bold border-2 border-black px-3 py-1 bg-white hover:bg-black hover:text-white transition-colors"
              >
                [ ESC ]
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto max-h-[500px]">
              {results.length === 0 ? (
                <div className="p-8 text-center font-mono text-sm text-zinc-400">
                  [ 0 MATCHES FOUND FOR "{terminalQuery}" ]
                </div>
              ) : (
                (() => {
                  const categories = [
                    { type: 'ACTION', title: '[ ACTION ]' },
                    { type: 'JOBS', title: '[ JOBS ]' },
                    { type: 'PRODUCTS', title: '[ PRODUCTS ]' },
                    { type: 'CLIENTS', title: '[ CLIENTS ]' }
                  ];

                  return categories.map((cat) => {
                    const catItems = results.filter(item => item.type === cat.type);
                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat.type} className="border-b-4 border-black last:border-b-0">
                        {/* Category Header */}
                        <div className="bg-[#FA5D19] text-zinc-950 font-mono text-xs font-black px-6 py-2 uppercase border-b-2 border-black text-left">
                          {cat.title}
                        </div>
                        {/* Category Items */}
                        <div className="divide-y-2 divide-zinc-200">
                          {catItems.map((item) => {
                            const absoluteIndex = results.findIndex(r => r === item);
                            const isSelected = absoluteIndex === selectedIndex;

                            return (
                              <div
                                key={item.label}
                                onClick={() => executeResult(item)}
                                onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                                className={`p-4 px-8 font-mono text-sm font-bold text-left cursor-pointer flex justify-between items-center transition-colors ${
                                  isSelected ? 'bg-black text-white' : 'bg-white text-zinc-950'
                                }`}
                              >
                                <span>{item.label}</span>
                                {isSelected && <span className="text-xs">[ PRESS ENTER ]</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>
            
            {/* Terminal Footer */}
            <div className="bg-zinc-100 border-t-4 border-black p-4 text-left font-mono text-[10px] text-zinc-500 flex justify-between uppercase">
              <span>Use ↑↓ keys to navigate, [Enter] to execute, [Esc] to close</span>
              <span>Inquiry Terminal v1.1.0</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
