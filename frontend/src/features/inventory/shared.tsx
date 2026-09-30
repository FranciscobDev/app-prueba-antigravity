import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { MovementType, RequestStatus, StockRequest } from "../../types/inventory";
import { useInventory } from "./store";
import { colors } from "../../theme/colors";

export function KindTag({ kind }: { kind: MovementType }) {
  const stylesByKind = {
    Entrada: { bg: colors.successLight, text: colors.success, border: colors.successBorder },
    Salida: { bg: colors.primaryLight, text: colors.primary, border: colors.primaryBorder },
    Merma: { bg: colors.warningLight, text: colors.warning, border: colors.warningBorder },
  }[kind];

  return (
    <View style={[styles.kindTag, { backgroundColor: stylesByKind.bg, borderColor: stylesByKind.border }]}>
      <Text style={[styles.kindText, { color: stylesByKind.text }]}>{kind}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, { bg: string; text: string }> = {
    Pendiente: { bg: colors.warningLight, text: colors.warning },
    "Por despachar": { bg: colors.primaryLight, text: colors.primary },
    Completada: { bg: colors.successLight, text: colors.success },
    Rechazada: { bg: colors.dangerLight, text: colors.danger },
  };

  const current = map[status] || { bg: colors.borderLight, text: colors.textMuted };

  return (
    <View style={[styles.badge, { backgroundColor: current.bg }]}>
      <Text style={[styles.badgeText, { color: current.text }]}>{status}</Text>
    </View>
  );
}

export function ItemsList({ request }: { request: StockRequest }) {
  const { productName } = useInventory();
  return (
    <View style={styles.itemsList}>
      {request.items.map((item) => (
        <View key={item.sku} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{productName(item.sku)}</Text>
            <Text style={styles.itemSku}>{item.sku}</Text>
          </View>
          <Text style={styles.itemQty}>{item.quantity} uds.</Text>
        </View>
      ))}
    </View>
  );
}

export function EmptyBlock({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {typeof children === "string" ? (
        <Text style={styles.emptyText}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export function RequestsTable({ rows }: { rows: StockRequest[] }) {
  const { productName, projects } = useInventory();
  if (!rows.length) {
    return <Text style={styles.emptyInline}>Aún no hay solicitudes.</Text>;
  }

  return (
    <View style={styles.cardsList}>
      {rows.map((r) => {
        const project = projects.find((p) => p.id === r.projectId);
        return (
          <View key={r.id} style={styles.reqCard}>
            <View style={styles.reqHeader}>
              <View style={styles.reqIdRow}>
                <Text style={styles.reqId}>{r.id}</Text>
                <KindTag kind={r.kind} />
              </View>
              <StatusBadge status={r.status} />
            </View>

            <Text style={styles.reqDate}>{r.createdAt}</Text>

            <View style={styles.reqBody}>
              {r.items.map((i) => (
                <Text key={i.sku} style={styles.reqItemLine}>
                  • {productName(i.sku)} <Text style={styles.bold}>× {i.quantity}</Text>
                </Text>
              ))}
              {project && (
                <Text style={styles.reqProject}>Proyecto: {project.name}</Text>
              )}
              {r.invoice && (
                <Text style={styles.reqInvoice}>
                  Factura {r.invoice.number} ({r.invoice.supplier})
                </Text>
              )}
            </View>

            {r.decidedBy && (
              <View style={styles.decisionBox}>
                <Text style={styles.decisionAuthor}>
                  {r.status === "Completada" ? "Autorizado por: " : "Decidido por: "}
                  {r.decidedBy}
                </Text>
                {r.decisionNote ? (
                  <Text style={styles.decisionNote}>"{r.decisionNote}"</Text>
                ) : null}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  kindTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  kindText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  itemsList: {
    gap: 8,
    marginVertical: 6,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  itemSku: {
    fontSize: 11,
    color: colors.textMuted,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    marginBottom: 8,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
  emptyInline: {
    padding: 16,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 13,
  },
  cardsList: {
    gap: 10,
  },
  reqCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reqIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reqId: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  reqDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 6,
  },
  reqBody: {
    gap: 3,
    marginVertical: 4,
  },
  reqItemLine: {
    fontSize: 13,
    color: colors.text,
  },
  bold: {
    fontWeight: "700",
  },
  reqProject: {
    fontSize: 12,
    color: colors.primaryDark,
    marginTop: 2,
  },
  reqInvoice: {
    fontSize: 12,
    color: colors.teal,
    marginTop: 2,
  },
  decisionBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  decisionAuthor: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  decisionNote: {
    fontSize: 11,
    color: colors.text,
    fontStyle: "italic",
    marginTop: 2,
  },
});
