"use client"
import { useEffect } from "react";
import { useTimer } from "react-timer-hook";
type MyTimerProps = {
  expiryTimestamp: Date;
  onExpire: () => void;
  isRunning: boolean;
};
export function MyTimer({ expiryTimestamp, onExpire, isRunning }: MyTimerProps) {
  const {
    totalSeconds,
    milliseconds,
    seconds,
    minutes,
    hours,
    days,
    restart,
    pause,
    resume,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      console.warn("onExpire called");
      onExpire();
    },
    interval: 20,
    autoStart: false,
  });

  useEffect(() => {
    restart(expiryTimestamp, isRunning);
  }, [expiryTimestamp, restart, isRunning]);

  useEffect(() => {
    if (isRunning) {
      resume();
    } else {
      pause();
    }
  }, [isRunning, pause, resume]);

  const pad = (value: number, digits = 2) => value.toString().padStart(digits, "0");

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-wide text-slate-800">
          Time Remaining
        </h2>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Total {totalSeconds} seconds
        </p>
      </div>

      <div className="flex items-end gap-2 font-mono text-4xl sm:text-5xl md:text-6xl">
        <span className="tabular-nums">{pad(days)}</span>
        <span className="pb-2 text-2xl text-slate-400">:</span>
        <span className="tabular-nums">{pad(hours)}</span>
        <span className="pb-2 text-2xl text-slate-400">:</span>
        <span className="tabular-nums">{pad(minutes)}</span>
        <span className="pb-2 text-2xl text-slate-400">:</span>
        <span className="tabular-nums">{pad(seconds)}</span>
        <span className="pb-2 text-2xl text-slate-400">:</span>
        <span className="tabular-nums">{pad(milliseconds, 3)}</span>
      </div>
    </div>
  );
}