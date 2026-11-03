import { useState, useEffect } from "react";
import api from "../../services/api";
import "./Dashboard.css";

const STOCK_MINIMO = 10; // Bajo stock: menor o igual a este valor
const COLORES = ["#4f7cff", "#ff9f43", "#2ecc9a", "#a55eea", "#ff5e8a", "#f7c948", "#4bcffa", "#8395a7"];

const Dashboard = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const [prod, cat, prov, mov] = await Promise.all([
        api.get("/productos"),
        api.get("/categorias"),
        api.get("/proveedores"),
        api.get("/movimientos"),
      ]);
      setProductos(prod.data);
      setCategorias(cat.data);
      setProveedores(prov.data);
      setMovimientos(mov.data);
    };
    cargarDatos();
  }, []);

  const bajoStock = productos.filter((p) => p.stock <= STOCK_MINIMO);

  // Stock total agrupado por categoría
  const stockPorCategoria = Object.values(
    productos.reduce((acc, p) => {
      const nombre = p.categoria?.nombre || "Sin categoría";
      acc[nombre] = acc[nombre] || { nombre, total: 0 };
      acc[nombre].total += p.stock;
      return acc;
    }, {})
  );

  const totalStock = stockPorCategoria.reduce((s, c) => s + c.total, 0);

  let acumulado = 0;
  const segmentos = stockPorCategoria.map((c, i) => {
    const inicio = (acumulado / totalStock) * 100;
    acumulado += c.total;
    const fin = (acumulado / totalStock) * 100;
    return `${COLORES[i % COLORES.length]} ${inicio}% ${fin}%`;
  });

  const gradiente =
    totalStock > 0 ? `conic-gradient(${segmentos.join(", ")})` : "#e5e7eb";

  const tarjetas = [
    { titulo: "Total Productos", valor: productos.length, icono: "bi-box-seam", color: "#4f7cff", fondo: "#e8eeff" },
    { titulo: "Categorías", valor: categorias.length, icono: "bi-folder", color: "#2ecc9a", fondo: "#e3f8f1" },
    { titulo: "Proveedores", valor: proveedores.length, icono: "bi-people", color: "#a55eea", fondo: "#f1e8fc" },
    { titulo: "Bajo Stock (Alertas)", valor: bajoStock.length, icono: "bi-exclamation-triangle", color: "#dc3545", fondo: "#fdecee", rojo: true },
  ];

  const formatoCantidad = (m) => {
    if (m.tipo_movimiento === "Entrada") return `+${m.cantidad}`;
    if (m.tipo_movimiento === "Salida") return `-${m.cantidad}`;
    return `=${m.cantidad}`;
  };

  const claseTipo = (tipo) => {
    if (tipo === "Entrada") return "text-success";
    if (tipo === "Salida") return "text-danger";
    return "text-warning";
  };

  return (
    <div>
      <h4 className="dash-titulo">Dashboard</h4>

      <div className="kpi-grid">
        {tarjetas.map((t) => (
          <div className="kpi-card" key={t.titulo}>
            <div>
              <div className="kpi-label">{t.titulo}</div>
              <div className="kpi-value" style={{ color: t.rojo ? t.color : "#1f2937" }}>
                {t.valor}
              </div>
            </div>
            <div className="kpi-icon" style={{ background: t.fondo, color: t.color }}>
              <i className={`bi ${t.icono}`}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-title">Movimientos Recientes (Kardex)</div>
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-muted">
                    Aún no hay movimientos
                  </td>
                </tr>
              )}
              {movimientos.slice(0, 6).map((m) => (
                <tr key={m.id}>
                  <td>
                    {new Date(m.fecha_hora).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>{m.producto?.nombre}</td>
                  <td className={claseTipo(m.tipo_movimiento)}>{m.tipo_movimiento}</td>
                  <td className={claseTipo(m.tipo_movimiento)}>{formatoCantidad(m)}</td>
                  <td>{m.usuario?.nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-title">Stock por Categoría</div>
          <div className="donut-wrap">
            <div className="donut" style={{ background: gradiente }}></div>
          </div>
          <ul className="leyenda">
            {stockPorCategoria.map((c, i) => (
              <li key={c.nombre}>
                <span
                  className="punto"
                  style={{ background: COLORES[i % COLORES.length] }}
                ></span>
                {c.nombre}
                <strong>{c.total}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {bajoStock.length > 0 && (
        <div className="panel mt-4">
          <div className="panel-title">Productos con bajo stock (≤ {STOCK_MINIMO})</div>
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {bajoStock.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.categoria?.nombre || "Sin categoría"}</td>
                  <td>
                    <span className="badge text-bg-danger">{p.stock}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;