const scenarios = [
  {
    title: "Gap Between Properties",
    desc: "Sold your home but the new one is not ready yet. Store everything safely in between without rushing.",
  },
  {
    title: "Renovating Before Moving In",
    desc: "New place needs work before you move in. Store your furniture and belongings while the renovations are done.",
  },
  {
    title: "Downsizing",
    desc: "Moving to a smaller place and not everything will fit. Store the overflow while you decide what to keep.",
  },
  {
    title: "Relocating to Johannesburg",
    desc: "Moving to Joburg and need somewhere to store your belongings while you find the right place to settle.",
  },
  {
    title: "Temporary Accommodation",
    desc: "Staying with family or in short term accommodation while you sort out your permanent move.",
  },
  {
    title: "Phased Move",
    desc: "Moving in stages and need a secure place to keep items between trips.",
  },
];

export default function MovingStorage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Moving Storage</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Storage for People on the Move in Johannesburg
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl">
            Moving is stressful enough. Our moving storage gives you a safe, flexible place to keep your belongings while you transition between homes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg text-center transition">
              Get a Moving Storage Quote
            </a>
            <a href="https://wa.me/27000000000" className="border border-white hover:bg-white hover:text-gray-950 text-white font-semibold px-8 py-4 rounded-lg text-center transition">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Common Situations</p>
          <h2 className="text-4xl font-bold mb-12">When do people need moving storage?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {scenarios.map((item) => (
              <div key={item.title} className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collection */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 border border-orange-500 rounded-xl p-8">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Collection Service</p>
            <h2 className="text-3xl font-bold mb-4">Need us to collect your items?</h2>
            <p className="text-gray-400 mb-6">
              We offer a collection and transport service. Tell us where you are, what you need moved, and we will arrange collection and delivery to the storage facility.
            </p>
            <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition inline-block">
              Request Collection
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">How It Works</p>
          <h2 className="text-4xl font-bold mb-12">Simple process from start to finish</h2>
          <div className="flex flex-col gap-6">
            {[
              { num: "01", title: "Get a quote", desc: "Tell us what you need to store, your area, and when you need to move in." },
              { num: "02", title: "We confirm availability", desc: "We check the nearest facility and confirm your unit and pricing." },
              { num: "03", title: "Move in on your date", desc: "Bring your items or use our collection service. Simple move in process." },
              { num: "04", title: "Access when you need", desc: "Retrieve your items whenever you need them during the move." },
            ].map((step) => (
              <div key={step.num} className="flex gap-6 items-start border-b border-gray-800 pb-6">
                <span className="text-orange-500 text-3xl font-bold w-12 shrink-0">{step.num}</span>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Planning a move in Johannesburg?</h2>
          <p className="text-gray-400 mb-8">Get a storage quote today and take one thing off your moving checklist.</p>
          <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition inline-block">
            Get a Quote
          </a>
        </div>
      </section>
    </main>
  );
}
