import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { stockTrend } from "../../data/inventory";
import { colors } from "../../theme/colors";

const MONTHS = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function StockChart() {
  const max = Math.max(...stockTrend, 100);

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {stockTrend.map((val, idx) => {
          const heightPercent = (val / max) * 100;
          const isLatest = idx === stockTrend.length - 1;
          return (
            <View key={idx} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${heightPercent}%` },
                    isLatest && styles.barFillLatest,
                  ]}
                />
              </View>
              <Text style={[styles.monthText, isLatest && styles.monthTextLatest]}>
                {MONTHS[idx]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 90,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    gap: 4,
  },
  barTrack: {
    width: 14,
    height: 70,
    backgroundColor: colors.borderLight,
    borderRadius: 7,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 7,
  },
  barFillLatest: {
    backgroundColor: colors.primaryDark,
  },
  monthText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "500",
  },
  monthTextLatest: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
});
