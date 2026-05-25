/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface MatchCountdownProps {
  startTime: string;
  isCompact?: boolean;
}

export const MatchCountdown: React.FC<MatchCountdownProps> = ({ 
  startTime,
  isCompact = false 
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(startTime) - +new Date();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      };
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  if (timeLeft.isOver) {
    return (
      <div className="flex items-center space-x-1.5 text-rose-400 font-mono text-[11px] font-semibold py-0.5" id="countdown-ended">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <span>Starting Any Moment!</span>
      </div>
    );
  }

  if (isCompact) {
    return (
      <div className="flex items-center space-x-1 text-emerald-400 font-mono text-[11px]" id="countdown-compact">
        <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-400 mr-0.5 shrink-0" />
        {timeLeft.days > 0 && <span className="font-bold">{timeLeft.days}d</span>}
        <span className="font-bold bg-[#0A0E1A]/60 px-1 py-0.5 rounded">{timeLeft.hours.toString().padStart(2, "0")}h</span>
        <span className="text-zinc-600">:</span>
        <span className="font-bold bg-[#0A0E1A]/60 px-1 py-0.5 rounded">{timeLeft.minutes.toString().padStart(2, "0")}m</span>
        <span className="text-zinc-600">:</span>
        <span className="font-bold text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded animate-pulse">{timeLeft.seconds.toString().padStart(2, "0")}s</span>
      </div>
    );
  }

  return (
    <div className="bg-[#12192A] border border-[#1F2C4C] rounded-xl p-3 my-3" id="countdown-block-advanced">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-bold">MATCH COUNTDOWN</span>
        <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-1.5 py-0.5 rounded">HURRY UP!</span>
      </div>
      <div className="flex items-center justify-between" id="timer-segments">
        <div className="flex items-center space-x-3">
          <Clock className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
          <div className="flex items-center space-x-1">
            {timeLeft.days > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-white font-mono bg-[#162038] px-2 py-1 rounded border border-[#26375E]">
                    {timeLeft.days}
                  </span>
                  <span className="text-[8px] text-zinc-500 font-mono uppercase font-bold mt-0.5">Days</span>
                </div>
                <span className="text-zinc-600 font-bold">:</span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-white font-mono bg-[#162038] px-2 py-1 rounded border border-[#26375E] min-w-[28px] text-center">
                {timeLeft.hours.toString().padStart(2, "0")}
              </span>
              <span className="text-[8px] text-zinc-500 font-mono uppercase font-bold mt-0.5">Hours</span>
            </div>
            <span className="text-zinc-600 font-bold">:</span>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-white font-mono bg-[#162038] px-2 py-1 rounded border border-[#26375E] min-w-[28px] text-center">
                {timeLeft.minutes.toString().padStart(2, "0")}
              </span>
              <span className="text-[8px] text-zinc-500 font-mono uppercase font-bold mt-0.5">Mins</span>
            </div>
            <span className="text-zinc-600 font-bold">:</span>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-amber-400 font-mono bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 min-w-[28px] text-center animate-pulse">
                {timeLeft.seconds.toString().padStart(2, "0")}
              </span>
              <span className="text-[8px] text-zinc-500 font-mono uppercase font-bold mt-0.5">Secs</span>
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-400 font-sans tracking-wide">Ready To Play</span>
      </div>
    </div>
  );
};
