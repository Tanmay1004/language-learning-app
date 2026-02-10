import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../../auth/firebase";
import { expandDotFields } from "../../../../shared/utils/firestore";

const POS_META = {
  verb: "Verb Tense & Form",
  "verb.modal": "Modal Verbs",
  "verb.auxiliary": "Auxiliary Verbs",
  adjective: "Adjectives",
  adverb: "Adverbs",
  determiner: "Articles / Determiners",
  preposition: "Prepositions",
  pronoun: "Pronouns",
  possessive: "Possessives",
  conjunction: "Conjunctions",
  contraction: "Contractions",
  punctuation: "Punctuation",
  orthography: "Spelling / Capitalization",
  lexical: "Word Choice",
  grammar: "General Grammar",
  colloquialism: "Colloquial Usage",
};

function FocusPill({ title, value, gradient }) {
  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.6,
        borderRadius: 999,
        background: gradient,
        color: "#000",
        fontWeight: 600,
        textAlign: "center",
        fontSize: 15,
        letterSpacing: 0.2,
        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
      }}
    >
      <span style={{ opacity: 0.75 }}>{title}:</span>{" "}
      <span>{value}</span>
    </Box>
  );
}

export default function FocusAreasCard() {
  const [loading, setLoading] = useState(true);
  const [grammarFocus, setGrammarFocus] = useState(null);
  const [pronunciationFocus, setPronunciationFocus] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // ---- Grammar ----
        const grammarRef = doc(db, "users", user.uid, "chatErrors", "errors");
        const grammarSnap = await getDoc(grammarRef);

        if (grammarSnap.exists()) {
          const expanded = expandDotFields(grammarSnap.data());
          const topGrammar = Object.entries(expanded)
            .filter(([pos, v]) => POS_META[pos] && v?.count > 0)
            .sort((a, b) => b[1].count - a[1].count)[0];

          if (topGrammar) {
            setGrammarFocus(POS_META[topGrammar[0]]);
          }
        }

        // ---- Pronunciation ----
        const pronRef = doc(
          db,
          "users",
          user.uid,
          "pronunciationStats",
          "errors"
        );
        const pronSnap = await getDoc(pronRef);

        if (pronSnap.exists()) {
          const weakest = Object.entries(pronSnap.data())
            .filter(([, v]) => typeof v?.score === "number")
            .sort((a, b) => a[1].score - b[1].score)[0];

          if (weakest) {
            setPronunciationFocus(weakest[0]);
          }
        }
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
          Focus Areas
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && !grammarFocus && !pronunciationFocus && (
          <Typography variant="body2" color="text.secondary">
            You’re doing great so far — no clear weaknesses detected yet 🎉
          </Typography>
        )}

        {!loading && (grammarFocus || pronunciationFocus) && (
          <Stack spacing={1.8} sx={{ mt: 1 }}>
            {grammarFocus && (
              <FocusPill
                title="🧠 Grammar"
                value={grammarFocus}
                gradient="linear-gradient(135deg, #ff6b6b, #ff8e53)"
              />
            )}

            {pronunciationFocus && (
              <FocusPill
                title="🗣️ Pronunciation"
                value={`“${pronunciationFocus}”`}
                gradient="linear-gradient(135deg, #2dd4bf, #38bdf8)"
              />
            )}
          </Stack>
        )}

        {!loading && (grammarFocus || pronunciationFocus) && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, lineHeight: 1.6 }}
          >
            These are your highest-impact improvement areas right now.
            Tackling them will give you the fastest progress 🚀
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
