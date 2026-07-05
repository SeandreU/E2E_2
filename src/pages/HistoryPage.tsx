import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import type { Trip, TripStatus, User } from "../types";

const STATUS_FILTERS: Array<TripStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
];

function HistoryPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<TripStatus | "ALL">("ALL");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setError("");

        const meResponse = await api.get<User>("/users/me");
        setUser(meResponse.data);

        const tripsEndpoint =
          meResponse.data.role === "DRIVER" ? "/trips/my" : "/trips";
        const tripsResponse = await api.get<Trip[]>(tripsEndpoint);

        setTrips(tripsResponse.data);
      } catch (err: any) {
        const message =
          err.response?.data?.error || "No se pudo cargar el historial.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredTrips = useMemo(() => {
    if (statusFilter === "ALL") return trips;
    return trips.filter((trip) => trip.status === statusFilter);
  }, [trips, statusFilter]);

  const goToTrip = (tripId: number) => {
    if (user?.role === "DRIVER") {
      navigate(`/driver/trips/${tripId}`);
    } else {
      navigate(`/passenger/trips/${tripId}`);
    }
  };

  if (loading) {
    return (
      <main style={styles.page}>
        <p>Cargando historial...</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <button
          style={styles.backButton}
          onClick={() => navigate(user?.role === "DRIVER" ? "/driver" : "/passenger")}
        >
          ← Volver al dashboard
        </button>

        <h1 style={styles.title}>Historial de viajes</h1>

        <div style={styles.filterRow}>
          <label style={styles.label}>Filtrar por estado</label>
          <select
            style={styles.select}
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as TripStatus | "ALL")
            }
          >
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "Todos" : status}
              </option>
            ))}
          </select>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {!error && filteredTrips.length === 0 && (
          <p style={styles.muted}>No hay viajes para mostrar.</p>
        )}

        {!error && filteredTrips.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Origen</th>
                  <th style={styles.th}>Destino</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>
                    {user?.role === "DRIVER" ? "Pasajero" : "Conductor"}
                  </th>
                  <th style={styles.th}>Solicitado</th>
                  <th style={styles.th}>Calificación</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip) => {
                  const counterpart =
                    user?.role === "DRIVER" ? trip.passenger : trip.driver;

                  return (
                    <tr key={trip.id}>
                      <td style={styles.td}>#{trip.id}</td>
                      <td style={styles.td}>{trip.pickupAddress}</td>
                      <td style={styles.td}>{trip.dropoffAddress}</td>
                      <td style={styles.td}>
                        <span style={getStatusStyle(trip.status)}>
                          {trip.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {counterpart
                          ? `${counterpart.firstName} ${counterpart.lastName}`
                          : "—"}
                      </td>
                      <td style={styles.td}>
                        {new Date(trip.requestedAt).toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        {trip.passengerRating !== null
                          ? `${trip.passengerRating}/5`
                          : "—"}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.linkButton}
                          onClick={() => goToTrip(trip.id)}
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default HistoryPage;

const getStatusStyle = (status: Trip["status"]): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "12px",
  };

  if (status === "PENDING") {
    return { ...base, backgroundColor: "#fef3c7", color: "#92400e" };
  }

  if (status === "IN_PROGRESS") {
    return { ...base, backgroundColor: "#dbeafe", color: "#1e40af" };
  }

  return { ...base, backgroundColor: "#dcfce7", color: "#166534" };
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    padding: "32px",
  },
  card: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "32px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  },
  backButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 700,
    marginBottom: "18px",
  },
  title: {
    margin: "0 0 20px",
    fontSize: "30px",
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  label: {
    fontWeight: 700,
    margin: 0,
  },
  select: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },
  muted: {
    color: "#6b7280",
  },
  error: {
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "10px",
    marginBottom: "16px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "2px solid #e5e7eb",
    fontSize: "13px",
    color: "#6b7280",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  linkButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 700,
  },
};
