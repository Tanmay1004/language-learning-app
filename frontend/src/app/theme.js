import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },

  colorSchemes: { light: true, dark: true },

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },

  // 🔒 BOOTSTRAP-PROOF MUI OVERRIDES
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',            // kills bootstrap gradients
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: 'none',
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',            // stops bs vars from leaking
        },
      },
    },
  },
});

export default theme;
