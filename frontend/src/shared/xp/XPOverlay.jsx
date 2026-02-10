import { useEffect, useState } from "react";
import { levelFromXP } from "./xp";

export default function XPOverlay() {
  const [burst, setBurst] = useState(null);
  const [levelUp, setLevelUp] = useState(null);

  useEffect(() => {
    function onChange(e) {
      const meta = e?.detail;
      if (!meta) return;

      // XP burst
      if (meta.delta > 0) {
        setBurst(meta.delta);
        setTimeout(() => setBurst(null), 3000);
      }

      // Level-up detection
      if (meta.prev != null && meta.now != null) {
        const prevLevel = levelFromXP(meta.prev);
        const newLevel = levelFromXP(meta.now);
        if (newLevel > prevLevel) {
          setLevelUp({ from: prevLevel, to: newLevel });
          setTimeout(() => setLevelUp(null), 5000);
        }
      }
    }

    window.addEventListener("xp:changed", onChange);
    return () => window.removeEventListener("xp:changed", onChange);
  }, []);

  return (
    <>
      {/* XP burst below AppBar */}
      {burst && (
        <div
          style={{
            position: "fixed",
            top: 72,     // just below AppBar
            right: 24,   // visually under HUD
            zIndex: 9999,
          }}
        >
          <div className="xp-chip">+{burst} XP</div>
        </div>
      )}

      {/* Global level-up banner */}
      {levelUp && (
        <div className="levelup">
          <span className="levelup__title">Level Up!</span>
          <span className="levelup__sub">
            {levelUp.from} → <strong>{levelUp.to}</strong>
          </span>
        </div>
      )}
    </>
  );
}
