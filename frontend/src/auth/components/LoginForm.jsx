import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Divider,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { toast } from "react-toastify";

import {
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithCredential,
  linkWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase";

export default function LoginForm({ setModalOpen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /* ---------------- email/password login ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful");
      setModalOpen(false);
    } catch (err) {
      setError(err.message || "Login failed");
      toast.error(err.message || "Login failed");
    }
  };

  /* ---------------- google login + linking ---------------- */

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      toast.success("Login successful");
      setModalOpen(false);
    } catch (err) {
      if (err.code === "auth/account-exists-with-different-credential") {
        const pendingCred = err.credential;
        const email = err.customData.email;

        const password = window.prompt(
          `An account already exists for ${email}. Enter your password to link Google login:`
        );

        if (!password) return;

        try {
          const emailCred = EmailAuthProvider.credential(email, password);
          const result = await signInWithCredential(auth, emailCred);

          await linkWithCredential(result.user, pendingCred);

          toast.success("Google account linked successfully");
          setModalOpen(false);
        } catch (linkErr) {
          toast.error(linkErr.message || "Account linking failed");
        }
      } else {
        toast.error(err.message || "Google sign-in failed");
      }
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Container
      maxWidth="sm"
      sx={{
        background:
          "linear-gradient(135deg, #1e1e2f 30%, #3f3f5a 70%, #2a2a3d 100%)",
        color: "#ffffff",
        padding: "2rem",
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h5" mb={2}>
          Sign In
        </Typography>

        {error && (
          <Typography color="error" variant="body2" mb={2}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              sx: { backgroundColor: "#2a2a3d", color: "#fff" },
            }}
            InputLabelProps={{
              sx: { color: "#fff" },
            }}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              sx: { backgroundColor: "#2a2a3d", color: "#fff" },
            }}
            InputLabelProps={{
              sx: { color: "#fff" },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </form>

        <Divider sx={{ my: 2, color: "#fff" }}>OR</Divider>

        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          fullWidth
          onClick={handleGoogleSignIn}
          sx={{
            color: "#ffffff",
            borderColor: "#ffffff",
            "&:hover": {
              borderColor: "#ffffff",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          Sign in with Google
        </Button>
      </Box>
    </Container>
  );
}
