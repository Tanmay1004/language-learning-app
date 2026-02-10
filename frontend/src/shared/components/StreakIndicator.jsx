import { useEffect, useState } from "react";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import { Box, Typography, Tooltip } from "@mui/material";

export default function StreakIndicator() {
  const [streak, setStreak] = useState(0);

  // Initial user snapshot (from global fetch)
  useEffect(() => {
    const handler = (e) => {
      setStreak(e.detail.streak ?? 0);
    };

    window.addEventListener("user:updated", handler);
    return () => window.removeEventListener("user:updated", handler);
  }, []);

  // Live updates (quiz completion, XP sync)
  useEffect(() => {
    const handler = (e) => setStreak(e.detail);
    window.addEventListener("streak:changed", handler);
    return () => window.removeEventListener("streak:changed", handler);
  }, []);

  const isActive = streak > 0;

  return (
    <Tooltip title={isActive ? `${streak} day streak 🔥` : "No active streak"}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.2,
          py: 0.6,
          borderRadius: "999px",
          border: "2px solid",
          borderColor: isActive ? "#2e7d32" : "#9e9e9e",
          backgroundColor: isActive
            ? "rgba(46, 125, 50, 0.08)"
            : "rgba(158, 158, 158, 0.08)",
        }}
      >
        {isActive ? (
          <WhatshotIcon sx={{ color: "#ff6f00" }} />
        ) : (
          <LocalFireDepartmentOutlinedIcon sx={{ color: "#9e9e9e" }} />
        )}

        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            minWidth: 16,
            color: isActive ? "#2e7d32" : "#9e9e9e",
          }}
        >
          {streak}
        </Typography>
      </Box>
    </Tooltip>
  );
}
