import React from "react";
import { Ionicons } from "@expo/vector-icons";

export type IconName =
  | "home"
  | "bell"
  | "box"
  | "swap"
  | "folder"
  | "report"
  | "truck"
  | "settings"
  | "logOut"
  | "plus"
  | "minus"
  | "alert"
  | "chart"
  | "search"
  | "check"
  | "close"
  | "chevron"
  | "chevronDown"
  | "eye"
  | "eyeOff"
  | "user"
  | "info"
  | "upload"
  | "download"
  | "print"
  | "archive";

const ioniconMap: Record<IconName, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  bell: "notifications-outline",
  box: "cube-outline",
  swap: "swap-horizontal-outline",
  folder: "folder-outline",
  report: "document-text-outline",
  truck: "car-outline",
  settings: "settings-outline",
  logOut: "log-out-outline",
  plus: "add",
  minus: "remove",
  alert: "warning-outline",
  chart: "bar-chart-outline",
  search: "search-outline",
  check: "checkmark",
  close: "close",
  chevron: "chevron-forward",
  chevronDown: "chevron-down",
  eye: "eye-outline",
  eyeOff: "eye-off-outline",
  user: "person-outline",
  info: "information-circle-outline",
  upload: "cloud-upload-outline",
  download: "download-outline",
  print: "print-outline",
  archive: "archive-outline",
};

export function AppIcon({
  name,
  size = 20,
  color = "#0F172A",
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const iconName = ioniconMap[name] || "ellipse-outline";
  return <Ionicons name={iconName} size={size} color={color} />;
}
