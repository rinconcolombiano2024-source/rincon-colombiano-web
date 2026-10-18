"use client";

/** Shared entry point into the existing assistant, without a second chat. */
export function OpenRinconAiButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return <button type="button" className={className} aria-haspopup="dialog" onClick={() => window.dispatchEvent(new Event("rc-open-ai"))}>{children}</button>;
}
