import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import type { Trip } from "../types";

function DriverTripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  const loadTrip = async () => {
    try {
      setError("");
      const response = await api.get<Trip>(`/trips/${id}`);
      setTrip(response.data);
    } catch (err: any) {
      const message =
        err.response?.data?.error || "No se pudo cargar el viaje.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!trip) return;

    try {
      setCompleting(true);
      setError("");

      const response = await api.patch<Trip>(`/trips/${trip.id}/complete`);

      setTrip(response.data);
    } catch (err: any) {
      const message =
        err.response?.data?.error || "No se pudo completar el viaje.";
      setError(message);
    } finally {
      setCompleting(false);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [id]);

  if (loading) {
    return (
      <main style={styles.page}>
        <p>Cargando detalle del viaje...</p>
      </main>
    );
  }

  if (error && !trip) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <p style={styles.error}>{error}</p>

          <button style={styles.secondaryButton} onClick={() => navigate("/driver")}>
            Volver al dashboard
          </button>
        </section>
      </main>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <button style={styles.backButton} onClick={() => navigate("/driver")}>
          ← Volver al dashboard
        </button>

        <h1 style={styles.title}>Detalle del viaje #{trip.id}</h1>

        <span style={getStatusStyle(trip.status)}>{trip.status}</span>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Ruta del viaje</h2>

          <div style={styles.infoBox}>
            <p style={styles.label}>Origen</p>
            <p style={styles.value}>{trip.pickupAddress}</p>
          </div>

          <div style={styles.infoBox}>
            <p style={styles.label}>Destino</p>
            <p style={styles.value}>{trip.dropoffAddress}</p>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Datos del pasajero</h2>

          <div style={styles.infoBox}>
            <p style={styles.value}>
              {trip.passenger.firstName} {trip.passenger.lastName}
            </p>
            <p style={styles.muted}>{trip.passenger.email}</p>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Fechas</h2>

          <p>
            <strong>Solicitado:</strong>{" "}
            {new Date(trip.requestedAt).toLocaleString()}
          </p>

          {trip.acceptedAt && (
            <p>
              <strong>Aceptado:</strong>{" "}
              {new Date(trip.acceptedAt).toLocaleString()}
            </p>
          )}

          {trip.completedAt && (
            <p>
              <strong>Completado:</strong>{" "}
              {new Date(trip.completedAt).toLocaleString()}
            </p>
          )}
        </section>

        {error && <p style={styles.error}>{error}</p>}

        {trip.status === "IN_PROGRESS" && (
          <button
            style={styles.primaryButton}
            onClick={handleCompleteTrip}
            disabled={completing}
          >
            {completing ? "Completando..." : "Completar viaje"}
          </button>
        )}

        {trip.status === "COMPLETED" && (
          <div style={styles.successBox}>
            <h2 style={styles.successTitle}>Viaje completado</h2>
            <p>El viaje ya fue marcado como completado correctamente.</p>

            {trip.passengerRating ? (
              <p>
                <strong>Calificación recibida:</strong> {trip.passengerRating}/5
              </p>
            ) : (
              <p>El pasajero todavía no ha calificado este viaje.</p>
            )}

            {trip.ratingComment && (
              <p>
                <strong>Comentario:</strong> {trip.ratingComment}
              </p>
            )}
          </div>
        )}

        {trip.status === "PENDING" && (
          <p style={styles.warningBox}>
            Este viaje todavía está pendiente. Primero debe ser aceptado por un
            conductor.
          </p>
        )}
      </section>
    </main>
  );
}

export default DriverTripDetailPage;

const getStatusStyle = (status: Trip["status"]): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "13px",
    marginBottom: "18px",
  };

  if (status === "PENDING") {
    return {
      ...base,
      backgroundColor: "#fef3c7",
      color: "#92400e",
    };
  }

  if (status === "IN_PROGRESS") {
    return {
      ...base,
      backgroundColor: "#dbeafe",
      color: "#1e40af",
    };
  }

  return {
    ...base,
    backgroundColor: "#dcfce7",
    color: "#166534",
  };
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    padding: "32px",
  },
  card: {
    width: "100%",
    maxWidth: "760px",
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
  infoBox: {
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "12px",
  },
  label: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },
  value: {
    margin: "4px 0 0",
    fontWeight: 700,
    fontSize: "16px",
  },
  muted: {
    margin: "4px 0 0",
    color: "#6b7280",
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
    marginTop: "28px",
  },
  secondaryButton: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#111827",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },
  error: {
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "10px",
    marginTop: "20px",
  },
  successBox: {
    marginTop: "28px",
    padding: "18px",
    borderRadius: "12px",
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  successTitle: {
    marginTop: 0,
  },
  warningBox: {
    marginTop: "28px",
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
};