import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { AppIcon } from "../../components/AppIcon";
import { userNames } from "../../data/inventory";
import type { Role } from "../../types/inventory";
import { EmptyBlock } from "./shared";
import { useInventory } from "./store";
import { colors } from "../../theme/colors";

export function ProjectsView({
  role,
  onNewProject,
  onRequest,
}: {
  role: Role;
  onNewProject: () => void;
  onRequest: (projectId: string) => void;
}) {
  const { projects, requests } = useInventory();
  const isTech = role === "Técnico";
  const visible = isTech
    ? projects.filter((p) => p.createdBy === userNames.Técnico)
    : projects;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>PROYECTOS</Text>
        <Text style={styles.title}>
          {isTech ? "Mis Proyectos" : "Proyectos Activos"}
        </Text>
        <Text style={styles.subtitle}>
          {isTech
            ? "Crea un proyecto para justificar y solicitar los productos que necesitas."
            : "Los proyectos justifican cada salida de existencias de almacén."}
        </Text>

        {isTech && (
          <TouchableOpacity style={styles.newProjectBtn} onPress={onNewProject}>
            <AppIcon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.newProjectText}>Nuevo proyecto</Text>
          </TouchableOpacity>
        )}
      </View>

      {visible.length === 0 ? (
        <View style={styles.emptyPanel}>
          <EmptyBlock
            icon={<AppIcon name="folder" size={32} color={colors.textMuted} />}
            title="Sin proyectos activos"
          >
            Crea tu primer proyecto para poder solicitar productos.
          </EmptyBlock>
        </View>
      ) : (
        <View style={styles.projectsList}>
          {visible.map((p) => {
            const related = requests.filter((r) => r.projectId === p.id);
            const open = related.filter(
              (r) => r.status === "Pendiente" || r.status === "Por despachar"
            ).length;

            return (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.projectId}>{p.id}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{p.status}</Text>
                  </View>
                </View>

                <Text style={styles.projectName}>{p.name}</Text>
                <Text style={styles.projectDesc}>{p.description}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Responsable</Text>
                    <Text style={styles.metaValue}>{p.createdBy}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Fecha</Text>
                    <Text style={styles.metaValue}>{p.createdAt}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Solicitudes</Text>
                    <Text style={styles.metaValue}>
                      {related.length}
                      {open ? ` (${open} activas)` : ""}
                    </Text>
                  </View>
                </View>

                {isTech && (
                  <TouchableOpacity
                    style={styles.requestItemsBtn}
                    onPress={() => onRequest(p.id)}
                  >
                    <AppIcon name="box" size={16} color={colors.primary} />
                    <Text style={styles.requestItemsText}>
                      Solicitar productos para este proyecto
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
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
  newProjectBtn: {
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
  newProjectText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyPanel: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projectsList: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectId: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },
  statusBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.success,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  projectDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.borderLight,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  metaCol: {
    gap: 2,
  },
  metaLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
  },
  requestItemsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    height: 40,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  requestItemsText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
  },
});
