import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductModal from '../../components/ProductModal';
import { apiFetch } from '../../api/client';
import AdminFooter from '../../components/AdminFooter';

// Shared style constants
const INPUT_CLS = "w-full px-4 py-3 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-lg uppercase tracking-wider transition-all";
const LABEL_CLS = "block text-sm font-mono font-bold tracking-widest text-black uppercase mb-2";
const SELECT_CLS = "w-full appearance-none px-4 py-3 pr-10 border-2 border-black bg-white text-black font-mono text-lg font-bold tracking-widest uppercase cursor-pointer focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none transition-all";

function SelectWrapper({ children }) {
  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'PRODUCTS',      label: 'Products' },
  { id: 'RAW_MATERIALS', label: 'Raw Materials' },
  { id: 'SUPPLIERS',     label: 'Suppliers' },
];

const MODAL_TITLES = {
  PRODUCTS:      'ADD NEW PRODUCT',
  RAW_MATERIALS: 'ADD NEW RAW MATERIAL',
  SUPPLIERS:     'ADD NEW SUPPLIER',
};

const mockRawMaterials = [
  { materialCode: 'RM-101', name: '10mm Mild Steel Plates',       currentStock: 45,  reorderThreshold: 20,  unit: 'Tons' },
  { materialCode: 'RM-102', name: 'Firebrick Grade A (ISO-23)',    currentStock: 12,  reorderThreshold: 15,  unit: 'Units' },
  { materialCode: 'RM-103', name: 'Ceramic Fiber Insulation Wool', currentStock: 0,   reorderThreshold: 5,   unit: 'Kg' },
  { materialCode: 'RM-104', name: 'Nichrome Heating Wire 18AWG',   currentStock: 280, reorderThreshold: 100, unit: 'Kg' },
  { materialCode: 'RM-105', name: 'High-Silica Refractory Cement', currentStock: 8,   reorderThreshold: 10,  unit: 'Kg' },
  { materialCode: 'RM-106', name: 'Stainless Steel Sheet 304-2B',  currentStock: 3,   reorderThreshold: 5,   unit: 'Tons' },
];

const mockSuppliers = [
  { supplierId: 'SUP-001', companyName: 'Tata Steel Ltd.', contactPerson: 'Rajesh Kumar', email: 'rajesh@tatasteel.com', phone: '+91 98765 43210' },
  { supplierId: 'SUP-002', companyName: 'JSW Steel', contactPerson: 'Amit Sharma', email: 'amit@jsw.in', phone: '+91 99999 88888' },
  { supplierId: 'SUP-003', companyName: 'Bhushan Refractories', contactPerson: 'Sanjay Gupta', email: 'sanjay@bhushan.com', phone: '+91 98123 45678' }
];

function StockBadge({ current, threshold }) {
  if (current === 0)
    return <span className="inline-block px-4 py-2 text-base font-sans font-bold uppercase tracking-wider bg-red-100 text-red-800 rounded-sm">DEPLETED</span>;
  if (current <= threshold)
    return <span className="inline-block px-4 py-2 text-base font-sans font-bold uppercase tracking-wider bg-orange-100 text-orange-800 rounded-sm">LOW STOCK</span>;
  return <span className="inline-block px-4 py-2 text-base font-sans font-bold uppercase tracking-wider bg-green-100 text-green-800 rounded-sm">HEALTHY</span>;
}

