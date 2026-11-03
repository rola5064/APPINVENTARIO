import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import logo from "../../assets/logo-blanco.png";
import "./Layout.css";

const Layout = ({ usuario, onLogout }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const links = [
    { to: "/dashboard", texto: "Inicio (Dashboard)", icono: "bi-house" },
    { to: "/productos", texto: "Productos", icono: "bi-box-seam" },
    { to: "/categorias", texto: "Categorías", icono: "bi-folder" },
    { to: "/proveedores", texto: "Proveedores", icono: "bi-people" },
    { to: "/kardex", texto: "Kardex / Movimientos", icono: "bi-arrow-left-right" },
  ];

  if (usuario.rol === "Administrador") {
    links.push({ to: "/usuarios", texto: "Usuarios", icono: "bi-person" });
  }
  
  links.push({ to: "/configuracion", texto: "Configuración", icono: "bi-gear" });

  const iniciales = usuario.nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">SENATI - Sistema de Inventario</div>

        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
            >
              <i className={`bi ${l.icono}`}></i>
              {l.texto}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-user" onClick={() => setMenuAbierto(!menuAbierto)}>
            <div className="avatar">{iniciales}</div>
            <span>{usuario.nombre}</span>
            <i className="bi bi-chevron-down"></i>

            {menuAbierto && (
              <div className="user-menu">
                <div className="user-menu-rol">{usuario.rol}</div>
                <button onClick={onLogout}>
                  <i className="bi bi-box-arrow-right"></i> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;