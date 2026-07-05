import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import type { Role, User } from "../types";

function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<Role>("PASSENGER");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectByRole = (user: User) => {
    if (user.role === "PASSENGER") {
      navigate("/passenger");
    } else {
      navigate("/driver");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      let response;

      if (mode === "login") {
        response = await api.post("/auth/login", {
          email,
          password,
        });
      } else {
        response = await api.post("/auth/register", {
          firstName,
          lastName,
          email,
          password,
          role,
        });
      }

      const token = response.data.token;

      localStorage.setItem("token", token);

      const meResponse = await api.get<User>("/users/me");

      redirectByRole(meResponse.data);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        "Ocurrió un error. Revisa tus datos e inténtalo otra vez.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>

        <p style={styles.subtitle}>Uber Clone Frontend</p>

        {mode === "register" && (
          <>
            <label style={styles.label}>Nombre</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Ej: Ana"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />

            <label style={styles.label}>Apellido</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Ej: García"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </>
        )}

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          placeholder="ana@uber.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label style={styles.label}>Contraseña</label>
        <input
          style={styles.input}
          type="password"
          placeholder="pass123"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {mode === "register" && (
          <>
            <label style={styles.label}>Rol</label>
            <select
              style={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="PASSENGER">Pasajero</option>
              <option value="DRIVER">Conductor</option>
            </select>
          </>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.primaryButton} disabled={loading}>
          {loading
            ? "Cargando..."
            : mode === "login"
            ? "Entrar"
            : "Registrarme"}
        </button>

        <button
          type="button"
          style={styles.linkButton}
          onClick={() => {
            setError("");
            setMode(mode === "login" ? "register" : "login");
          }}
        >
          {mode === "login"
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>

        <div style={styles.testBox}>
          <strong>Usuarios de prueba:</strong>
          <p>Pasajero: ana@uber.com / pass123</p>
          <p>Driver: carlos@uber.com / pass123</p>
        </div>
      </form>
    </main>
  );
}

export default AuthPage;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "32px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  },
  title: {
    margin: 0,
    textAlign: "center",
    fontSize: "28px",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "28px",
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
    padding: "13px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#111827",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px",
  },
  linkButton: {
    width: "100%",
    marginTop: "16px",
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 600,
  },
  error: {
    padding: "10px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    fontSize: "14px",
  },
  testBox: {
    marginTop: "24px",
    padding: "14px",
    backgroundColor: "#f9fafb",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#374151",
  },
};