import { useState, useEffect } from 'react';

export default function ProductModal({ isOpen, onClose, product, onSave }) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    material: '',
    fuel: '',
    operation: '',
    temp_text: '',
    max_temp_val: '',
    description: '',
    short_description: '',
    is_active: true,
    specific_max_temp: '',
    heating_element: '',
    thermocouple: '',
    electrical_phase: '',
    insulation: '',
    dimensions: '',
    precision_control: '',
    structural_integrity: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        category: product.category || '',
        material: product.material || '',
        fuel: product.fuel || '',
        operation: product.operation || '',
        temp_text: product.temp_text || '',
        max_temp_val: product.max_temp_val || '',
        description: product.description || '',
        short_description: product.short_description || '',
        is_active: product.is_active !== false,
        specific_max_temp: product.specs?.specific_max_temp || '',
        heating_element: product.specs?.heating_element || '',
        thermocouple: product.specs?.thermocouple || '',
        electrical_phase: product.specs?.electrical_phase || '',
        insulation: product.specs?.insulation || '',
        dimensions: product.specs?.dimensions || '',
        precision_control: product.specs?.precision_control || '',
        structural_integrity: product.specs?.structural_integrity || ''
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        category: '',
        material: '',
        fuel: '',
        operation: '',
        temp_text: '',
        max_temp_val: '',
        description: '',
        short_description: '',
        is_active: true,
        specific_max_temp: '',
        heating_element: '',
        thermocouple: '',
        electrical_phase: '',
        insulation: '',
        dimensions: '',
        precision_control: '',
        structural_integrity: ''
      });
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct payload strictly matching the backend schema
    const payload = {
      sku: formData.sku,
      product_id: formData.sku, // Mirror SKU as product_id
      name: formData.name,
      category: formData.category,
      material: formData.material,
      fuel: formData.fuel,
      operation: formData.operation,
      temp_text: formData.temp_text,
      max_temp_val: formData.max_temp_val ? parseFloat(formData.max_temp_val) : null,
      description: formData.description,
      short_description: formData.short_description,
      is_active: formData.is_active,
      specs: {
        specific_max_temp: formData.specific_max_temp,
        heating_element: formData.heating_element,
        thermocouple: formData.thermocouple,
        electrical_phase: formData.electrical_phase,
        insulation: formData.insulation,
        dimensions: formData.dimensions,
        precision_control: formData.precision_control,
        structural_integrity: formData.structural_integrity
      }
    };

    onSave(payload);
  };

  const inputClass = "w-full px-4 py-3 border-2 border-black bg-white rounded-none focus:outline-none focus:border-[#FA5D19] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-sm uppercase tracking-wider transition-all placeholder:text-zinc-400";
  const labelClass = "block text-xs font-mono font-bold tracking-widest text-black uppercase mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-5xl flex flex-col text-black max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-[3px] border-black shrink-0 bg-white">
          <h2 className="text-2xl font-black uppercase tracking-widest font-mono text-black">
            {product ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-black hover:text-[#FA5D19] transition-colors focus:outline-none"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto p-8 bg-[#F2F0E9] flex-1">
          <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-10">
            
            {/* Core Data Section */}
            <div>
              <h3 className="font-mono text-lg font-black uppercase mb-6 border-b-[3px] border-black pb-2 text-[#FA5D19]">CORE SPECIFICATIONS</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className={labelClass}>SKU / ID</label>
                  <input required type="text" name="sku" value={formData.sku} onChange={handleChange} className={inputClass} placeholder="SE-MELT-001" />
                </div>
                <div>
                  <label className={labelClass}>MODEL NAME</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="Ferrous Melting Furnace" />
                </div>
                <div>
                  <label className={labelClass}>CATEGORY</label>
                  <input required type="text" name="category" value={formData.category} onChange={handleChange} className={inputClass} placeholder="Heavy-Duty Melting Furnaces" />
                </div>
                <div>
                  <label className={labelClass}>MATERIAL</label>
                  <input type="text" name="material" value={formData.material} onChange={handleChange} className={inputClass} placeholder="Ferrous / Steel" />
                </div>
                <div>
                  <label className={labelClass}>FUEL TYPE</label>
                  <input type="text" name="fuel" value={formData.fuel} onChange={handleChange} className={inputClass} placeholder="Electric; Gas" />
                </div>
                <div>
                  <label className={labelClass}>OPERATION TYPE</label>
                  <input type="text" name="operation" value={formData.operation} onChange={handleChange} className={inputClass} placeholder="Batch / Continuous" />
                </div>
                <div>
                  <label className={labelClass}>TEMP RANGE (TEXT)</label>
                  <input type="text" name="temp_text" value={formData.temp_text} onChange={handleChange} className={inputClass} placeholder="1000°C - 1500°C" />
                </div>
                <div>
                  <label className={labelClass}>MAX TEMP (NUMERIC °C)</label>
                  <input type="number" step="0.1" name="max_temp_val" value={formData.max_temp_val} onChange={handleChange} className={inputClass} placeholder="1500" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>SHORT DESCRIPTION</label>
                  <textarea rows="2" name="short_description" value={formData.short_description} onChange={handleChange} className={inputClass} placeholder="A brief summary of the furnace capabilities..."></textarea>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>FULL DESCRIPTION</label>
                  <textarea rows="4" name="description" value={formData.description} onChange={handleChange} className={inputClass} placeholder="Engineered for high-yield metallurgy, delivering rapid melting..."></textarea>
                </div>
                <div className="col-span-2 flex items-center mt-2">
                  <label className="flex items-center cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="is_active" 
                      checked={formData.is_active} 
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} 
                      className="hidden" 
                    />
                    <div className={`w-8 h-8 border-[3px] border-black flex items-center justify-center transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${formData.is_active ? 'bg-[#FA5D19]' : 'bg-white'}`}>
                      {formData.is_active && (
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7"></path></svg>
                      )}
                    </div>
                    <span className="ml-4 font-mono font-bold tracking-widest text-black uppercase text-sm">
                      {formData.is_active ? 'DISPLAY IN PUBLIC CATALOG' : 'HIDDEN FROM PUBLIC CATALOG'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Technical Specs Section */}
            <div>
              <h3 className="font-mono text-lg font-black uppercase mb-6 border-b-[3px] border-black pb-2 text-[#FA5D19]">TECHNICAL SPECS</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className={labelClass}>SPECIFIC MAX TEMP</label>
                  <input type="text" name="specific_max_temp" value={formData.specific_max_temp} onChange={handleChange} className={inputClass} placeholder="Up to 1650°C" />
                </div>
                <div>
                  <label className={labelClass}>HEATING ELEMENT</label>
                  <input type="text" name="heating_element" value={formData.heating_element} onChange={handleChange} className={inputClass} placeholder="Induction / Gas" />
                </div>
                <div>
                  <label className={labelClass}>THERMOCOUPLE</label>
                  <input type="text" name="thermocouple" value={formData.thermocouple} onChange={handleChange} className={inputClass} placeholder="Pt-Rh (R/S Type)" />
                </div>
                <div>
                  <label className={labelClass}>ELECTRICAL PHASE</label>
                  <input type="text" name="electrical_phase" value={formData.electrical_phase} onChange={handleChange} className={inputClass} placeholder="3-Phase 415V 50Hz" />
                </div>
                <div>
                  <label className={labelClass}>INSULATION</label>
                  <input type="text" name="insulation" value={formData.insulation} onChange={handleChange} className={inputClass} placeholder="High-Alumina Refractory" />
                </div>
                <div>
                  <label className={labelClass}>DIMENSIONS</label>
                  <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} className={inputClass} placeholder="Custom Engineered" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>PRECISION CONTROL</label>
                  <textarea rows="2" name="precision_control" value={formData.precision_control} onChange={handleChange} className={inputClass} placeholder="Microprocessor-based PID..."></textarea>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>STRUCTURAL INTEGRITY</label>
                  <textarea rows="2" name="structural_integrity" value={formData.structural_integrity} onChange={handleChange} className={inputClass} placeholder="Heavy-gauge MS structural shell..."></textarea>
                </div>
              </div>
            </div>
            
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-[3px] border-black shrink-0 flex justify-end items-center gap-6 bg-white">
          <button 
            type="button" 
            onClick={onClose} 
            className="text-sm font-mono font-bold tracking-widest uppercase hover:text-[#FA5D19] transition-colors py-2 px-4 focus:outline-none"
          >
            CANCEL
          </button>
          <button 
            type="submit" 
            form="product-form"
            className="px-8 py-4 bg-[#FA5D19] text-white border-[3px] border-black font-mono text-sm font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer focus:outline-none"
          >
            SAVE PRODUCT
          </button>
        </div>

      </div>
    </div>
  );
}
