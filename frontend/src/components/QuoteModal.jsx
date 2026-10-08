import { useState, useEffect } from 'react';
import { products } from '../data/products';
import { apiFetch } from '../api/client';

export default function QuoteModal(props) {
  if (!props.inquiry) return null;
  // Keyed by quote id so the form state resets whenever a different quote is opened.
  return <QuoteModalContent key={props.inquiry.id} {...props} />;
}

function QuoteModalContent({ inquiry, onClose, onUpdate }) {
  const selectedItems = (inquiry.requested_assets || []).map(assetId => 
    products.find(p => p.id === assetId || p.sku === assetId)
  ).filter(Boolean);

  // Compute a mock sum of base prices
  const totalBasePrice = selectedItems.reduce((sum, item) => {
    const basePriceVal = item.maxTempVal ? (item.maxTempVal * 1250) : 850000;
    return sum + basePriceVal;
  }, 0);

  const [basePrice, setBasePrice] = useState(inquiry.base_price || (totalBasePrice > 0 ? `₹ ${totalBasePrice.toLocaleString('en-IN')}` : "₹ 4,500,000"));
  const [leadTime, setLeadTime] = useState(inquiry.lead_time || "4-6 Weeks");
  const [paymentTerms, setPaymentTerms] = useState(inquiry.payment_terms || "50% Advance, 50% Against Proforma");
  const [notes, setNotes] = useState(inquiry.notes || "");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (inquiry) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [inquiry]);

  useEffect(() => {
    if (!inquiry || !inquiry.id) return;
    let cancelled = false;
    
    const fetchDraft = async () => {
      try {
        const data = await apiFetch(`/api/quotes/${inquiry.id}`);
        
        if (!cancelled) {
          if (data.base_price) setBasePrice(data.base_price);
          if (data.lead_time) setLeadTime(data.lead_time);
          if (data.payment_terms) setPaymentTerms(data.payment_terms);
          if (data.notes) setNotes(data.notes);
        }
      } catch (err) {
        console.warn("[QuoteModal] Could not fetch draft", err);
      }
    };
    
    fetchDraft();
    return () => { cancelled = true; };
  }, [inquiry]);

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      await apiFetch(`/api/quotes/${inquiry.id}/draft`, {
        method: "PATCH",
        body: JSON.stringify({
          base_price: basePrice,
          lead_time: leadTime,
          payment_terms: paymentTerms,
          notes: notes
        })
      });

      setIsSaving(false);
      setIsSaved(true);
      
      if (onUpdate) {
        onUpdate(inquiry.id, {
          base_price: basePrice,
          lead_time: leadTime,
          payment_terms: paymentTerms,
          notes: notes
        });
      }

      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to save draft");
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      const res = await apiFetch(`/api/quotes/${inquiry.id}/generate-pdf`, {
        method: "POST",
        body: JSON.stringify({
          base_price: basePrice,
          lead_time: leadTime,
          payment_terms: paymentTerms,
          notes: notes
        }),
        rawResponse: true
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `Savitha_Quote.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]">
      
      {/* Sliding Panel */}
      <div className="w-[500px] h-full bg-[#FAF9F6] border-l-[3px] border-black flex flex-col shadow-2xl font-sans animate-slide-in-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-[3px] border-black bg-white">
          <h2 className="text-[13px] font-bold tracking-widest uppercase text-black">
            Drafting Quote: {inquiry.id} // {inquiry.company}
          </h2>
          <button onClick={onClose} className="text-2xl font-bold hover:text-[#FA5D19] transition-colors leading-none bg-transparent border-none cursor-pointer">
            &times;
          </button>
        </div>

        {/* Customer contact details */}
        {(inquiry.full_name || inquiry.email || inquiry.phone) && (
          <div className="px-6 py-3 border-b-[3px] border-black bg-[#F2F0E9] font-mono text-xs space-y-1 text-black">
            {inquiry.full_name && (
              <div><span className="font-bold text-gray-500">CONTACT </span>{inquiry.full_name}</div>
            )}
            {inquiry.email && (
              <div><span className="font-bold text-gray-500">EMAIL </span><a className="underline text-[#FA5D19]" href={`mailto:${inquiry.email}`}>{inquiry.email}</a></div>
            )}
            {inquiry.phone && (
              <div><span className="font-bold text-gray-500">PHONE </span><a className="underline text-[#FA5D19]" href={`tel:${inquiry.phone}`}>{inquiry.phone}</a></div>
            )}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Inquiry Summary */}
          <div className="bg-[#F3F4F6] p-5 border-l-[4px] border-gray-400 text-left">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Inquiry Summary</p>
            <p className="font-bold text-black text-sm mb-1">Category: {inquiry.category}</p>
            {inquiry.is_custom_request && (
              <div className="mt-3 p-3 bg-yellow-100 border border-yellow-400">
                <p className="text-[10px] font-bold uppercase text-yellow-800 mb-1">Custom Request Details</p>
                <p className="text-xs text-black mb-2 whitespace-pre-wrap">{inquiry.custom_details}</p>
                {inquiry.equipment_serial_number && (
                  <p className="text-xs font-mono font-bold text-black border-t border-yellow-400 pt-2">S/N: {inquiry.equipment_serial_number}</p>
                )}
              </div>
            )}
            {selectedItems.length > 0 ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-bold text-gray-600 uppercase">Selected Items:</p>
                <div className="flex flex-col gap-1.5">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="text-xs font-mono bg-white border border-black/10 p-2">
                      <span className="font-bold">{item.sku}</span> - {item.title}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              !inquiry.is_custom_request && (
                <p className="text-sm italic text-gray-700 leading-relaxed mt-2">
                  Details: {inquiry.details}
                </p>
              )
            )}
          </div>

          <h3 className="text-[11px] font-bold uppercase tracking-widest text-black border-b-[2px] border-gray-200 pb-2 text-left">
            Commercial Terms
          </h3>

          {/* Form Group: Base Price */}
          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Base Price (INR)</label>
            <input 
              type="text" 
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="p-3 border-[2px] border-black bg-white focus:outline-none focus:border-[#FA5D19] font-mono text-sm transition-colors" 
            />
          </div>

          {/* Form Group: Lead Time */}
          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Estimated Lead Time</label>
            <input 
              type="text" 
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
              className="p-3 border-[2px] border-black bg-white focus:outline-none focus:border-[#FA5D19] font-mono text-sm transition-colors" 
            />
          </div>

          {/* Form Group: Payment Terms */}
          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Payment Terms</label>
            <input 
              type="text" 
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="p-3 border-[2px] border-black bg-white focus:outline-none focus:border-[#FA5D19] font-mono text-sm transition-colors" 
            />
          </div>

          {/* Form Group: Notes */}
          <div className="flex flex-col space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Additional Notes/Exclusions</label>
            <textarea 
              rows="4" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter technical caveats or exclusions..." 
              className="p-3 border-[2px] border-black bg-white focus:outline-none focus:border-[#FA5D19] text-sm resize-none transition-colors"
            ></textarea>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t-[3px] border-black bg-white flex justify-between items-center space-x-4 flex-shrink-0">
          <button 
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-6 py-4 text-xs font-bold tracking-widest uppercase hover:text-[#FA5D19] transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "SAVING..." : isSaved ? "SAVED!" : "Save Draft"}
          </button>
          <button 
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex-1 px-4 py-4 bg-[#FA5D19] border-[2px] border-black text-black text-xs font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[4px] active:translate-x-[4px] active:shadow-none cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? "GENERATING..." : "GENERATE & DOWNLOAD PDF"}
          </button>
        </div>

      </div>
    </div>
  );
}