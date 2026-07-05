import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import type { Trip, User } from "../types";

function RequestTripPage() {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<User[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [driversError, setDriversError] = useState("");

  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadDrivers = async () => {
    try {
      setDriversError("");
      const response = await api.get<User[]>("/drivers/available");
      setDrivers(response.data);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        "No se pudo cargar los conductores disponibles.";
      setDriversError(message);
    } finally {
      setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const response = await api.post<Trip>("/trips", {
        pickupAddress,
        dropoffAddress,
      });

      navigate(`/passenger/trips/${response.data.id}`);
    } catch (err: any) {
      const message =
        err.response?.data?.error || "No se pudo solicitar el viaje.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <button style={styles.backButton} onClick={() => navigate("/passenger")}>
          ← Volver al dashboard
        </button>

        <h1 style={styles.title}>Solicitar viaje</h1>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Conductores disponibles</h2>

          {loadingDrivers && <p style={styles.muted}>Cargando conductores...</p>}

          {!loadingDrivers && driversError && (
            <p style={styles.error}>{driversError}</p>
          )}

          {!loadingDrivers && !driversError && drivers.length === 0 && (
            <p style={styles.muted}>
              No hay conductores disponibles en este momento.
            </p>
          )}

          {!loadingDrivers && !driversError && drivers.length > 0 && (
            <ul style={styles.driverList}>
              {drivers.map((driver) => (
                <li key={driver.id} style={styles.driverItem}>
                  <span style={styles.driverName}>
                    {driver.firstName} {driver.lastName}
                  </span>
                  <span style={styles.driverRating}>
                    {driver.rating > 0 ? `${driver.rating} ⭐` : "Sin calificaciones"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form onSubmit={handleSubmit} style={styles.section}>
          <h2 style={styles.sectionTitle}>Detalles del viaje</h2>

          <label style={styles.label}>Origen</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Ej: Av. Javier Prado 123"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            required
          />

          <label style={styles.label}>Destino</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Ej: Av. Larco 456"
            value={dropoffAddress}
            onChange={(e) => setDropoffAddress(e.target.value)}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.primaryButton} disabled={submitting}>
            {submitting ? "Solicitando..." : "Solicitar viaje"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default RequestTripPage;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    padding: "32px",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
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
    margin: "0 0 12px",
    fontSize: "30px",
  },
  section: {
    marginTop: "24px",
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "12px",
  },
  driverList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  driverItem: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "8px",
  },
  driverName: {
    fontWeight: 700,
  },
  driverRating: {
    color: "#6b7280",
  },
  muted: {
    color: "#6b7280",
  },
  label: {
    display: "block",
    fontWeight: 700,
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    marginBottom: "16px",
    fontSize: "15px",
  },
  primaryButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#111827",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    padding: "10px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "16px",
  },
};
