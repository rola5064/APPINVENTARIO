import { useState } from "react";
import api from "../../services/api";
import { getStockMinimo, setStockMinimo } from "../../utils/config";

const passVacio = { passwordActual: "", passwordNueva: "", confirmar: "" };

const Aviso = ({ mensaje }) =>
  mensaje ? (
    <div className={`alert alert-${mensaje.tipo} py-2 mt-3 mb-0`}>
      {mensaje.texto}
    </div>
  ) : null;

const Configuracion = ({ usuario, onActualizar }) => {
  const [nombre, setNombre] = useState(usuario.nombre);
  const [msgPerfil, setMsgPerfil] = useState(null);

  const [pass, setPass] = useState(passVacio);
  const [msgPass, setMsgPass] = useState(null);

  const [stockMin, setStockMin] = useState(getStockMinimo());
  const [msgStock, setMsgStock] = useState(null);

  const guardarPerfil = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/perfil", { nombre });
      const actualizado = { ...usuario, nombre: response.data.nombre };
      localStorage.setItem("usuario", JSON.stringify(actualizado));
      onActualizar(actualizado);
      setMsgPerfil({ tipo: "success", texto: "Perfil actualizado correctamente" });
    } catch (error) {
      setMsgPerfil({
        tipo: "danger",
        texto: error.response?.data?.error || "No se pudo actualizar el perfil",
      });
    }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();
    if (pass.passwordNueva !== pass.confirmar) {
      setMsgPass({ tipo: "danger", texto: "Las contraseñas nuevas no coinciden" });
      return;
    }
    try {
      await api.put("/perfil/password", {
        passwordActual: pass.passwordActual,
        passwordNueva: pass.passwordNueva,
      });
      setPass(passVacio);
      setMsgPass({ tipo: "success", texto: "Contraseña actualizada correctamente" });
    } catch (error) {
      setMsgPass({
        tipo: "danger",
        texto: error.response?.data?.error || "No se pudo cambiar la contraseña",
      });
    }
  };

  const guardarStock = (e) => {
    e.preventDefault();
    const valor = parseInt(stockMin);
    if (!valor || valor < 1) {
      setMsgStock({ tipo: "danger", texto: "Ingresa un número mayor a 0" });
      return;
    }
    setStockMinimo(valor);
    setMsgStock({ tipo: "success", texto: "Parámetro guardado" });
  };

  return (
    <div>
      <h3 className="fw-bold mb-4">Configuración</h3>

      <div className="row">
        {/* Mi perfil */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Mi perfil</h6>
              <form onSubmit={guardarPerfil}>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={usuario.email || ""}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Rol</label>
                  <input
                    type="text"
                    className="form-control"
                    value={usuario.rol}
                    disabled
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Guardar cambios
                </button>
                <Aviso mensaje={msgPerfil} />
              </form>
            </div>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Cambiar contraseña</h6>
              <form onSubmit={cambiarPassword}>
                <div className="mb-3">
                  <label className="form-label">Contraseña actual</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pass.passwordActual}
                    onChange={(e) =>
                      setPass({ ...pass, passwordActual: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nueva contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pass.passwordNueva}
                    onChange={(e) =>
                      setPass({ ...pass, passwordNueva: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pass.confirmar}
                    onChange={(e) => setPass({ ...pass, confirmar: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Actualizar contraseña
                </button>
                <Aviso mensaje={msgPass} />
              </form>
            </div>
          </div>
        </div>

        {/* Parámetros del inventario */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Parámetros del inventario</h6>
              <form onSubmit={guardarStock}>
                <div className="mb-3">
                  <label className="form-label">Stock mínimo (alerta de bajo stock)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={stockMin}
                    onChange={(e) => setStockMin(e.target.value)}
                    required
                  />
                  <small className="text-muted">
                    Los productos con este stock o menos se marcan en rojo.
                  </small>
                </div>
                <button type="submit" className="btn btn-primary">
                  Guardar
                </button>
                <Aviso mensaje={msgStock} />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;