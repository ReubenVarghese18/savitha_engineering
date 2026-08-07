import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import QuoteModal from '../../components/QuoteModal';
import POModal from '../../components/POModal';

export default function LiveFeed() {
  const { setIsNewInquiryOpen, inquiryRefreshTrigger } = useOutletContext();
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [timeRange, setTimeRange] = useState('6M');
  const [inquiries, setInquiries] = useState([]);

  const [isNewPOOpen, setIsNewPOOpen] = useState(false);
  const [activePO, setActivePO] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const [qRes, pRes] = await Promise.all([
          fetch('http://localhost:8000/api/quotes', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:8000/api/purchase_orders', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const qData = qRes.ok ? await qRes.json() : [];
        const pData = pRes.ok ? await pRes.json() : [];
        
        const combined = [
          ...qData.map(q => ({ ...q, type: 'QUOTE' })),
          ...pData.map(p => ({ ...p, type: 'PO' }))
        ];
        
        combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setInquiries(combined);
      } catch (err) {
        console.error('[LiveFeed] Failed to fetch inquiries:', err);
      }
    };
    fetchInquiries();
  }, [inquiryRefreshTrigger]);

  const handleQuoteUpdate = (quoteId, updatedData) => {
    setInquiries((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, ...updatedData } : q))
    );
    if (activeInquiry && activeInquiry.id === quoteId) {
      setActiveInquiry((prev) => ({ ...prev, ...updatedData }));
    }
  };

  const timeRangeLabels = {
    '30D': '30 DAYS',
    '3M': '3 MONTHS',
    '6M': '6 MONTHS',
    '1Y': '1 YEAR',
    '3Y': '3 YEARS',
    'ALL': 'ALL TIME'
  };

  const mockKPIs = {
    '30D': { quotes: 8, deals: 3, rev: '₹ 45 L' },
    '3M': { quotes: 14, deals: 5, rev: '₹ 80 L' },
    '6M': { quotes: 28, deals: 12, rev: '₹ 1.2 Cr' },
    '1Y': { quotes: 54, deals: 26, rev: '₹ 3.1 Cr' },
    '3Y': { quotes: 142, deals: 78, rev: '₹ 8.5 Cr' },
    'ALL': { quotes: 289, deals: 140, rev: '₹ 14.2 Cr' }
  };

  const mockChartData = {
    '30D': [
      { label: 'W1', value: 30, text: '3 Deals' }, { label: 'W2', value: 60, text: '6 Deals' }, { label: 'W3', value: 20, text: '2 Deals' }, { label: 'W4', value: 90, text: '9 Deals' }
    ],
    '3M': [
      { label: 'APR', value: 40, text: '4 Deals' }, { label: 'MAY', value: 60, text: '6 Deals' }, { label: 'JUN', value: 90, text: '9 Deals' }
    ],
    '6M': [
      { label: 'JAN', value: 20, text: '2 Deals' }, { label: 'FEB', value: 50, text: '5 Deals' }, { label: 'MAR', value: 30, text: '3 Deals' }, { label: 'APR', value: 70, text: '7 Deals' }, { label: 'MAY', value: 40, text: '4 Deals' }, { label: 'JUN', value: 90, text: '9 Deals' }
    ],
    '1Y': [
      { label: 'Q1', value: 30, text: '12 Deals' }, { label: 'Q2', value: 60, text: '24 Deals' }, { label: 'Q3', value: 40, text: '16 Deals' }, { label: 'Q4', value: 80, text: '32 Deals' }
    ],
    '3Y': [
      { label: '2024', value: 50, text: '45 Deals' }, { label: '2025', value: 75, text: '68 Deals' }, { label: '2026', value: 95, text: '86 Deals' }
    ],
    'ALL': [
      { label: '2022', value: 20, text: '15 Deals' }, { label: '2023', value: 40, text: '35 Deals' }, { label: '2024', value: 60, text: '55 Deals' }, { label: '2025', value: 80, text: '75 Deals' }, { label: '2026', value: 100, text: '95 Deals' }
    ]
  };

  const mockTableData = [
    { id: 'SE-7601', date: '24/05/2026', client: 'B. Wayne', company: 'Wayne Enterprises', category: 'Precision Annealing', details: 'Batch processing unit v4', requested_assets: ['SE-ANNE-001', 'SE-ANNE-002'], status: 'PENDING', bg: 'bg-[#FFF000]', text: 'text-black' },
    { id: 'SE-7602', date: '25/05/2026', client: 'T. Stark', company: 'Stark Industries', category: 'Melting Furnaces', details: 'Arc-refinery upgrade', requested_assets: ['SE-MELT-001', 'SE-MELT-003'], status: 'QUOTED', bg: 'bg-[#00FF00]', text: 'text-black' },
    { id: 'SE-7603', date: '26/05/2026', client: 'L. Luthor', company: 'Lexcorp', category: 'Custom Build', details: 'Thermal core isolation', requested_assets: ['SE-CUST-001', 'SE-CUST-004'], status: 'PENDING', bg: 'bg-[#FFF000]', text: 'text-black' },
    { id: 'SE-7604', date: '28/05/2026', client: 'O. Queen', company: 'Queen Consolidated', category: 'Industrial Oven', details: 'High capacity baking', requested_assets: ['SE-OVEN-001'], status: 'QUOTED', bg: 'bg-[#00FF00]', text: 'text-black' },
    { id: 'SE-7605', date: '02/06/2026', client: 'V. Von Doom', company: 'Latverian Tech', category: 'Forging Press', details: 'Titanium compression', requested_assets: ['SE-FORG-001', 'SE-FORG-002'], status: 'PENDING', bg: 'bg-[#FFF000]', text: 'text-black' },
    { id: 'SE-7606', date: '05/06/2026', client: 'N. Osborn', company: 'Oscorp', category: 'Chemical Reactor', details: 'High-pressure synthesis', requested_assets: ['SE-CUST-002'], status: 'WON', bg: 'bg-[#00FFFF]', text: 'text-black' },
    { id: 'SE-7607', date: '08/06/2026', client: 'H. Pym', company: 'Pym Technologies', category: 'Micro-Furnace', details: 'Particle containment unit', requested_assets: ['SE-BATCH-003'], status: 'LOST', bg: 'bg-[#FF0000]', text: 'text-white' },
    { id: 'SE-7608', date: '10/06/2026', client: 'M. Dyson', company: 'Cyberdyne Systems', category: 'Automation Core', details: 'Neural net processor housing', requested_assets: ['SE-CUST-005'], status: 'MISSED', bg: 'bg-black', text: 'text-white' },
    { id: 'SE-7609', date: '12/06/2026', client: 'A. Wesker', company: 'Umbrella Corp', category: 'Bio-Incubator', details: 'Temperature controlled vault', requested_assets: ['SE-BATCH-004'], status: 'QUOTED', bg: 'bg-[#00FF00]', text: 'text-black' },
    { id: 'SE-7610', date: '14/06/2026', client: 'P. Weyland', company: 'Weyland-Yutani', category: 'Cryo-Chamber', details: 'Deep space hibernation rig', requested_assets: ['SE-BATCH-001', 'SE-BATCH-002'], status: 'WON', bg: 'bg-[#00FFFF]', text: 'text-black' }
  ];

  const onRowClick = (row) => {
    if (row.type === 'PO') {
      setActivePO(row);
    } else if (row.status === 'PENDING') {
      setActiveInquiry(row);
    }
  };

  const handlePOUpdate = (newPO) => {
    setInquiries((prev) => [newPO, ...prev].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)));
  };

  return (
    <div className="space-y-12">
      



<div className="flex-1 overflow-y-auto space-y-12 bg-[#F2F0E9] pb-margin-md md:pb-margin-lg px-margin-lg" style={{"backgroundColor":"rgb(248, 247, 242)"}}>
<section className="space-y-2 pt-6 px-0">
<div className="flex justify-between items-end pb-6">
<div className="space-y-2">
<h2 className="font-headline-lg text-[48px] md:text-[64px] leading-none font-black uppercase tracking-tight text-zinc-950">ADMIN PAGE</h2>
<div className="flex items-center gap-3 mt-1 mb-6">
  {/* Decorative Orange Line */}
  <span className="w-12 h-[3px] bg-[#FA5D19]"></span>
  
  {/* Monospace Subtitle */}
  <span className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.2em] text-gray-600 uppercase">
    SYS.ADMIN // LIVE_FEED
  </span>
