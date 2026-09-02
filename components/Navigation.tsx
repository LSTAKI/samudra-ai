'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Search } from 'lucide-react';
import { useOrcaStore } from '@/stores/useOrcaStore';

const navItems = [
  { name: 'Research Console', href: '/research' },
  { name: 'Ocean Explorer', href: '/research/ocean' },
  { name: 'Satellites', href: '/research/satellites' },
  { name: 'PFZ', href: '/research/pfz' },
  { name: 'Analytics', href: '/research/analytics' },
  { name: 'Command Center', href: '/research/command' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { toggleStatusDrawer } = useOrcaStore();

  return (
    <header className="h-16 bg-ocean-navy border-b border-[#1b3459] text-white flex items-center justify-between px-6 z-50 select-none">
      {/* Left: Brand */}
      <div className="flex items-center space-x-3">
        <Link href="/" className="flex flex-col items-start leading-none group">
          <span className="text-xl font-bold tracking-wider text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-orca-blue rounded-full animate-pulse inline-block"></span>
            ORCA
          </span>
          <span className="text-[10px] text-muted-orca font-mono tracking-widest mt-0.5 uppercase">
            Ocean Intelligence
          </span>
        </Link>
      </div>

      {/* Center: Scientific Nav items */}
      <nav className="hidden xl:flex items-center space-x-1 h-full">
        {navItems.map((item) => {
          // Determine if active
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && !navItems.some(other => other.href !== '/research' && other.href !== item.href && pathname.startsWith(other.href)));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 h-full flex items-center text-sm font-medium transition-colors border-b-2 font-mono ${
                isActive
                  ? 'border-orca-blue text-white bg-[#0f2a4f]'
                  : 'border-transparent text-muted-orca hover:text-white hover:bg-[#0d2547]'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search coordinates, buoys, vessels..."
            className="w-64 bg-[#0a1b33] border border-[#1b3459] rounded-md py-1.5 pl-8 pr-3 text-xs text-white placeholder-secondary-text focus:outline-none focus:border-orca-blue focus:ring-1 focus:ring-orca-blue font-mono transition-all"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-secondary-text" />
        </div>

        {/* Status indicator */}
        <button
          onClick={toggleStatusDrawer}
          className="flex items-center space-x-2 bg-[#0d2547] border border-[#1b3459] hover:bg-[#12315b] hover:border-orca-blue px-3 py-1.5 rounded-md text-xs font-mono transition-all active:scale-95 cursor-pointer"
          title="Open System Status"
        >
          <Activity className="w-3.5 h-3.5 text-success-orca" />
          <span className="text-white hidden lg:inline">SYSTEM STATUS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-success-orca inline-block"></span>
        </button>
      </div>
    </header>
  );
}
