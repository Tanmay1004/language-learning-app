import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../auth/firebase";

import LocalPolice from "@mui/icons-material/LocalPolice";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarIcon from "@mui/icons-material/Star";
import DiamondIcon from "@mui/icons-material/Diamond";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import GrassIcon from "@mui/icons-material/Grass";

import "./styles/bootstrap-legacy.scoped.css";
import "./styles/badges.css";

// ---------------- BADGE CONFIG ----------------
const badges = [
    // STREAK BADGES
    { id: "streak_7", name: "Streaky", icon: StarIcon, type: "streak", req: 7 },
    { id: "streak_30", name: "Workhorse", icon: MilitaryTechIcon, type: "streak", req: 30 },

    // XP BADGES
    { id: "xp_100", name: "Bronze", icon: EmojiEventsIcon, type: "xp", req: 100 },
    { id: "xp_200", name: "Silver", icon: WorkspacePremiumIcon, type: "xp", req: 200 },
    { id: "xp_300", name: "Gold", icon: EmojiEventsIcon, type: "xp", req: 300 },
    { id: "xp_500", name: "Language Sage", icon: GrassIcon, type: "xp", req: 500 },
    { id: "xp_1000", name: "Platinum", icon: AutoAwesomeIcon, type: "xp", req: 1000 },
    { id: "xp_1500", name: "Diamond", icon: DiamondIcon, type: "xp", req: 1500 },
];

export default function Badges() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (!u) return;

            const ref = doc(db, "users", u.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setUser(snap.data());
            }
        });

        return () => unsub();
    }, []);

    if (!user) return null;

    const { totalXP = 0, streak = 0 } = user;

    // ---------------- UNLOCK LOGIC ----------------
    const isUnlocked = (badge) => {
        if (badge.type === "xp") return totalXP >= badge.req;
        if (badge.type === "streak") return streak >= badge.req;
        return false;
    };

    const unlocked = badges.filter(isUnlocked);
    const locked = badges.filter((b) => !isUnlocked(b));

    return (
        <div className="legacy-page">
            <div className="badges">

                <h1 className="text-center pt-4 fw-bold">
                    Badges <LocalPolice />
                </h1>

                {/* UNLOCKED */}
                <h2 className="px-3 mt-3">
                    Unlocked <LockOpenOutlinedIcon />
                </h2>

                <div className="badge-grid px-3">
                    {unlocked.length > 0 ? (
                        unlocked.map((b) => {
                            const Icon = b.icon;
                            return (
                                <div className="badge-card unlocked" key={b.id}>
                                    <Icon className="badge-icon" />
                                    <p className="badge-name">{b.name}</p>
                                </div>
                            );
                        })
                    ) : (
                        <p>No badges unlocked yet 🚀</p>
                    )}
                </div>

                {/* LOCKED */}
                <h2 className="px-3 mt-5">
                    Locked <LockOutlinedIcon />
                </h2>

                <div className="badge-grid px-3">
                    {locked.map((b) => {
                        const Icon = b.icon;
                        return (
                            <div className="badge-card locked" key={b.id}>
                                <Icon className="badge-icon" />
                                <p className="badge-name">{b.name}</p>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}