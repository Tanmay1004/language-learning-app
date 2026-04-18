import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },

  colorSchemes: {
    light: true,
    dark: true,
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  palette: {
    light: {
      background: {
        default: "#ffffff",
        paper: "#ffffff",
      },
      text: {
        primary: "#111827",
        secondary: "#6b7280",
      },
    },

    dark: {
      background: {
        default: "#0b0f19",
        paper: "#111827",
      },
      text: {
        primary: "#f9fafb",
        secondary: "#9ca3af",
      },
    },
  },

  components: {
    /* ========================= */
    /* CARD CLEAN SYSTEM */
    /* ========================= */
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 16,
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
          backdropFilter: "none",
        },
      },
    },

    /* ========================= */
    /* PAPER CLEAN SYSTEM */
    /* ========================= */
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
        },
      },
    },

    /* ========================= */
    /* BUTTONS (CLEAN CHATGPT STYLE) */
    /* ========================= */
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;