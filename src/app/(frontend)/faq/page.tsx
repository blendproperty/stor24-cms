const faqs = [
  {
    q: "How do I get a storage quote?",
    a: "Fill in the quote form on our homepage. We will get back to you quickly with pricing and availability.",
  },
  {
    q: "What size storage unit do I need?",
    a: "It depends on what you are storing. A small unit suits boxes and student items. A medium unit covers a one bedroom flat. A large unit handles a two bedroom home or business stock. If you are unsure, tell us what you have and we will recommend the right size.",
  },
  {
    q: "How long can I store my items?",
    a: "As long as you need. We offer short term month to month options as well as long term storage. There are no lock in contracts.",
  },
  {
    q: "Is my stuff safe?",
    a: "Yes. Our facilities have 24 hour access control, CCTV monitoring, and secure individual units.",
  },
  {
    q: "Can you collect my items?",
    a: "Yes. We offer collection and transport assistance. Let us know when you fill in the quote form.",
  },
  {
    q: "Do you offer business storage?",
    a: "Yes. We handle stock, documents, equipment, and commercial overflow. Business storage is available on flexible terms.",
  },
  {
    q: "Can students use your storage?",
    a: "Yes. We offer short term student storage, ideal for university holidays or moving between residences.",
  },
  {
    q: "What areas do you serve?",
    a: "We cover Johannesburg and surrounding areas including Sandton, Randburg, Midrand, Fourways, Roodepoort, Edenvale, Germiston, Boksburg, and Centurion.",
  },
  {
    q: "How do I get started?",
    a: "Fill in the quote form, or WhatsApp us directly. We will handle the rest.",
  },
];

export default function FAQ() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">FAQ</p>
        <h1 className="text-5xl font-bold mb-4">Common Questions</h1>
        <p className="text-gray-400 mb-16">Everything you need to know before getting started.</p>

        <div className="flex flex-col gap-6">
          {faqs.map((item) => (
            <div key={item.q} className="border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-3">{item.q}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-900 rounded-xl p-8 text-center">
          <p className="text-lg font-semibold mb-4">Still have questions?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/27000000000" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition">
              WhatsApp Us
            </a>
            <a href="/#quote" className="border border-white hover:bg-white hover:text-gray-950 text-white font-semibold px-8 py-4 rounded-lg transition">
              Get a Quote
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
