import { useState, useEffect } from "react";
import api from "../../services/api";

const POR_PAGINA = 5;
const STOCK_MINIMO = 10; // Bajo stock: menor o igual a este valor

const formVacio = {
  id: null,
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  categoriaId: "",
  proveedorId: "",
};

const CrudProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(formVacio);

  useEffect(() => {
    obtenerProductos();
    obtenerCategorias();
    obtenerProveedores();
  }, []);

  const obtenerProductos = async () => {
    const response = await api.get("/productos");
    setProductos(response.data);
  };

  const obtenerCategorias = async () => {
    const response = await api.get("/categorias");
    setCategorias(response.data);
  };

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

  const handleEdit = (producto) => {
    setForm({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      stock: producto.stock,
      categoriaId: producto.categoriaId || "",
      proveedorId: producto.proveedorId || "",
    });
    setMostrarForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/productos/${form.id}`, form);
      } else {
        await api.post("/productos", form);
      }
      setForm(formVacio);
      setMostrarForm(false);
      obtenerProductos();
    } catch (error) {
      alert(error.response?.data?.error || "Error al guardar el producto");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      try {
        await api.delete(`/productos/${id}`);
        obtenerProductos();
      } catch (error) {
        alert(error.response?.data?.error || "No se pudo eliminar el producto");
      }
    }
  };

  // Búsqueda por producto, categoría o proveedor
  const filtrados = productos.filter((p) => {
    const texto = `${p.nombre} ${p.categoria?.nombre || ""} ${
      p.proveedor?.razon_social || ""
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
      <h3 className="fw-bold mb-4">Productos</h3>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por producto, categoría o proveedor..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
        />
        <button className="btn btn-primary text-nowrap" onClick={abrirNuevo}>
          + Nuevo Producto
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Lista de Productos</h6>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay productos para mostrar
                    </td>
                  </tr>
                )}
                {visibles.map((p) => (
                  <tr key={p.id}>
                    <td>{String(p.id).padStart(3, "0")}</td>
                    <td>
                      <div className="fw-semibold">{p.nombre}</div>
                      <small className="text-muted">{p.descripcion}</small>
                    </td>
                    <td>
                      {p.categoria ? (
                        <span className="badge bg-primary-subtle text-primary-emphasis">
                          {p.categoria.nombre}
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary-emphasis">
                          Sin categoría
                        </span>
                      )}
                    </td>
                    <td>{p.proveedor?.razon_social || "Sin proveedor"}</td>
                    <td>S/ {Number(p.precio).toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.stock <= STOCK_MINIMO
                            ? "bg-danger-subtle text-danger-emphasis"
                            : "bg-success-subtle text-success-emphasis"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
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
              Mostrando {desde}-{hasta} de {filtrados.length} productos
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

      {/* Ventana: Nuevo / Editar producto */}
      {mostrarForm && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {form.id ? "Editar Producto" : "Nuevo Producto"}
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
                    <label className="form-label">Descripción</label>
                    <input
                      type="text"
                      name="descripcion"
                      className="form-control"
                      value={form.descripcion}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Categoría</label>
                      <select
                        name="categoriaId"
                        className="form-select"
                        value={form.categoriaId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Proveedor</label>
                      <select
                        name="proveedorId"
                        className="form-select"
                        value={form.proveedorId}
                        onChange={handleChange}
                      >
                        <option value="">Seleccione...</option>
                        {proveedores.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.razon_social}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-1">
                      <label className="form-label">Precio (S/)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="precio"
                        className="form-control"
                        value={form.precio}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-1">
                      <label className="form-label">Stock</label>
                      <input
                        type="number"
                        name="stock"
                        className="form-control"
                        value={form.stock}
                        onChange={handleChange}
                        disabled={!!form.id}
                        required={!form.id}
                      />
                      {form.id && (
                        <small className="text-muted">
                          El stock se modifica desde Kardex
                        </small>
                      )}
                    </div>
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

export default CrudProductos;