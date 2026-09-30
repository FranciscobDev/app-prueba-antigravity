import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, inverse ? styles.iconWrapInverse : styles.iconWrapDefault]}>
        <Ionicons name="cube" size={20} color={inverse ? colors.navy : "#FFFFFF"} />
      </View>
      <View>
        <Text style={[styles.title, inverse ? styles.titleInverse : styles.titleDefault]}>
          ALMACÉN
        </Text>
        <Text style={[styles.subtitle, inverse ? styles.subtitleInverse : styles.subtitleDefault]}>
          CONTROL & GESTIÓN
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDefault: {
    backgroundColor: colors.primary,
  },
  iconWrapInverse: {
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  titleDefault: {
    color: colors.navy,
  },
  titleInverse: {
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  subtitleDefault: {
    color: colors.textMuted,
  },
  subtitleInverse: {
    color: "#94A3B8",
  },
});
