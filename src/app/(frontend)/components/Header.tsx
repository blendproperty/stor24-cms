"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);

  const nav = [
    { label: "Storage Near Me", href: "/storage-near-me" },
    { label: "Locations", href: "/locations" },
    { label: "Sizes", href: "/storage-unit-sizes" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-xl tracking-tight">
          Stor<span className="text-orange-500">24</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-gray-400 hover:text-white text-sm transition">
              {item.label}
            </Link>
          ))}
        </nav>

        <a href="/#quote" className="hidden md:block bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">
          Get a Quote
        </a>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white focus:outline-none">
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-gray-900 px-6 pb-6 flex flex-col gap-4">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="text-gray-300 hover:text-white text-sm py-2 border-b border-gray-800">
              {item.label}
            </Link>
          ))}
          <a href="/#quote" className="bg-orange-500 text-white text-sm font-semibold px-5 py-3 rounded-lg text-center mt-2">
            Get a Quote
          </a>
        </div>
      )}
    </header>
  );
}
