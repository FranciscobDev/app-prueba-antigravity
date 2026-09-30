import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import { AppIcon } from "../../components/AppIcon";
import { categoryColors, money, userNames, stockTrend } from "../../data/inventory";
import type { Category, Role } from "../../types/inventory";
import { RequestsTable } from "./shared";
import { useInventory } from "./store";
import { MovementsTable } from "./StockViews";
import { StockChart } from "./StockChart";
import { colors } from "../../theme/colors";

type Props = {
  role: Role;
  go: (view: string) => void;
  onRequest: (kind: "Entrada" | "Salida" | "Merma") => void;
  onProjectRequest: () => void;
};

export function OverviewView({ role, go, onRequest, onProjectRequest }: Props) {
  const { products, movements, requests } = useInventory();
  const [activeModal, setActiveModal] = useState<"lowStock" | "products" | "totalValue" | null>(null);

  const totalValue = products.reduce((n, p) => n + p.stock * p.cost, 0);
  const low = products.filter((p) => p.stock < p.min).length;
  const pending = requests.filter((r) => r.status === "Pendiente").length;
  const toDispatch = requests.filter((r) => r.status === "Por despachar").length;
  const myActive = requests.filter(
    (r) =>
      r.requestedBy === userNames.Técnico &&
      (r.status === "Pendiente" || r.status === "Por despachar")
  ).length;

  const cats = (Object.keys(categoryColors) as Category[]).map((name) => ({
    name,
    value: products
      .filter((p) => p.category === name)
      .reduce((n, p) => n + p.stock * p.cost, 0),
    color: categoryColors[name],
  }));

  const fourth =
    role === "Administrador"
      ? {
          label: "Por autorizar",
          value: pending,
          note: pending ? "Requieren su decisión" : "Todo al día",
          warn: pending > 0,
          view: "Notificaciones",
        }
      : role === "Bodeguero"
      ? {
          label: "Por despachar",
          value: toDispatch,
          note: toDispatch ? "Autorizadas para entrega" : "Sin entregas pendientes",
          warn: toDispatch > 0,
          view: "Solicitudes",
        }
      : {
          label: "Mis solicitudes",
          value: myActive,
          note: "Pendientes o por retirar",
          warn: false,
          view: "Solicitudes",
        };

  const banner =
    role === "Administrador" && pending > 0
      ? {
          text: `Tiene ${pending} ${
            pending === 1 ? "solicitud" : "solicitudes"
          } esperando su autorización.`,
          action: "Revisar",
          view: "Notificaciones",
        }
      : role === "Bodeguero" && toDispatch > 0
      ? {
          text: `Hay ${toDispatch} ${
            toDispatch === 1 ? "solicitud autorizada" : "solicitudes autorizadas"
          } listas para entregar.`,
          action: "Entregar",
          view: "Solicitudes",
        }
      : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Page Heading & Quick Actions */}
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>PANEL DE CONTROL</Text>
        <Text style={styles.title}>Resumen General</Text>
        <Text style={styles.subtitle}>Visión general del estado de inventario</Text>

        {/* Role Quick Buttons */}
        <View style={styles.actionsRow}>
          {role === "Bodeguero" && (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => onRequest("Merma")}
              >
                <AppIcon name="alert" size={16} color={colors.warning} />
                <Text style={styles.btnSecondaryText}>Merma</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => onRequest("Salida")}
              >
                <AppIcon name="minus" size={16} color={colors.primary} />
                <Text style={styles.btnSecondaryText}>Salida</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={() => onRequest("Entrada")}
              >
                <AppIcon name="plus" size={16} color="#FFFFFF" />
                <Text style={styles.btnPrimaryText}>Ingreso</Text>
              </TouchableOpacity>
            </>
          )}

          {role === "Técnico" && (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => go("Proyectos")}
              >
                <AppIcon name="folder" size={16} color={colors.primary} />
                <Text style={styles.btnSecondaryText}>Mis proyectos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={onProjectRequest}
              >
                <AppIcon name="plus" size={16} color="#FFFFFF" />
                <Text style={styles.btnPrimaryText}>Solicitar</Text>
              </TouchableOpacity>
            </>
          )}

          {role === "Administrador" && (
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => go("Reportes")}
            >
              <AppIcon name="report" size={16} color="#FFFFFF" />
              <Text style={styles.btnPrimaryText}>Generar Informe</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Alert Banner */}
      {banner && (
        <TouchableOpacity
          style={styles.banner}
          onPress={() => go(banner.view)}
          activeOpacity={0.85}
        >
          <View style={styles.bannerIcon}>
            <AppIcon name="bell" size={20} color={colors.primary} />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerText}>{banner.text}</Text>
            <Text style={styles.bannerAction}>{banner.action} →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Metrics 2x2 Grid */}
      <View style={styles.metricsGrid}>
        <TouchableOpacity 
          style={styles.metricCard}
          onPress={() => setActiveModal("products")}
          activeOpacity={0.7}
        >
          <View style={[styles.metricIconWrap, { backgroundColor: colors.primaryLight }]}>
            <AppIcon name="box" size={20} color={colors.primary} />
          </View>
          <Text style={styles.metricLabel}>Productos</Text>
          <Text style={styles.metricValue}>{products.length}</Text>
          <Text style={styles.metricSub}>
            {products.reduce((n, p) => n + p.stock, 0)} unidades
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.metricCard}
          onPress={() => setActiveModal("totalValue")}
          activeOpacity={0.7}
        >
          <View style={[styles.metricIconWrap, { backgroundColor: colors.successLight }]}>
            <AppIcon name="chart" size={20} color={colors.success} />
          </View>
          <Text style={styles.metricLabel}>Valor Total</Text>
          <Text style={styles.metricValue}>{money(totalValue)}</Text>
          <Text style={styles.metricSub}>+3,2% vs. mes anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.metricCard} 
          onPress={() => setActiveModal("lowStock")}
          activeOpacity={0.7}
        >
          <View style={[styles.metricIconWrap, { backgroundColor: colors.warningLight }]}>
            <AppIcon name="alert" size={20} color={colors.warning} />
          </View>
          <Text style={styles.metricLabel}>Stock Bajo</Text>
          <Text style={[styles.metricValue, low > 0 && { color: colors.warning }]}>
            {low}
          </Text>
          <Text style={[styles.metricSub, low > 0 && { color: colors.warning }]}>
            {low ? "Requieren reposición" : "Sin alertas"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.metricCard}
          onPress={() => go(fourth.view)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.metricIconWrap,
              { backgroundColor: fourth.warn ? colors.dangerLight : colors.borderLight },
            ]}
          >
            <AppIcon
              name={role === "Bodeguero" ? "truck" : "bell"}
              size={20}
              color={fourth.warn ? colors.danger : colors.textMuted}
            />
          </View>
          <Text style={styles.metricLabel}>{fourth.label}</Text>
          <Text style={[styles.metricValue, fourth.warn && { color: colors.danger }]}>
            {fourth.value}
          </Text>
          <Text style={styles.metricSub}>{fourth.note}</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Breakdown */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Valor por categoría</Text>
          <Text style={styles.panelSubtitle}>Distribución de existencias</Text>
        </View>
        <View style={styles.categoriesList}>
          {cats.map((c) => {
            const percent = totalValue > 0 ? Math.round((c.value / totalValue) * 100) : 0;
            return (
              <View key={c.name} style={styles.catRow}>
                <View style={styles.catInfo}>
                  <View style={[styles.catDot, { backgroundColor: c.color }]} />
                  <Text style={styles.catName}>{c.name}</Text>
                </View>
                <View style={styles.catBarWrapper}>
                  <View
                    style={[
                      styles.catBarFill,
                      { width: `${percent}%`, backgroundColor: c.color },
                    ]}
                  />
                </View>
                <Text style={styles.catPercent}>{percent}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent Movements or Requests */}
      <View style={styles.panel}>
        <View style={styles.panelHeaderRow}>
          <View>
            <Text style={styles.panelTitle}>
              {role === "Técnico" ? "Mis solicitudes recientes" : "Movimientos recientes"}
            </Text>
            <Text style={styles.panelSubtitle}>Últimos registros en almacén</Text>
          </View>
          <TouchableOpacity
            onPress={() => go(role === "Técnico" ? "Solicitudes" : "Kardex")}
          >
            <Text style={styles.seeAllText}>Ver todo →</Text>
          </TouchableOpacity>
        </View>

        {role === "Técnico" ? (
          <RequestsTable
            rows={requests
              .filter((r) => r.requestedBy === userNames.Técnico)
              .slice(0, 3)}
          />
        ) : (
          <MovementsTable rows={movements.slice(0, 4)} />
        )}
      </View>

      {/* Productos Modal */}
      <Modal visible={activeModal === "products"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lista de Productos</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={{ padding: 4 }}>
                <AppIcon name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {products.map(p => (
                <View key={p.sku} style={styles.modalListItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemName}>{p.name}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.modalItemStock}>
                      {p.stock}
                    </Text>
                    <Text style={styles.modalItemUnit}>{p.unit}</Text>
                  </View>
                </View>
              ))}
              {products.length === 0 && (
                <Text style={styles.modalEmpty}>No hay productos en este momento.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Valor Total Modal */}
      <Modal visible={activeModal === "totalValue"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Valor Histórico por Mes</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={{ padding: 4 }}>
                <AppIcon name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, idx) => {
                const currentTrend = stockTrend[stockTrend.length - 1] || 1;
                const val = (stockTrend[idx] / currentTrend) * totalValue;
                return (
                  <View key={m} style={styles.modalListItem}>
                    <Text style={styles.modalItemName}>{m}</Text>
                    <Text style={styles.modalItemStock}>{money(val)}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Stock Bajo Modal */}
      <Modal visible={activeModal === "lowStock"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Productos con Stock Bajo</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={{ padding: 4 }}>
                <AppIcon name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {products.filter(p => p.stock < p.min).map(p => (
                <View key={p.sku} style={styles.modalListItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemName}>{p.name}</Text>
                    <Text style={styles.modalItemSku}>{p.sku}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.modalItemStock, { color: colors.warning }]}>
                      {p.stock} / {p.min}
                    </Text>
                    <Text style={styles.modalItemUnit}>{p.unit}</Text>
                  </View>
                </View>
              ))}
              {low === 0 && (
                <Text style={styles.modalEmpty}>No hay productos con stock bajo en este momento.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
  },
  heading: {
    gap: 4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  btnSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  btnSecondaryText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerContent: {
    flex: 1,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  bannerAction: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 10,
    color: colors.textLight,
  },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  panelHeader: {
    marginBottom: 10,
  },
  panelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  panelSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  seeAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
  },
  categoriesList: {
    gap: 10,
    marginTop: 6,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  catInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: 105,
    gap: 6,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
  },
  catBarWrapper: {
    flex: 1,
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  catBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  catPercent: {
    width: 32,
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30,27,75,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  modalList: {
    padding: 16,
  },
  modalListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  modalItemSku: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalItemStock: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  modalItemUnit: {
    fontSize: 11,
    color: colors.textLight,
  },
  modalEmpty: {
    textAlign: "center",
    color: colors.textMuted,
    padding: 24,
    fontStyle: "italic",
  },
});
