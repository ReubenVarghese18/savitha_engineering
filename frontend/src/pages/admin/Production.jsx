import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DndContext, useDraggable, useDroppable, pointerWithin } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { products } from '../../data/products';
import { apiFetch } from '../../api/client';
import AdminFooter from '../../components/AdminFooter';

const getJobAssets = (job) => {
  if (!job) return [];
  return (job.requested_assets || []).map(assetId =>
    products.find(p => p.id === assetId || p.sku === assetId)
  ).filter(Boolean);
};

const getJobPriceVal = (job) => {
  if (job && job.base_price) {
    // Parse the number from the saved string (e.g., "₹ 4,500,000")
    return parseInt(job.base_price.replace(/[^\d]/g, ''), 10);
  }
  const assets = getJobAssets(job);
  return assets.reduce((sum, item) => {
    return sum + (item.maxTempVal ? (item.maxTempVal * 1250) : 850000);
  }, 0);
};

const getJobPriceStr = (job) => {
  if (job && job.base_price) return job.base_price;
  return `₹ ${getJobPriceVal(job).toLocaleString('en-IN')}`;
};

const getJobMachineStr = (job) => {
  const assets = getJobAssets(job);
  return assets.map(item => item.title).join(', ');
};

const SALES_COLUMNS = [
  {
    status: 'ENGINEERING REVIEW',
    title: '[ ENG REVIEW ]',
    color: '#EAB308', // yellow-500
    badgeColor: 'bg-yellow-400 text-black border border-black',
  },
  {
    status: 'QUEUED',
    title: '[ QUEUED ]',
    color: '#27272A', // zinc-800
    badgeColor: 'bg-zinc-200 text-zinc-900 border border-black',
  },
  {
    status: 'IN ASSEMBLY',
    title: '[ IN ASSEMBLY ]',
    color: '#FA5D19', // orange
    badgeColor: 'bg-[#FA5D19] text-zinc-950 border border-black',
  },
  {
    status: 'TESTING',
    title: '[ TESTING ]',
    color: '#0066FF', // blue
    badgeColor: 'bg-[#0066FF] text-white border border-black',
  },
  {
    status: 'READY FOR DISPATCH',
    title: '[ READY FOR DISPATCH ]',
    color: '#00AA66', // green
    badgeColor: 'bg-[#00AA66] text-white border border-black',
  }
];

const PROCUREMENT_COLUMNS = [
  { status: 'DRAFT', title: '[ DRAFT ]', color: '#A1A1AA', badgeColor: 'bg-zinc-300 text-black border border-black' },
  { status: 'ORDERED', title: '[ ORDERED ]', color: '#FA5D19', badgeColor: 'bg-[#FA5D19] text-zinc-950 border border-black' },
  { status: 'RECEIVED', title: '[ RECEIVED ]', color: '#EAB308', badgeColor: 'bg-yellow-400 text-black border border-black' },
  { status: 'DELIVERED', title: '[ DELIVERED ]', color: '#00AA66', badgeColor: 'bg-[#00AA66] text-white border border-black' }
];

