// app/admin/layout.jsx
import Navbar from "@/components/Navbar/Navbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />

      <main className="pt-20 p-4">
        {children}
      </main>
    </div>
  );
}
