import React from "react";
import { Outlet } from "react-router-dom";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";

import theme from "./theme";
import { NAVIGATION } from "./navigation";

import XPHud from "../shared/components/XPHud";
import StreakIndicator from "../shared/components/StreakIndicator"; // 👈 add
import UserIcon from "../auth/components/UserIcon";

export default function DashboardLayoutShell() {
  return (
    <AppProvider navigation={NAVIGATION} theme={theme}>
      <DashboardLayout
        slots={{
          toolbarActions: (props) => (
            <>
              {props.children}

              {/* 🔥 Streak */}
              <StreakIndicator />

              {/* XP */}
              <XPHud />

              {/* User */}
              <UserIcon />
            </>
          ),
        }}
      >
        <Outlet />
      </DashboardLayout>
    </AppProvider>
  );
}
