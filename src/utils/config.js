// Stock mínimo para considerar un producto con "bajo stock"
export const getStockMinimo = () =>
  Number(localStorage.getItem("stockMinimo")) || 10;

export const setStockMinimo = (valor) =>
  localStorage.setItem("stockMinimo", String(valor));