</div>
</div>
<div className="flex gap-4">
<button 
  onClick={() => setIsNewPOOpen(true)}
  className="flex items-center gap-2 px-6 py-3 bg-zinc-200 border-[3px] border-black text-black font-mono text-sm font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
>
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
  New PO
</button>
<button 
  onClick={() => setIsNewInquiryOpen(true)}
  className="flex items-center gap-2 px-6 py-3 bg-[#FA5D19] border-[3px] border-black text-black font-mono text-sm font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
>
  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
  New Inquiry
</button>
</div>
</div>
</section>

<section className="space-y-6">
<div className="flex justify-between items-center border-b-2 border-black pb-4">
<h3 className="font-label-caps text-lg font-black uppercase">Performance Overview</h3>
<div className="relative">
  <select 
    value={timeRange}
    onChange={(e) => setTimeRange(e.target.value)}
    className="appearance-none px-4 py-2 pr-10 border-[3px] border-black bg-white text-black font-mono text-xs font-bold tracking-widest uppercase cursor-pointer focus:outline-none focus:border-[#FA5D19] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
  >
    <option value="30D">30 Days</option>
    <option value="3M">3 Months</option>
    <option value="6M">6 Months</option>
    <option value="1Y">1 Year</option>
    <option value="3Y">3 Years</option>
    <option value="ALL">All Time</option>
  </select>
  {/* Custom Dropdown Arrow */}
  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
    </svg>
  </div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{/* Card 1: Pending Inquiries (Real-Time) */}
