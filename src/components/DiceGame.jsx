import React, { useState } from "react";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Sparkles } from "lucide-react";

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const MESSAGES = {
  6: ["Lucky six! 🔥", "Can't beat that.", "Big number energy."],
  1: ["Ouch, a one.", "Rough roll.", "Everyone gets a one sometimes."],
  default: ["Not bad.", "Solid roll.", "Keep going.", "Rolling along."],
};

function getMessage(value) {
  const pool = MESSAGES[value] || MESSAGES.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getStreak() {
  return parseInt(localStorage.getItem("atlasglobe-dice-streak") || "0", 10);
}

export default function DiceGame() {
  const [value, setValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState("Give it a roll.");
  const [streak, setStreak] = useState(getStreak);
  const [rolls, setRolls] = useState(0);

  const Icon = DICE_ICONS[value - 1];

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * 6) + 1);
      ticks++;
      if (ticks >= 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setValue(finalValue);
        setMessage(getMessage(finalValue));
        setRolling(false);
        setRolls((r) => r + 1);
        if (finalValue === 6) {
          const next = getStreak() + 1;
          localStorage.setItem("atlasglobe-dice-streak", String(next));
          setStreak(next);
        }
      }
    }, 60);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      <div className="border-2 border-border rounded-2xl bg-card p-6 sm:p-8 shadow-[5px_5px_0_hsl(var(--border))] flex flex-col sm:flex-row items-center gap-8">
        <div className="flex-1 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-dashed border-border font-mono text-xs uppercase tracking-wider rotate-1">
            <Sparkles className="w-3.5 h-3.5" /> Free · No stakes
          </span>
          <h2 className="font-display font-bold text-2xl mt-3">Bored while you browse?</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm">
            Roll the dice for fun.
          </p>
          {rolls > 0 && (
            <p className="font-mono text-xs text-muted-foreground mt-3">
              Rolls this visit: {rolls} · Sixes rolled ever: {streak}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-24 h-24 rounded-2xl border-2 border-border bg-secondary flex items-center justify-center transition-transform ${
              rolling ? "scale-95" : "scale-100"
            }`}
          >
            <Icon className="w-14 h-14" />
          </div>
          <p className="font-mono text-sm text-muted-foreground h-4">{message}</p>
          <button
            onClick={roll}
            disabled={rolling}
            className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl border-2 border-border shadow-[3px_3px_0_hsl(var(--border))] hover:shadow-[1px_1px_0_hsl(var(--border))] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-60"
          >
            {rolling ? "Rolling..." : "Roll the dice"}
          </button>
        </div>
      </div>
    </section>
  );
}
