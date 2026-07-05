import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import type { Trip } from "../types";

const POLL_INTERVAL_MS = 4000;

function PassengerTripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState("");

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

  useEffect(() => {
    loadTrip();
  }, [id]);

  useEffect(() => {
    if (!trip) return;
    if (trip.status !== "PENDING" && trip.status !== "IN_PROGRESS") return;

    const interval = setInterval(loadTrip, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [id, trip?.status]);

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ratingValue === 0) {
      setRatingError("Selecciona una calificación de 1 a 5 estrellas.");
      return;
    }

    try {
      setSubmittingRating(true);
      setRatingError("");

      const response = await api.post<Trip>(`/trips/${id}/rate`, {
        rating: ratingValue,
        comment: comment.trim() || undefined,
      });

      setTrip(response.data);
    } catch (err: any) {
      const message =
        err.response?.data?.error || "No se pudo enviar la calificación.";
      setRatingError(message);
    } finally {
      setSubmittingRating(false);
    }
  };

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

          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/passenger")}
          >
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
        <button
          style={styles.backButton}
          onClick={() => navigate("/passenger")}
        >
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
          <h2 style={styles.sectionTitle}>Conductor</h2>

          {trip.driver ? (
            <div style={styles.infoBox}>
              <p style={styles.value}>
                {trip.driver.firstName} {trip.driver.lastName}
              </p>
              <p style={styles.muted}>
                {trip.driver.rating > 0
                  ? `${trip.driver.rating} ⭐`
                  : "Sin calificaciones"}
              </p>
            </div>
          ) : (
            <p style={styles.warningBox}>Buscando conductor...</p>
          )}
        </section>

        {error && <p style={styles.error}>{error}</p>}

        {trip.status === "COMPLETED" && trip.passengerRating === null && (
          <form onSubmit={handleRate} style={styles.section}>
            <h2 style={styles.sectionTitle}>Califica tu viaje</h2>

            <div style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  style={{
                    ...styles.starButton,
                    color: star <= ratingValue ? "#f59e0b" : "#d1d5db",
                  }}
                  onClick={() => setRatingValue(star)}
                  aria-label={`${star} estrellas`}
                >
                  ★
                </button>
              ))}
            </div>

            <label style={styles.label}>Comentario (opcional)</label>
            <textarea
              style={styles.textarea}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos cómo estuvo el viaje"
              rows={3}
            />

            {ratingError && <p style={styles.error}>{ratingError}</p>}

            <button
              type="submit"
              style={styles.primaryButton}
              disabled={submittingRating}
            >
              {submittingRating ? "Enviando..." : "Enviar calificación"}
            </button>
          </form>
        )}

        {trip.status === "COMPLETED" && trip.passengerRating !== null && (
          <div style={styles.successBox}>
            <h2 style={styles.successTitle}>Viaje completado</h2>
            <p>
              <strong>Tu calificación:</strong> {trip.passengerRating}/5
            </p>
            {trip.ratingComment && (
              <p>
                <strong>Comentario:</strong> {trip.ratingComment}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default PassengerTripDetailPage;

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
    marginTop: "12px",
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
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  starsRow: {
    display: "flex",
    gap: "6px",
    marginBottom: "16px",
  },
  starButton: {
    border: "none",
    background: "transparent",
    fontSize: "32px",
    cursor: "pointer",
    lineHeight: 1,
    padding: 0,
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    marginBottom: "16px",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "vertical",
  },
};
