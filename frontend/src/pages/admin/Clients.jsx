import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminFooter from '../../components/AdminFooter';

/* ─────────────────────────────────────────────────────────────────
   SHARED STYLE CONSTANTS
───────────────────────────────────────────────────────────────── */
const INPUT_CLS =
  'w-full px-4 py-2.5 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-lg transition-all';
const LABEL_CLS = 'block font-mono font-bold uppercase text-gray-700 mb-2 tracking-wider text-sm';
/* ─────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────── */
const CLIENTS_DATA = [
  {
    id: 'SE-C101',
    company: 'Wayne Enterprises',
    contact: 'Bruce Wayne',
    phone: '+1 123-4567',
    email: 'bruce@wayne.com',
    value: '₹ 4.2 Cr',
    status: 'ACTIVE',
    industry: 'Defense',
    recentOrders: [
      { id: 'ORD-8821', date: '14 May 2026', amount: '₹ 1.8 Cr', products: ['SE-MELT-001', 'SE-MELT-002'] },
      { id: 'ORD-8654', date: '02 Mar 2026', amount: '₹ 1.4 Cr', products: ['SE-ANNE-001', 'SE-BATCH-003'] },
      { id: 'ORD-8401', date: '18 Jan 2026', amount: '₹ 1.0 Cr', products: ['SE-FORG-001'] },
    ],
  },
  {
    id: 'SE-C102',
    company: 'Stark Industries',
    contact: 'Tony Stark',
    phone: '+1 987-6543',
    email: 'tony@stark.com',
    value: '₹ 3.8 Cr',
    status: 'ACTIVE',
    industry: 'Aerospace',
    recentOrders: [
      { id: 'ORD-8790', date: '01 Jun 2026', amount: '₹ 2.1 Cr', products: ['SE-MELT-003', 'SE-MELT-004', 'SE-BATCH-006'] },
      { id: 'ORD-8600', date: '10 Apr 2026', amount: '₹ 1.7 Cr', products: ['SE-ANNE-002', 'SE-FORG-002'] },
      { id: 'ORD-8310', date: '05 Feb 2026', amount: '₹ 0.0 Cr', products: ['SE-OVEN-001'] },
    ],
  },
  {
    id: 'SE-C103',
    company: 'LexCorp',
    contact: 'Lex Luthor',
    phone: '+1 555-0199',
    email: 'lex@lexcorp.com',
    value: '₹ 1.5 Cr',
    status: 'LEAD',
    industry: 'Custom Fabrication',
    recentOrders: [
      { id: 'ORD-8801', date: '20 May 2026', amount: '₹ 0.9 Cr', products: ['SE-CUST-001', 'SE-CUST-002'] },
      { id: 'ORD-8670', date: '11 Mar 2026', amount: '₹ 0.6 Cr', products: ['SE-BATCH-005'] },
      { id: 'ORD-8450', date: '02 Jan 2026', amount: '₹ 0.0 Cr', products: ['SE-OVEN-002', 'SE-OVEN-003'] },
    ],
  },
  {
    id: 'SE-C104',
    company: 'Pym Tech',
    contact: 'Hank Pym',
    phone: '+1 444-0122',
    email: 'hank@pym.com',
    value: '₹ 0.9 Cr',
    status: 'ACTIVE',
    industry: 'Automotive',
    recentOrders: [
      { id: 'ORD-8755', date: '28 Apr 2026', amount: '₹ 0.5 Cr', products: ['SE-MELT-005', 'SE-ANNE-003'] },
      { id: 'ORD-8580', date: '15 Feb 2026', amount: '₹ 0.4 Cr', products: ['SE-BATCH-001'] },
      { id: 'ORD-8320', date: '09 Dec 2025', amount: '₹ 0.0 Cr', products: ['SE-CUST-004', 'SE-CUST-005'] },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export default function Clients() {
  // Add Client Modal
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  // View Profile Drawer
  const [selectedClient, setSelectedClient] = useState(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  const handleViewProfile = (client) => {
    setSelectedClient(client);
    setIsProfileDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsProfileDrawerOpen(false);
    setTimeout(() => setSelectedClient(null), 300);
  };

  const location = useLocation();

  // Highlight / open client profile drawer on global search navigate
  useEffect(() => {
    if (location.state && location.state.highlightClientId) {
      const clientId = location.state.highlightClientId;
      const client = CLIENTS_DATA.find(c => c.id === clientId);
      if (client) {
        handleViewProfile(client);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (isAddClientOpen || isProfileDrawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isAddClientOpen, isProfileDrawerOpen]);

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          PAGE BODY
      ══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-[95%] mx-auto px-12 space-y-12 pb-8" style={{ backgroundColor: 'rgb(248, 247, 242)' }}>

        {/* ── HEADER ──────────────────────────────────────────────── */}
        <section className="pt-6 px-0 mb-8">
          <div className="flex justify-between items-end pb-6">
            <div className="space-y-2">
              <h2 className="font-sans text-[48px] md:text-[64px] leading-none font-black uppercase tracking-tight text-zinc-950">
                CLIENT DIRECTORY
              </h2>
              <div className="flex items-center gap-3 mt-1 mb-6">
                <span className="w-12 h-[3px] bg-[#FA5D19]"></span>
                <span className="font-mono text-xs font-bold tracking-widest text-gray-500 uppercase">
                  SYS.ADMIN // CRM_MODULE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">search</span>
                <input
                  className="bg-white border-2 border-black py-2.5 pl-10 pr-4 font-mono text-xs focus:outline-none focus:border-[#FA5D19] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-[320px] uppercase tracking-wider placeholder:text-zinc-400 transition-all"
                  placeholder="SEARCH COMPANIES OR CONTACTS..."
                  type="text"
                />
              </div>
              <button
                onClick={() => setIsAddClientOpen(true)}
                className="bg-[#FA5D19] text-black font-sans font-bold text-sm py-2.5 px-6 uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all whitespace-nowrap flex-shrink-0"
              >
                ADD NEW CLIENT
              </button>
            </div>
          </div>
        </section>

        {/* ── KPI CARDS ───────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3">TOTAL ACTIVE ACCOUNTS</p>
            <p className="font-sans text-6xl font-black text-zinc-950">142</p>
          </div>
          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3">KEY ACCOUNTS / VIP</p>
            <p className="font-sans text-6xl font-black text-zinc-950">18</p>
          </div>
          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3">PENDING COMMUNICATIONS</p>
              <p className="font-sans text-6xl font-black text-zinc-950">5</p>
            </div>
            <span className="material-symbols-outlined text-[#FA5D19] text-4xl mb-1">warning</span>
          </div>
        </section>

        {/* ── CLIENT TABLE ────────────────────────────────────────── */}
        <section className="pb-12">
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left">
                <thead className="bg-black">
                  <tr className="font-mono font-bold uppercase">
                    <th className="py-6 px-6 text-white whitespace-nowrap align-middle">CLIENT ID</th>
                    <th className="py-6 px-6 text-white whitespace-nowrap align-middle">COMPANY NAME</th>
                    <th className="py-6 px-6 text-white whitespace-nowrap align-middle">PRIMARY CONTACT</th>
                    <th className="py-6 px-6 text-white whitespace-nowrap align-middle">CONTACT INFO</th>
                    <th className="py-6 px-6 text-white whitespace-nowrap align-middle">LIFETIME VALUE</th>
                    <th className="py-6 px-6 text-white whitespace-nowrap align-middle text-center">STATUS</th>
                    <th className="py-6 px-6 text-white whitespace-nowrap align-middle text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {CLIENTS_DATA.map((client) => (
                    <tr key={client.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-8 px-6 font-mono text-lg font-black text-black whitespace-nowrap align-middle">{client.id}</td>
                      <td className="py-8 px-6 font-sans font-black uppercase text-xl text-zinc-950 align-middle">{client.company}</td>
                      <td className="py-8 px-6 font-mono text-lg text-zinc-800 whitespace-nowrap align-middle">{client.contact}</td>
                      <td className="py-8 px-6 font-mono text-lg text-zinc-700 align-middle">
                        <div className="flex flex-col gap-1">
                          <span>{client.phone}</span>
                          <span className="text-zinc-500">{client.email}</span>
                        </div>
                      </td>
                      <td className="py-8 px-6 font-mono text-lg font-black text-zinc-950 whitespace-nowrap align-middle">{client.value}</td>
                      <td className="py-8 px-6 text-center whitespace-nowrap align-middle">
                        {client.status === 'ACTIVE' ? (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-mono font-bold uppercase text-sm rounded-sm">ACTIVE</span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 font-mono font-bold uppercase text-sm rounded-sm">LEAD</span>
                        )}
                      </td>
                      <td className="py-8 px-6 text-center whitespace-nowrap align-middle">
                        <button
                          onClick={() => handleViewProfile(client)}
                          className="font-mono font-bold uppercase text-black text-lg underline underline-offset-4 decoration-2 hover:text-[#FA5D19] transition-colors whitespace-nowrap"
                        >
                          VIEW PROFILE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <AdminFooter />

      {/* ══════════════════════════════════════════════════════════════
          ADD NEW CLIENT MODAL
      ══════════════════════════════════════════════════════════════ */}
      {isAddClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-4xl p-8 max-h-[90vh] overflow-hidden flex flex-col">

            {/* Modal Header */}
            <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-4 flex-shrink-0">
              <h2 className="font-sans font-black uppercase text-3xl text-black tracking-tight">
                ADD NEW CLIENT
              </h2>
              <button
                onClick={() => setIsAddClientOpen(false)}
                className="text-black hover:text-[#FA5D19] transition-colors focus:outline-none"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); setIsAddClientOpen(false); }} className="flex flex-col gap-4 overflow-y-auto flex-1">

              {/* Row 1: Company Name & Industry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>COMPANY NAME</label>
                  <input type="text" placeholder="E.G. WAYNE ENTERPRISES" className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>INDUSTRY</label>
                  <input type="text" placeholder="E.G. AEROSPACE, DEFENSE, AUTOMOTIVE..." className={INPUT_CLS} />
                </div>
              </div>

              {/* Row 2: Primary Contact Name & Contact Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>PRIMARY CONTACT NAME</label>
                  <input type="text" placeholder="E.G. BRUCE WAYNE" className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>CONTACT PHONE</label>
                  <input type="tel" placeholder="+91 98765 43210" className={INPUT_CLS} />
                </div>
              </div>

              {/* Row 3: Email Address & GSTIN */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>EMAIL ADDRESS</label>
                  <input type="email" placeholder="E.G. CONTACT@COMPANY.COM" className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>GSTIN / TAX ID</label>
                  <input type="text" placeholder="E.G. 27AAPFU0939F1ZV" className={INPUT_CLS} />
                </div>
              </div>

              {/* Row 4: Billing Address (full width) */}
              <div className="col-span-2">
                <label className={LABEL_CLS}>BILLING ADDRESS</label>
                <textarea
                  rows={2}
                  placeholder="E.G. LOWER PAREL, MUMBAI, MAHARASHTRA — 400 013"
                  className={`${INPUT_CLS} resize-none`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-6 pt-3 border-t-2 border-black/10 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="font-sans font-bold uppercase text-lg text-gray-500 hover:text-black transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-[#FA5D19] text-black font-sans font-black uppercase text-xl px-8 py-4 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  SAVE CLIENT RECORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW PROFILE — SLIDE-OUT DRAWER
      ══════════════════════════════════════════════════════════════ */}
      {/* Dim overlay */}
      {isProfileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          onClick={handleCloseDrawer}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[600px] z-50 bg-white border-l-[4px] border-black shadow-[-12px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-transform duration-300 ease-in-out ${
          isProfileDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedClient && (
          <>
            {/* Drawer Header */}
            <div className="px-8 pt-8 pb-6 border-b-[3px] border-black flex-shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-sans font-black uppercase text-4xl text-zinc-950 leading-tight mb-2">
                    {selectedClient.company}
                  </h2>
                  <p className="font-mono text-gray-500 text-lg">{selectedClient.id}</p>
                </div>
                {/* Close button */}
                <button
                  onClick={handleCloseDrawer}
                  className="text-black hover:text-[#FA5D19] transition-colors focus:outline-none mt-1 flex-shrink-0"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Status badge */}
              <div className="mt-4">
                {selectedClient.status === 'ACTIVE' ? (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-mono font-bold uppercase text-sm rounded-sm">ACTIVE</span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 font-mono font-bold uppercase text-sm rounded-sm">LEAD</span>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">

              {/* Contact Block */}
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3">PRIMARY CONTACT</p>
                <p className="font-sans font-bold text-2xl text-zinc-950 mb-2">{selectedClient.contact}</p>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-lg text-zinc-700">{selectedClient.phone}</p>
                  <p className="font-mono text-lg text-zinc-500">{selectedClient.email}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-black/10" />

              {/* Financial Overview */}
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3">LIFETIME VALUE</p>
                <p className="font-sans font-black text-5xl text-green-700">{selectedClient.value}</p>
                <p className="font-mono text-sm text-gray-400 mt-2 uppercase tracking-wider">All-time billed (incl. GST)</p>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-black/10" />

              {/* Industry */}
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3">INDUSTRY VERTICAL</p>
                <p className="font-sans font-black uppercase text-2xl text-zinc-950">{selectedClient.industry}</p>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-black/10" />

              {/* Recent Orders Mini-Table */}
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">RECENT ORDERS</p>
                <div className="border-2 border-black overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-black">
                        <th className="py-3 px-4 font-mono font-bold text-xs text-white uppercase whitespace-nowrap">ORDER ID</th>
                        <th className="py-3 px-4 font-mono font-bold text-xs text-white uppercase whitespace-nowrap">DATE</th>
                        <th className="py-3 px-4 font-mono font-bold text-xs text-white uppercase whitespace-nowrap text-right">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {selectedClient.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3 px-4 font-mono text-sm text-black">
                            <div className="font-black">{order.id}</div>
                            {order.products && order.products.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {order.products.map((prod) => (
                                  <span key={prod} className="px-1.5 py-0.5 bg-zinc-100 text-zinc-900 text-[10px] font-bold border border-black rounded-none">
                                    {prod}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-sm text-zinc-600">{order.date}</td>
                          <td className="py-3 px-4 font-mono text-sm font-bold text-zinc-950 text-right">{order.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Drawer Footer — pinned action button */}
            <div className="flex-shrink-0">
              <button className="w-full bg-black text-white font-sans font-black uppercase text-xl py-6 hover:bg-[#FA5D19] hover:text-black transition-colors border-t-[3px] border-black tracking-widest">
                EDIT PROFILE DETAILS
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}