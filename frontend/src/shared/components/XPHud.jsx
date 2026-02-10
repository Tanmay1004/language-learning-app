import { useEffect, useState } from "react";
import { getTotalXP, levelProgress } from "../xp/xp";
import { fetchUserProfile } from "../api/userApi";

export default function XPHud() {
  const [total, setTotal] = useState(getTotalXP());
  const prog = levelProgress(total);

  useEffect(() => {
    function onChange() {
      setTotal(getTotalXP());
    }

    window.addEventListener("xp:changed", onChange);
    window.addEventListener("storage", onChange);

    return () => {
      window.removeEventListener("xp:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // 🔥 SINGLE authoritative /me fetch
  useEffect(() => {
    fetchUserProfile()
      .then((res) => {
        window.dispatchEvent(
          new CustomEvent("user:updated", { detail: res })
        );
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="hud">
      <div className="hud__top">
        <span className="hud__label">XP</span>
        <strong className="hud__total">{total}</strong>
      </div>

      <div className="hud__bar">
        <div
          className="hud__fill"
          style={{ width: `${prog.pct}%` }}
        />
      </div>

      <div className="hud__meta">
        <span className="hud__lvl">Lv {prog.level}</span>
        <span className="hud__count">
          {prog.into} / {prog.span}
        </span>
      </div>
    </aside>
  );
}
