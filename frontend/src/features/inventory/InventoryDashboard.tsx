import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import { AppIcon, type IconName } from "../../components/AppIcon";
import { userNames } from "../../data/inventory";
import type { MovementType, Role } from "../../types/inventory";
import { NotificationsView } from "./NotificationsView";
import { OverviewView } from "./OverviewView";
import { ProjectModal, ProjectRequestModal } from "./ProjectModals";
import { ProjectsView } from "./ProjectsView";
import { ReportsView } from "./ReportsView";
import { RequestModal } from "./RequestModal";
import { RequestsView } from "./RequestsView";
import { useInventory } from "./store";
import { InventoryView, KardexView } from "./StockViews";
import { colors } from "../../theme/colors";

const navByRole: Record<Role, { icon: IconName; label: string }[]> = {
  Administrador: [
    { icon: "home", label: "Resumen" },
    { icon: "bell", label: "Notificaciones" },
    { icon: "box", label: "Inventario" },
    { icon: "swap", label: "Kardex" },
    { icon: "folder", label: "Proyectos" },
    { icon: "report", label: "Reportes" },
  ],
  Bodeguero: [
    { icon: "home", label: "Resumen" },
    { icon: "box", label: "Inventario" },
    { icon: "swap", label: "Kardex" },
    { icon: "truck", label: "Solicitudes" },
  ],
  Técnico: [
    { icon: "home", label: "Resumen" },
    { icon: "folder", label: "Proyectos" },
    { icon: "truck", label: "Solicitudes" },
    { icon: "box", label: "Inventario" },
  ],
};

type Modal =
  | { type: "request"; kind: MovementType }
  | { type: "project" }
  | { type: "projectRequest"; projectId?: string }
  | null;

export function InventoryDashboard({
  role,
  onLogout,
}: {
  role: Role;
  onLogout: () => void;
}) {
  const { requests } = useInventory();
  const [activeNav, setActiveNav] = useState("Resumen");
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const name = userNames[role];
  const bellCount =
    role === "Administrador"
      ? requests.filter((r) => r.status === "Pendiente").length
      : role === "Bodeguero"
      ? requests.filter((r) => r.status === "Por despachar").length
      : 0;

  const bellTarget = role === "Administrador" ? "Notificaciones" : "Solicitudes";
  const tabs = navByRole[role];

  const openRequest = (kind: MovementType) => setModal({ type: "request", kind });
  const openProjectRequest = (projectId?: string) =>
    setModal({ type: "projectRequest", projectId });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topbar}>
        <View style={styles.userInfo}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString("es-CL", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </Text>
          <Text style={styles.greetingText}>
            Hola, <Text style={styles.userNameText}>{name.split(" ")[0]}</Text>
          </Text>
        </View>

        <View style={styles.topbarRight}>
          {role !== "Técnico" && (
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => setActiveNav(bellTarget)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="bell" size={22} color={colors.text} />
              {bellCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{bellCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{role}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogout}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppIcon name="logOut" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs (Horizontal Scrollable) */}
      <View style={styles.navBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navBarContent}
        >
          {tabs.map((item) => {
            const active = activeNav === item.label;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => setActiveNav(item.label)}
              >
                <AppIcon
                  name={item.icon}
                  size={16}
                  color={active ? "#FFFFFF" : colors.textMuted}
                />
                <Text
                  style={[styles.navItemText, active && styles.navItemTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {activeNav === "Resumen" && (
          <OverviewView
            go={setActiveNav}
            onRequest={openRequest}
            onProjectRequest={() => openProjectRequest()}
            role={role}
          />
        )}
        {activeNav === "Notificaciones" && role === "Administrador" && (
          <NotificationsView onNotify={setToast} />
        )}
        {activeNav === "Inventario" && (
          <InventoryView onRequest={openRequest} role={role} />
        )}
        {activeNav === "Kardex" && <KardexView />}
        {activeNav === "Proyectos" && (
          <ProjectsView
            role={role}
            onNewProject={() => setModal({ type: "project" })}
            onRequest={openProjectRequest}
          />
        )}
        {activeNav === "Solicitudes" && role !== "Administrador" && (
          <RequestsView
            role={role}
            onNewRequest={() => openProjectRequest()}
            onNotify={setToast}
          />
        )}
        {activeNav === "Reportes" && role === "Administrador" && <ReportsView />}
      </View>

      {/* Toast Notification */}
      {toast && (
        <View style={styles.toast}>
          <AppIcon name="check" size={18} color="#FFFFFF" />
          <Text style={styles.toastText}>{toast}</Text>
          <TouchableOpacity onPress={() => setToast(null)}>
            <AppIcon name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      {modal?.type === "request" && (
        <RequestModal
          kind={modal.kind}
          onClose={() => setModal(null)}
          onSubmitted={setToast}
        />
      )}
      {modal?.type === "project" && (
        <ProjectModal
          onClose={() => setModal(null)}
          onCreated={(id) =>
            setToast(`Proyecto ${id} creado. Ya puedes pedir productos.`)
          }
        />
      )}
      {modal?.type === "projectRequest" && (
        <ProjectRequestModal
          projectId={modal.projectId}
          onClose={() => setModal(null)}
          onSubmitted={(msg) => {
            setToast(msg);
            setActiveNav("Solicitudes");
          }}
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? (Constants.statusBarHeight ?? 0) + 12 : 12,
    paddingBottom: 12,
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    gap: 2,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  greetingText: {
    fontSize: 17,
    color: colors.text,
  },
  userNameText: {
    fontWeight: "800",
  },
  topbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bellBtn: {
    position: "relative",
    padding: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 10,
  },
  bellBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: colors.card,
  },
  bellBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  roleTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleTagText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "700",
  },
  logoutBtn: {
    padding: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 10,
  },
  navBarWrapper: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  navBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
  },
  navItemActive: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  navItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  navItemTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  mainContent: {
    flex: 1,
  },
  toast: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: colors.navy,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
