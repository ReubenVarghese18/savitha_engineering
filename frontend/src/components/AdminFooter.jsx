import { useState, useEffect } from 'react';

export default function AdminFooter() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer
      className="h-8 px-margin-lg flex items-center justify-between shrink-0 overflow-hidden border-t-2 border-black"
      style={{ backgroundColor: 'rgb(242, 240, 233)' }}
    >
      <span className="font-mono text-[9px] uppercase text-zinc-950">SYS.ADMIN</span>
      <span className="font-mono text-[9px] uppercase text-zinc-950">{now.toLocaleString('en-GB')}</span>
    </footer>
  );
}
