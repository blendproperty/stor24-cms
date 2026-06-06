const reasons = [
  {
    title: "Holiday Storage",
    desc: "Going home for the holidays and cannot take everything with you. Store your belongings safely and collect when you return.",
  },
  {
    title: "Between Residences",
    desc: "Moving out of res or a flat and need somewhere to keep your stuff while you sort out the next place.",
  },
  {
    title: "Year End Clearout",
    desc: "End of year and need to vacate your room. Store everything and collect at the start of the next semester.",
  },
  {
    title: "Semester Abroad",
    desc: "Heading overseas for a semester or exchange programme. Keep your belongings safe while you are away.",
  },
];

export default function StudentStorage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Student Storage</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Student Storage in Johannesburg. Short Term, No Hassle.
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl">
            Flexible short term storage for students in Johannesburg. Store your belongings between semesters, during holidays, or while you move between residences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg text-center transition">
              Get a Student Storage Quote
            </a>
            <a href="https://wa.me/27000000000" className="border border-white hover:bg-white hover:text-gray-950 text-white font-semibold px-8 py-4 rounded-lg text-center transition">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Reasons */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">When Students Use Storage</p>
          <h2 className="text-4xl font-bold mb-12">Common student storage situations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reasons.map((item) => (
              <div key={item.title} className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What students store */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">What You Can Store</p>
          <h2 className="text-4xl font-bold mb-8">Typical student storage items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {["Boxes", "Clothing", "Books", "Laptop and electronics", "Mini fridge", "Bedding", "Bicycle", "Sports gear", "Kitchen items", "Luggage", "Desk and chair", "Shelving"].map((item) => (
              <div key={item} className="bg-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 text-center">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Stor24 */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Why Stor24</p>
          <h2 className="text-4xl font-bold mb-12">Built for student needs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "Short Term Options", desc: "No long contracts. Store for a month, a semester, or longer." },
              { title: "Affordable Units", desc: "Small units start from R500 per month. Right sized for student belongings." },
              { title: "Fast and Simple", desc: "Get a quote on WhatsApp and move in quickly. No complicated paperwork." },
            ].map((item) => (
              <div key={item.title} className="border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Need student storage in Johannesburg?</h2>
          <p className="text-gray-400 mb-8">Get a quick quote. We will sort the rest.</p>
          <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition inline-block">
            Get a Quote
          </a>
        </div>
      </section>
    </main>
  );
}
