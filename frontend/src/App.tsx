import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoginScreen } from "./features/auth/LoginScreen";
import { InventoryDashboard } from "./features/inventory/InventoryDashboard";
import { InventoryProvider } from "./features/inventory/store";
import type { Role } from "./types/inventory";

export default function App() {
  const [session, setSession] = useState<{ role: Role } | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {!session ? (
        <LoginScreen onLogin={(role) => setSession({ role })} />
      ) : (
        <InventoryProvider>
          <InventoryDashboard
            role={session.role}
            onLogout={() => setSession(null)}
          />
        </InventoryProvider>
      )}
    </SafeAreaProvider>
  );
}
