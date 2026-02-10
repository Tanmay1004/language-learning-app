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
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";

import { auth } from "../firebase";

export default function SignUpForm({ setModalOpen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ---------------- email/password signup OR linking ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const user = auth.currentUser;

      if (user) {
        /* 🔗 LINK EMAIL/PASSWORD TO EXISTING USER (Google → Email) */
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(user, credential);

        toast.success("Email & password added to your account");
      } else {
        /* 🆕 BRAND NEW USER */
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created successfully");
      }

      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Signup / linking failed");
    }
  };

  /* ---------------- google signup ---------------- */

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google");
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Google sign-up failed");
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
          {auth.currentUser ? "Add Email Login" : "Sign Up"}
        </Typography>

        {auth.currentUser && (
          <Typography variant="body2" mb={2} sx={{ opacity: 0.85 }}>
            You’re signed in with Google. Add email & password for alternate login.
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

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{
              sx: { backgroundColor: "#2a2a3d", color: "#fff" },
            }}
            InputLabelProps={{
              sx: { color: "#fff" },
            }}
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            {auth.currentUser ? "Link Email Login" : "Sign Up"}
          </Button>
        </form>

        {!auth.currentUser && (
          <>
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
              Sign up with Google
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
