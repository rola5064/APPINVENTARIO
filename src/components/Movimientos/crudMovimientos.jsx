import { useState, useEffect } from "react";
import api from "../../services/api";

const POR_PAGINA = 5;

const getUsuarioActual = () =>
  JSON.parse(localStorage.getItem("usuario") || "null");

// El usuario de la sesión viene seleccionado por defecto
const formVacio = () => ({
  productoId: "",
  usuarioId: getUsuarioActual()?.id || "",
  tipo_movimiento: "Entrada",
  cantidad: "",
  observaciones: "",
});

const estiloTipo = {
  Entrada: "bg-success-subtle text-success-emphasis",
  Salida: "bg-danger-subtle text-danger-emphasis",
  Ajuste: "bg-warning-subtle text-warning-emphasis",
};

const colorCantidad = {
  Entrada: "text-success",
  Salida: "text-danger",
  Ajuste: "text-warning",
};

const formatoCantidad = (m) => {
  if (m.tipo_movimiento === "Entrada") return `+ ${m.cantidad}`;
  if (m.tipo_movimiento === "Salida") return `- ${m.cantidad}`;
  return `= ${m.cantidad}`;
};

const formatoFecha = (fecha) =>
  new Date(fecha).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const CrudMovimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [form, setForm] = useState(formVacio);

  useEffect(() => {
    obtenerMovimientos();
    obtenerProductos();
    obtenerUsuarios();
  }, []);

  const obtenerMovimientos = async () => {
    const response = await api.get("/movimientos");
    setMovimientos(response.data);
  };

  const obtenerProductos = async () => {
    const response = await api.get("/productos");
    setProductos(response.data);
  };

  const obtenerUsuarios = async () => {
    const response = await api.get("/usuarios");
    setUsuarios(response.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/movimientos", form);
      setForm(formVacio());
      setMostrarForm(false);
      setPagina(1);
      obtenerMovimientos();
      obtenerProductos();
    } catch (error) {
      alert(error.response?.data?.error || "Error al registrar el movimiento");
    }
  };

  // Búsqueda por producto, tipo o usuario
  const filtrados = movimientos.filter((m) => {
    const texto = `${m.producto?.nombre || ""} ${m.tipo_movimiento} ${
      m.usuario?.nombre || ""
    }`.toLowerCase();
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
      <h3 className="fw-bold mb-4">Kardex / Movimientos</h3>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por producto, tipo o usuario..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
        />
        <button
          className="btn btn-primary text-nowrap"
          onClick={() => setMostrarForm(true)}
        >
          + Registrar Movimiento
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Lista de Movimientos (Kardex)</h6>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha / Hora</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay movimientos para mostrar
                    </td>
                  </tr>
                )}
                {visibles.map((m) => (
                  <tr key={m.id}>
                    <td>{String(m.id).padStart(3, "0")}</td>
                    <td>{formatoFecha(m.fecha_hora)}</td>
                    <td>{m.producto?.nombre}</td>
                    <td>
                      <span className={`badge ${estiloTipo[m.tipo_movimiento]}`}>
                        {m.tipo_movimiento}
                      </span>
                    </td>
                    <td className={`fw-semibold ${colorCantidad[m.tipo_movimiento]}`}>
                      {formatoCantidad(m)}
                    </td>
                    <td>{m.usuario?.nombre}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setDetalle(m)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              Mostrando {desde}-{hasta} de {filtrados.length} movimientos
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

      {/* Ventana: Registrar movimiento */}
      {mostrarForm && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Registrar Movimiento</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMostrarForm(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Producto</label>
                    <select
                      name="productoId"
                      className="form-select"
                      value={form.productoId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione...</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} (stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tipo de movimiento</label>
                      <select
                        name="tipo_movimiento"
                        className="form-select"
                        value={form.tipo_movimiento}
                        onChange={handleChange}
                      >
                        <option value="Entrada">Entrada</option>
                        <option value="Salida">Salida</option>
                        <option value="Ajuste">Ajuste</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        name="cantidad"
                        className="form-control"
                        value={form.cantidad}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Usuario</label>
                    <select
                      name="usuarioId"
                      className="form-select"
                      value={form.usuarioId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione...</option>
                      {usuarios.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-1">
                    <label className="form-label">Observaciones</label>
                    <input
                      type="text"
                      name="observaciones"
                      className="form-control"
                      value={form.observaciones}
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
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ventana: Detalle del movimiento */}
      {detalle && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Movimiento {String(detalle.id).padStart(3, "0")}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDetalle(null)}
                ></button>
              </div>

              <div className="modal-body">
                <dl className="row mb-0">
                  <dt className="col-4">Fecha / Hora</dt>
                  <dd className="col-8">{formatoFecha(detalle.fecha_hora)}</dd>

                  <dt className="col-4">Producto</dt>
                  <dd className="col-8">{detalle.producto?.nombre}</dd>

                  <dt className="col-4">Tipo</dt>
                  <dd className="col-8">
                    <span className={`badge ${estiloTipo[detalle.tipo_movimiento]}`}>
                      {detalle.tipo_movimiento}
                    </span>
                  </dd>

                  <dt className="col-4">Cantidad</dt>
                  <dd className="col-8">{formatoCantidad(detalle)}</dd>

                  <dt className="col-4">Usuario</dt>
                  <dd className="col-8">{detalle.usuario?.nombre}</dd>

                  <dt className="col-4">Observaciones</dt>
                  <dd className="col-8 mb-0">
                    {detalle.observaciones || "Sin observaciones"}
                  </dd>
                </dl>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setDetalle(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudMovimientos;