import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../../auth/firebase";

export default function FocusAreasCard() {
  const [loading, setLoading] = useState(true);
  const [tagXP, setTagXP] = useState({});
  const [masteryScores, setMasteryScores] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

          setTagXP(data.tag_xp || {});
          setMasteryScores(data.mastery_scores || {});
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // -----------------------------
  // STRONG AREAS (XP HIGH)
  // -----------------------------
  const strengths = Object.entries(tagXP)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // -----------------------------
  // WEAK AREAS (MOST NEGATIVE / LOW)
  // -----------------------------
  const weaknesses = Object.entries(masteryScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3);

  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Focus Areas
      </Typography>

      {loading && <CircularProgress size={20} />}

      {/* ---------------- STRENGTHS ---------------- */}
      <Typography variant="subtitle2" sx={{ color: "green", mb: 1 }}>
        Strengths
      </Typography>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {strengths.length > 0 ? (
          strengths.map(([tag, xp]) => (
            <Chip
              key={tag}
              label={`${tag} (${xp} XP)`}
              color="success"
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No strengths yet — keep practicing 🚀
          </Typography>
        )}
      </Box>

      {/* ---------------- WEAKNESSES ---------------- */}
      <Typography variant="subtitle2" sx={{ color: "red", mb: 1 }}>
        Needs Improvement
      </Typography>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {weaknesses.length > 0 ? (
          weaknesses.map(([tag, score]) => (
            <Chip
              key={tag}
              label={`${tag} (${score})`}
              color="error"
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No weak areas detected 🎉
          </Typography>
        )}
      </Box>

    </Paper>
  );
}