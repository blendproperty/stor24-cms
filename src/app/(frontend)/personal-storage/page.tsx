const useCases = [
  {
    title: "Moving House",
    desc: "Between properties and need somewhere safe for your furniture, boxes, and appliances while you sort out the next place.",
  },
  {
    title: "Decluttering",
    desc: "Clearing out your home but not ready to sell or donate everything. Store it safely while you decide.",
  },
  {
    title: "Renovating",
    desc: "Protecting your furniture and belongings while building work or renovations are underway.",
  },
  {
    title: "Downsizing",
    desc: "Moving to a smaller home and need somewhere to keep the overflow without getting rid of everything.",
  },
  {
    title: "Student Storage",
    desc: "Going home for the holidays or moving between residences. Short term flexible storage for students.",
  },
  {
    title: "Long Term Storage",
    desc: "Need somewhere secure for items you do not use daily but are not ready to part with.",
  },
];

export default function PersonalStorage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Personal Storage</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Personal Storage in Johannesburg for Every Situation
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl">
            Whether you are moving, renovating, decluttering, or just need extra space, we have secure personal storage options with flexible terms and fast quotes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg text-center transition">
              Get a Storage Quote
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
          <h2 className="text-4xl font-bold mb-12">When do people use personal storage?</h2>
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

      {/* What you can store */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">What You Can Store</p>
          <h2 className="text-4xl font-bold mb-8">We store just about anything</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {["Furniture", "Appliances", "Boxes", "Clothing", "Books", "Bicycles", "Sports gear", "Tools", "Electronics", "Mattresses", "Garden equipment", "Artwork"].map((item) => (
              <div key={item} className="bg-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 text-center">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Get a fast quote for personal storage in your area. No obligation, no pressure.</p>
          <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition inline-block">
            Get a Quote
          </a>
        </div>
      </section>
    </main>
  );
}
