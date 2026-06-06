export default function Contact() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Contact Us</p>
        <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
        <p className="text-gray-400 mb-12">We are based in Johannesburg and respond quickly. Choose the contact method that works best for you.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          <a href="https://wa.me/27000000000" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-center transition">
            <p className="text-2xl mb-3">💬</p>
            <p className="font-semibold mb-1">WhatsApp</p>
            <p className="text-gray-400 text-sm">Fastest response</p>
          </a>
          <a href="tel:+27000000000" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-center transition">
            <p className="text-2xl mb-3">📞</p>
            <p className="font-semibold mb-1">Phone</p>
            <p className="text-gray-400 text-sm">Mon to Fri 8am to 5pm</p>
          </a>
          <a href="mailto:info@stor24.co.za" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-center transition">
            <p className="text-2xl mb-3">✉️</p>
            <p className="font-semibold mb-1">Email</p>
            <p className="text-gray-400 text-sm">info@stor24.co.za</p>
          </a>
        </div>

        <div className="border-t border-gray-800 pt-12">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Or Send a Message</p>
          <a href="/#quote" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg inline-block transition">
            Fill in the Quote Form
          </a>
        </div>
      </div>
    </main>
  );
}
