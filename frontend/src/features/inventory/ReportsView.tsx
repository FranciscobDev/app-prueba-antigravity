import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { AppIcon } from "../../components/AppIcon";
import { fmtDate, fmtTime, money, userNames } from "../../data/inventory";
import type { Category } from "../../types/inventory";
import { useInventory } from "./store";
import { colors } from "../../theme/colors";

const categories: Category[] = ["Repuestos", "Consumibles", "Herramientas", "Protección"];

export function ReportsView() {
  const { products } = useInventory();
  const [selected, setSelected] = useState<Set<string>>(new Set(products.map((p) => p.sku)));
  const [report, setReport] = useState<{ skus: string[]; at: string } | null>(null);

  const toggle = (sku: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (!next.delete(sku)) next.add(sku);
      return next;
    });

  const toggleCategory = (c: Category) => {
    const skus = products.filter((p) => p.category === c).map((p) => p.sku);
    const all = skus.every((s) => selected.has(s));
    setSelected((s) => {
      const next = new Set(s);
      skus.forEach((k) => (all ? next.delete(k) : next.add(k)));
      return next;
    });
  };

  const generate = () => {
    const now = new Date();
    setReport({
      skus: products.filter((p) => selected.has(p.sku)).map((p) => p.sku),
      at: `${fmtDate(now)} · ${fmtTime(now)}`,
    });
  };

  const rows = report ? products.filter((p) => report.skus.includes(p.sku)) : [];
  const units = rows.reduce((n, p) => n + p.stock, 0);
  const value = rows.reduce((n, p) => n + p.stock * p.cost, 0);
  const low = rows.filter((p) => p.stock < p.min).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>REPORTES</Text>
        <Text style={styles.title}>Informe de Existencias</Text>
        <Text style={styles.subtitle}>
          Selecciona los productos y genera un reporte detallado del valor en almacén.
        </Text>
      </View>

      {/* Picker Section */}
      <View style={styles.panel}>
        <View style={styles.pickerHeader}>
          <Text style={styles.panelTitle}>1. Selección de productos</Text>
          <Text style={styles.pickerCount}>
            {selected.size} de {products.length} seleccionados
          </Text>
        </View>

        <View style={styles.quickSelectRow}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => setSelected(new Set(products.map((p) => p.sku)))}
          >
            <Text style={styles.quickBtnText}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => setSelected(new Set())}
          >
            <Text style={styles.quickBtnText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((c) => {
            const skus = products.filter((p) => p.category === c);
            const active = skus.every((p) => selected.has(p.sku));
            return (
              <TouchableOpacity
                key={c}
                style={[styles.catChip, active && styles.catChipActive]}
                onPress={() => toggleCategory(c)}
              >
                {active && <AppIcon name="check" size={14} color="#FFFFFF" />}
                <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Products Checkbox List */}
        <View style={styles.productsCheckList}>
          {products.map((p) => {
            const isChecked = selected.has(p.sku);
            return (
              <TouchableOpacity
                key={p.sku}
                style={[styles.productCheckRow, isChecked && styles.productCheckRowChecked]}
                onPress={() => toggle(p.sku)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <AppIcon name="check" size={14} color="#FFFFFF" />}
                </View>
                <View style={styles.productCheckInfo}>
                  <Text style={styles.checkName}>{p.name}</Text>
                  <Text style={styles.checkSub}>
                    {p.sku} · {p.category}
                  </Text>
                </View>
                <Text style={styles.checkStock}>{p.stock} {p.unit}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </View>

      {/* Generated Report Sheet */}
      {report && (
        <View style={styles.reportSheet}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>Informe Generado</Text>
            <Text style={styles.reportDate}>
              Emitido el {report.at} por {userNames.Administrador}
            </Text>
          </View>

          {/* Totals Grid */}
          <View style={styles.totalsGrid}>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Productos</Text>
              <Text style={styles.totalValue}>{rows.length}</Text>
            </View>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Unidades</Text>
              <Text style={styles.totalValue}>{units.toLocaleString("es-CL")}</Text>
            </View>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Valor Total</Text>
              <Text style={styles.totalValue}>{money(value)}</Text>
            </View>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Bajo Mínimo</Text>
              <Text style={[styles.totalValue, low > 0 && { color: colors.warning }]}>
                {low}
              </Text>
            </View>
          </View>

          {/* Rows List */}
          <View style={styles.reportItemsList}>
            {rows.map((p) => {
              const isLow = p.stock < p.min;
              return (
                <View key={p.sku} style={styles.reportItemRow}>
                  <View style={styles.reportItemLeft}>
                    <Text style={styles.reportItemName}>{p.name}</Text>
                    <Text style={styles.reportItemMeta}>
                      {p.sku} · Ubic: {p.location}
                    </Text>
                  </View>
                  <View style={styles.reportItemRight}>
                    <Text style={[styles.reportItemStock, isLow && { color: colors.warning }]}>
                      {p.stock} {p.unit}
                    </Text>
                    <Text style={styles.reportItemCost}>
                      {money(p.stock * p.cost)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>

      {/* Botón flotante fijo en la parte inferior */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.generateBtn, !selected.size && styles.generateBtnDisabled, { marginTop: 0 }]}
          disabled={!selected.size}
          onPress={generate}
        >
          <AppIcon name="report" size={18} color="#FFFFFF" />
          <Text style={styles.generateBtnText}>Generar Informe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
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
  panel: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  pickerCount: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  quickSelectRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.borderLight,
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  catScroll: {
    flexDirection: "row",
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: colors.primary,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  catChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  productsCheckList: {
    gap: 8,
    maxHeight: 220,
  },
  productCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 10,
  },
  productCheckRowChecked: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  productCheckInfo: {
    flex: 1,
  },
  checkName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  checkSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  checkStock: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  generateBtn: {
    flexDirection: "row",
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  generateBtnDisabled: {
    backgroundColor: colors.textLight,
  },
  generateBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  reportSheet: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  reportHeader: {
    gap: 2,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  reportDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  totalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  totalCard: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: colors.borderLight,
    padding: 10,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  reportItemsList: {
    gap: 8,
  },
  reportItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  reportItemLeft: {
    flex: 1,
    marginRight: 8,
  },
  reportItemName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  reportItemMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  reportItemRight: {
    alignItems: "flex-end",
  },
  reportItemStock: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  reportItemCost: {
    fontSize: 11,
    color: colors.textMuted,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
