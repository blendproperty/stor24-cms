import { notFound } from "next/navigation";

const areas: Record<string, {
  name: string;
  intro: string;
  personal: string;
  business: string;
  nearby: string[];
}> = {
  johannesburg: {
    name: "Johannesburg",
    intro: "Looking for storage in Johannesburg? We help individuals and businesses find secure storage options for furniture, stock, documents, equipment, and short term moving needs across Johannesburg and the surrounding suburbs.",
    personal: "Johannesburg residents use our storage for moving house, renovating, decluttering, and downsizing. Whether you are between properties in the CBD or need short term storage in the northern suburbs, we have flexible options to suit.",
    business: "Johannesburg businesses use our storage for stock overflow, document archiving, equipment storage, and office relocations. Flexible month to month terms with no long contracts.",
    nearby: ["Sandton", "Randburg", "Midrand", "Fourways", "Roodepoort"],
  },
  sandton: {
    name: "Sandton",
    intro: "Looking for storage in Sandton? We help individuals and businesses in Sandton find secure storage for furniture, business stock, documents, equipment, and short term moving needs.",
    personal: "Sandton residents use our storage for moving between properties, renovating, and decluttering. Whether you are in Bryanston, Morningside, or Sandton Central, we have units to suit.",
    business: "Sandton businesses use our storage for stock overflow, document archiving, and equipment storage. Ideal for companies in Sandton City, Bryanston, and the surrounding commercial nodes.",
    nearby: ["Johannesburg", "Randburg", "Midrand", "Fourways", "Edenvale"],
  },
  randburg: {
    name: "Randburg",
    intro: "Looking for storage in Randburg? We provide secure personal and business storage for residents and companies in Randburg, Northcliff, Bordeaux, and surrounding areas.",
    personal: "Randburg residents use our storage for moving house, renovating, and decluttering. Flexible short and long term options available.",
    business: "Randburg businesses use our storage for stock overflow, document storage, and equipment. Month to month terms with easy access.",
    nearby: ["Johannesburg", "Sandton", "Roodepoort", "Fourways", "Midrand"],
  },
  midrand: {
    name: "Midrand",
    intro: "Looking for storage in Midrand? We offer secure personal and business storage for Midrand, Kyalami, Halfway House, and surrounding areas.",
    personal: "Midrand residents use our storage for moving between properties, renovating, and short term storage needs. Fast quotes and flexible terms.",
    business: "Midrand businesses use our storage for stock, documents, and equipment. Midrand is a key logistics node and we have units suited to business needs.",
    nearby: ["Johannesburg", "Sandton", "Fourways", "Centurion", "Edenvale"],
  },
  fourways: {
    name: "Fourways",
    intro: "Looking for storage in Fourways? We provide secure storage for residents and businesses in Fourways, Dainfern, Lonehill, and surrounding suburbs.",
    personal: "Fourways residents use our storage for moving house, decluttering, and renovation projects. Flexible month to month options available.",
    business: "Fourways businesses use our storage for stock overflow, seasonal inventory, and equipment. Fast setup and easy access.",
    nearby: ["Sandton", "Randburg", "Midrand", "Roodepoort", "Johannesburg"],
  },
  roodepoort: {
    name: "Roodepoort",
    intro: "Looking for storage in Roodepoort? We offer secure personal and business storage for Roodepoort, Weltevreden Park, Florida, and surrounding areas.",
    personal: "Roodepoort residents use our storage for moving, renovating, and decluttering. Affordable units with flexible terms.",
    business: "Roodepoort businesses use our storage for stock, documents, and equipment overflow. Easy access and no long contracts.",
    nearby: ["Johannesburg", "Randburg", "Fourways", "Germiston", "Edenvale"],
  },
  edenvale: {
    name: "Edenvale",
    intro: "Looking for storage in Edenvale? We provide secure personal and business storage for Edenvale, Bedfordview, Modderfontein, and surrounding areas.",
    personal: "Edenvale residents use our storage for moving between properties, renovating, and short term storage needs.",
    business: "Edenvale businesses use our storage for stock, documents, and equipment. Convenient access for East Rand based companies.",
    nearby: ["Germiston", "Boksburg", "Johannesburg", "Sandton", "Midrand"],
  },
  germiston: {
    name: "Germiston",
    intro: "Looking for storage in Germiston? We offer secure personal and business storage for Germiston, Ekurhuleni, and nearby industrial and residential areas.",
    personal: "Germiston residents use our storage for moving, decluttering, and renovation projects. Affordable flexible options available.",
    business: "Germiston businesses use our storage for stock overflow and equipment. Well located for industrial and commercial operations in the area.",
    nearby: ["Edenvale", "Boksburg", "Johannesburg", "Roodepoort", "Centurion"],
  },
  boksburg: {
    name: "Boksburg",
    intro: "Looking for storage in Boksburg? We provide secure personal and business storage for Boksburg, Benoni, and East Rand areas.",
    personal: "Boksburg residents use our storage for moving house, renovating, and decluttering. Fast quotes and flexible terms.",
    business: "Boksburg businesses use our storage for stock, documents, and equipment. Suitable for East Rand industrial and commercial operations.",
    nearby: ["Germiston", "Edenvale", "Johannesburg", "Centurion", "Midrand"],
  },
  centurion: {
    name: "Centurion",
    intro: "Looking for storage in Centurion? We offer secure personal and business storage for Centurion, Irene, Lyttelton, and nearby Pretoria areas.",
    personal: "Centurion residents use our storage for moving between properties, renovating, and short term storage. Flexible month to month options.",
    business: "Centurion businesses use our storage for stock overflow, documents, and equipment. Well positioned for companies between Johannesburg and Pretoria.",
    nearby: ["Midrand", "Johannesburg", "Sandton", "Boksburg", "Germiston"],
  },
};

