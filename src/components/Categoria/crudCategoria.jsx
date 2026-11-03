import { useState, useEffect } from "react";
import api from "../../services/api";

const POR_PAGINA = 5;

const formVacio = { id: null, nombre: "", descripcion: "" };

const CrudCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(formVacio);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    const response = await api.get("/categorias");
    setCategorias(response.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const abrirNueva = () => {
    setForm(formVacio);
    setMostrarForm(true);
  };

  const handleEdit = (categoria) => {
    setForm({
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
    });
    setMostrarForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/categorias/${form.id}`, form);
      } else {
        await api.post("/categorias", form);
      }
      setForm(formVacio);
      setMostrarForm(false);
      obtenerCategorias();
    } catch (error) {
      alert(error.response?.data?.error || "Error al guardar la categoría");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta categoría?")) {
      try {
        await api.delete(`/categorias/${id}`);
        obtenerCategorias();
      } catch (error) {
        alert(error.response?.data?.error || "No se pudo eliminar la categoría");
      }
    }
  };

  // Búsqueda por nombre o descripción
  const filtrados = categorias.filter((c) => {
    const texto = `${c.nombre} ${c.descripcion || ""}`.toLowerCase();
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
      <h3 className="fw-bold mb-4">Categorías</h3>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre o descripción..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
        />
        <button className="btn btn-primary text-nowrap" onClick={abrirNueva}>
          + Nueva Categoría
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Lista de Categorías</h6>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      No hay categorías para mostrar
                    </td>
                  </tr>
                )}
                {visibles.map((c) => (
                  <tr key={c.id}>
                    <td>{String(c.id).padStart(3, "0")}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary-emphasis">
                        {c.nombre}
                      </span>
                    </td>
                    <td>{c.descripcion}</td>
                    <td className="text-nowrap">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => handleEdit(c)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(c.id)}
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
              Mostrando {desde}-{hasta} de {filtrados.length} categorías
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

      {/* Ventana: Nueva / Editar categoría */}
      {mostrarForm && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {form.id ? "Editar Categoría" : "Nueva Categoría"}
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

                  <div className="mb-1">
                    <label className="form-label">Descripción</label>
                    <input
                      type="text"
                      name="descripcion"
                      className="form-control"
                      value={form.descripcion}
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

export default CrudCategorias;