import type {
  Category,
  Movement,
  Product,
  Project,
  Role,
  StockRequest,
} from "../types/inventory";

export const stockTrend = [46, 58, 51, 65, 61, 73, 68, 78, 75, 87, 83, 92];

export const userNames: Record<Role, string> = {
  Administrador: "Roberto Méndez",
  Bodeguero: "Marta Rojas",
  Técnico: "Carlos Silva",
};

export const categoryColors: Record<Category, string> = {
  Repuestos: "#6366F1",
  Consumibles: "#14B8A6",
  Herramientas: "#F59E0B",
  Protección: "#8B5CF6",
};

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export const fmtDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const fmtTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmtDate(d);
};
export const money = (n: number) =>
  n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

export const initialProducts: Product[] = [
  { sku: "ROD-6205", name: "Rodamiento industrial 6205", category: "Repuestos", unit: "un.", stock: 148, min: 40, cost: 18.5, location: "A-01" },
  { sku: "FIL-HF10", name: "Filtro hidráulico HF-10", category: "Repuestos", unit: "un.", stock: 22, min: 25, cost: 46, location: "A-03" },
  { sku: "COR-A42", name: "Correa de transmisión A-42", category: "Repuestos", unit: "un.", stock: 64, min: 20, cost: 12.8, location: "A-04" },
  { sku: "VAL-SL24", name: "Válvula solenoide 24 V", category: "Repuestos", unit: "un.", stock: 14, min: 12, cost: 89, location: "A-06" },
  { sku: "ACE-ISO68", name: "Aceite sintético ISO 68 (20 L)", category: "Consumibles", unit: "bidón", stock: 35, min: 15, cost: 112, location: "B-02" },
  { sku: "GRA-LT03", name: "Grasa de litio EP2", category: "Consumibles", unit: "cartucho", stock: 58, min: 20, cost: 6.4, location: "B-03" },
  { sku: "CAB-12AW", name: "Cable eléctrico 12 AWG", category: "Consumibles", unit: "rollo", stock: 27, min: 10, cost: 54, location: "B-05" },
  { sku: "CIN-AI33", name: "Cinta aislante industrial", category: "Consumibles", unit: "rollo", stock: 18, min: 30, cost: 2.2, location: "B-06" },
  { sku: "HER-LT17", name: 'Llave de torque 1/2"', category: "Herramientas", unit: "un.", stock: 6, min: 4, cost: 138, location: "C-01" },
  { sku: "HER-MT05", name: "Multímetro digital", category: "Herramientas", unit: "un.", stock: 11, min: 5, cost: 72, location: "C-02" },
  { sku: "EPP-GT02", name: "Guantes de protección térmica", category: "Protección", unit: "par", stock: 9, min: 20, cost: 14.5, location: "D-01" },
  { sku: "EPP-CS01", name: "Casco de seguridad clase E", category: "Protección", unit: "un.", stock: 42, min: 15, cost: 21, location: "D-02" },
];

export const initialProjects: Project[] = [
  { id: "PRJ-012", name: "Mantención línea de empaque 2", description: "Cambio preventivo de correas, rodamientos y lubricación general.", createdBy: "Carlos Silva", createdAt: daysAgo(9), status: "Activo" },
  { id: "PRJ-014", name: "Cambio de bombas planta norte", description: "Reemplazo de dos bombas hidráulicas y su cableado de control.", createdBy: "Carlos Silva", createdAt: daysAgo(4), status: "Activo" },
  { id: "PRJ-015", name: "Revisión eléctrica bodega 3", description: "Inspección de tableros y reemplazo de cableado dañado.", createdBy: "Diego Mora", createdAt: daysAgo(2), status: "Activo" },
];

