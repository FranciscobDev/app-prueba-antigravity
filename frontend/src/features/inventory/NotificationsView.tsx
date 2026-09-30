import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { AppIcon } from "../../components/AppIcon";
import { userNames } from "../../data/inventory";
import type { StockRequest } from "../../types/inventory";
import { EmptyBlock, ItemsList, KindTag, StatusBadge } from "./shared";
import { useInventory } from "./store";
import { colors } from "../../theme/colors";

function RequestCard({
  request,
  onDone,
}: {
  request: StockRequest;
  onDone: (msg: string) => void;
}) {
  const { decide, shortage, projects } = useInventory();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const project = projects.find((p) => p.id === request.projectId);
  const problem = request.status === "Pendiente" ? shortage(request) : null;
  const admin = userNames.Administrador;
  const fromTech = request.origin === "Técnico";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <KindTag kind={request.kind} />
          <Text style={styles.cardId}>{request.id}</Text>
        </View>
        <Text style={styles.cardMeta}>{request.createdAt}</Text>
      </View>

      <Text style={styles.cardRequester}>
        Solicita: <Text style={styles.boldText}>{request.requestedBy}</Text> ({request.origin})
      </Text>

      <ItemsList request={request} />

      {request.invoice && (
        <View style={styles.invoiceBox}>
          <Text style={styles.invoiceTitle}>Datos de Factura</Text>
          <View style={styles.invoiceRow}>
            <Text style={styles.invLabel}>Factura:</Text>
            <Text style={styles.invValue}>{request.invoice.number}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invLabel}>Proveedor:</Text>
            <Text style={styles.invValue}>{request.invoice.supplier}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invLabel}>Monto:</Text>
            <Text style={styles.invValue}>${request.invoice.amount.toLocaleString("es-CL")}</Text>
          </View>
        </View>
      )}

      {project && (
        <View style={styles.projectRef}>
          <AppIcon name="folder" size={16} color={colors.primary} />
          <Text style={styles.projectRefText}>
            {project.id} · {project.name}
          </Text>
        </View>
      )}

      {request.reason ? (
        <Text style={styles.reasonText}>“{request.reason}”</Text>
      ) : null}

      {problem ? (
        <View style={styles.problemBox}>
          <AppIcon name="alert" size={16} color={colors.danger} />
          <Text style={styles.problemText}>{problem}</Text>
        </View>
      ) : null}

      {request.status === "Pendiente" ? (
        rejecting ? (
          <View style={styles.rejectContainer}>
            <Text style={styles.rejectLabel}>Motivo del rechazo:</Text>
            <TextInput
              style={styles.rejectInput}
              value={note}
              onChangeText={setNote}
              placeholder="Indica el motivo..."
              placeholderTextColor={colors.textLight}
              multiline
            />
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setRejecting(false)}
              >
                <Text style={styles.btnCancelText}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnDanger, !note.trim() && styles.btnDisabled]}
                disabled={!note.trim()}
                onPress={() => {
                  decide(request.id, false, admin, note.trim());
                  onDone(`Solicitud ${request.id} rechazada.`);
                }}
              >
                <Text style={styles.btnDangerText}>Confirmar rechazo</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.btn, styles.btnReject]}
              onPress={() => setRejecting(true)}
            >
              <AppIcon name="close" size={16} color={colors.danger} />
              <Text style={styles.btnRejectText}>Rechazar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnApprove,
                !!problem && styles.btnDisabled,
              ]}
              disabled={!!problem}
              onPress={() => {
                decide(
                  request.id,
                  true,
                  admin,
                  fromTech ? "Autorizado. Retirar en bodega." : undefined
                );
                onDone(
                  fromTech
                    ? `Solicitud ${request.id} autorizada y enviada a bodega.`
                    : `Solicitud ${request.id} autorizada y guardada en kardex.`
                );
              }}
            >
              <AppIcon
                name={fromTech ? "truck" : "check"}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.btnApproveText}>
                {fromTech ? "Autorizar y enviar" : "Autorizar"}
              </Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={styles.resultBox}>
          <StatusBadge status={request.status} />
          <Text style={styles.resultDetails}>
            {request.decidedBy} · {request.decidedAt}
            {request.decisionNote ? `\n"${request.decisionNote}"` : ""}
          </Text>
        </View>
      )}
    </View>
  );
}

export function NotificationsView({
  onNotify,
}: {
  onNotify: (msg: string) => void;
}) {
  const { requests } = useInventory();
  const [tab, setTab] = useState<"Pendientes" | "Historial">("Pendientes");

  const pending = requests.filter((r) => r.status === "Pendiente");
  const history = requests.filter((r) => r.status !== "Pendiente");
  const list = tab === "Pendientes" ? pending : history;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>CENTRO DE AUTORIZACIONES</Text>
        <Text style={styles.title}>Autorizaciones</Text>
        <Text style={styles.subtitle}>
          Todo movimiento requiere tu aprobación previa antes de alterar el inventario.
        </Text>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "Pendientes" && styles.tabBtnActive]}
            onPress={() => setTab("Pendientes")}
          >
            <Text
              style={[styles.tabText, tab === "Pendientes" && styles.tabTextActive]}
            >
              Pendientes ({pending.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "Historial" && styles.tabBtnActive]}
            onPress={() => setTab("Historial")}
          >
            <Text
              style={[styles.tabText, tab === "Historial" && styles.tabTextActive]}
            >
              Historial ({history.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {list.length === 0 ? (
        <View style={styles.emptyPanel}>
          <EmptyBlock
            icon={<AppIcon name="check" size={32} color={colors.success} />}
            title={tab === "Pendientes" ? "Todo al día" : "Sin historial"}
          >
            {tab === "Pendientes"
              ? "No hay solicitudes esperando autorización."
              : "Aún no se ha resuelto ninguna solicitud."}
          </EmptyBlock>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {list.map((r) => (
            <RequestCard key={r.id} request={r} onDone={onNotify} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heading: {
    gap: 4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyPanel: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardId: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  cardMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cardRequester: {
    fontSize: 12,
    color: colors.textMuted,
  },
  boldText: {
    fontWeight: "700",
    color: colors.text,
  },
  invoiceBox: {
    backgroundColor: colors.borderLight,
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  invoiceTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  invLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  invValue: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
  },
  projectRef: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primaryLight,
    padding: 8,
    borderRadius: 8,
  },
  projectRefText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: "600",
  },
  reasonText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  problemBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.dangerLight,
    padding: 8,
    borderRadius: 8,
  },
  problemText: {
    fontSize: 12,
    color: colors.danger,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  btnReject: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  btnRejectText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
  btnApprove: {
    backgroundColor: colors.primary,
  },
  btnApproveText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  btnCancel: {
    backgroundColor: colors.borderLight,
  },
  btnCancelText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  btnDanger: {
    backgroundColor: colors.danger,
  },
  btnDangerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  rejectContainer: {
    gap: 8,
    marginTop: 4,
  },
  rejectLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  rejectInput: {
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    fontSize: 13,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: "top",
  },
  resultBox: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 6,
  },
  resultDetails: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
