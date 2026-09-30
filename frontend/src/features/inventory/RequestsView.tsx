import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { AppIcon } from "../../components/AppIcon";
import { userNames } from "../../data/inventory";
import type { Role } from "../../types/inventory";
import { EmptyBlock, ItemsList, RequestsTable } from "./shared";
import { useInventory } from "./store";
import { colors } from "../../theme/colors";

export function RequestsView({
  role,
  onNotify,
  onNewRequest,
}: {
  role: "Bodeguero" | "Técnico";
  onNotify: (msg: string) => void;
  onNewRequest: () => void;
}) {
  const { requests, dispatch, projects, shortage } = useInventory();
  const name = userNames[role as Role];
  const toDispatch = requests.filter((r) => r.status === "Por despachar");
  const mine = requests.filter((r) => r.requestedBy === name);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>SEGUIMIENTO</Text>
        <Text style={styles.title}>
          {role === "Bodeguero" ? "Solicitudes y Entregas" : "Mis Solicitudes"}
        </Text>
        <Text style={styles.subtitle}>
          {role === "Bodeguero"
            ? "Entrega lo autorizado por el administrador y sigue tus solicitudes."
            : "Consulta el estado y avance de cada solicitud de productos."}
        </Text>

        {role === "Técnico" && (
          <TouchableOpacity style={styles.newRequestBtn} onPress={onNewRequest}>
            <AppIcon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.newRequestText}>Solicitar productos</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bodeguero toDispatch section */}
      {role === "Bodeguero" && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Por despachar</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{toDispatch.length}</Text>
            </View>
          </View>

          {toDispatch.length === 0 ? (
            <View style={styles.panel}>
              <EmptyBlock
                icon={<AppIcon name="truck" size={32} color={colors.textMuted} />}
                title="Nada por entregar"
              >
                Las solicitudes autorizadas por el administrador aparecerán aquí.
              </EmptyBlock>
            </View>
          ) : (
            <View style={styles.cardsGrid}>
              {toDispatch.map((r) => {
                const project = projects.find((p) => p.id === r.projectId);
                const problem = shortage(r);

                return (
                  <View key={r.id} style={styles.dispatchCard}>
                    <View style={styles.dispatchHeader}>
                      <View>
                        <Text style={styles.dispatchId}>{r.id}</Text>
                        <Text style={styles.dispatchMeta}>
                          Solicita: {r.requestedBy}
                        </Text>
                      </View>
                      <View style={styles.authBadge}>
                        <Text style={styles.authBadgeText}>Autorizada</Text>
                      </View>
                    </View>

                    <ItemsList request={r} />

                    {project && (
                      <View style={styles.projectRef}>
                        <AppIcon name="folder" size={16} color={colors.primary} />
                        <Text style={styles.projectRefText}>
                          {project.id} · {project.name}
                        </Text>
                      </View>
                    )}

                    {problem && (
                      <View style={styles.problemBox}>
                        <AppIcon name="alert" size={16} color={colors.danger} />
                        <Text style={styles.problemText}>{problem}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.confirmBtn,
                        !!problem && styles.confirmBtnDisabled,
                      ]}
                      disabled={!!problem}
                      onPress={() => {
                        dispatch(r.id, userNames.Bodeguero);
                        onNotify(`Entrega ${r.id} registrada. El stock fue descontado.`);
                      }}
                    >
                      <AppIcon name="truck" size={16} color="#FFFFFF" />
                      <Text style={styles.confirmBtnText}>Confirmar entrega</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* History section */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {role === "Bodeguero" ? "Mis solicitudes" : "Historial"}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{mine.length}</Text>
          </View>
        </View>
        <RequestsTable rows={mine} />
      </View>
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
  newRequestBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 10,
  },
  newRequestText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionBlock: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  countBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardsGrid: {
    gap: 12,
  },
  dispatchCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  dispatchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dispatchId: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  dispatchMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  authBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  authBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  projectRef: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.borderLight,
    padding: 8,
    borderRadius: 8,
  },
  projectRefText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primaryDark,
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
  confirmBtn: {
    flexDirection: "row",
    backgroundColor: colors.success,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  confirmBtnDisabled: {
    backgroundColor: colors.textLight,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
