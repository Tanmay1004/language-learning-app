import React, { useState } from "react";
import { AccountCircle } from "@mui/icons-material";
import {
  AppBar,
  Modal,
  Tab,
  Tabs,
  Zoom,
  Menu,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LinkIcon from "@mui/icons-material/Link";
import { toast } from "react-toastify";

import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import { auth } from "../firebase";
import { GoogleAuthProvider, linkWithPopup } from "firebase/auth";

/* ---------------- styled components ---------------- */

const CustomTab = styled(Tab)({
  color: "white",
  "&.Mui-selected": {
    color: "lightgray",
  },
});

const ModalContent = styled("div")({
  width: 400,
  outline: "none",
  maxHeight: "90vh",
  overflowY: "auto",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

/* ---------------- component ---------------- */

export default function UserIcon() {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0 = login, 1 = signup
  const [authMode, setAuthMode] = useState("tabs");
  // "tabs" | "signup-only"

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  /* -------- provider detection (NEW) -------- */

  const providers = user?.providerData.map(p => p.providerId) || [];
  const hasPassword = providers.includes("password");
  const hasGoogle = providers.includes("google.com");

  /* ---------------- handlers ---------------- */

  const handleIconClick = (event) => {
    if (user) {
      setAnchorEl(event.currentTarget);
    } else {
      setAuthMode("tabs");
      setTabValue(0);
      setOpen(true);
    }
  };

  const handleModalClose = () => {
    setTabValue(0);
    setAuthMode("tabs");
    setOpen(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const logout = async () => {
    try {
      await auth.signOut();
      toast.success("Logged out successfully");
      handleMenuClose();
    } catch (err) {
      toast.error(err.message || "Failed to log out");
    }
  };

  /* ---------------- render ---------------- */

  return (
    <>
      <AccountCircle
        onClick={handleIconClick}
        sx={{
          cursor: "pointer",
          marginLeft: "20px",
          fontSize: 40,
        }}
      />

      {/* ---------- AUTH MODAL ---------- */}
      <Modal
        open={open}
        onClose={handleModalClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Zoom in={open} timeout={300}>
          <ModalContent>
            <AppBar
              position="static"
              sx={{
                background:
                  "linear-gradient(135deg, #1e1e2f 80%, #3f3f5a 100%)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              }}
            >
              {authMode === "tabs" && (
                <Tabs
                  variant="fullWidth"
                  value={tabValue}
                  onChange={(_, v) => setTabValue(v)}
                >
                  <CustomTab label="Login" />
                  <CustomTab label="Sign Up" />
                </Tabs>
              )}
            </AppBar>

            {authMode === "tabs" && tabValue === 0 && (
              <LoginForm setModalOpen={setOpen} />
            )}

            {authMode === "tabs" && tabValue === 1 && (
              <SignUpForm setModalOpen={setOpen} />
            )}

            {authMode === "signup-only" && (
              <SignUpForm setModalOpen={setOpen} />
            )}
          </ModalContent>
        </Zoom>
      </Modal>

      {/* ---------- LOGGED-IN MENU ---------- */}
      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            navigate("/dashboard");
          }}
        >
          <DashboardOutlinedIcon sx={{ mr: 1 }} />
          Dashboard
        </MenuItem>

        {/* 🔗 PROVIDER-AWARE LINKING (NEW) */}
        {hasGoogle && !hasPassword && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              setAuthMode("signup-only");
              setOpen(true);
            }}
          >
            <LinkIcon sx={{ mr: 1 }} />
            Add Email Login
          </MenuItem>
        )}

        {hasPassword && !hasGoogle && (
  <MenuItem
    onClick={async () => {
      handleMenuClose();
      try {
        const provider = new GoogleAuthProvider();
        await linkWithPopup(auth.currentUser, provider);
        toast.success("Google login linked successfully");
      } catch (err) {
        toast.error(err.message || "Google linking failed");
      }
    }}
  >
    <LinkIcon sx={{ mr: 1 }} />
    Add Google Login
  </MenuItem>
)}


        <MenuItem onClick={logout}>
          <LogoutOutlinedIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
