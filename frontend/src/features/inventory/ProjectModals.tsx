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
import { useInventory } from "./store";
import { colors } from "../../theme/colors";

function ModalShell({
  visible,
  eyebrow,
  title,
  onClose,
  onSubmit,
  children,
  submitLabel,
}: {
  visible: boolean;
  eyebrow: string;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
  submitLabel: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <AppIcon name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onClose}>
              <Text style={styles.btnSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={onSubmit}>
              <Text style={styles.btnPrimaryText}>{submitLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function ProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (projectId: string) => void;
}) {
  const { createProject } = useInventory();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    const project = createProject({
      name: name.trim(),
      description: description.trim(),
      createdBy: userNames.Técnico,
    });
    onCreated(project.id);
    onClose();
  };

  return (
    <ModalShell
      visible={true}
      eyebrow="NUEVO PROYECTO"
      title="Crear Proyecto"
      onClose={onClose}
      onSubmit={handleCreate}
      submitLabel="Crear Proyecto"
    >
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre del proyecto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Mantención de bombas planta 2"
          placeholderTextColor={colors.textLight}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Descripción de las faenas</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detalles del trabajo que se va a realizar..."
          placeholderTextColor={colors.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>
    </ModalShell>
  );
}

export function ProjectRequestModal({
  projectId,
  onClose,
  onSubmitted,
}: {
  projectId?: string;
  onClose: () => void;
  onSubmitted: (message: string) => void;
}) {
  const { products, projects, submitRequest } = useInventory();
  const mine = projects.filter(
    (p) => p.createdBy === userNames.Técnico && p.status === "Activo"
  );
  const [selectedProject, setSelectedProject] = useState(projectId ?? mine[0]?.id ?? "");
  const [lines, setLines] = useState([{ sku: products[0].sku, quantity: "1" }]);
  const [reason, setReason] = useState("");

  const updateLine = (index: number, patch: Partial<(typeof lines)[number]>) => {
    setLines((l) => l.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const handleSend = () => {
    if (!selectedProject || !lines.length) return;
    const id = submitRequest({
      kind: "Salida",
      origin: "Técnico",
      requestedBy: userNames.Técnico,
      projectId: selectedProject,
      reason,
      items: lines.map((l) => ({ sku: l.sku, quantity: Math.max(1, Number(l.quantity) || 1) })),
    });
    onSubmitted(`Solicitud ${id} enviada al administrador.`);
    onClose();
  };

  return (
    <ModalShell
      visible={true}
      eyebrow="SOLICITUD DE MATERIALES"
      title="Pedir Productos"
      onClose={onClose}
      onSubmit={handleSend}
      submitLabel="Enviar Solicitud"
    >
      <View style={styles.noteBox}>
        <AppIcon name="info" size={16} color={colors.primary} />
        <Text style={styles.noteText}>
          El administrador autorizará tu pedido y luego podrás retirarlo en bodega.
        </Text>
      </View>

      {mine.length === 0 ? (
        <Text style={styles.emptyNote}>
          Primero debes crear un proyecto para poder solicitar materiales.
        </Text>
      ) : (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Seleccionar Proyecto</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
              {mine.map((p) => {
                const isSel = selectedProject === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.pill, isSel && styles.pillActive]}
                    onPress={() => setSelectedProject(p.id)}
                  >
                    <Text style={[styles.pillText, isSel && styles.pillTextActive]}>
                      {p.id} · {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Productos requeridos</Text>
            {lines.map((line, idx) => {
              const prod = products.find((p) => p.sku === line.sku) || products[0];
              return (
                <View key={idx} style={styles.lineCard}>
                  <View style={styles.lineHeader}>
                    <Text style={styles.lineProdName}>{prod.name}</Text>
                    <Text style={styles.lineStock}>Stock: {prod.stock}</Text>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.skuScroll}>
                    {products.map((p) => {
                      const active = line.sku === p.sku;
                      return (
                        <TouchableOpacity
                          key={p.sku}
                          style={[styles.skuChip, active && styles.skuChipActive]}
                          onPress={() => updateLine(idx, { sku: p.sku })}
                        >
                          <Text style={[styles.skuChipText, active && styles.skuChipTextActive]}>
                            {p.sku}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <View style={styles.qtyRow}>
                    <Text style={styles.qtyLabel}>Cantidad ({prod.unit}):</Text>
                    <TextInput
                      style={styles.qtyInput}
                      keyboardType="numeric"
                      value={line.quantity}
                      onChangeText={(val) => updateLine(idx, { quantity: val })}
                    />
                    {lines.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeLineBtn}
                        onPress={() => setLines((l) => l.filter((_, i) => i !== idx))}
                      >
                        <AppIcon name="close" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.addLineBtn}
              onPress={() => setLines((l) => [...l, { sku: products[0].sku, quantity: "1" }])}
            >
              <AppIcon name="plus" size={16} color={colors.primary} />
              <Text style={styles.addLineText}>Agregar otro producto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Justificación</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="¿Para qué se usarán estos insumos?"
              placeholderTextColor={colors.textLight}
              value={reason}
              onChangeText={setReason}
              multiline
            />
          </View>
        </>
      )}
    </ModalShell>
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
    height: 80,
    textAlignVertical: "top",
    paddingTop: 8,
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
  emptyNote: {
    fontSize: 13,
    color: colors.warning,
    paddingVertical: 12,
    textAlign: "center",
  },
  pillsScroll: {
    flexDirection: "row",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  lineCard: {
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 6,
  },
  lineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lineProdName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  lineStock: {
    fontSize: 11,
    color: colors.textMuted,
  },
  skuScroll: {
    flexDirection: "row",
    marginVertical: 4,
  },
  skuChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  skuChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  skuChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text,
  },
  skuChipTextActive: {
    color: "#FFFFFF",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  qtyInput: {
    width: 60,
    height: 34,
    backgroundColor: colors.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: "center",
    fontSize: 13,
    color: colors.text,
  },
  removeLineBtn: {
    padding: 6,
  },
  addLineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  addLineText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
  },
});