function KanbanColumn({ column, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.status,
  });

  return (
    <div className="min-w-[300px] flex-1 flex flex-col gap-4">
      {/* Column Header */}
      <h3 
        className="font-sans font-black text-base pb-2 mb-2 border-b-[3px] text-zinc-950 uppercase tracking-widest text-left"
        style={{ borderBottomColor: column.color }}
      >
        {column.title}
      </h3>

      {/* Cards container */}
      <div 
        ref={setNodeRef} 
        className="flex-1 flex flex-col gap-4 min-h-[400px] transition-colors p-2"
        style={{
          backgroundColor: isOver ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
          border: isOver ? '2px dashed #FA5D19' : '2px dashed transparent'
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DraggableCard({ job, column, onOpenInvoice, onOpenProforma }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
  });

  const style = transform ? {
    transform: `${CSS.Translate.toString(transform)} ${isDragging ? 'rotate(2deg)' : ''}`,
    zIndex: isDragging ? 50 : undefined,
  } : undefined;

  const dragShadowClass = isDragging 
    ? 'shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-zinc-50 border-[#FA5D19] opacity-90'
    : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]';

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex flex-col p-4 gap-4 bg-white border-2 border-black transition-all text-black relative select-none ${dragShadowClass}`}
    >
      {/* Card Top Row: Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span 
            {...attributes} 
            {...listeners}
            className="material-symbols-outlined text-sm opacity-40 cursor-grab active:cursor-grabbing p-1 hover:opacity-100"
          >
            drag_indicator
          </span>
          {/* Job ID — System Data: monospace ledger */}
          <span className="font-mono font-black text-xs text-zinc-950">{job.id}</span>
        </div>
        {/* Due badge — Callout: sans bold uppercase */}
        <div className="flex gap-2">
          {job.is_custom_request && (
            <span className="px-2 py-0.5 text-[10px] font-sans font-black uppercase tracking-wider bg-yellow-400 text-black border border-black animate-pulse">
              CUSTOM SPEC
            </span>
          )}
          <span className={`px-2 py-0.5 text-xs font-sans font-bold uppercase tracking-wider ${column.badgeColor}`}>
            {job.due}
          </span>
        </div>
      </div>

      {/* Card Middle Row: Details */}
      <div className="flex flex-col gap-1 text-left">
        {/* Company Name — Primary Anchor: sans black uppercase */}
        <p className="font-sans font-black text-sm uppercase text-zinc-950">{job.company}</p>
        {/* PO# — System Data: monospace */}
        <p className="font-mono text-[10px] text-zinc-600">PO #{job.po}</p>
        {/* Machine — Secondary Description: sans normal */}
        <p 
          className="font-sans font-normal text-sm mt-1 text-zinc-800 border-l-4 pl-2" 
          style={{ borderColor: column.color }}
        >
          {job.type === 'PO' ? 'MATERIALS ORDER' : getJobMachineStr(job)}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {(job.requested_assets || []).map(assetId => (
            <span key={assetId} className="px-1.5 py-0.5 bg-zinc-100 text-zinc-900 text-[9px] font-bold font-mono border border-black uppercase rounded-none">
              {assetId}
            </span>
          ))}
        </div>
      </div>

      {/* Card Bottom Row: Conditional Actions */}
      {column.status === 'QUEUED' && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onOpenProforma(job);
          }}
          className="w-full bg-zinc-950 text-white font-sans font-bold text-xs py-2 hover:bg-[#D13B00] hover:text-black transition-colors flex items-center justify-center gap-2 uppercase tracking-wider rounded-none border border-zinc-950 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">description</span>
          PROFORMA INVOICE
        </button>
      )}

      {column.status === 'IN ASSEMBLY' && (
        <div className="w-full bg-zinc-200 h-2 rounded-none border border-black overflow-hidden mt-1">
          <div className="bg-[#FA5D19] h-full" style={{ width: `${job.progress}%` }}></div>
        </div>
      )}

      {column.status === 'TESTING' && job.details && (
        <div className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-wider mt-1 text-left">
          {job.details}
        </div>
      )}

      {column.status === 'READY FOR DISPATCH' && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onOpenInvoice(job);
          }}
          className="w-full bg-[#00AA66] text-white font-sans font-bold text-xs py-2 hover:bg-black hover:text-[#00AA66] transition-all flex items-center justify-center gap-2 uppercase tracking-wider rounded-none border border-black cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">receipt_long</span>
          FINAL TAX INVOICE
        </button>
      )}
    </div>
  );
}

export default function Production() {
  const STATUS_MAP = {
    'Pending':            'QUEUED',
    'Engineering Review': 'ENGINEERING REVIEW',
    'Designing':          'IN ASSEMBLY',
    'Manufacturing':      'TESTING',
    'Testing':            'READY FOR DISPATCH',
  };

  const [mode, setMode] = useState('SALES');
  const [boardData, setBoardData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (mode === 'SALES') {
          const data = await apiFetch('/api/quotes');
          const mapped = data.map((quote) => ({
            type:             'QUOTE',
            id:               `SE-${quote.id}`,
            db_id:            quote.id,
            company:          quote.company,
            po:               quote.requirement_details
                                ? quote.requirement_details.slice(0, 40) + (quote.requirement_details.length > 40 ? '…' : '')
                                : '—',
            due:              quote.created_at
                                ? `REC: ${new Date(quote.created_at).toLocaleDateString('en-GB')}`
                                : 'DATE PENDING',
            status:           STATUS_MAP[quote.status] || 'QUEUED',
            progress:         50,
            requested_assets: quote.requested_assets || [],
            base_price:       quote.base_price,
            lead_time:        quote.lead_time,
            payment_terms:    quote.payment_terms,
            notes:            quote.notes,
            is_custom_request: quote.is_custom_request,
            custom_details:    quote.custom_details,
            equipment_serial_number: quote.equipment_serial_number,
          }));
          setBoardData(mapped);
        } else {
          const data = await apiFetch('/api/purchase_orders');
          const mapped = data.map((po) => ({
            type:             'PO',
            id:               `PO-${po.id}`,
            db_id:            po.id,
            company:          po.vendor_name,
            po:               'N/A',
            due:              po.created_at ? `DATE: ${new Date(po.created_at).toLocaleDateString('en-GB')}` : '—',
            status:           (po.status || 'Draft').toUpperCase(),
            requested_assets: po.items_requested || [],
          }));
          setBoardData(mapped);
        }
      } catch (err) {
        console.error('[Production] Failed to fetch data:', err);
      }
    };
    fetchData();
  }, [mode]);

  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const filteredJobs = boardData.filter((job) => {
    const q = searchQuery.toLowerCase();
    return (
      (job.id && job.id.toLowerCase().includes(q)) ||
      (job.company && job.company.toLowerCase().includes(q)) ||
      (job.po && job.po.toLowerCase().includes(q)) ||
      (job.requested_assets && job.requested_assets.some((assetId) => assetId.toLowerCase().includes(q)))
    );
  });
  
  // Final Invoice Modal States
  const [isFinalInvoiceOpen, setIsFinalInvoiceOpen] = useState(false);
  const [activeInvoiceJob, setActiveInvoiceJob] = useState(null);

  // Proforma Invoice Modal States
  const [isProformaOpen, setIsProformaOpen] = useState(false);
  const [activeProformaJob, setActiveProformaJob] = useState(null);

  // Reverse map: Kanban column ID → DB status string for the PATCH body
  const COLUMN_TO_DB_STATUS = {
    'QUEUED':              'Pending',
    'ENGINEERING REVIEW':  'Engineering Review',
    'IN ASSEMBLY':         'Designing',
    'TESTING':             'Manufacturing',
    'READY FOR DISPATCH':  'Testing',
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // Drop Guard: no valid destination
    if (!over) return;

    const draggedCardId   = active.id;
    const destinationColumnId = over.id;

    // Find the card being dragged so we can read its current (original) status
    const originalCard = boardData.find((card) => card.id === draggedCardId);
    if (!originalCard) return;

    // No-op: dropped back into the same column
    if (originalCard.status === destinationColumnId) return;

    // ── OPTIMISTIC UPDATE ────────────────────────────────────────────────
    // Move the card in local state immediately so the UI feels instant.
    setBoardData((prev) =>
      prev.map((card) =>
        card.id === draggedCardId ? { ...card, status: destinationColumnId } : card
      )
    );

    const numericId = originalCard.db_id || draggedCardId.replace(/^SE-/i, '').replace(/^PO-/i, '');
    let dbStatus;
    let endpoint;
    
    if (originalCard.type === 'PO') {
      endpoint = `/api/purchase_orders/${numericId}`;
      dbStatus = destinationColumnId.charAt(0) + destinationColumnId.slice(1).toLowerCase();
    } else {
      endpoint = `/api/quotes/${numericId}`;
      dbStatus = COLUMN_TO_DB_STATUS[destinationColumnId] || 'Pending';
    }

    try {
      await apiFetch(endpoint, {
        method:  'PATCH',
        body:    JSON.stringify({ status: dbStatus }),
      });
    } catch (err) {
      console.error('[Production] PATCH failed — reverting card:', err);
      // ── REVERT on failure ──────────────────────────────────────────────
      setBoardData((prev) =>
        prev.map((card) =>
          card.id === draggedCardId ? { ...card, status: originalCard.status } : card
        )
      );
    }
  };

  const handleOpenInvoiceModal = (job) => {
    setActiveInvoiceJob(job);
    setIsFinalInvoiceOpen(true);
  };

  const handleOpenProformaModal = (job) => {
    setActiveProformaJob(job);
    setIsProformaOpen(true);
  };

  const handleInvoiceSubmit = (e) => {
    e.preventDefault();
    alert(`Invoice Generated Successfully for ${activeInvoiceJob.id}!`);
    setIsFinalInvoiceOpen(false);
    setActiveInvoiceJob(null);
  };

  const handleProformaSubmit = (e) => {
    e.preventDefault();
    alert(`Proforma Invoice Generated Successfully for ${activeProformaJob.id}!`);
    setIsProformaOpen(false);
    setActiveProformaJob(null);
  };

  // Highlight / auto-open modal based on global search navigation
  useEffect(() => {
    if (location.state && location.state.highlightJobId) {
      const jobId = location.state.highlightJobId;
      const job = boardData.find((j) => j.id === jobId);
      if (job) {
        if (job.status === 'QUEUED') {
          handleOpenProformaModal(job);
        } else if (job.status === 'READY FOR DISPATCH') {
          handleOpenInvoiceModal(job);
        } else {
          alert(`Job ${jobId} (${job.company}) is currently in status: ${job.status}`);
        }
      }
    }
  }, [location.state, boardData]);

  // Safe parsing helper for summary prices
  const rawPrice = activeInvoiceJob ? getJobPriceVal(activeInvoiceJob) : 0;
  const advanceReceived = rawPrice / 2;
  const balanceDue = rawPrice - advanceReceived;

  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-12 bg-[#F2F0E9] pb-margin-md md:pb-margin-lg px-margin-lg" style={{"backgroundColor":"rgb(248, 247, 242)"}}>
        <section className="pt-6 px-0">
          <div className="flex flex-row justify-between items-center pb-2">
            <h2 className="font-sans text-[48px] md:text-[64px] leading-none font-black uppercase tracking-tight text-zinc-950">PRODUCTION</h2>
            
            <div className="flex items-center gap-4">
              {/* Toggle Switch */}
              <div className="flex border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <button 
                  onClick={() => setMode('SALES')}
                  className={`px-6 py-2 font-mono text-sm font-bold uppercase transition-colors ${mode === 'SALES' ? 'bg-[#FA5D19] text-black' : 'text-black hover:bg-gray-100'}`}
                >
                  Sales
                </button>
                <div className="w-[3px] bg-black"></div>
                <button 
                  onClick={() => setMode('PROCUREMENT')}
                  className={`px-6 py-2 font-mono text-sm font-bold uppercase transition-colors ${mode === 'PROCUREMENT' ? 'bg-[#FA5D19] text-black' : 'text-black hover:bg-gray-100'}`}
                >
                  Procurement
                </button>
              </div>

              <div className="relative border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-900 text-sm">search</span>
                <input 
                  type="text" 
                  placeholder="Filter Jobs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white py-2 pl-10 pr-4 font-mono text-xs focus:outline-none focus:bg-zinc-50 transition-all placeholder:text-zinc-500 uppercase tracking-wider w-[250px]" 
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1 pb-6">
            {/* Decorative Orange Line */}
            <span className="w-12 h-[3px] bg-[#FA5D19]"></span>
            
            {/* Monospace Subtitle */}
            <span className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.2em] text-gray-600 uppercase">
              SYS.ADMIN // PRODUCTION
            </span>
          </div>
        </section>

        <DndContext collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
          <section className="w-full overflow-x-auto pb-12">
            <div className="flex gap-6 min-w-max h-full pb-6">
              {(mode === 'SALES' ? SALES_COLUMNS : PROCUREMENT_COLUMNS).map((column, colIdx) => {
                const columnJobs = filteredJobs.filter(job => job.status === column.status);
                
                return (
                  <KanbanColumn key={colIdx} column={column}>
                    {columnJobs.map((job) => (
                      <DraggableCard 
                        key={job.id} 
                        job={job} 
                        column={column} 
                        onOpenInvoice={handleOpenInvoiceModal} 
                        onOpenProforma={handleOpenProformaModal}
                      />
                    ))}
                  </KanbanColumn>
                );
              })}
            </div>
          </section>
        </DndContext>
      </div>

      {/* Redesigned Final Tax Invoice Modal (2-Column Layout, max-w-4xl, p-10) */}
      {isFinalInvoiceOpen && activeInvoiceJob && (
        <div role="dialog" aria-modal="true" aria-label="Invoice" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-4xl p-10 flex flex-col text-black">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b-[3px] border-black pb-4 text-left">
              <h2 className="text-sm font-black uppercase tracking-widest font-sans text-black">
                GENERATE FINAL INVOICE // {activeInvoiceJob.id} // {activeInvoiceJob.company}
              </h2>
              <button 
                onClick={() => {
                  setIsFinalInvoiceOpen(false);
                  setActiveInvoiceJob(null);
                }} 
                aria-label="Close" className="text-black hover:text-[#FA5D19] transition-colors focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Form & Two-Column Grid */}
            <form onSubmit={handleInvoiceSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                {/* Left Column: Read-Only Data */}
                <div className="flex flex-col gap-6">
                  <div className="bg-zinc-100 border-2 border-black p-6 space-y-4">
                    <div className="flex flex-col gap-2 font-mono text-xs text-zinc-600 font-bold uppercase">
                      <span>REQUESTED ASSETS ({getJobAssets(activeInvoiceJob).length})</span>
                      <div className="flex flex-col gap-1.5 mt-1">
                        {getJobAssets(activeInvoiceJob).map((item) => (
                          <div key={item.id} className="text-xs font-mono bg-white border border-black p-2 flex justify-between items-center text-black">
                            <div>
                              <span className="font-black">{item.sku}</span> - {item.title}
                            </div>
                            <span className="font-bold">₹ {(item.maxTempVal ? (item.maxTempVal * 1250) : 850000).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 font-mono text-xs text-zinc-600 font-bold uppercase border-t border-zinc-300 pt-3">
                      <span>ORIGINAL QUOTE TOTAL</span>
                      <span className="text-sm text-black font-black">{getJobPriceStr(activeInvoiceJob)}</span>
                    </div>
                    <div className="flex flex-col gap-1 font-mono text-xs text-zinc-600 font-bold uppercase border-t border-zinc-300 pt-3">
                      <span>LESS: 50% ADVANCE RECEIVED</span>
                      <span className="text-sm text-red-600 font-black">- ₹ {advanceReceived.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex flex-col gap-1 font-mono text-xs font-black text-black uppercase border-t-2 border-black pt-3">
                      <span>BALANCE DUE</span>
                      <span className="text-lg text-black font-black">₹ {balanceDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Inputs & Buttons */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col">
                    <label className="block text-xs font-mono font-bold tracking-widest text-black uppercase mb-2">
                      FINAL DESTINATION / SHIPPING ADDRESS
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.G. PLOT 45, GIDC INDUSTRIAL ESTATE, GUJARAT"
                      className="p-4 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-sm uppercase tracking-wider transition-all"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-xs font-mono font-bold tracking-widest text-black uppercase mb-2">
                      FREIGHT & LOGISTICS COST (₹)
                    </label>
                    <input 
                      type="number" 
                      required
                      placeholder="E.G. 45000"
                      className="p-4 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-sm uppercase tracking-wider transition-all"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-xs font-mono font-bold tracking-widest text-black uppercase mb-2">
                      APPLICABLE TAX / GST
                    </label>
                    <div className="relative">
                      <select 
                        aria-label="Applicable tax / GST" 
                        className="w-full appearance-none p-4 pr-10 border-2 border-black bg-white text-black font-mono text-sm font-bold tracking-widest uppercase cursor-pointer focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none transition-all"
                      >
                        <option value="18% IGST">18% IGST (INTER-STATE)</option>
                        <option value="18% CGST/SGST">18% CGST/SGST (INTRA-STATE)</option>
                        <option value="EXEMPTED">0% EXEMPTED</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Buttons pushed to the bottom right of the right column */}
                  <div className="flex justify-end items-center gap-4 mt-auto pt-6">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsFinalInvoiceOpen(false);
                        setActiveInvoiceJob(null);
                      }} 
                      className="text-sm font-mono font-bold tracking-widest uppercase hover:text-red-600 transition-colors px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-3.5 bg-[#00AA66] text-white border-2 border-black font-mono text-xs font-bold tracking-widest uppercase transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                    >
                      GENERATE OFFICIAL INVOICE
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proforma Invoice Modal (max-w-3xl, p-10) */}
      {isProformaOpen && activeProformaJob && (
        <div role="dialog" aria-modal="true" aria-label="Proforma invoice" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl p-10 flex flex-col text-black">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b-[3px] border-black pb-4 text-left">
              <h2 className="text-sm font-black uppercase tracking-widest font-sans text-black">
                GENERATE PROFORMA INVOICE // {activeProformaJob.id} // {activeProformaJob.company}
              </h2>
              <button 
                onClick={() => {
                  setIsProformaOpen(false);
                  setActiveProformaJob(null);
                }} 
                aria-label="Close" className="text-black hover:text-[#FA5D19] transition-colors focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Form Layout */}
            <form onSubmit={handleProformaSubmit} className="flex flex-col gap-6 text-left">
              {/* Summary Fields */}
              <div className="bg-zinc-100 border-2 border-black p-6 space-y-4">
                <div className="flex flex-col gap-2 font-mono text-xs text-zinc-600 font-bold uppercase">
                  <span>REQUESTED ASSETS ({getJobAssets(activeProformaJob).length})</span>
                  <div className="flex flex-col gap-1.5 mt-1">
                    {getJobAssets(activeProformaJob).map((item) => (
                      <div key={item.id} className="text-xs font-mono bg-white border border-black p-2 flex justify-between items-center text-black">
                        <div>
                          <span className="font-black">{item.sku}</span> - {item.title}
                        </div>
                        <span className="font-bold">₹ {(item.maxTempVal ? (item.maxTempVal * 1250) : 850000).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between font-mono text-xs text-zinc-600 font-bold uppercase border-t border-zinc-300 pt-3 items-center">
                  <span>AGREED-UPON QUOTE AMOUNT</span>
                  <span className="text-black font-black text-sm">{getJobPriceStr(activeProformaJob)}</span>
                </div>
              </div>

              {/* Payment Terms Input */}
              <div className="flex flex-col">
                <label className="block text-xs font-mono font-bold tracking-widest text-black uppercase mb-2">
                  ADVANCE PAYMENT TERMS
                </label>
                <div className="relative">
                  <select 
                    aria-label="Advance payment terms" 
                    className="w-full appearance-none p-4 pr-10 border-2 border-black bg-white text-black font-mono text-sm font-bold tracking-widest uppercase cursor-pointer focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none transition-all"
                  >
                    <option value="50% Advance">50% ADVANCE PAYMENT</option>
                    <option value="100% Upfront">100% UPFRONT PAYMENT</option>
                    <option value="Custom">CUSTOM PAYMENT SCHEDULE</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Timeline Input */}
              <div className="flex flex-col">
                <label className="block text-xs font-mono font-bold tracking-widest text-black uppercase mb-2">
                  EXPECTED DISPATCH TIMELINE
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="E.G. 14 DAYS FROM ADVANCE"
                  className="p-4 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-sm uppercase tracking-wider transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsProformaOpen(false);
                    setActiveProformaJob(null);
                  }} 
                  className="text-sm font-mono font-bold tracking-widest uppercase hover:text-red-600 transition-colors px-4 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3.5 bg-black text-white border-2 border-black font-mono text-xs font-bold tracking-widest uppercase transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  GENERATE PROFORMA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminFooter />
    </>
  );
}