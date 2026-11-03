import { useState } from 'react';
import './login.css';
// Cambia esta ruta por la del logo que ya usas en tu login actual
import logo from '../../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Si ya tienes tu propia función de login, pega aquí su contenido
  // y borra esta. Lo nuevo de este archivo es el diseño (el return).
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar sesión');
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      window.location.href = '/'; // ajusta a tu ruta de inicio
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="lg-page">
      <section className="lg-brand">
        <svg className="lg-arcs" viewBox="0 0 600 800" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
          <g fill="none" stroke="#fff" strokeWidth="1">
            <circle cx="620" cy="820" r="180" />
            <circle cx="620" cy="820" r="280" />
            <circle cx="620" cy="820" r="380" />
            <circle cx="620" cy="820" r="480" />
            <circle cx="620" cy="820" r="580" />
            <circle cx="620" cy="820" r="680" />
          </g>
        </svg>

        <div className="lg-brand-body">
          <h1>Hola, bienvenido al Sistema de Inventario SENATI</h1>
          <p>
            Controla tu stock, registra cada entrada y salida y mantén la
            información de la institución segura en un solo lugar.
          </p>
        </div>

        <small className="lg-copy">© {new Date().getFullYear()} SENATI. Todos los derechos reservados.</small>
      </section>

      <section className="lg-side">
        <form className="lg-form" onSubmit={handleSubmit}>
          <img src={logo} alt="SENATI" className="lg-logo" />

          <h2>Bienvenido de nuevo</h2>
          <p className="lg-sub">Ingresa con tu cuenta para continuar</p>

          {error && (
            <div className="lg-error" role="alert">
              {error}
            </div>
          )}

          <label className="lg-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="lg-field">
            <span>Contraseña</span>
            <input
              type={mostrar ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <label className="lg-check">
            <input
              type="checkbox"
              checked={mostrar}
              onChange={(e) => setMostrar(e.target.checked)}
            />
            Mostrar contraseña
          </label>

          <button type="submit" className="lg-btn" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  );
}
