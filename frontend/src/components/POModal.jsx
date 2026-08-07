import React, { useState } from 'react';

export default function POModal({ po, onClose, onUpdate }) {
  const [vendorName, setVendorName] = useState(po?.vendor_name || '');
  const [itemsRequested, setItemsRequested] = useState(po?.items_requested ? po.items_requested.join(', ') : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!po?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const itemsArray = itemsRequested.split(',').map(i => i.trim()).filter(Boolean);
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:8000/api/purchase_orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vendor_name: vendorName, items_requested: itemsArray }),
      });
      
      if (!res.ok) throw new Error('Failed to create PO');
      
      const data = await res.json();
      if (onUpdate) {
        onUpdate({ 
          id: data.id, 
          vendor_name: vendorName, 
          items_requested: itemsArray, 
          status: 'Draft',
          created_at: new Date().toISOString(),
          type: 'PO'
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error creating PO');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!po && !isEdit && !onUpdate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-zinc-200 border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl p-8 flex flex-col text-black relative">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <h2 className="text-xl font-black uppercase tracking-widest font-mono text-black">
            {isEdit ? `PURCHASE ORDER // ${po.id}` : 'CREATE PURCHASE ORDER'}
          </h2>
          <button onClick={onClose} className="hover:text-[#FA5D19] transition-colors focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content */}
        {isEdit ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs font-bold text-gray-500 uppercase">Vendor Name</span>
              <span className="font-sans text-xl font-black uppercase text-black">{po.vendor_name}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs font-bold text-gray-500 uppercase">Status</span>
              <span className="font-sans text-lg font-bold uppercase text-black">{po.status}</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs font-bold text-gray-500 uppercase">Items Requested</span>
              <div className="flex flex-wrap gap-2">
                {(po.items_requested || []).map((item, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white border border-black text-sm font-mono font-bold text-black uppercase">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label className="font-mono text-xs font-bold text-gray-500 uppercase mb-2">Vendor Name</label>
              <input 
                type="text" 
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="E.G. ACME STEEL CORP"
                className="p-4 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-sm uppercase transition-all"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="font-mono text-xs font-bold text-gray-500 uppercase mb-2">Items Requested (Comma Separated)</label>
              <textarea 
                required
                rows={3}
                value={itemsRequested}
                onChange={(e) => setItemsRequested(e.target.value)}
                placeholder="E.G. 10x STEEL PLATES, 5x REFRACTORY BRICKS"
                className="p-4 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-sm uppercase transition-all"
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-3 bg-black text-white border-2 border-black font-mono text-sm font-bold tracking-widest uppercase transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {isSubmitting ? 'CREATING...' : 'CREATE PO'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
