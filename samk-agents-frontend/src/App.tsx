export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="rounded-2xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-4xl font-extrabold text-blue-600">
          Tailwind is working 🎉
        </h1>
        <p className="mt-4 text-gray-600">
          If this is centered, styled, and blue — you’re good.
        </p>
        <button className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition">
          Test Button
        </button>
      </div>
    </div>
  )
}
