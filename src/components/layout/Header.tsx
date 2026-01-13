import { useNavigate } from "react-router-dom";
import { storage } from "../../lib/storage";

export default function Header() {
  const navigate = useNavigate();

  function logout() {
    storage.removeToken();
    navigate("/login", { replace: true });
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div className="font-medium">Admin Panel</div>
      <button
        onClick={logout}
        className="rounded bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800"
      >
        Çıxış
      </button>
    </header>
  );
}
