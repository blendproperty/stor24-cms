const sizes = [
  {
    name: "Small",
    dimensions: "Approx 2m x 2m",
    goodFor: ["Boxes and bags", "Small furniture items", "Student belongings", "Appliances", "Sports equipment"],
    notIdealFor: "Full bedroom sets or large furniture",
  },
  {
    name: "Medium",
    dimensions: "Approx 3m x 3m",
    goodFor: ["One bedroom flat contents", "Office equipment and files", "Appliances and white goods", "Bicycles and outdoor gear"],
    notIdealFor: "Full two bedroom home contents",
  },
  {
    name: "Large",
    dimensions: "Approx 4m x 5m",
    goodFor: ["Two bedroom home contents", "Business stock and inventory", "Large furniture and appliances", "Commercial equipment"],
    notIdealFor: "Full house contents or vehicle storage",
  },
  {
    name: "Extra Large",
    dimensions: "Approx 6m x 6m",
    goodFor: ["Full house contents", "Commercial overflow stock", "Vehicles and trailers", "Large scale business storage"],
    notIdealFor: "Nothing. This is the biggest we have.",
  },
];

export default function StorageUnitSizes() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Size Guide</p>
        <h1 className="text-5xl font-bold mb-4">Storage Unit Size Guide</h1>
        <p className="text-gray-400 mb-16 max-w-2xl">
          Not sure what size you need? Use this guide to find the right unit. If you are still unsure, tell us what you have and we will recommend the right size for you.
        </p>

        <div className="flex flex-col gap-8 mb-16">
          {sizes.map((size) => (
            <div key={size.name} className="bg-gray-900 border border-gray-800 rounded-xl p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{size.name} Unit</h2>
                  <p className="text-gray-500 text-sm mt-1">{size.dimensions}</p>
                </div>
                <a href="/#quote" className="mt-4 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition inline-block">
                  Quote This Size
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Good for</p>
                  <ul className="flex flex-col gap-2">
                    {size.goodFor.map((item) => (
                      <li key={item} className="text-gray-400 text-sm flex gap-2">
                        <span className="text-orange-500">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Not ideal for</p>
                  <p className="text-gray-400 text-sm">{size.notIdealFor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Still not sure what size you need?</h2>
          <p className="text-gray-400 mb-6">Tell us what you are storing and we will recommend the right unit for you.</p>
          <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition inline-block">
            Get a Recommendation
          </a>
        </div>
      </div>
    </main>
  );
}
