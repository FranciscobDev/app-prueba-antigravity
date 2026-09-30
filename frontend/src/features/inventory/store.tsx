import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  fmtDate,
  fmtTime,
  initialMovements,
  initialProducts,
  initialProjects,
  initialRequests,
} from "../../data/inventory";
import type { Movement, Product, Project, StockRequest } from "../../types/inventory";

type State = {
  products: Product[];
  movements: Movement[];
  projects: Project[];
  requests: StockRequest[];
};

export type NewRequest = Pick<
  StockRequest,
  "kind" | "origin" | "items" | "projectId" | "invoice" | "reason" | "requestedBy"
>;

type Store = State & {
  submitRequest: (request: NewRequest) => string;
  decide: (id: string, approve: boolean, by: string, note?: string) => void;
  dispatch: (id: string, by: string) => void;
  createProject: (input: { name: string; description: string; createdBy: string }) => Project;
  shortage: (request: StockRequest) => string | null;
  productName: (sku: string) => string;
};

const StoreContext = createContext<Store | null>(null);

const stamp = () => {
  const now = new Date();
  return `${fmtDate(now)} · ${fmtTime(now)}`;
};

function execute(state: State, request: StockRequest, authorizedBy: string): State {
  const now = new Date();
  const sign = request.kind === "Entrada" ? 1 : -1;
  const products = state.products.map((p) => ({ ...p }));
  const created: Movement[] = [];
  let counter = 1000 + state.movements.length + 1;

  request.items.forEach((item) => {
    const product = products.find((p) => p.sku === item.sku);
    if (!product) return;
    product.stock += sign * item.quantity;
    created.unshift({
      id: `MOV-${counter++}`,
      date: fmtDate(now),
      time: fmtTime(now),
      product: product.name,
      sku: product.sku,
      type: request.kind,
      quantity: item.quantity,
      balance: product.stock,
      responsible: request.origin === "Técnico" ? "Marta Rojas" : request.requestedBy,
      authorizedBy,
      reference: request.id,
    });
  });

  return { ...state, products, movements: [...created, ...state.movements] };
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    products: initialProducts,
    movements: initialMovements,
    projects: initialProjects,
    requests: initialRequests,
  });

  const shortage = useCallback(
    (request: StockRequest) => {
      if (request.kind === "Entrada") return null;
      for (const item of request.items) {
        const product = state.products.find((p) => p.sku === item.sku);
        if (!product || product.stock < item.quantity) {
          return `Stock insuficiente de ${product?.name ?? item.sku}: hay ${product?.stock ?? 0} y se piden ${item.quantity}.`;
        }
      }
      return null;
    },
    [state.products],
  );

  const value = useMemo<Store>(
    () => ({
      ...state,
      shortage,
      productName: (sku) => state.products.find((p) => p.sku === sku)?.name ?? sku,
      submitRequest: (request) => {
        const id = `REQ-0${306 + state.requests.length - initialRequests.length}`;
        setState((s) => ({
          ...s,
          requests: [{ ...request, id, status: "Pendiente", createdAt: stamp() }, ...s.requests],
        }));
        return id;
      },
      decide: (id, approve, by, note) =>
        setState((s) => {
          const request = s.requests.find((r) => r.id === id);
          if (!request || request.status !== "Pendiente") return s;
          const decision = { decidedBy: by, decidedAt: stamp(), decisionNote: note };
          const updateWith = (status: StockRequest["status"], base: State): State => ({
            ...base,
            requests: base.requests.map((r) => (r.id === id ? { ...r, ...decision, status } : r)),
          });
          if (!approve) return updateWith("Rechazada", s);
          if (request.origin === "Técnico") return updateWith("Por despachar", s);
          return updateWith("Completada", execute(s, request, by));
        }),
      dispatch: (id, by) =>
        setState((s) => {
          const request = s.requests.find((r) => r.id === id);
          if (!request || request.status !== "Por despachar") return s;
          const next = execute(s, request, request.decidedBy ?? by);
          return {
            ...next,
            requests: next.requests.map((r) => (r.id === id ? { ...r, status: "Completada" } : r)),
          };
        }),
      createProject: ({ name, description, createdBy }) => {
        const project: Project = {
          id: `PRJ-0${16 + state.projects.length - initialProjects.length}`,
          name,
          description,
          createdBy,
          createdAt: fmtDate(new Date()),
          status: "Activo",
        };
        setState((s) => ({ ...s, projects: [project, ...s.projects] }));
        return project;
      },
    }),
    [state, shortage],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useInventory() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useInventory debe usarse dentro de InventoryProvider");
  return store;
}
