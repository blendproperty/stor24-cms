const areas = [
  { name: "Johannesburg", slug: "johannesburg", desc: "Central Johannesburg and surrounding suburbs." },
  { name: "Sandton", slug: "sandton", desc: "Sandton, Bryanston, Morningside, and nearby areas." },
  { name: "Randburg", slug: "randburg", desc: "Randburg, Northcliff, Bordeaux, and surrounds." },
  { name: "Midrand", slug: "midrand", desc: "Midrand, Kyalami, Halfway House, and nearby areas." },
  { name: "Fourways", slug: "fourways", desc: "Fourways, Dainfern, Lonehill, and surrounds." },
  { name: "Roodepoort", slug: "roodepoort", desc: "Roodepoort, Weltevreden Park, Florida, and nearby areas." },
  { name: "Edenvale", slug: "edenvale", desc: "Edenvale, Bedfordview, Modderfontein, and surrounds." },
  { name: "Germiston", slug: "germiston", desc: "Germiston, Ekurhuleni, and nearby industrial areas." },
  { name: "Boksburg", slug: "boksburg", desc: "Boksburg, Benoni, and East Rand areas." },
  { name: "Centurion", slug: "centurion", desc: "Centurion, Irene, Lyttelton, and nearby Pretoria areas." },
];

export default function Locations() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Locations</p>
          <h1 className="text-5xl font-bold mb-4">Storage Across Johannesburg</h1>
          <p className="text-gray-400 mb-16 max-w-2xl">
            We serve Johannesburg and surrounding areas. Select your area below for local storage options, pricing, and availability.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {areas.map((area) => (
              <a key={area.slug} href={`/locations/${area.slug}`} className="bg-gray-900 border border-gray-800 hover:border-orange-500 rounded-xl p-6 transition group">
                <h2 className="text-lg font-semibold mb-2 group-hover:text-orange-500 transition">
                  Storage in {area.name}
                </h2>
                <p className="text-gray-400 text-sm">{area.desc}</p>
                <p className="text-orange-500 text-sm mt-4">View options →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Do not see your area?</h2>
          <p className="text-gray-400 mb-8">We may still be able to help. Get in touch and we will check availability near you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/27000000000" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition">
              WhatsApp Us
            </a>
            <a href="/#quote" className="border border-white hover:bg-white hover:text-gray-950 text-white font-semibold px-8 py-4 rounded-lg transition">
              Get a Quote
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
