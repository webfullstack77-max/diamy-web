"use client";

export default function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-on-surface-muted hover:bg-surface-container transition"
    >
      <span className="material-symbol" style={{ fontSize: "18px" }}>
        logout
      </span>
      Cerrar sesión
    </button>
  );
}