<div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col justify-between">
  <div className="flex justify-between items-start">
    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest">Pending Inquiries</h4>
    
    {/* LIVE Status Badge */}
    <div className="flex items-center gap-2 border-[2px] border-black px-2 py-1 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <span className="w-2.5 h-2.5 bg-[#00FF00] border-[1px] border-black animate-pulse"></span>
      <span className="text-[10px] font-mono font-bold tracking-widest text-black">LIVE</span>
    </div>
  </div>
  
  <span className="text-5xl font-black text-black mt-6 font-mono tracking-tighter">{inquiries.filter(q => (q.status || 'PENDING').toUpperCase() === 'PENDING').length}</span>
</div>
{/* Card 2: Quotes Sent (Historical) */}
<div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col justify-between">
  <div className="flex justify-between items-center w-full">
    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest leading-none">
      Quotes Sent
    </h4>
    
    {/* Aligned Dynamic Time Range Badge */}
    <div className="bg-gray-100 border-[1px] border-black px-3 py-1 flex items-center justify-center">
      <span className="text-[10px] font-mono font-bold tracking-widest text-gray-600 uppercase leading-none">
        {timeRangeLabels[timeRange]}
      </span>
    </div>
  </div>
  
  <span className="text-5xl font-black text-black mt-6 font-mono tracking-tighter">{mockKPIs[timeRange].quotes}</span>
</div>

{/* Card 3: Deals Closed / Won (Historical) */}
<div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col justify-between">
  <div className="flex justify-between items-center w-full">
    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest leading-none">
      Deals Closed / Won
    </h4>
    
    {/* Aligned Dynamic Time Range Badge */}
    <div className="bg-gray-100 border-[1px] border-black px-3 py-1 flex items-center justify-center">
      <span className="text-[10px] font-mono font-bold tracking-widest text-gray-600 uppercase leading-none">
        {timeRangeLabels[timeRange]}
      </span>
    </div>
  </div>
  
  <div className="mt-6 flex items-baseline gap-3">
    <span className="text-5xl font-black text-black font-mono tracking-tighter">{mockKPIs[timeRange].deals}</span>
    <span className="text-sm font-bold text-[#FA5D19] font-mono tracking-widest">{mockKPIs[timeRange].rev}</span>
  </div>
</div>
</div>

{/* Deals Closed Per Month - Chart Area */}
<div className="w-full mt-6 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col h-[350px]">
  
  <div className="flex justify-between items-center mb-8">
    <h3 className="text-sm font-bold tracking-widest uppercase text-black">Deals Closed Per Month</h3>
    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">RANGE: {timeRange}</span>
  </div>  {/* Bar Chart Container */}
  <div className="flex-1 flex items-end justify-between gap-2 sm:gap-6 border-b-[3px] border-black pb-0 relative">
    
    {/* Y-Axis Grid Lines (Background) */}
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0">
      <div className="w-full border-t-[2px] border-dashed border-gray-200"></div>
      <div className="w-full border-t-[2px] border-dashed border-gray-200"></div>
      <div className="w-full border-t-[2px] border-dashed border-gray-200"></div>
      <div className="w-full border-t-[2px] border-dashed border-gray-200"></div>
    </div>

    {mockChartData[timeRange].map((item, index) => (
      <div key={index} className="flex flex-col items-center flex-1 group z-10 h-full justify-end">
        <div 
          style={{ height: `${item.value}%` }} 
          className="w-full max-w-[60px] bg-[#FA5D19] border-[3px] border-black transition-all duration-300 ease-out group-hover:bg-black relative cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[11px] py-1 px-3 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {item.text}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold mt-4 tracking-widest uppercase text-black border-b-[2px] border-transparent hover:border-black transition-colors pb-1">
          {item.label}
        </span>
      </div>
    ))}
  </div>
</div>
</section>

<div className="mt-8">
  {/* Section Header */}
  <h3 className="text-lg font-mono font-bold tracking-[0.1em] uppercase text-black mb-3">
    Priority Queue
  </h3>
  <div className="w-full h-[2px] bg-black mb-6"></div>

  {/* Brutalist Table Container */}
  <div className="w-full max-h-[600px] overflow-x-auto overflow-y-auto bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
    <table className="w-full text-left border-collapse whitespace-nowrap">
      
      {/* Dark Table Header */}
      <thead className="bg-black text-white font-mono text-sm uppercase tracking-widest sticky top-0 z-10 shadow-[0_2px_0_0_rgba(0,0,0,1)]">
        <tr>
          <th className="px-4 py-5 border-r border-gray-700">ID</th>
          <th className="px-4 py-5 border-r border-gray-700">Date</th>
          <th className="px-6 py-5 border-r border-gray-700">Client</th>
          <th className="px-6 py-5 border-r border-gray-700">Company</th>
          <th className="px-6 py-5 border-r border-gray-700">Category</th>
          <th className="px-6 py-5 border-r border-gray-700">Requested Assets</th>
          <th className="px-4 py-5 text-center">Status</th>
        </tr>
      </thead>
      
      {/* Table Body */}
      <tbody className="text-sm font-sans">
        {inquiries.map((row, index) => {
          const isPO = row.type === 'PO';
          const statusUpper = (row.status || 'PENDING').toUpperCase();
          let statusBg = 'bg-black';
          let statusText = 'text-white';
          
          if (isPO) {
             statusBg = statusUpper === 'DRAFT' ? 'bg-zinc-300' 
               : statusUpper === 'ORDERED' ? 'bg-[#FA5D19]' 
               : statusUpper === 'RECEIVED' ? 'bg-[#FFF000]' 
               : statusUpper === 'DELIVERED' ? 'bg-[#00FF00]' 
               : 'bg-black';
             statusText = statusUpper === 'ORDERED' || statusUpper === 'RECEIVED' || statusUpper === 'DELIVERED' || statusUpper === 'DRAFT' ? 'text-black' : 'text-white';
          } else {
             statusBg = statusUpper === 'PENDING' ? 'bg-[#FFF000]'
               : statusUpper === 'DESIGNING' ? 'bg-[#00FF00]'
               : statusUpper === 'MANUFACTURING' ? 'bg-[#00FFFF]'
               : statusUpper === 'TESTING' ? 'bg-[#FA5D19]'
               : 'bg-black';
             statusText = (statusUpper === 'MANUFACTURING' || statusUpper === 'DESIGNING' || statusUpper === 'PENDING') ? 'text-black' : 'text-white';
          }
          
          const rowBg = isPO ? 'bg-zinc-200' : 'bg-white';
          const items = isPO ? (row.items_requested || []) : (row.requested_assets || []);
          const idPrefix = isPO ? 'PO-' : '';
          
          return (
          <tr key={isPO ? `po-${row.id}` : `q-${row.id ?? index}`} onClick={() => onRowClick({ ...row, status: statusUpper })} className={`border-b-[2px] border-gray-200 hover:brightness-95 transition-all cursor-pointer ${rowBg}`}>
            <td className="px-4 py-5 font-mono text-base font-bold text-black border-r-[2px] border-gray-200">{idPrefix}{row.id}</td>
            <td className="px-4 py-5 font-mono text-base text-gray-600 border-r-[2px] border-gray-200">{row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB') : '—'}</td>
            <td className="px-6 py-5 font-mono text-base text-gray-800 border-r-[2px] border-gray-200">{isPO ? '—' : row.full_name}</td>
            <td className="px-6 py-5 text-lg font-black uppercase text-black border-r-[2px] border-gray-200">{isPO ? row.vendor_name : row.company}</td>
            <td className="px-6 py-5 text-base text-gray-800 border-r-[2px] border-gray-200">{isPO ? 'PROCUREMENT' : row.category}</td>
            <td className="px-6 py-5 text-base text-gray-600 border-r-[2px] border-gray-200">
              <div className="flex flex-wrap gap-1.5">
                {items.map((assetId, i) => (
                  <span
                    key={i}
                    className="inline-block px-2 py-0.5 border border-black bg-zinc-100 text-black text-[11px] font-mono font-bold"
                  >
                    {assetId}
                  </span>
                ))}
              </div>
            </td>
            <td className="px-4 py-5 text-center">
              <button 
                disabled={!isPO && statusUpper !== 'PENDING'}
                onClick={(e) => { e.stopPropagation(); if (isPO) { setActivePO(row) } else { setActiveInquiry({ ...row, status: statusUpper }) } }}
                className={`inline-block px-4 py-2 ${statusBg} ${statusText} border-[2px] border-black text-sm font-bold tracking-widest uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all
                ${(isPO || statusUpper === 'PENDING') 
                  ? 'cursor-pointer hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]' 
                  : 'cursor-not-allowed opacity-80 shadow-none hover:translate-y-0'
                }`}
              >
                {statusUpper}
              </button>
            </td>
          </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>

<section className="pb-12">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<div className="bg-white border-2 border-black p-4">
<p className="font-label-caps text-[9px] font-black uppercase text-zinc-400 mb-2">Thermal Output</p>
<p className="font-data-readout text-xl">1,240 °C</p>
<div className="mt-3 h-1.5 bg-zinc-100">
<div className="bg-molten-amber h-full" style={{"width":"82%"}}></div>
</div>
</div>
<div className="bg-white border-2 border-black p-4">
<p className="font-label-caps text-[9px] font-black uppercase text-zinc-400 mb-2">Inquiry Queue</p>
<div className="flex items-baseline gap-2">
<p className="font-data-readout text-xl">42</p>
<span className="text-[9px] font-black text-green-600">+12 SINCE LAST UPDATE</span>
</div>
</div>
<div className="bg-white border-2 border-black p-4">
<p className="font-label-caps text-[9px] font-black uppercase text-zinc-400 mb-2">System Uptime</p>
<p className="font-data-readout text-xl">99.98%</p>
<div className="mt-3 flex gap-0.5">
<div className="h-1.5 flex-1 bg-green-500"></div>
<div className="h-1.5 flex-1 bg-green-500"></div>
<div className="h-1.5 flex-1 bg-green-500"></div>
<div className="h-1.5 flex-1 bg-green-500"></div>
<div className="h-1.5 flex-1 bg-zinc-200"></div>
</div>
</div>
<div className="bg-white border-2 border-black p-4 border-l-4 border-l-molten-amber">
<p className="font-label-caps text-[9px] font-black uppercase text-zinc-400 mb-2">Active Nodes</p>
<p className="font-data-readout text-xl">08</p>
<p className="text-[8px] font-bold text-molten-amber mt-1 animate-pulse uppercase">NODE_07: RE-CALIBRATING</p>
</div>
</div>
</section></div>

<footer className="h-8 border-t border-outline-variant px-margin-lg flex items-center justify-between shrink-0 overflow-hidden bg-white border-t-2 border-black" style={{"backgroundColor":"rgb(242, 240, 233)","borderTop":"2px solid rgb(0, 0, 0)"}}>
<div className="flex gap-8 items-center h-full">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-green-500 text-zinc-950"></span>
<span className="font-label-caps text-[9px] text-secondary uppercase text-zinc-950">Connection: SECURE</span>
</div>
<div className="hidden md:flex items-center gap-2">
<span className="font-label-caps text-[9px] text-secondary uppercase text-zinc-950">Latency: 14ms</span>
</div>
</div>
<div className="flex items-center gap-4">
<span className="font-label-caps text-[9px] text-on-surface text-zinc-950" id="system-time">2026-06-03 17:47:19 UTC</span>
</div>
</footer>
      <QuoteModal 
        inquiry={activeInquiry} 
        onClose={() => setActiveInquiry(null)} 
        onUpdate={handleQuoteUpdate}
      />
      {isNewPOOpen && <POModal onClose={() => setIsNewPOOpen(false)} onUpdate={handlePOUpdate} />}
      {activePO && <POModal po={activePO} onClose={() => setActivePO(null)} />}
    </div>
  );
}