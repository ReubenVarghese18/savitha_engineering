import AdminFooter from '../../components/AdminFooter';

export default function Service() {
  return (
    <>
      



<div className="flex-1 overflow-y-auto space-y-12 bg-[#F2F0E9] pb-margin-md md:pb-margin-lg px-margin-lg" style={{"backgroundColor":"rgb(248, 247, 242)"}}>
<section className="pt-6 px-0">
<div className="flex justify-between items-end pb-6">
<div className="space-y-2">
<h2 className="font-headline-lg text-[48px] md:text-[64px] leading-none font-black uppercase tracking-tight text-zinc-950">SERVICE &amp; WARRANTY</h2>
<div className="flex items-center gap-3 mt-1 mb-6">
  {/* Decorative Orange Line */}
  <span className="w-12 h-[3px] bg-[#FA5D19]"></span>
  
  {/* Monospace Subtitle */}
  <span className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.2em] text-gray-600 uppercase">
    SYS.ADMIN // SERVICE
  </span>
</div>
</div>
<div className="flex items-center gap-6">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">search</span>
<input className="bg-white border-2 border-black py-2.5 pl-10 pr-4 font-label-caps text-xs focus:ring-0 w-[320px] uppercase tracking-wider placeholder:text-zinc-400" placeholder="Search Machine IDs or Clients..." type="text" />
</div>
<button className="bg-molten-amber text-zinc-950 font-label-caps text-xs font-bold py-2.5 px-6 uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all whitespace-nowrap flex-shrink-0">
        Log Service Ticket
      </button>
</div>
</div>
</section>

<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
<p className="font-label-caps text-[10px] uppercase text-zinc-950/60 mb-2">Active Repair Tickets</p>
<p className="font-display-lg text-[40px] font-black text-zinc-950">03</p>
</div>
<div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
<p className="font-label-caps text-[10px] uppercase text-zinc-950/60 mb-2">Warranties Expiring (30 Days)</p>
<p className="font-display-lg text-[40px] font-black text-zinc-950">08</p>
</div>
<div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
<p className="font-label-caps text-[10px] uppercase text-zinc-950/60 mb-2">Scheduled Maintenance</p>
<p className="font-display-lg text-[40px] font-black text-zinc-950">12</p>
</div>
</section>

<div className="flex gap-1">
<button className="px-8 py-3 bg-zinc-950 text-white font-label-caps text-xs font-bold uppercase border-2 border-black">Active Tickets</button>
<button className="px-8 py-3 bg-white text-zinc-950 font-label-caps text-xs font-bold uppercase border-2 border-black hover:bg-zinc-100 transition-colors">Equipment in Field</button>
</div>

<section className="pb-12">
<div className="overflow-x-auto border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
<table className="w-full text-left">
<thead>
<tr className="bg-zinc-950 text-white font-label-caps text-[10px] uppercase">
<th className="p-4">TICKET ID</th>
<th className="p-4">CLIENT &amp; LOCATION</th>
<th className="p-4">MACHINE LOG</th>
<th className="p-4">REPORTED ISSUE</th>
<th className="p-4">FILED DATE</th>
<th className="p-4 text-center">WARRANTY STATUS</th>
<th className="p-4 text-center">ACTIONS</th>
</tr>
</thead>
<tbody className="font-label-caps text-[11px] font-medium divide-y-2 divide-black/10">
<tr className="hover:bg-zinc-50">
<td className="p-4 font-black">TK-5501</td>
<td className="p-4">
<div className="font-bold uppercase">Wayne Enterprises</div>
<div className="opacity-60 text-[9px]">Gotham Plant // B3-Sector</div>
</td>
<td className="p-4">
<div className="font-black">SN-99824</div>
<div className="opacity-60 text-[9px] uppercase">P-200 Arc Welder</div>
</td>
<td className="p-4">Hydraulic actuator pressure loss in main arm.</td>
<td className="p-4">2026-05-28</td>
<td className="p-4 text-center">
<span className="py-1 bg-green-100 text-green-800 text-[9px] font-black border border-green-800 whitespace-nowrap px-3">UNDER WARRANTY</span>
</td>
<td className="p-4 text-center">
<button className="px-3 py-1 bg-zinc-100 border-2 border-black font-black uppercase text-[10px] hover:bg-molten-amber transition-colors">Update Ticket</button>
</td>
</tr>
<tr className="hover:bg-zinc-50">
<td className="p-4 font-black">TK-5502</td>
<td className="p-4">
<div className="font-bold uppercase">Stark Industries</div>
<div className="opacity-60 text-[9px]">Malibu Lab // Site A</div>
</td>
<td className="p-4">
<div className="font-black">SN-44120</div>
<div className="opacity-60 text-[9px] uppercase">Laser Cutter MK-III</div>
</td>
<td className="p-4">Calibration drift exceeding 0.05mm tolerance.</td>
<td className="p-4">2026-06-01</td>
<td className="p-4 text-center">
<span className="px-2 py-1 bg-red-100 text-red-800 text-[9px] font-black border border-red-800">EXPIRED</span>
</td>
<td className="p-4 text-center">
<button className="px-3 py-1 bg-zinc-100 border-2 border-black font-black uppercase text-[10px] hover:bg-molten-amber transition-colors">Update Ticket</button>
</td>
</tr>
<tr className="hover:bg-zinc-50">
<td className="p-4 font-black">TK-5503</td>
<td className="p-4">
<div className="font-bold uppercase">LexCorp</div>
<div className="opacity-60 text-[9px]">Metropolis Tower</div>
</td>
<td className="p-4">
<div className="font-black">SN-88219</div>
<div className="opacity-60 text-[9px] uppercase">Heavy Duty Press</div>
</td>
<td className="p-4">Coolant pump failure during high-load cycle.</td>
<td className="p-4">2026-06-03</td>
<td className="p-4 text-center">
<span className="py-1 bg-green-100 text-green-800 text-[9px] font-black border border-green-800 whitespace-nowrap px-3">UNDER WARRANTY</span>
</td>
<td className="p-4 text-center">
<button className="px-3 py-1 bg-zinc-100 border-2 border-black font-black uppercase text-[10px] hover:bg-molten-amber transition-colors">Update Ticket</button>
</td>
</tr>
</tbody>
</table>
</div>
</section></div>

<AdminFooter />

    </>
  );
}