export function generateStaticParams() {
  return Object.keys(areas).map((slug) => ({ slug }));
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = areas[slug];
  if (!area) notFound();

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Storage in {area.name}</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Storage in {area.name} for Homes, Businesses, and Moving
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl">{area.intro}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg text-center transition">
              Get a Quote in {area.name}
            </a>
            <a href="https://wa.me/27000000000" className="border border-white hover:bg-white hover:text-gray-950 text-white font-semibold px-8 py-4 rounded-lg text-center transition">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Personal */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Personal Storage</p>
          <h2 className="text-4xl font-bold mb-6">Personal Storage in {area.name}</h2>
          <p className="text-gray-400 mb-8">{area.personal}</p>
          <a href="/personal-storage" className="text-orange-500 hover:underline text-sm">
            Learn more about personal storage →
          </a>
        </div>
      </section>

      {/* Business */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Business Storage</p>
          <h2 className="text-4xl font-bold mb-6">Business Storage in {area.name}</h2>
          <p className="text-gray-400 mb-8">{area.business}</p>
          <a href="/business-storage" className="text-orange-500 hover:underline text-sm">
            Learn more about business storage →
          </a>
        </div>
      </section>

      {/* Unit sizes */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Unit Sizes</p>
          <h2 className="text-4xl font-bold mb-8">Storage Unit Sizes in {area.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { size: "Small", desc: "Boxes, student items" },
              { size: "Medium", desc: "One bedroom flat" },
              { size: "Large", desc: "Two bedroom home" },
              { size: "Extra Large", desc: "Full house or commercial" },
            ].map((item) => (
              <div key={item.size} className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="font-semibold mb-1">{item.size}</p>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <a href="/storage-unit-sizes" className="text-orange-500 hover:underline text-sm">
            View full size guide →
          </a>
        </div>
      </section>

      {/* Nearby areas */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Nearby Areas</p>
          <h2 className="text-4xl font-bold mb-8">We also serve areas near {area.name}</h2>
          <div className="flex flex-wrap gap-4">
            {area.nearby.map((n) => (
              <a key={n} href={`/locations/${n.toLowerCase()}`} className="bg-gray-800 hover:bg-gray-700 rounded-lg px-5 py-3 text-sm transition">
                Storage in {n}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">FAQ</p>
          <h2 className="text-4xl font-bold mb-8">Common questions about storage in {area.name}</h2>
          <div className="flex flex-col gap-6">
            {[
              { q: `How do I get a storage quote in ${area.name}?`, a: "Fill in the quote form on our homepage or WhatsApp us directly. We will get back to you quickly with pricing and availability in your area." },
              { q: `What size storage unit do I need in ${area.name}?`, a: "It depends on what you are storing. Use our size guide or tell us what you have and we will recommend the right unit." },
              { q: `Do you offer short term storage in ${area.name}?`, a: "Yes. We offer flexible month to month storage with no long term contracts." },
              { q: `Can you collect my items in ${area.name}?`, a: "Yes. We offer a collection and transport service. Let us know when you fill in the quote form." },
            ].map((item) => (
              <div key={item.q} className="border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-3">{item.q}</h3>
                <p className="text-gray-400 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gray-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get storage in {area.name}?</h2>
          <p className="text-gray-400 mb-8">Get a fast quote. No obligation, no pressure.</p>
          <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition inline-block">
            Get a Quote
          </a>
        </div>
      </section>
    </main>
  );
}
