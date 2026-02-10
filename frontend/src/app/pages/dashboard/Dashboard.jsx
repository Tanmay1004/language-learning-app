import { useEffect, useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";

import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../../auth/firebase";

import FocusAreasCard from "./cards/FocusAreasCard";
import GrammarWeaknessCard from "./cards/GrammarWeaknessCard";
import PronunciationWeaknessCard from "./cards/PronunciationWeaknessCard";
import RecentActivityCard from "./cards/RecentActivityCard";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // -----------------------
    // Auth guard
    // -----------------------
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u || null);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    Loading dashboard…
                </Typography>
            </Box>
        );
    }

    if (!user) {
        return (
            <Box sx={{ p: 3, maxWidth: 600 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Sign in to see your dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Your dashboard shows personalized grammar and pronunciation insights.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/")}>
                        Go to Home
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Your Learning Dashboard
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                    },
                    gap: 2,
                }}
            >
                {/* Row 1 */}
                <FocusAreasCard />
                <GrammarWeaknessCard />

                {/* Row 2 */}
                <PronunciationWeaknessCard />
                <RecentActivityCard />
            </Box>
        </Box>

    );
}
