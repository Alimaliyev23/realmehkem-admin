import { useNavigate } from "react-router-dom";
import { storage } from "../../../lib/storage";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@realmehkem.local");
  const [password, setPassword] = useState("admin123");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    storage.setToken("demo-token");
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded bg-white p-6 shadow"
      >
        <h1 className="mb-4 text-xl font-semibold">Login</h1>

        <label className="block text-sm mb-2">
          Email
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block text-sm mb-4">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button className="w-full rounded bg-gray-900 py-2 text-white hover:bg-gray-800">
          Daxil ol
        </button>

        <p className="mt-3 text-xs text-gray-500">
          (Mock login — sadəcə token yazır)
        </p>
      </form>
    </div>
  );
}
