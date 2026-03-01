/**
 * app/admin/page.tsx
 * Wrapper liviano — evita el pre-render SSR del panel de admin
 * usando dynamic import con ssr: false
 */
import dynamic from "next/dynamic";

const AdminDashboard = dynamic(
  () => import("../../components/AdminDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 border-[#3EB2ED] border-t-transparent animate-spin" />
      </div>
    ),
  }
);

export default function AdminPage() {
  return <AdminDashboard />;
}
