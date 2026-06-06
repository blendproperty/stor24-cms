const areas = [
  { name: "Johannesburg", slug: "johannesburg" },
  { name: "Sandton", slug: "sandton" },
  { name: "Randburg", slug: "randburg" },
  { name: "Midrand", slug: "midrand" },
  { name: "Fourways", slug: "fourways" },
  { name: "Roodepoort", slug: "roodepoort" },
  { name: "Edenvale", slug: "edenvale" },
  { name: "Germiston", slug: "germiston" },
  { name: "Boksburg", slug: "boksburg" },
  { name: "Centurion", slug: "centurion" },
];

export default function StorageNearMe() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Storage Near Me</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Find Secure Storage Near You in Johannesburg
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl">
            We offer personal and business storage across Johannesburg and surrounding areas. Select your area below or fill in the quote form and we will find the closest option for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg text-center transition">
              Get a Quote Near Me
            </a>
            <a href="https://wa.me/27000000000" className="border border-white hover:bg-white hover:text-gray-950 text-white font-semibold px-8 py-4 rounded-lg text-center transition">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Areas We Serve</p>
          <h2 className="text-4xl font-bold mb-12">Storage locations across Johannesburg</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {areas.map((area) => (
              <a key={area.slug} href={`/locations/${area.slug}`} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-500 rounded-xl p-6 transition group">
                <h2 className="text-lg font-semibold mb-1 group-hover:text-orange-500 transition">
                  Storage in {area.name}
                </h2>
                <p className="text-orange-500 text-sm mt-3">View options →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why local */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Why Local Matters</p>
          <h2 className="text-4xl font-bold mb-12">Why choose storage close to you</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "Easy Access", desc: "Storage near your home or business means less time and cost every time you need to visit your unit." },
              { title: "Faster Move In", desc: "Local storage means we can confirm availability quickly and get you moved in without delay." },
              { title: "Local Support", desc: "Our team knows Johannesburg. We can help you find the closest and most suitable option for your area." },
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
          <h2 className="text-4xl font-bold mb-4">Not sure which area is closest?</h2>
          <p className="text-gray-400 mb-8">Fill in the quote form and tell us your suburb. We will find the nearest available unit for you.</p>
          <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition inline-block">
            Get a Quote
          </a>
        </div>
      </section>
    </main>
  );
}