export const initialMovements: Movement[] = [
  { id: "MOV-1048", date: daysAgo(0), time: "10:42", product: "Rodamiento industrial 6205", sku: "ROD-6205", type: "Entrada", quantity: 48, balance: 148, responsible: "Marta Rojas", authorizedBy: "Roberto Méndez", reference: "REQ-0301" },
  { id: "MOV-1047", date: daysAgo(0), time: "09:18", product: "Filtro hidráulico HF-10", sku: "FIL-HF10", type: "Salida", quantity: 12, balance: 22, responsible: "Marta Rojas", authorizedBy: "Roberto Méndez", reference: "REQ-0300" },
  { id: "MOV-1046", date: daysAgo(1), time: "16:35", product: "Correa de transmisión A-42", sku: "COR-A42", type: "Entrada", quantity: 30, balance: 64, responsible: "Marta Rojas", authorizedBy: "Roberto Méndez", reference: "REQ-0299" },
  { id: "MOV-1045", date: daysAgo(1), time: "14:20", product: "Aceite sintético ISO 68 (20 L)", sku: "ACE-ISO68", type: "Salida", quantity: 8, balance: 35, responsible: "Marta Rojas", authorizedBy: "Roberto Méndez", reference: "REQ-0298" },
  { id: "MOV-1044", date: daysAgo(2), time: "11:06", product: "Guantes de protección térmica", sku: "EPP-GT02", type: "Merma", quantity: 4, balance: 9, responsible: "Marta Rojas", authorizedBy: "Roberto Méndez", reference: "REQ-0297" },
];

export const initialRequests: StockRequest[] = [
  {
    id: "REQ-0305", kind: "Entrada", origin: "Bodeguero", requestedBy: "Marta Rojas", createdAt: `${daysAgo(0)} · 11:05`, status: "Pendiente",
    items: [{ sku: "FIL-HF10", quantity: 40 }],
    invoice: { number: "F-88214", supplier: "Hidrosur SpA", date: daysAgo(1), amount: 1840, fileName: "factura-F-88214.pdf" },
  },
  {
    id: "REQ-0304", kind: "Merma", origin: "Bodeguero", requestedBy: "Marta Rojas", createdAt: `${daysAgo(0)} · 10:20`, status: "Pendiente",
    items: [{ sku: "ACE-ISO68", quantity: 2 }],
    reason: "Daño: bidones golpeados durante el traslado interno, con derrame parcial.",
  },
  {
    id: "REQ-0303", kind: "Salida", origin: "Bodeguero", requestedBy: "Marta Rojas", createdAt: `${daysAgo(0)} · 09:40`, status: "Pendiente",
    items: [{ sku: "EPP-CS01", quantity: 6 }], projectId: "PRJ-014",
    reason: "Cascos para el equipo externo que trabajará en la planta norte.",
  },
  {
    id: "REQ-0302", kind: "Salida", origin: "Técnico", requestedBy: "Carlos Silva", createdAt: `${daysAgo(0)} · 08:52`, status: "Pendiente",
    items: [{ sku: "COR-A42", quantity: 4 }, { sku: "ROD-6205", quantity: 8 }], projectId: "PRJ-012",
    reason: "Repuestos para el cambio preventivo programado del viernes.",
  },
  {
    id: "REQ-0301", kind: "Salida", origin: "Técnico", requestedBy: "Diego Mora", createdAt: `${daysAgo(1)} · 15:10`, status: "Por despachar",
    items: [{ sku: "CAB-12AW", quantity: 3 }, { sku: "CIN-AI33", quantity: 5 }], projectId: "PRJ-015",
    decidedBy: "Roberto Méndez", decidedAt: `${daysAgo(1)} · 16:00`, decisionNote: "Autorizado. Retirar en bodega.",
  },
  {
    id: "REQ-0296", kind: "Entrada", origin: "Bodeguero", requestedBy: "Marta Rojas", createdAt: `${daysAgo(3)} · 12:15`, status: "Rechazada",
    items: [{ sku: "HER-MT05", quantity: 10 }],
    invoice: { number: "F-77102", supplier: "Electro Andes", date: daysAgo(4), amount: 720, fileName: "factura-F-77102.jpg" },
    decidedBy: "Roberto Méndez", decidedAt: `${daysAgo(3)} · 13:00`, decisionNote: "La factura no coincide con la orden de compra.",
  },
];
