import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { AppIcon } from "../../components/AppIcon";
import { userNames } from "../../data/inventory";
import type { Invoice, MovementType } from "../../types/inventory";
import { useInventory } from "./store";
import { colors } from "../../theme/colors";

const copy: Record<MovementType, { eyebrow: string; title: string; note: string; submit: string }> = {
  Entrada: {
    eyebrow: "INGRESO DE PRODUCTOS",
    title: "Solicitar Ingreso",
    note: "El administrador debe autorizar el ingreso antes de sumar stock.",
    submit: "Enviar para Autorización",
  },
  Salida: {
    eyebrow: "SALIDA DE STOCK",
    title: "Solicitar Salida",
    note: "Toda salida debe justificarse con un proyecto activo.",
    submit: "Enviar para Autorización",
  },
  Merma: {
    eyebrow: "REGISTRO DE MERMA",
    title: "Registrar Merma",
    note: "La merma descuenta stock solo cuando el administrador la aprueba.",
    submit: "Enviar para Autorización",
  },
};

const lossReasons = ["Daño", "Vencimiento", "Pérdida", "Robo", "Otro"];

export function RequestModal({
  kind,
  onClose,
  onSubmitted,
}: {
  kind: MovementType;
  onClose: () => void;
  onSubmitted: (message: string) => void;
}) {
  const { products, projects, submitRequest } = useInventory();
  const [sku, setSku] = useState(products[0]?.sku || "");
  const [quantity, setQuantity] = useState("1");
  const [projectId, setProjectId] = useState(
    projects.find((p) => p.status === "Activo")?.id ?? ""
  );
  const [lossReason, setLossReason] = useState(lossReasons[0]);
  const [reason, setReason] = useState("");
  const [invoice, setInvoice] = useState({
    number: "F-90210",
    supplier: "Distribuidora Industrial",
    date: new Date().toISOString().split("T")[0],
    amount: "150",
    fileName: "factura.pdf",
  });

  const product = products.find((p) => p.sku === sku) || products[0];
  const max = kind === "Entrada" ? undefined : product.stock;
  const c = copy[kind];

  const handleSubmit = () => {
    const qty = Number(quantity);
    if (!qty || qty <= 0) return;

    const inv: Invoice | undefined =
      kind === "Entrada"
        ? {
            number: invoice.number,
            supplier: invoice.supplier,
            date: invoice.date,
            amount: Number(invoice.amount) || 0,
            fileName: invoice.fileName,
          }
        : undefined;

    const id = submitRequest({
      kind,
      origin: "Bodeguero",
      requestedBy: userNames.Bodeguero,
      items: [{ sku, quantity: qty }],
      projectId: kind === "Salida" ? projectId : undefined,
      invoice: inv,
      reason: kind === "Merma" ? `${lossReason}: ${reason}` : reason || undefined,
    });

    onSubmitted(`Solicitud ${id} enviada al administrador.`);
    onClose();
  };

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.eyebrow}>{c.eyebrow}</Text>
              <Text style={styles.title}>{c.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <AppIcon name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <View style={styles.noteBox}>
              <AppIcon name="info" size={16} color={colors.primary} />
              <Text style={styles.noteText}>{c.note}</Text>
            </View>

            {/* Select Product */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Producto</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                {products.map((p) => {
                  const active = sku === p.sku;
                  return (
                    <TouchableOpacity
                      key={p.sku}
                      style={[styles.productPill, active && styles.productPillActive]}
                      onPress={() => setSku(p.sku)}
                    >
                      <Text style={[styles.productPillText, active && styles.productPillTextActive]}>
                        {p.name} ({p.stock} disp.)
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Quantity */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cantidad ({product.unit})</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                placeholderTextColor={colors.textLight}
              />
              {max !== undefined && (
                <Text style={styles.helperText}>Máximo disponible: {max} {product.unit}</Text>
              )}
            </View>

            {/* Entrada: Invoice Fields */}
            {kind === "Entrada" && (
              <View style={styles.invoiceSection}>
                <Text style={styles.sectionHeader}>Datos de la Factura</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>N.º de Factura</Text>
                  <TextInput
                    style={styles.input}
                    value={invoice.number}
                    onChangeText={(val) => setInvoice((i) => ({ ...i, number: val }))}
                    placeholder="F-00000"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Proveedor</Text>
                  <TextInput
                    style={styles.input}
                    value={invoice.supplier}
                    onChangeText={(val) => setInvoice((i) => ({ ...i, supplier: val }))}
                    placeholder="Razón Social"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Monto Total (USD)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={invoice.amount}
                    onChangeText={(val) => setInvoice((i) => ({ ...i, amount: val }))}
                    placeholder="0"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </View>
            )}

            {/* Salida: Project Picker */}
            {kind === "Salida" && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Proyecto de Justificación</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                  {projects
                    .filter((p) => p.status === "Activo")
                    .map((p) => {
                      const active = projectId === p.id;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.productPill, active && styles.productPillActive]}
                          onPress={() => setProjectId(p.id)}
                        >
                          <Text style={[styles.productPillText, active && styles.productPillTextActive]}>
                            {p.id} · {p.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              </View>
            )}

            {/* Merma: Loss Reason */}
            {kind === "Merma" && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo de Merma</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                  {lossReasons.map((r) => {
                    const active = lossReason === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        style={[styles.productPill, active && styles.productPillActive]}
                        onPress={() => setLossReason(r)}
                      >
                        <Text style={[styles.productPillText, active && styles.productPillTextActive]}>
                          {r}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Justification text */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {kind === "Entrada"
                  ? "Observaciones (opcional)"
                  : kind === "Salida"
                  ? "Justificación"
                  : "Detalle de lo ocurrido"}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reason}
                onChangeText={setReason}
                placeholder="Escribe aquí los detalles..."
                placeholderTextColor={colors.textLight}
                multiline
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onClose}>
              <Text style={styles.btnSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
              <Text style={styles.btnPrimaryText}>{c.submit}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 10,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  modalBody: {
    maxHeight: 400,
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primaryLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.primaryDark,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: colors.text,
  },
  textArea: {
    height: 70,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  helperText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  scrollRow: {
    flexDirection: "row",
  },
  productPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    marginRight: 8,
  },
  productPillActive: {
    backgroundColor: colors.primary,
  },
  productPillText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  productPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  invoiceSection: {
    backgroundColor: colors.borderLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  btnSecondary: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  btnPrimary: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
