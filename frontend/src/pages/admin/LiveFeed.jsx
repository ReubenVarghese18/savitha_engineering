import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import QuoteModal from '../../components/QuoteModal';
import POModal from '../../components/POModal';
import { apiFetch } from '../../api/client';

const WON_STATUSES = ['DESIGNING', 'MANUFACTURING', 'TESTING', 'DELIVERED'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];


export default function LiveFeed() {
  const { setIsNewInquiryOpen, inquiryRefreshTrigger } = useOutletContext();
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [timeRange, setTimeRange] = useState('6M');
  const [inquiries, setInquiries] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  const [isNewPOOpen, setIsNewPOOpen] = useState(false);
  const [activePO, setActivePO] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const [qData, pData] = await Promise.all([
          apiFetch('/api/quotes').catch(() => []),
          apiFetch('/api/purchase_orders').catch(() => [])
        ]);
        
        const combined = [
          ...qData.map(q => ({ ...q, type: 'QUOTE' })),
          ...pData.map(p => ({ ...p, type: 'PO' }))
        ];
        
        combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setInquiries(combined);
        setLastSync(new Date());
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

  const { kpis, chartData, stats } = useMemo(() => {
    const quotes = inquiries.filter((i) => i.type === 'QUOTE');
    const pos = inquiries.filter((i) => i.type === 'PO');
    const now = new Date();
    const statusOf = (q) => (q.status || 'PENDING').toUpperCase();
    const isWon = (q) => WON_STATUSES.includes(statusOf(q));
    const monthIndex = (d) => d.getFullYear() * 12 + d.getMonth();

    let inRange = () => true;
    let buckets;
    let bucketOf = () => -1;

    if (timeRange === '30D') {
      const start = new Date(now.getTime() - 30 * 86400000);
      inRange = (d) => d >= start;
      buckets = ['W1', 'W2', 'W3', 'W4'];
      bucketOf = (d) => 3 - Math.min(3, Math.floor((now - d) / (7.5 * 86400000)));
    } else if (['3M', '6M', '1Y'].includes(timeRange)) {
      const n = { '3M': 3, '6M': 6, '1Y': 12 }[timeRange];
      const startIdx = monthIndex(now) - (n - 1);
      inRange = (d) => monthIndex(d) >= startIdx;
      buckets = Array.from({ length: n }, (_, i) => MONTHS[(startIdx + i) % 12]);
      bucketOf = (d) => monthIndex(d) - startIdx;
    } else {
      const years = timeRange === '3Y'
        ? 3
        : Math.max(1, now.getFullYear() - Math.min(now.getFullYear(), ...quotes.filter((q) => q.created_at).map((q) => new Date(q.created_at).getFullYear())) + 1);
      const startYear = now.getFullYear() - (years - 1);
      inRange = (d) => d.getFullYear() >= startYear;
      buckets = Array.from({ length: years }, (_, i) => String(startYear + i));
      bucketOf = (d) => d.getFullYear() - startYear;
    }

    const counts = buckets.map(() => 0);
    let quotesInRange = 0;
    let dealsInRange = 0;
    quotes.forEach((q) => {
      if (!q.created_at) return;
      const d = new Date(q.created_at);
      if (!inRange(d)) return;
      quotesInRange += 1;
      if (isWon(q)) {
        dealsInRange += 1;
        const idx = bucketOf(d);
        if (idx >= 0 && idx < counts.length) counts[idx] += 1;
      }
    });

    const max = Math.max(1, ...counts);
    return {
      kpis: { quotes: quotesInRange, deals: dealsInRange },
      chartData: buckets.map((label, i) => ({
        label,
        count: counts[i],
        value: (counts[i] / max) * 100,
        text: `${counts[i]} ${counts[i] === 1 ? 'Deal' : 'Deals'}`,
      })),
      stats: {
        totalQuotes: quotes.length,
        awaitingReview: quotes.filter((q) => ['PENDING', 'ENGINEERING REVIEW'].includes(statusOf(q))).length,
        inProduction: quotes.filter((q) => ['DESIGNING', 'MANUFACTURING', 'TESTING'].includes(statusOf(q))).length,
        openPOs: pos.filter((p) => (p.status || 'DRAFT').toUpperCase() !== 'DELIVERED').length,
      },
    };
  }, [inquiries, timeRange]);

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
{/* Card 2: Quotes Received (Historical) */}
<div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col justify-between">
  <div className="flex justify-between items-center w-full">
    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest leading-none">
      Quotes Received
    </h4>
    
    {/* Aligned Dynamic Time Range Badge */}
    <div className="bg-gray-100 border-[1px] border-black px-3 py-1 flex items-center justify-center">
      <span className="text-[10px] font-mono font-bold tracking-widest text-gray-600 uppercase leading-none">
        {timeRangeLabels[timeRange]}
      </span>
    </div>
  </div>
  
  <span className="text-5xl font-black text-black mt-6 font-mono tracking-tighter">{kpis.quotes}</span>
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
    <span className="text-5xl font-black text-black font-mono tracking-tighter">{kpis.deals}</span>
  </div>
</div>
</div>

{/* Deals Closed Per Month - Chart Area */}
<div className="w-full mt-6 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col h-[350px]">
  
  <div className="flex justify-between items-center mb-8">
    <h3 className="text-sm font-bold tracking-widest uppercase text-black">Deals Closed Over Time</h3>
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

    {chartData.map((item, index) => (
      <div key={index} className="flex flex-col items-center flex-1 group z-10 h-full justify-end">
        <div 
          style={{ height: `${item.value}%` }} 
          className={`w-full max-w-[60px] ${item.count === 0 ? 'bg-zinc-200' : 'bg-[#FA5D19]'} border-[3px] border-black transition-all duration-300 ease-out group-hover:bg-black relative cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}
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
<p className="font-label-caps text-[9px] font-black uppercase text-zinc-400 mb-2">Total Quotes</p>
<p className="font-data-readout text-xl">{stats.totalQuotes}</p>
</div>
<div className="bg-white border-2 border-black p-4 border-l-4 border-l-molten-amber">
<p className="font-label-caps text-[9px] font-black uppercase text-zinc-400 mb-2">Awaiting Review</p>
<p className="font-data-readout text-xl">{stats.awaitingReview}</p>
</div>
<div className="bg-white border-2 border-black p-4">
<p className="font-label-caps text-[9px] font-black uppercase text-zinc-400 mb-2">In Production</p>
<p className="font-data-readout text-xl">{stats.inProduction}</p>
</div>
<div className="bg-white border-2 border-black p-4">
<p className="font-label-caps text-[9px] font-black uppercase text-zinc-400 mb-2">Open Purchase Orders</p>
<p className="font-data-readout text-xl">{stats.openPOs}</p>
</div>
</div>
</section></div>

<footer className="h-8 border-t border-outline-variant px-margin-lg flex items-center justify-between shrink-0 overflow-hidden bg-white border-t-2 border-black" style={{"backgroundColor":"rgb(242, 240, 233)","borderTop":"2px solid rgb(0, 0, 0)"}}>
<div className="flex gap-8 items-center h-full">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-green-500 text-zinc-950"></span>
<span className="font-label-caps text-[9px] text-secondary uppercase text-zinc-950">{inquiries.length} records loaded</span>
</div>
</div>
<div className="flex items-center gap-4">
<span className="font-label-caps text-[9px] text-on-surface text-zinc-950">{lastSync ? `LAST SYNC: ${lastSync.toLocaleTimeString('en-GB')}` : 'SYNCING...'}</span>
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