export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold mb-4">Login test</h1>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Username"
        />
        <input
          className="border p-2 w-full mb-4"
          type="password"
          placeholder="Password"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Sign in
        </button>
      </div>
    </div>
  );
}
