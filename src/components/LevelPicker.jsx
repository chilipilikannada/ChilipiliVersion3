import { useState } from "react";
import { ArrowUp, ArrowDown, Check } from "lucide-react";
import { store } from "../lib/store/index.js";
import { useApp, firstName } from "../lib/hooks.js";
import { LEVELS, levelOf, levelPatch } from "../lib/course.js";
import { friendlyError } from "../App.jsx";
import { isAdult, ADULT_LEVELS, adultLevelOf, adultLevelPatch } from "../lib/adult.js";

// Level 1 to 4. Anyone in the family can move up to explore harder work, or come back down.
export default function LevelPicker({ child, kid = false, onChanged }) {
  const { say, profile } = useApp();
  const adult = isAdult(child);
  const LIST = adult ? ADULT_LEVELS : LEVELS;
  const cur = adult ? adultLevelOf(child) : levelOf(child);
  const [confirm, setConfirm] = useState(null);
  const nm = firstName(child.name);
  async function move(n) {
    try {
      await store.update("children", child.id, { ...(adult ? adultLevelPatch(n) : levelPatch(n)), levelBy: profile.role === "teacher" || profile.role === "admin" ? "teacher" : profile.role === "kid" ? "child" : "family", levelAt: Date.now() });
      await store.add("activity", { childId: child.id, parentEmails: child.parentEmails, kind: "level", item: `level ${cur} → ${n}`, stars: 0, week: 0, at: Date.now() }).catch(() => {});
      say(n > cur ? `Level ${n}: ${LIST[n - 1].en}! It's harder. Come back any time.` : `Back to level ${n}: ${LIST[n - 1].en}.`);
      setConfirm(null); onChanged && onChanged(n);
    } catch (e) { say(friendlyError(e), true); }
  }
  return (
    <div className="level-ladder">
      {LIST.map((L) => {
        const on = L.n === cur;
        return (
          <div key={L.n} className={`level-card ${on ? "on" : ""}`}>
            <span className="lv-icon" aria-hidden="true">{L.icon}</span>
            <div className="lv-body">
              <b>Level {L.n}: {L.en} <span className="kn muted" style={{ fontWeight: 500 }}>{L.kn}</span></b>
              {!adult && <span className="tiny muted">Ages {L.ages}</span>}
              {(!kid || on) && <span className="small">{L.what}</span>}
            </div>
            {on ? <span className="pill green"><Check size={14} /> {kid || (adult && profile.role !== "teacher" && profile.role !== "admin") ? "Me now" : `${nm} now`}</span>
              : confirm === L.n ? (
                <div className="lv-confirm">
                  <span className="small">{L.n > cur ? (kid ? "It will be harder. Ready?" : `Harder work for ${nm}. You can come back any time.`) : "Go back to this level?"}</span>
                  <div className="row"><button className="btn primary small" onClick={() => move(L.n)}>Yes</button><button className="btn ghost small" onClick={() => setConfirm(null)}>No</button></div>
                </div>
              ) : (
                <button className={`btn small ${L.n > cur ? "yellow" : "ghost"}`} onClick={() => setConfirm(L.n)}>
                  {L.n > cur ? <><ArrowUp size={16} /> Try it</> : <><ArrowDown size={16} /> Easier</>}
                </button>
              )}
          </div>
        );
      })}
      {adult ? <p className="tiny muted" style={{ margin: 0 }}>Every lesson stays open whatever the level; the level decides what comes next and whether the script is part of the daily plan.</p> : <p className="tiny muted" style={{ margin: 0 }}>Ages are only a guide. Children can try any level, even if it's hard. Letters also have their own journey, with a quick check to jump ahead.</p>}
    </div>
  );
}
