const useCases = [
  {
    title: "Stock Overflow",
    desc: "Running out of warehouse or office space. Store excess inventory securely and access it when you need it.",
  },
  {
    title: "Document Storage",
    desc: "Compliance documents, contracts, and records that need to be kept but do not need to be on site.",
  },
  {
    title: "Equipment Storage",
    desc: "Tools, machinery, IT equipment, or seasonal assets that are not in daily use.",
  },
  {
    title: "Office Relocation",
    desc: "Moving offices and need somewhere to store furniture and equipment during the transition.",
  },
  {
    title: "Seasonal Stock",
    desc: "Retail or product businesses that need flexible space for peak season inventory.",
  },
  {
    title: "Commercial Overflow",
    desc: "Expanding faster than your current premises allow. Use storage as a flexible extension of your business.",
  },
];

export default function BusinessStorage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Business Storage</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Business Storage in Johannesburg for Stock, Documents and Equipment
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl">
            Flexible, secure business storage for Johannesburg companies. No long contracts, fast setup, and units sized for everything from document boxes to commercial overflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg text-center transition">
              Get a Business Storage Quote
            </a>
            <a href="https://wa.me/27000000000" className="border border-white hover:bg-white hover:text-gray-950 text-white font-semibold px-8 py-4 rounded-lg text-center transition">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Common Uses</p>
          <h2 className="text-4xl font-bold mb-12">How businesses use our storage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {useCases.map((item) => (
              <div key={item.title} className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why business */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Why Stor24 for Business</p>
          <h2 className="text-4xl font-bold mb-12">Built for business needs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: "Flexible Terms", desc: "Month to month contracts. Scale up or down as your business needs change." },
              { title: "Secure Access", desc: "24 hour access control and CCTV. Your stock and documents are protected." },
              { title: "Multiple Unit Sizes", desc: "From small document storage to large commercial units. We have the right size." },
              { title: "Fast Setup", desc: "Get a quote, confirm availability, and move in quickly. No lengthy onboarding." },
            ].map((item) => (
              <div key={item.title} className="border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Need business storage in Johannesburg?</h2>
          <p className="text-gray-400 mb-8">Get a fast quote tailored to your business requirements.</p>
          <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition inline-block">
            Get a Business Quote
          </a>
        </div>
      </section>
    </main>
  );
}
