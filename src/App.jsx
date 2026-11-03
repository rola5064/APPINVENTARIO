import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './components/Login/login'
import Layout from './components/Layout/layout'
import Dashboard from './components/Dashboard/dashboard'
import CrudProductos from './components/Productos/crudProductos'
import CrudCategorias from './components/Categoria/crudCategoria'
import CrudProveedor from './components/Proveedor/crudProveedor'
import CrudUsuarios from './components/Usuarios/crudUsuarios'
import CrudMovimientos from './components/Movimientos/crudMovimientos'
import Configuracion from './components/Configuracion/configuracion'

function App() {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout usuario={usuario} onLogout={cerrarSesion} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/productos" element={<CrudProductos />} />
          <Route path="/categorias" element={<CrudCategorias />} />
          <Route path="/proveedores" element={<CrudProveedor />} />
          <Route path="/kardex" element={<CrudMovimientos />} />
          {usuario.rol === "Administrador" && (
            <Route path="/usuarios" element={<CrudUsuarios />} />
          )}
          <Route
            path="/configuracion"
            element={<Configuracion usuario={usuario} onActualizar={setUsuario} />}
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;