export default function Catalog() {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [activeTab, setActiveTab] = useState('PRODUCTS');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const fetchProducts = async () => {
    try {
      const data = await apiFetch('/furnaces/');
      setProductsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (payload) => {
    try {
      const isEditing = !!selectedProduct;
      const url = isEditing 
        ? `/furnaces/${selectedProduct.id}` 
        : `/furnaces/`;
      const method = isEditing ? 'PUT' : 'POST';

      await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving product.");
    }
  };

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const filteredProducts = productsList.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  const filteredRawMaterials = mockRawMaterials.filter((mat) => {
    const q = searchQuery.toLowerCase();
    return (
      (mat.materialCode && mat.materialCode.toLowerCase().includes(q)) ||
      (mat.name && mat.name.toLowerCase().includes(q))
    );
  });

  const filteredSuppliers = mockSuppliers.filter((sup) => {
    const q = searchQuery.toLowerCase();
    return (
      (sup.companyName && sup.companyName.toLowerCase().includes(q)) ||
      (sup.contactPerson && sup.contactPerson.toLowerCase().includes(q))
    );
  });

  // Body scroll lock
  useEffect(() => {
    if (isAddItemOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isAddItemOpen]);

  return (
    <>

<div className="w-full space-y-12 pb-8" style={{"backgroundColor":"rgb(248, 247, 242)"}}>
<section className="space-y-2 pt-6 px-0 mb-8">
<div className="flex justify-between items-end pb-6">
<div className="space-y-2">
<h2 className="font-headline-lg text-[48px] md:text-[64px] leading-none font-black uppercase tracking-tight text-zinc-950">PRECISION CATALOG</h2>
<div className="flex items-center gap-3 mt-1 mb-6">
  {/* Decorative Orange Line */}
  <span className="w-12 h-[3px] bg-[#FA5D19]"></span>
  
  {/* Monospace Subtitle */}
  <span className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.2em] text-gray-600 uppercase">
    SYS.ADMIN // CATALOG
  </span>
</div>
</div>
<button 
  onClick={() => {
    if (activeTab === 'PRODUCTS') {
      setSelectedProduct(null);
      setIsProductModalOpen(true);
    } else {
      setIsAddItemOpen(true);
    }
  }}
  className="bg-[#FA5D19] text-black font-label-caps py-3 px-8 font-bold active:scale-95 transition-transform uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[-4px] translate-y-[-4px]"
>
  ADD NEW ITEM
</button>
</div>
</section>

<section className="mb-8 flex justify-between items-end border-b-2 border-black">
<div className="flex gap-8">
  {TABS.map((tab) => (
    <button
      key={tab.id}
      onClick={() => {
        setActiveTab(tab.id);
        setSearchQuery('');
      }}
      className={`pb-4 font-label-caps text-sm font-black uppercase transition-opacity ${
        activeTab === tab.id
          ? 'border-b-4 border-[#FA5D19] opacity-100'
          : 'opacity-40 hover:opacity-100'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">search</span>
<input 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="bg-white border-2 border-black py-2 pl-10 pr-4 font-mono text-xs focus:outline-none focus:border-[#FA5D19] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-[300px] uppercase tracking-wider transition-all" 
  placeholder={
    activeTab === 'PRODUCTS'
      ? 'Search Products...'
      : activeTab === 'RAW_MATERIALS'
      ? 'Search Raw Materials...'
      : 'Search Suppliers...'
  } 
  type="text" 
/>
</div>
</section>

      {/* ── PRODUCTS TABLE ───────────────────────────────────────────── */}
      {activeTab === 'PRODUCTS' && (
        <section className="pb-12">
          {filteredProducts.length === 0 ? (
            <div className="w-full bg-white border-2 border-dashed border-black p-12 text-center">
              <span className="font-mono text-sm font-bold text-black uppercase tracking-widest">
                [ 0 MATCHES FOUND FOR "{searchQuery}" ]
              </span>
            </div>
          ) : (
            <div tabIndex={0} role="region" aria-label="Scrollable table" className="overflow-x-auto border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black text-white font-sans font-black text-base uppercase">
                    <th className="py-6 px-6">ITEM CODE</th>
                    <th className="py-6 px-6">MODEL NAME</th>
                    <th className="py-6 px-6 text-right">BASE PRICE</th>
                    <th className="py-6 px-6">CATEGORY</th>
                    <th className="py-6 px-6 text-center">SPEC SHEET</th>
                    <th className="py-6 px-6 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {filteredProducts.map((p) => {
                    const basePriceVal = p.maxTempVal ? (p.maxTempVal * 1250) : 850000;
                    return (
                      <tr key={p.id} className={`transition-colors ${p.is_active === false ? 'bg-zinc-100 opacity-60' : 'hover:bg-zinc-50'}`}>
                        {/* ITEM CODE — System Data: monospace ledger */}
                        <td className="py-8 px-6 font-mono text-base font-black text-black">
                          {p.sku}
                          {p.is_active === false && <span className="ml-2 bg-red-100 text-red-800 text-[9px] px-2 py-0.5 uppercase tracking-widest">HIDDEN</span>}
                        </td>
                        {/* MODEL NAME — Primary Anchor: sans bold uppercase */}
                        <td className="py-8 px-6 font-sans font-black uppercase text-base text-zinc-900">{p.title || p.name}</td>
                        {/* BASE PRICE — System Data: monospace */}
                        <td className="py-8 px-6 font-mono text-base text-right text-zinc-950 whitespace-nowrap">
                          ₹ {basePriceVal.toLocaleString('en-IN')}
                        </td>
                        {/* CATEGORY — Secondary Description: sans normal */}
                        <td className="py-8 px-6 font-sans font-normal text-base text-zinc-600">{p.category}</td>
                        <td className="py-8 px-6 text-center">
                          <span className="material-symbols-outlined text-[#FA5D19] text-2xl cursor-pointer hover:scale-110 transition-transform">
                            description
                          </span>
                        </td>
                        <td className="py-8 px-6 text-center">
                          <span 
                            className="material-symbols-outlined text-zinc-950 text-2xl cursor-pointer hover:text-[#FA5D19] transition-colors"
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsProductModalOpen(true);
                            }}
                          >
                            edit
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── RAW MATERIALS TABLE ──────────────────────────────────────── */}
      {activeTab === 'RAW_MATERIALS' && (
        <section className="pb-12">
          {filteredRawMaterials.length === 0 ? (
            <div className="w-full bg-white border-2 border-dashed border-black p-12 text-center">
              <span className="font-mono text-sm font-bold text-black uppercase tracking-widest">
                [ 0 MATCHES FOUND FOR "{searchQuery}" ]
              </span>
            </div>
          ) : (
            <div tabIndex={0} role="region" aria-label="Scrollable table" className="overflow-x-auto border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black text-white font-sans font-black text-base uppercase">
                    <th className="py-6 px-6">MATERIAL CODE</th>
                    <th className="py-6 px-6">DESCRIPTION</th>
                    <th className="py-6 px-6 text-right">CURRENT STOCK</th>
                    <th className="py-6 px-6 text-right">THRESHOLD</th>
                    <th className="py-6 px-6 text-center">STATUS</th>
                    <th className="py-6 px-6 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {filteredRawMaterials.map((mat) => (
                    <tr key={mat.materialCode} className="hover:bg-zinc-50 transition-colors">
                      {/* MATERIAL CODE — System Data: monospace ledger */}
                      <td className="py-8 px-6 font-mono text-base font-black text-black">{mat.materialCode}</td>
                      {/* DESCRIPTION — Primary Anchor: sans bold uppercase */}
                      <td className="py-8 px-6 font-sans font-black uppercase text-base text-zinc-900">{mat.name}</td>
                      {/* CURRENT STOCK — System Data: monospace */}
                      <td className="py-8 px-6 font-mono text-base text-right text-zinc-950">{mat.currentStock} <span className="font-sans font-normal text-zinc-500">{mat.unit}</span></td>
                      {/* THRESHOLD — System Data: monospace, muted */}
                      <td className="py-8 px-6 font-mono text-base text-right text-zinc-400">{mat.reorderThreshold} <span className="font-sans font-normal text-zinc-400">{mat.unit}</span></td>
                      <td className="py-8 px-6 text-center">
                        <StockBadge current={mat.currentStock} threshold={mat.reorderThreshold} />
                      </td>
                      <td className="py-8 px-6 text-center">
                        <button className="font-sans font-bold text-sm uppercase tracking-wider text-black border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                          REORDER
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── SUPPLIERS TABLE ────────────────────────────────────────── */}
      {activeTab === 'SUPPLIERS' && (
        <section className="pb-12">
          {filteredSuppliers.length === 0 ? (
            <div className="w-full bg-white border-2 border-dashed border-black p-12 text-center">
              <span className="font-mono text-sm font-bold text-black uppercase tracking-widest">
                [ 0 MATCHES FOUND FOR "{searchQuery}" ]
              </span>
            </div>
          ) : (
            <div tabIndex={0} role="region" aria-label="Scrollable table" className="overflow-x-auto border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black text-white font-sans font-black text-base uppercase">
                    <th className="py-6 px-6">SUPPLIER ID</th>
                    <th className="py-6 px-6">COMPANY NAME</th>
                    <th className="py-6 px-6">CONTACT PERSON</th>
                    <th className="py-6 px-6">EMAIL</th>
                    <th className="py-6 px-6">PHONE</th>
                    <th className="py-6 px-6 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {filteredSuppliers.map((sup) => (
                    <tr key={sup.supplierId} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-8 px-6 font-mono text-base font-black text-black">{sup.supplierId}</td>
                      <td className="py-8 px-6 font-sans font-black uppercase text-base text-zinc-900">{sup.companyName}</td>
                      <td className="py-8 px-6 font-mono text-base text-zinc-950">{sup.contactPerson}</td>
                      <td className="py-8 px-6 font-mono text-base text-zinc-600">{sup.email}</td>
                      <td className="py-8 px-6 font-mono text-base text-zinc-600">{sup.phone}</td>
                      <td className="py-8 px-6 text-center">
                        <span className="material-symbols-outlined text-zinc-950 text-2xl cursor-pointer hover:text-[#FA5D19] transition-colors">
                          edit
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
</div>

<AdminFooter />

      {/* ── ADD ITEM MODAL ────────────────────────────────────────────── */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl p-10 flex flex-col text-black max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8 border-b-[3px] border-black pb-4 text-left">
              <h2 className="text-2xl font-black uppercase tracking-widest font-mono text-black">
                {MODAL_TITLES[activeTab]}
              </h2>
              <button
                onClick={() => setIsAddItemOpen(false)}
                className="text-black hover:text-[#FA5D19] transition-colors focus:outline-none"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-8">

              {/* ── PRODUCTS FORM ─────────────────────────────────────────── */}
              {activeTab === 'PRODUCTS' && (
                <>
                  {/* Row 1: ITEM CODE & MODEL NAME */}
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>ITEM CODE</label>
                      <input type="text" placeholder="SE-MELT-008" className={INPUT_CLS} />
                    </div>
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>MODEL NAME</label>
                      <input type="text" placeholder="E.G. SKELNER MELTING FURNACE" className={INPUT_CLS} />
                    </div>
                  </div>

                  {/* Row 2: BASE PRICE & CATEGORY */}
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>BASE PRICE (₹)</label>
                      <input type="number" placeholder="E.G. 1500000" className={INPUT_CLS} />
                    </div>
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>CATEGORY</label>
                      <SelectWrapper>
                        <select className={SELECT_CLS}>
                          <option value="Melting Furnaces">Melting Furnaces</option>
                          <option value="Annealing">Annealing</option>
                          <option value="Batch Processing">Batch Processing</option>
                          <option value="Laboratory">Laboratory</option>
                        </select>
                      </SelectWrapper>
                    </div>
                  </div>

                  {/* Row 3: Spec Sheet Dropzone */}
                  <div className="flex flex-col text-left">
                    <label className={LABEL_CLS}>SPEC SHEET</label>
                    <div className="w-full h-32 border-2 border-dashed border-black bg-zinc-50 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors">
                      <span className="material-symbols-outlined text-[#FA5D19] text-3xl mb-2">upload_file</span>
                      <span className="font-mono text-xs font-bold tracking-widest text-black uppercase">
                        DRAG PDF SPEC SHEET HERE OR BROWSE
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* ── RAW MATERIALS FORM ────────────────────────────────────── */}
              {activeTab === 'RAW_MATERIALS' && (
                <>
                  {/* Row 1: MATERIAL CODE & DESCRIPTION */}
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>MATERIAL CODE</label>
                      <input type="text" placeholder="MAT-001" className={INPUT_CLS} />
                    </div>
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>DESCRIPTION</label>
                      <input type="text" placeholder="E.G. 10MM MILD STEEL" className={INPUT_CLS} />
                    </div>
                  </div>

                  {/* Row 2: PRIMARY SUPPLIER & UNIT OF MEASUREMENT */}
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>PRIMARY SUPPLIER</label>
                      <SelectWrapper>
                        <select className={SELECT_CLS}>
                          <option value="Tata Steel">Tata Steel</option>
                          <option value="SAIL">SAIL</option>
                          <option value="JSW Steel">JSW Steel</option>
                          <option value="Essar Steel">Essar Steel</option>
                          <option value="Other">Other</option>
                        </select>
                      </SelectWrapper>
                    </div>
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>UNIT OF MEASUREMENT</label>
                      <SelectWrapper>
                        <select className={SELECT_CLS}>
                          <option value="Tons">Tons</option>
                          <option value="Kg">Kg</option>
                          <option value="Liters">Liters</option>
                          <option value="Units">Units</option>
                        </select>
                      </SelectWrapper>
                    </div>
                  </div>

                  {/* Row 3: INITIAL STOCK LEVEL & LOW STOCK THRESHOLD */}
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>INITIAL STOCK LEVEL</label>
                      <input type="number" placeholder="E.G. 500" className={INPUT_CLS} />
                    </div>
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>LOW STOCK THRESHOLD</label>
                      <input type="number" placeholder="E.G. 50" className={INPUT_CLS} />
                    </div>
                  </div>
                </>
              )}

              {/* ── SUPPLIERS FORM ────────────────────────────────────────── */}
              {activeTab === 'SUPPLIERS' && (
                <>
                  {/* Row 1: SUPPLIER ID & COMPANY NAME */}
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>SUPPLIER ID</label>
                      <input type="text" placeholder="SUP-001" className={INPUT_CLS} />
                    </div>
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>COMPANY NAME</label>
                      <input type="text" placeholder="E.G. TATA STEEL LTD." className={INPUT_CLS} />
                    </div>
                  </div>

                  {/* Row 2: CONTACT PERSON & EMAIL */}
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>CONTACT PERSON</label>
                      <input type="text" placeholder="E.G. RAJESH KUMAR" className={INPUT_CLS} />
                    </div>
                    <div className="flex flex-col">
                      <label className={LABEL_CLS}>EMAIL</label>
                      <input type="email" placeholder="E.G. RAJESH@TATASTEEL.COM" className={INPUT_CLS} />
                    </div>
                  </div>

                  {/* Row 3: PHONE (full-width) */}
                  <div className="text-left">
                    <label className={LABEL_CLS}>PHONE</label>
                    <input type="tel" placeholder="E.G. +91 98765 43210" className={INPUT_CLS} />
                  </div>
                </>
              )}

              {/* Actions — shared across all tabs */}
              <div className="flex justify-end items-center gap-6 mt-4 pt-4 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="text-sm font-mono font-bold tracking-widest uppercase hover:text-[#FA5D19] transition-colors py-2 px-4 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-[#FA5D19] text-black border-[3px] border-black font-mono text-sm font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer focus:outline-none"
                >
                  SAVE TO CATALOG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PRODUCT EDITOR MODAL ────────────────────────────────────── */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

    </>
  );
}