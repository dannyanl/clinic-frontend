import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search as SearchIcon, User, Stethoscope } from "lucide-react";

import { Spinner } from "../components/ui/Spinner";
import { globalSearch } from "../services/search";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const enabled = q.trim().length >= 2;

  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: () => globalSearch(q.trim()),
    enabled,
  });

  const total = (data?.patients.length ?? 0) + (data?.doctors.length ?? 0);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold">Búsqueda global</h1>
        <p className="text-sm text-ink-500">Buscá pacientes y doctores por nombre, email o DNI</p>
      </header>

      <div className="card flex items-center gap-3">
        <SearchIcon className="w-5 h-5 text-ink-400 flex-shrink-0" />
        <input
          className="input border-0 shadow-none p-0 flex-1 text-lg"
          placeholder="Escribí al menos 2 caracteres…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
        {isLoading && <Spinner />}
      </div>

      {enabled && data && (
        <div className="text-sm text-ink-500">{total} resultado{total !== 1 ? "s" : ""} para «{q}»</div>
      )}

      {data?.patients && data.patients.length > 0 && (
        <div className="card">
          <h2 className="font-bold mb-3 flex items-center gap-2 text-ink-700">
            <User className="w-4 h-4 text-accent-600" /> Pacientes ({data.patients.length})
          </h2>
          <div className="space-y-2">
            {data.patients.map((p) => (
              <Link key={p.id} to={`/patients/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-ink-200 hover:border-brand-400 hover:bg-brand-50 transition group">
                <div className="w-9 h-9 rounded-full bg-accent-100 grid place-items-center text-accent-700 font-bold flex-shrink-0">
                  {p.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold group-hover:text-brand-700">{p.name}</div>
                  <div className="text-xs text-ink-500">{p.email}{p.dni ? ` · DNI ${p.dni}` : ""}</div>
                </div>
                <span className="text-ink-400 text-sm">Ver →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {data?.doctors && data.doctors.length > 0 && (
        <div className="card">
          <h2 className="font-bold mb-3 flex items-center gap-2 text-ink-700">
            <Stethoscope className="w-4 h-4 text-brand-600" /> Doctores ({data.doctors.length})
          </h2>
          <div className="space-y-2">
            {data.doctors.map((d) => (
              <Link key={d.id} to={`/doctors/${d.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-ink-200 hover:border-brand-400 hover:bg-brand-50 transition group">
                <div className="w-9 h-9 rounded-full bg-brand-100 grid place-items-center text-brand-700 font-bold flex-shrink-0">
                  {d.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold group-hover:text-brand-700">{d.name}</div>
                  <div className="text-xs text-ink-500">{d.specialty ?? "Sin especialidad"} · MP {d.license}</div>
                </div>
                <span className="text-ink-400 text-sm">Ver →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {enabled && !isLoading && data && total === 0 && (
        <div className="card text-center text-ink-500 py-10">
          <SearchIcon className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <div>Sin resultados para «{q}»</div>
          <div className="text-sm mt-1">Probá con otro nombre, email o DNI.</div>
        </div>
      )}

      {!enabled && (
        <div className="card text-center text-ink-400 py-10">
          <SearchIcon className="w-10 h-10 text-ink-200 mx-auto mb-3" />
          <div className="text-sm">Ingresá al menos 2 caracteres para buscar</div>
        </div>
      )}
    </div>
  );
}
