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

/* ---------------- Severity Bar ---------------- */

function SeverityBar({ score, recent }) {
    const capped = Math.min(score, 2.2);
    const severityPct = (capped / 2.2) * 100;

    let label = "Stable";
    let gradient = "linear-gradient(90deg, #66bb6a, #81c784)";
    let glow = "none";

    if (score > 1.2) {
        label = "Needs attention";
        gradient = "linear-gradient(90deg, #ef5350, #e57373)";
        glow = "0 0 14px rgba(239,83,80,0.55)";
    } else if (score > 0.6) {
        label = "Improving";
        gradient = "linear-gradient(90deg, #ffa726, #ffb74d)";
    }

    return (
        <Box sx={{ minWidth: 130 }}>
            <Typography
                variant="caption"
                sx={{
                    color: recent ? "warning.light" : "text.secondary",
                    mb: 0.3,
                    fontWeight: recent ? 600 : 400,
                }}
            >
                {label}
            </Typography>

            <Box
                sx={{
                    height: 8,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.14)",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        width: `${severityPct}%`,
                        height: "100%",
                        background: gradient,
                        boxShadow: glow,
                        transition: "width 0.45s cubic-bezier(.4,0,.2,1)",
                    }}
                />
            </Box>
        </Box>
    );
}

/* ---------------- Card ---------------- */

export default function PronunciationWeaknessCard() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const ref = doc(
                    db,
                    "users",
                    user.uid,
                    "pronunciationStats",
                    "errors"
                );
                const snap = await getDoc(ref);

                if (!snap.exists()) {
                    setItems([]);
                    return;
                }

                const now = Date.now();

                const rows = Object.entries(snap.data())
                    .filter(([, v]) => typeof v?.score === "number")
                    .map(([word, v]) => ({
                        word,
                        score: v.score,
                        recent:
                            v.lastMistakeAt &&
                            now - v.lastMistakeAt.toMillis() < 48 * 60 * 60 * 1000,
                    }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5);

                setItems(rows);
            } finally {
                setLoading(false);
            }
        });

        return () => unsub();
    }, []);

    return (
        <Card
            sx={{
                height: "100%",
                minHeight: 420, // 🔥 MATCHES RecentActivity
                background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
        >
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ letterSpacing: 0.3 }}>
                    Pronunciation Focus
                </Typography>

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                {!loading && items.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        No active pronunciation problem words.
                        Your consistency is paying off 🎧✨
                    </Typography>
                )}

                {!loading && items.length > 0 && (
                    <Stack spacing={1.6}>
                        {items.map((item) => (
                            <Box
                                key={item.word}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 2,
                                    px: 1.6,
                                    minHeight: 64, // 🔥 MATCH ROW HEIGHT
                                    borderRadius: 2,
                                    background: item.recent
                                        ? "rgba(239,83,80,0.1)"
                                        : "rgba(255,255,255,0.05)",
                                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
                                    },
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        maxWidth: 150,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    “{item.word}”
                                </Typography>

                                <SeverityBar score={item.score} recent={item.recent} />
                            </Box>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}
