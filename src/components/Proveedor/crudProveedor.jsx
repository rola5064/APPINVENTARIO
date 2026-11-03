import { useState, useEffect } from "react";
import api from "../../services/api";

const POR_PAGINA = 5;

const formVacio = {
  id: null,
  razon_social: "",
  contacto: "",
  telefono: "",
  email: "",
};

const CrudProveedor = () => {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(formVacio);

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const obtenerProveedores = async () => {
    const response = await api.get("/proveedores");
    setProveedores(response.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const abrirNuevo = () => {
    setForm(formVacio);
    setMostrarForm(true);
  };

  const handleEdit = (p) => {
    setForm({
      id: p.id,
      razon_social: p.razon_social,
      contacto: p.contacto || "",
      telefono: p.telefono || "",
      email: p.email || "",
    });
    setMostrarForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/proveedores/${form.id}`, form);
      } else {
        await api.post("/proveedores", form);
      }
      setForm(formVacio);
      setMostrarForm(false);
      obtenerProveedores();
    } catch (error) {
      alert(error.response?.data?.error || "Error al guardar el proveedor");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este proveedor?")) {
      try {
        await api.delete(`/proveedores/${id}`);
        obtenerProveedores();
      } catch (error) {
        alert(error.response?.data?.error || "No se pudo eliminar el proveedor");
      }
    }
  };

  // Búsqueda por razón social, contacto o email
  const filtrados = proveedores.filter((p) => {
    const texto = `${p.razon_social} ${p.contacto || ""} ${p.email || ""}`.toLowerCase();
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
      <h3 className="fw-bold mb-4">Proveedores</h3>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por razón social, contacto o email..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
        />
        <button className="btn btn-primary text-nowrap" onClick={abrirNuevo}>
          + Nuevo Proveedor
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Lista de Proveedores</h6>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Razón social</th>
                  <th>Contacto</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No hay proveedores para mostrar
                    </td>
                  </tr>
                )}
                {visibles.map((p) => (
                  <tr key={p.id}>
                    <td>{String(p.id).padStart(3, "0")}</td>
                    <td className="fw-semibold">{p.razon_social}</td>
                    <td>{p.contacto}</td>
                    <td>{p.telefono}</td>
                    <td>{p.email}</td>
                    <td className="text-nowrap">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => handleEdit(p)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(p.id)}
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
              Mostrando {desde}-{hasta} de {filtrados.length} proveedores
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

      {/* Ventana: Nuevo / Editar proveedor */}
      {mostrarForm && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {form.id ? "Editar Proveedor" : "Nuevo Proveedor"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMostrarForm(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Razón social</label>
                    <input
                      type="text"
                      name="razon_social"
                      className="form-control"
                      value={form.razon_social}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contacto</label>
                      <input
                        type="text"
                        name="contacto"
                        className="form-control"
                        value={form.contacto}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="text"
                        name="telefono"
                        className="form-control"
                        value={form.telefono}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-1">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                    />
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

export default CrudProveedor;