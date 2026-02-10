import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    CircularProgress,
} from "@mui/material";
import {
    collection,
    getDocs,
    orderBy,
    limit,
    query,
} from "firebase/firestore";
import { db, auth } from "../../../../auth/firebase";

/* ---------------- Time helper ---------------- */

function timeAgo(ts) {
    if (!ts) return "";
    const diff = Date.now() - ts.toDate().getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

/* ---------------- Card ---------------- */

export default function RecentActivityCard() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    useEffect(() => {
        async function load() {
            const user = auth.currentUser;
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const chatQ = query(
                    collection(db, "users", user.uid, "chatAttempts"),
                    orderBy("startedAt", "desc"),
                    limit(5)
                );

                const pronQ = query(
                    collection(db, "users", user.uid, "pronunciationAttempts"),
                    orderBy("createdAt", "desc"),
                    limit(5)
                );

                const [chatSnap, pronSnap] = await Promise.all([
                    getDocs(chatQ),
                    getDocs(pronQ),
                ]);

                const chatItems = chatSnap.docs.map((d) => ({
                    type: "chat",
                    id: d.id,
                    title: `Chat · ${d.data().scenarioId}`,
                    meta: `${d.data().turns || 0} turns`,
                    ts: d.data().startedAt,
                }));

                const pronItems = pronSnap.docs.map((d) => ({
                    type: "pronunciation",
                    id: d.id,
                    title: "Pronunciation Practice",
                    meta: `Score: ${d.data().overall ?? "—"}`,
                    ts: d.data().createdAt,
                }));

                const merged = [...chatItems, ...pronItems]
                    .filter((i) => i.ts)
                    .sort((a, b) => b.ts.toDate() - a.ts.toDate())
                    .slice(0, 5);

                setItems(merged);
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return (
        <Card
            sx={{
                height: "100%",
                minHeight: 420, // ✅ SAME AS PRONUNCIATION
                background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
        >

            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Recent Activity
                </Typography>

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                {!loading && items.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        No activity yet. Start a chat or pronunciation practice 🚀
                    </Typography>
                )}

                {!loading && items.length > 0 && (
                    <Stack spacing={1.6}>
                        {items.map((item) => (
                            <Box
                                key={item.type + item.id}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 2,
                                    px: 1.6,
                                    minHeight: 64, // 🔥 MATCH
                                    borderRadius: 2,
                                    background:
                                        item.type === "chat"
                                            ? "rgba(66,165,245,0.08)"
                                            : "rgba(38,198,218,0.08)",
                                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
                                    },
                                }}
                            >

                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600 }}
                                        noWrap
                                    >
                                        {item.title}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {item.meta}
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "text.secondary",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {timeAgo(item.ts)}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}
