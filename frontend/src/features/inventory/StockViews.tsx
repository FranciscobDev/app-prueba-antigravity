import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { AppIcon } from "../../components/AppIcon";
import { categoryColors, money } from "../../data/inventory";
import type { Category, Movement, Role } from "../../types/inventory";
import { KindTag } from "./shared";
import { useInventory } from "./store";
import { colors } from "../../theme/colors";

const sign = { Entrada: "+", Salida: "−", Merma: "−" } as const;

export function MovementsTable({
  rows,
  expandable = false,
}: {
  rows: Movement[];
  expandable?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!rows.length) {
    return <Text style={styles.emptyText}>No se encontraron movimientos.</Text>;
  }

  return (
    <View style={styles.movementsList}>
      {rows.map((m) => {
        const isOpen = openId === m.id;
        const isPositive = m.type === "Entrada";
        return (
          <TouchableOpacity
            key={m.id}
            style={[styles.movementCard, isOpen && styles.movementCardOpen]}
            onPress={() => expandable && setOpenId(isOpen ? null : m.id)}
            activeOpacity={expandable ? 0.7 : 1}
          >
            <View style={styles.movementMain}>
              <View style={styles.movementLeft}>
                <View style={styles.movementHeaderLine}>
                  <Text style={styles.movementDate}>
                    {m.date} · {m.time}
                  </Text>
                  <KindTag kind={m.type} />
                </View>
                <Text style={styles.movementProduct}>{m.product}</Text>
                <Text style={styles.movementSku}>{m.sku}</Text>
              </View>

              <View style={styles.movementRight}>
                <Text
                  style={[
                    styles.movementQty,
                    isPositive ? styles.qtyPositive : styles.qtyNegative,
                  ]}
                >
                  {sign[m.type]}
                  {m.quantity}
                </Text>
                {expandable && (
                  <AppIcon
                    name={isOpen ? "chevronDown" : "chevron"}
                    size={16}
                    color={colors.textMuted}
                  />
                )}
              </View>
            </View>

            {expandable && isOpen && (
              <View style={styles.movementDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Solicitud ref.:</Text>
                  <Text style={styles.detailVal}>{m.reference}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Autorizado por:</Text>
                  <Text style={styles.detailVal}>{m.authorizedBy}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Saldo resultante:</Text>
                  <Text style={styles.detailValBold}>{m.balance} uds.</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Responsable:</Text>
                  <Text style={styles.detailVal}>{m.responsible}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function KardexView() {
  const { movements } = useInventory();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Todos");

  const rows = useMemo(
    () =>
      movements.filter(
        (m) =>
          (type === "Todos" || m.type === type) &&
          `${m.product} ${m.sku} ${m.id} ${m.reference}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [movements, query, type]
  );

  return (
    <ScrollView contentContainerStyle={styles.viewContainer}>
      <View style={styles.pageHeading}>
        <Text style={styles.eyebrow}>KARDEX</Text>
        <Text style={styles.pageTitle}>Kardex de Movimientos</Text>
        <Text style={styles.pageSubtitle}>
          Toca un registro para ver autorizaciones y saldo resultante.
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <AppIcon name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto, SKU o solicitud..."
          placeholderTextColor={colors.textLight}
          value={query}
          onChangeText={setQuery}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery("")}>
            <AppIcon name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Type Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {["Todos", "Entrada", "Salida", "Merma"].map((t) => {
          const active = type === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Movements List */}
      <MovementsTable rows={rows} expandable />
    </ScrollView>
  );
}

export function InventoryView({
  role,
  onRequest,
}: {
  role: Role;
  onRequest: (kind: "Entrada" | "Salida" | "Merma") => void;
}) {
  const { products } = useInventory();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todas" | Category>("Todas");
  const [onlyLow, setOnlyLow] = useState(false);

  const rows = products.filter(
    (p) =>
      (category === "Todas" || p.category === category) &&
      (!onlyLow || p.stock < p.min) &&
      `${p.name} ${p.sku} ${p.location}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.viewContainer}>
      <View style={styles.pageHeading}>
        <Text style={styles.eyebrow}>INVENTARIO</Text>
        <Text style={styles.pageTitle}>Existencias de Almacén</Text>
        <Text style={styles.pageSubtitle}>
          {role === "Técnico"
            ? "Consulta existencias antes de solicitar productos."
            : "Control en tiempo real del stock de productos."}
        </Text>

        {role === "Bodeguero" && (
          <View style={styles.actionsRow}>
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
          </View>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <AppIcon name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto, código o ubicación..."
          placeholderTextColor={colors.textLight}
          value={query}
          onChangeText={setQuery}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery("")}>
            <AppIcon name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {["Todas", "Repuestos", "Consumibles", "Herramientas", "Protección"].map((c) => {
          const active = category === c;
          return (
            <TouchableOpacity
              key={c}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setCategory(c as typeof category)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Only Low Stock Toggle */}
      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setOnlyLow(!onlyLow)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, onlyLow && styles.checkboxActive]}>
          {onlyLow && <AppIcon name="check" size={14} color="#FFFFFF" />}
        </View>
        <Text style={styles.toggleText}>Solo productos con stock bajo mínimo</Text>
      </TouchableOpacity>

      {/* Products List Cards */}
      <View style={styles.productsList}>
        {rows.map((p) => {
          const low = p.stock < p.min;
          const ratio = Math.min(100, (p.stock / (p.min * 2)) * 100);

          return (
            <View key={p.sku} style={[styles.productCard, low && styles.productCardLow]}>
              <View style={styles.productHeader}>
                <View style={styles.productTitles}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productSku}>{p.sku}</Text>
                </View>
                <View
                  style={[
                    styles.catBadge,
                    { backgroundColor: categoryColors[p.category] + "1A" },
                  ]}
                >
                  <View
                    style={[
                      styles.catDot,
                      { backgroundColor: categoryColors[p.category] },
                    ]}
                  />
                  <Text
                    style={[
                      styles.catBadgeText,
                      { color: categoryColors[p.category] },
                    ]}
                  >
                    {p.category}
                  </Text>
                </View>
              </View>

              {/* Stock Bar & Numbers */}
              <View style={styles.stockSection}>
                <View style={styles.stockNumbers}>
                  <Text style={styles.stockMain}>
                    <Text style={styles.stockValue}>{p.stock}</Text> {p.unit}
                  </Text>
                  <Text style={styles.stockMin}>Mínimo: {p.min} {p.unit}</Text>
                </View>

                <View style={styles.stockTrack}>
                  <View
                    style={[
                      styles.stockFill,
                      {
                        width: `${ratio}%`,
                        backgroundColor: low ? colors.warning : colors.success,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Footer info: Location, Status and Admin Value */}
              <View style={styles.productFooter}>
                <Text style={styles.locationText}>Ubicación: {p.location}</Text>
                <View style={styles.footerRight}>
                  {low ? (
                    <View style={styles.lowBadge}>
                      <Text style={styles.lowBadgeText}>Stock bajo</Text>
                    </View>
                  ) : (
                    <View style={styles.okBadge}>
                      <Text style={styles.okBadgeText}>Normal</Text>
                    </View>
                  )}
                  {role === "Administrador" && (
                    <Text style={styles.costText}>{money(p.stock * p.cost)}</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        {!rows.length && (
          <Text style={styles.emptyText}>No se encontraron productos.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  viewContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  pageHeading: {
    gap: 4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  btnSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  chipsScroll: {
    flexDirection: "row",
    marginVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  toggleText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "500",
  },
  productsList: {
    gap: 12,
  },
  productCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  productCardLow: {
    borderColor: colors.warningBorder,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productTitles: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  productSku: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  stockSection: {
    gap: 4,
  },
  stockNumbers: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  stockMain: {
    fontSize: 13,
    color: colors.text,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  stockMin: {
    fontSize: 11,
    color: colors.textMuted,
  },
  stockTrack: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  stockFill: {
    height: "100%",
    borderRadius: 3,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  locationText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lowBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.warning,
  },
  okBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  okBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.success,
  },
  costText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  movementsList: {
    gap: 10,
  },
  movementCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  movementCardOpen: {
    borderColor: colors.primaryBorder,
  },
  movementMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  movementLeft: {
    flex: 1,
    gap: 2,
  },
  movementHeaderLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  movementDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  movementProduct: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  movementSku: {
    fontSize: 11,
    color: colors.textMuted,
  },
  movementRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  movementQty: {
    fontSize: 15,
    fontWeight: "800",
  },
  qtyPositive: {
    color: colors.success,
  },
  qtyNegative: {
    color: colors.danger,
  },
  movementDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  detailVal: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
  },
  detailValBold: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 13,
    padding: 20,
  },
});
