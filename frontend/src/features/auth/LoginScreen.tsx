import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AppIcon } from "../../components/AppIcon";
import { Logo } from "../../components/Logo";
import type { Role } from "../../types/inventory";
import { colors } from "../../theme/colors";

const roles: Role[] = ["Administrador", "Bodeguero", "Técnico"];

export function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [role, setRole] = useState<Role>("Administrador");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@almacen.com");
  const [password, setPassword] = useState("inventario");

  const handleRoleChange = (r: Role) => {
    setRole(r);
    if (r === "Administrador") setEmail("admin@almacen.com");
    else if (r === "Bodeguero") setEmail("bodega@almacen.com");
    else setEmail("tecnico@almacen.com");
  };

  const handleLogin = () => {
    if (email && password) {
      onLogin(role);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Intro Banner */}
        <View style={styles.heroSection}>
          <Logo inverse />
          <View style={styles.badgeOperating}>
            <View style={styles.dot} />
            <Text style={styles.badgeOperatingText}>Sistema Operativo</Text>
          </View>
          <Text style={styles.heroTitle}>Control claro.{"\n"}Decisiones seguras.</Text>
          <Text style={styles.heroSubtitle}>
            Gestión inteligente de existencias, movimientos y alertas de inventario.
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>ACCESO SEGURO</Text>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>
          <Text style={styles.cardSubtitle}>
            Selecciona tu perfil de acceso para comenzar:
          </Text>

          {/* Role Selector */}
          <View style={styles.rolesRow}>
            {roles.map((r) => {
              const active = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleTab, active && styles.roleTabActive]}
                  onPress={() => handleRoleChange(r)}
                  activeOpacity={0.7}
                >
                  <AppIcon
                    name={r === "Técnico" ? "settings" : "user"}
                    size={16}
                    color={active ? colors.card : colors.textMuted}
                  />
                  <Text style={[styles.roleTabText, active && styles.roleTabTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <View style={styles.inputWrapper}>
              <AppIcon name="user" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="correo@empresa.com"
                placeholderTextColor={colors.textLight}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <AppIcon name="archive" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AppIcon
                  name={showPassword ? "eyeOff" : "eye"}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Ingresar como {role}</Text>
            <AppIcon name="chevron" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <AppIcon name="info" size={16} color={colors.textMuted} />
            <Text style={styles.securityText}>
              Conexión cifrada de acceso corporativo.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  heroSection: {
    marginBottom: 24,
  },
  badgeOperating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(22, 163, 74, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  badgeOperatingText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 32,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
  },
  rolesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  roleTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
  roleTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  loginButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
  },
  securityText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
