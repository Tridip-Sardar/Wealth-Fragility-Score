// Mercury/Wealthfront fintech palette:
// Sole accent: Forest green #2D5A4A used only for primary action and resilient score.

export function scoreColor(score: number) {
  if (score >= 80) return "text-[#2D5A4A]";
  return "text-[#1A2332]";
}

export function pillarBarColor(score: number) {
  if (score >= 70) return "bg-[#2D5A4A]";
  if (score >= 40) return "bg-[#1A2332]/50";
  return "bg-[#B54834]";
}
