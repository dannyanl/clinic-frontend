import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="text-6xl font-bold text-brand-600">404</div>
      <div className="mt-2 text-slate-600">Página no encontrada</div>
      <Link to="/" className="btn-primary mt-6">Volver al inicio</Link>
    </div>
  );
}
