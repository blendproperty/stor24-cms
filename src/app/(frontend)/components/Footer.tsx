import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 px-6 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <p className="text-white font-bold text-xl mb-4">
            Stor<span className="text-orange-500">24</span>
          </p>
          <p className="text-sm">Secure personal and business storage in Johannesburg. Fast quotes, flexible options.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-4">Storage Types</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/storage-near-me" className="hover:text-white transition">Storage Near Me</Link></li>
            <li><Link href="/personal-storage" className="hover:text-white transition">Personal Storage</Link></li>
            <li><Link href="/business-storage" className="hover:text-white transition">Business Storage</Link></li>
            <li><Link href="/student-storage" className="hover:text-white transition">Student Storage</Link></li>
            <li><Link href="/moving-storage" className="hover:text-white transition">Moving Storage</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-4">Areas</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/locations/sandton" className="hover:text-white transition">Sandton</Link></li>
            <li><Link href="/locations/randburg" className="hover:text-white transition">Randburg</Link></li>
            <li><Link href="/locations/midrand" className="hover:text-white transition">Midrand</Link></li>
            <li><Link href="/locations/fourways" className="hover:text-white transition">Fourways</Link></li>
            <li><Link href="/locations" className="hover:text-white transition">All Areas</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-4">Company</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/storage-unit-sizes" className="hover:text-white transition">Size Guide</Link></li>
            <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
            <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-800 text-sm text-center">
        © {new Date().getFullYear()} Stor24. All rights reserved.
      </div>
    </footer>
  );
}
