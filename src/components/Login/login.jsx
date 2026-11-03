import { useState } from "react";
import api from "../../services/api";
import logo from "../../assets/logo.png";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const response = await api.post("/login", form);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      onLogin(response.data.usuario);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="SENATI" className="login-logo-img" width="140" />
        <h2>Sistema de Inventario</h2>
        <p className="login-subtitle">Ingresa con tu cuenta para continuar</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="form-floating mb-3">
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="form-floating mb-2">
            <input
              type={verPassword ? "text" : "password"}
              id="password"
              name="password"
              className="form-control"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="password">Contraseña</label>
          </div>

          <div className="form-check mb-4">
            <input
              type="checkbox"
              id="verPassword"
              className="form-check-input"
              checked={verPassword}
              onChange={(e) => setVerPassword(e.target.checked)}
            />
            <label htmlFor="verPassword" className="form-check-label">
              Mostrar contraseña
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn w-100"
            disabled={cargando}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;