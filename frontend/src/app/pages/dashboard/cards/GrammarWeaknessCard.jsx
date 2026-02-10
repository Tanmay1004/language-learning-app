import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../../auth/firebase";
import { expandDotFields } from "../../../../shared/utils/firestore";

const POS_META = {
  verb: { label: "Verb Tense & Form", color: "#ef5350" },
  "verb.modal": { label: "Modal Verbs", color: "#f06292" },
  "verb.auxiliary": { label: "Auxiliary Verbs", color: "#ec407a" },

  adjective: { label: "Adjectives", color: "#ab47bc" },
  adverb: { label: "Adverbs", color: "#7e57c2" },

  determiner: { label: "Articles / Determiners", color: "#5c6bc0" },
  preposition: { label: "Prepositions", color: "#42a5f5" },

  pronoun: { label: "Pronouns", color: "#26c6da" },
  possessive: { label: "Possessives", color: "#26a69a" },
  conjunction: { label: "Conjunctions", color: "#66bb6a" },

  contraction: { label: "Contractions", color: "#8d6e63" },

  punctuation: { label: "Punctuation", color: "#9ccc65" },
  orthography: { label: "Spelling / Capitalization", color: "#d4e157" },

  lexical: { label: "Word Choice", color: "#ffa726" },
  grammar: { label: "General Grammar", color: "#ff7043" },

  colloquialism: { label: "Colloquial Usage", color: "#90a4ae" },
};

export default function GrammarWeaknessCard() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid, "chatErrors", "errors");
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setItems([]);
          return;
        }

        // Expand Firestore dotted keys → nested objects
        const data = expandDotFields(snap.data());

        const rows = Object.entries(data)
          .filter(([pos, v]) => POS_META[pos] && v?.count > 0)
          .map(([pos, v]) => ({
            pos,
            count: v.count,
            chatCount: v.chatCount || 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setItems(rows);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Grammar Weaknesses
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && items.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No grammar issues detected yet. Keep practicing! 🎉
          </Typography>
        )}

        {!loading && items.length > 0 && (
          <Stack spacing={1.2}>
            {items.map(({ pos, count }) => {
              const meta = POS_META[pos];
              return (
                <Box
                  key={pos}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Chip
                    label={meta.label}
                    size="small"
                    sx={{
                      bgcolor: meta.color,
                      color: "#000",
                      fontWeight: 500,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {count} mistake{count > 1 ? "s" : ""}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
