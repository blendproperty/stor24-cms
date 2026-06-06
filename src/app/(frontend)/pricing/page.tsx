const sizes = [
  {
    name: "Small",
    dimensions: "Approx 2m x 2m",
    goodFor: "Boxes, small furniture, student items, appliances",
    price: "From R500/month",
    popular: false,
  },
  {
    name: "Medium",
    dimensions: "Approx 3m x 3m",
    goodFor: "One bedroom flat, office items, appliances, bikes",
    price: "From R900/month",
    popular: true,
  },
  {
    name: "Large",
    dimensions: "Approx 4m x 5m",
    goodFor: "Two bedroom home, business stock, large furniture",
    price: "From R1,500/month",
    popular: false,
  },
  {
    name: "Extra Large",
    dimensions: "Approx 6m x 6m",
    goodFor: "Full house contents, commercial overflow, vehicles",
    price: "From R2,500/month",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Pricing</p>
        <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-400 mb-16 max-w-2xl">
          Prices vary by location and availability. The figures below are starting ranges. Fill in the quote form for an exact price based on your area and needs.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {sizes.map((size) => (
            <div key={size.name} className={`rounded-xl p-8 border ${size.popular ? "border-orange-500 bg-gray-900" : "border-gray-800 bg-gray-900"}`}>
              {size.popular && (
                <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-4">Most Popular</p>
              )}
              <h2 className="text-2xl font-bold mb-1">{size.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{size.dimensions}</p>
              <p className="text-orange-500 text-2xl font-bold mb-4">{size.price}</p>
              <p className="text-gray-400 text-sm">{size.goodFor}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">What is included</h2>
          <ul className="flex flex-col gap-3 text-gray-400 text-sm">
            <li>✓ Secure 24 hour access controlled facility</li>
            <li>✓ CCTV monitoring</li>
            <li>✓ Flexible month to month contracts</li>
            <li>✓ No hidden admin fees</li>
            <li>✓ Personal and business units available</li>
            <li>✓ Optional collection and transport service</li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-gray-400 mb-6">Ready to get an exact quote for your area?</p>
          <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition inline-block">
            Get a Quote
          </a>
        </div>
      </div>
    </main>
  );
}
