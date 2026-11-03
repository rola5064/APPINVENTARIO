import { useState, useEffect } from "react";
import api from "../../services/api";

const POR_PAGINA = 5;

const formVacio = {
  id: null,
  nombre: "",
  email: "",
  password: "",
  rol: "trabajador",
};

const estiloRol = {
  Administrador: "bg-primary-subtle text-primary-emphasis",
  trabajador: "bg-secondary-subtle text-secondary-emphasis",
};

const CrudUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(formVacio);

  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "null");

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    const response = await api.get("/usuarios");
    setUsuarios(response.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const abrirNuevo = () => {
    setForm(formVacio);
    setMostrarForm(true);
  };

  const handleEdit = (u) => {
    setForm({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      password: "",
      rol: u.rol,
    });
    setMostrarForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/usuarios/${form.id}`, form);
      } else {
        await api.post("/usuarios", form);
      }
      setForm(formVacio);
      setMostrarForm(false);
      obtenerUsuarios();
    } catch (error) {
      alert(error.response?.data?.error || "Error al guardar el usuario");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      try {
        await api.delete(`/usuarios/${id}`);
        obtenerUsuarios();
      } catch (error) {
        alert(error.response?.data?.error || "No se pudo eliminar el usuario");
      }
    }
  };

  // Búsqueda por nombre, email o rol
  const filtrados = usuarios.filter((u) => {
    const texto = `${u.nombre} ${u.email} ${u.rol}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const visibles = filtrados.slice(inicio, inicio + POR_PAGINA);
  const desde = filtrados.length ? inicio + 1 : 0;
  const hasta = Math.min(inicio + POR_PAGINA, filtrados.length);

  return (
    <div>
      <h3 className="fw-bold mb-4">Usuarios</h3>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre, email o rol..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
        />
        <button className="btn btn-primary text-nowrap" onClick={abrirNuevo}>
          + Nuevo Usuario
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Lista de Usuarios</h6>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No hay usuarios para mostrar
                    </td>
                  </tr>
                )}
                {visibles.map((u) => (
                  <tr key={u.id}>
                    <td>{String(u.id).padStart(3, "0")}</td>
                    <td className="fw-semibold">{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${estiloRol[u.rol]}`}>{u.rol}</span>
                    </td>
                    <td className="text-nowrap">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => handleEdit(u)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(u.id)}
                        disabled={u.id === usuarioActual?.id}
                        title={
                          u.id === usuarioActual?.id
                            ? "No puedes eliminar tu propio usuario"
                            : ""
                        }
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              Mostrando {desde}-{hasta} de {filtrados.length} usuarios
            </small>

            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${pagina === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPagina(pagina - 1)}>
                  «
                </button>
              </li>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <li key={n} className={`page-item ${n === pagina ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setPagina(n)}>
                    {n}
                  </button>
                </li>
              ))}
              <li className={`page-item ${pagina === totalPaginas ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPagina(pagina + 1)}>
                  »
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ventana: Nuevo / Editar usuario */}
      {mostrarForm && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {form.id ? "Editar Usuario" : "Nuevo Usuario"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMostrarForm(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Contraseña {form.id && "(vacío = no cambiar)"}
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={form.password}
                      onChange={handleChange}
                      required={!form.id}
                    />
                  </div>

                  <div className="mb-1">
                    <label className="form-label">Rol</label>
                    <select
                      name="rol"
                      className="form-select"
                      value={form.rol}
                      onChange={handleChange}
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="trabajador">Trabajador</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setMostrarForm(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {form.id ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudUsuarios;