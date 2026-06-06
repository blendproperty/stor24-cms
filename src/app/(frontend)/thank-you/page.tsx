export default function ThankYou() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center px-6">
      <div className="max-w-lg text-center">
        <div className="text-orange-500 text-6xl mb-6">✓</div>
        <h1 className="text-4xl font-bold mb-4">We have got your request</h1>
        <p className="text-gray-400 text-lg mb-10">
          Someone from our team will be in touch shortly on your preferred contact method.
        </p>
        <a href="/" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition">
          Back to Home
        </a>
      </div>
    </main>
  );
}
