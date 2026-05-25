import React from "react";
import { User } from "../types";
import { getMatches } from "../db";
import { Trophy, Key, Clock, Calendar, ShieldCheck, ArrowRight, Copy, Check } from "lucide-react";
import { MatchCountdown } from "./MatchCountdown";

interface MyMatchesSectionProps {
  currentUser: User;
  setActiveTab: (tab: string) => void;
}

export const MyMatchesSection: React.FC<MyMatchesSectionProps> = ({
  currentUser,
  setActiveTab
}) => {
  const matches = getMatches();
  const joinedMatches = matches.filter(match => match.joinedPlayers.includes(currentUser.uid));
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatStartDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div className="py-6 sm:py-10 bg-[#0B0F19] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Title Indicator block */}
        <div className="flex items-center space-x-3 mb-8 border-b border-[#202A44] pb-4">
          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-sans uppercase">My Subscribed Matches</h2>
            <p className="text-zinc-500 text-xs">Verify your tournament slots and copy active Room ID credentials to join custom servers</p>
          </div>
        </div>

        {joinedMatches.length === 0 ? (
          <div className="text-center py-20 bg-[#101422] rounded-3xl border border-[#1B233A] max-w-4xl mx-auto">
            <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-sans">No Subscriptions Found</h3>
            <p className="text-zinc-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              You haven't joined or subscribed to any tournament matches yet. Explore active premium packages in the Home feed and get started!
            </p>
            <button
              onClick={() => setActiveTab("matches")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-sm tracking-wide shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase flex items-center justify-center space-x-1 mx-auto"
            >
              <span>Explore Home Packages</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {joinedMatches.map(match => {
              const isUpcoming = match.status === "upcoming";
              const isLive = match.status === "live";
              const isCompleted = match.status === "completed";

              return (
                <div 
                  key={match.id}
                  className="bg-[#101525] border border-emerald-500/20 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-xl"
                >
                  {/* Top Header Card */}
                  <div className="p-5 border-b border-[#182035] bg-[#12192A]">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold rounded uppercase">
                          {match.type}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1.5 leading-snug">
                          {match.title}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isLive 
                          ? "bg-rose-500 text-white animate-pulse" 
                          : isCompleted 
                          ? "bg-zinc-650 text-zinc-300" 
                          : "bg-emerald-500 text-slate-950"
                      }`}>
                        {match.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono text-zinc-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Date: {formatStartDate(match.startTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-yellow-400 font-bold">Prize: ৳{match.prize}</span>
                      </div>
                    </div>
                    {isUpcoming && (
                      <div className="mt-4 pt-3 border-t border-[#1C253D]">
                        <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5 font-sans uppercase">
                          <span>⏱️ Match Starts In:</span>
                        </p>
                        <MatchCountdown startTime={match.startTime} />
                      </div>
                    )}
                  </div>

                  {/* Body: Room Access Credentials representation */}
                  <div className="p-5 flex-grow bg-[#101525]">
                    {match.roomDetails?.roomId ? (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
                        <div className="flex items-center space-x-2 text-emerald-400">
                          <Key className="w-4 h-4" />
                          <span className="text-xs font-mono font-bold uppercase">Lobby Access Credentials Unlocked</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                          
                          <div className="bg-[#141B30] p-3 rounded-lg border border-[#212E4C] relative group">
                            <span className="text-[10px] text-zinc-500 block">ROOM ID</span>
                            <span className="text-white font-extrabold text-base tracking-wide select-all">
                              {match.roomDetails.roomId}
                            </span>
                            <button
                              onClick={() => handleCopy(match.roomDetails?.roomId || "", `${match.id}-roomId`)}
                              className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white rounded transition-all cursor-pointer"
                              title="Copy Room ID"
                            >
                              {copiedId === `${match.id}-roomId` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="bg-[#141B30] p-3 rounded-lg border border-[#212E4C] relative group">
                            <span className="text-[10px] text-zinc-500 block">PASSWORD</span>
                            <span className="text-yellow-400 font-extrabold text-base tracking-wide select-all">
                              {match.roomDetails.password}
                            </span>
                            <button
                              onClick={() => handleCopy(match.roomDetails?.password || "", `${match.id}-pass`)}
                              className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white rounded transition-all cursor-pointer"
                              title="Copy Password"
                            >
                              {copiedId === `${match.id}-pass` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                        </div>
                        <p className="text-[10px] text-zinc-500 font-sans leading-relaxed text-center pt-1">
                          Copy the Room ID and Password, open Free Fire, search for Custom Rooms, input details, and enter lobby 10-15 minutes before the start time.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-center">
                        <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-2 animate-pulse" />
                        <span className="text-xs font-mono font-bold text-yellow-400 block uppercase">Slots Reserved - Awaiting Server Room ID</span>
                        <p className="text-[10px] text-zinc-400 font-sans leading-relaxed mt-1.5">
                          You have successfully joined! The Admin will update and publish the Custom Server Room ID and Password 15 minutes before the match start time. Check back here!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rules Footer inside item */}
                  <div className="p-4 bg-[#0F1424] border-t border-[#1C243B] flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      Slot Verified
                    </span>
                    <span className="font-mono text-zinc-550">#ID: {match.id}</span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
