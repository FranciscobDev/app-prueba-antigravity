export type Role = "Administrador" | "Bodeguero" | "Técnico";

export type MovementType = "Entrada" | "Salida" | "Merma";

export type Category = "Repuestos" | "Consumibles" | "Herramientas" | "Protección";

export type Product = {
  sku: string;
  name: string;
  category: Category;
  unit: string;
  stock: number;
  min: number;
  cost: number;
  location: string;
};

export type Movement = {
  id: string;
  date: string;
  time: string;
  product: string;
  sku: string;
  type: MovementType;
  quantity: number;
  balance: number;
  responsible: string;
  authorizedBy: string;
  reference: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  status: "Activo" | "Cerrado";
};

export type Invoice = {
  number: string;
  supplier: string;
  date: string;
  amount: number;
  fileName: string;
};

export type RequestStatus = "Pendiente" | "Por despachar" | "Completada" | "Rechazada";

export type StockRequest = {
  id: string;
  kind: MovementType;
  origin: Role;
  items: { sku: string; quantity: number }[];
  projectId?: string;
  invoice?: Invoice;
  reason?: string;
  requestedBy: string;
  createdAt: string;
  status: RequestStatus;
  decidedBy?: string;
  decidedAt?: string;
  decisionNote?: string;
};
