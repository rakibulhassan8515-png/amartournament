/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Match, MatchType, User } from "../types";
import { getMatches, joinMatch, getResults } from "../db";
import { Play, Flame, Trophy, Coins, Info, ShieldCheck, Clock, Key, CheckCircle, Gift, Search, History, Trash2 } from "lucide-react";
import { MatchCountdown } from "./MatchCountdown";
import { useToast } from "../context/ToastContext";

interface MatchesSectionProps {
  currentUser: User;
  onRefreshData: () => void;
  setActiveTab?: (tabId: string) => void;
}

export const MatchesSection: React.FC<MatchesSectionProps> = ({
  currentUser,
  onRefreshData,
  setActiveTab
}) => {
  const matches = getMatches();
  const { success, error } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeRuleModal, setActiveRuleModal] = useState<Match | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Search History Local State & localStorage Sync
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("tournaments_search_history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showDropdown, setShowDropdown] = useState(false);

  const saveToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 3);
      localStorage.setItem("tournaments_search_history", JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("tournaments_search_history");
  };

  // Filter Categories
  const categories = ["All", "BR MATCH", "CLASH SQUAD", "CS 1v1 2v2", "LONE WOLF"];

  const filteredMatches = matches.filter(match => {
    const categoryMatches = selectedCategory === "All" || match.type === selectedCategory;
    const queryMatches = match.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         match.type.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatches && queryMatches;
  });

  const handleJoinAttempt = (m: Match) => {
    try {
      joinMatch(m.id, currentUser.uid);
      success(`Successfully joined "${m.title}"! Entry fee check approved.`);
      onRefreshData();
    } catch (e: any) {
      const errMsg = e.message || "Unable to join match";
      if (errMsg.toLowerCase().includes("insufficient balance")) {
        error("অপ্রতুল ব্যালেন্স! টাকা রিচার্জ করার জন্য আপনাকে ওয়ালেট পেজে নিয়ে যাওয়া হচ্ছে... / Insufficient balance! Redirecting you to Profile Wallet to add money.");
        if (setActiveTab) {
          // Short delay so user can read the error message
          setTimeout(() => {
            setActiveTab("profile");
          }, 1500);
        }
      } else {
        error(errMsg);
      }
    }
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
      
      {/* Visual Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-[#101F30] to-slate-900 border border-[#1E2E4E] rounded-3xl p-6 sm:p-10 mb-8 max-w-7xl mx-auto shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 rounded-full text-xs font-mono uppercase tracking-wider mb-4">
            <Flame className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Join & Earn Real Rewards</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
            Free Fire & Ludo <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Daily Battles!</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-6 font-sans">
            Ready to show your skills? Choose your favorite esports action, join custom server lobbies, kill opponents, secure the Winner Booyah, and claim instant cash rewards sent directly to your bKash wallet!
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              <span className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-slate-900 text-[10px] flex items-center justify-center font-bold">FF</span>
              <span className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-slate-900 text-[10px] flex items-center justify-center font-bold">LUDO</span>
              <span className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 text-[10px] font-bold text-slate-900 flex items-center justify-center">৳</span>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Trusted by <span className="text-emerald-400 font-bold">5,000+</span> active gamers in Bangladesh.
            </p>
          </div>
        </div>
      </div>



      {/* Categories Scroller & Search bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
        
        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto scroller-hide pb-2 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-glow-emerald"
                  : "bg-[#161C2C] border border-[#232F4D] text-zinc-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Simple Search bar */}
        <div className="relative w-full md:max-w-xs" id="search-bar-wrapper">
          <input
            type="text"
            id="search-input"
            placeholder="Search game..."
            value={searchQuery}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveToHistory(searchQuery);
                setShowDropdown(false);
              }
            }}
            className="w-full bg-[#111625] border border-[#202940] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 font-sans"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />

          {showDropdown && searchHistory.length > 0 && (
            <div 
              id="search-history-dropdown"
              className="absolute left-0 right-0 mt-2 bg-[#101525]/95 backdrop-blur-md border border-[#232F4D] rounded-xl overflow-hidden shadow-2xl z-30 animate-fade-in"
            >
              <div className="flex items-center justify-between p-2.5 border-b border-[#182035] bg-[#121828]/90">
                <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-wider uppercase flex items-center space-x-1">
                  <History className="w-3 h-3 text-zinc-500 shrink-0" />
                  <span>Recent searches</span>
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    clearHistory();
                  }}
                  className="text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 p-1 rounded transition-colors text-[10px] uppercase font-mono flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
              <div className="flex flex-col py-1">
                {searchHistory.map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery(item);
                      saveToHistory(item);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-zinc-350 hover:text-white hover:bg-[#1a233a] flex items-center space-x-2 transition-colors border-b last:border-b-0 border-[#141b2e]/40"
                  >
                    <History className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="font-sans font-medium truncate">{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Match Grid list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {filteredMatches.length === 0 ? (
          <div className="text-center py-20 bg-[#101422] rounded-3xl border border-[#1B233A]">
            <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No tournaments found</h3>
            <p className="text-zinc-500 text-xs mt-1">Check back later or try selecting another tab category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map(match => {
              const isJoined = match.joinedPlayers.includes(currentUser.uid);
              const percentageFilled = Math.min(100, Math.floor((match.currentSlots / match.maxSlots) * 100));
              const isUpcoming = match.status === "upcoming";
              const isLive = match.status === "live";
              const isCompleted = match.status === "completed";
              const matchResult = isCompleted ? getResults().find(r => r.matchId === match.id) : null;
              const champion = matchResult?.winners?.find(w => w.rank === 1);

              return (
                <div 
                  key={match.id}
                  className={`bg-[#101525] border rounded-2xl overflow-hidden hover:shadow-2xl transition-all flex flex-col h-full ${
                    isCompleted && champion 
                      ? "border-yellow-500/40 shadow-[0_0_12px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500/20" 
                      : "border-[#1D263D] hover:border-[#2C3F69]"
                  }`}
                >
                  
                  {/* Game Card Hero Media */}
                  <div className="relative h-44 sm:h-48 w-full bg-slate-900">
                    <img 
                      src={match.imageUrl} 
                      alt={match.title}
                      className="w-full h-full object-cover brightness-[0.7]"
                    />
                    
                    {/* Floating status match tag */}
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isLive 
                          ? "bg-rose-500 text-white animate-pulse" 
                          : isCompleted 
                          ? "bg-zinc-600 text-zinc-100" 
                          : "bg-emerald-500 text-slate-950"
                      }`}>
                        {match.status}
                      </span>
                      <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-mono font-bold text-zinc-300">
                        {match.type}
                      </span>
                    </div>

                    {/* Floating Start Time Badge */}
                    <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 border border-emerald-500/30 rounded-lg text-[10px] font-mono font-bold text-emerald-400 flex items-center space-x-1.5 shadow-lg select-none">
                      <Clock className="w-3 h-3 text-emerald-400 animate-pulse shrink-0" />
                      <span>{formatStartDate(match.startTime)}</span>
                    </div>

                    {/* Floating Compact Countdown */}
                    {isUpcoming && (
                      <div className="absolute bottom-3 left-3 bg-[#0A0E1A]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center shadow-lg">
                        <MatchCountdown startTime={match.startTime} isCompact={true} />
                      </div>
                    )}

                    {/* Dynamic Winner Overlay or Quick Prize Overlay */}
                    {isCompleted && champion ? (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-slate-950/95 to-transparent pt-10 pb-3 px-3.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gradient-to-tr from-yellow-500 to-amber-400 rounded-xl shadow-lg border border-yellow-300/30 animate-pulse">
                            <Trophy className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                          </div>
                          <div>
                            <span className="text-[9px] text-yellow-400 font-mono tracking-wider uppercase font-black block">👑 BOOYAH CHAMPION</span>
                            <span className="text-xs font-black text-white font-sans flex items-center gap-1">
                              @{champion.username}
                            </span>
                          </div>
                        </div>
                        <div className="text-right font-mono bg-[#0D1221] border border-yellow-500/20 px-2 py-0.5 rounded-lg">
                          <span className="text-[8px] text-zinc-400 block uppercase font-bold leading-none mb-0.5">PRIZE</span>
                          <span className="text-yellow-450 font-black text-xs text-yellow-400">৳{champion.prize}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-yellow-500/20 flex items-center space-x-1.5">
                        <Gift className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-xs font-mono font-bold text-yellow-300">
                          ৳{match.prize} POOL
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold leading-snug hover:text-emerald-300 transition-colors">
                        {match.title}
                      </h4>
                      {match.description && (
                        <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {match.description}
                        </p>
                      )}

                      {/* Detailed Live Countdown section for upcoming games */}
                      {isUpcoming && (
                        <div className="mt-3">
                          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1 font-sans">
                            <span>⏱️</span>
                            <span>ম্যাচ শুরু হতে সময় বাকি আছে / Time Remaining:</span>
                          </p>
                          <MatchCountdown startTime={match.startTime} />
                        </div>
                      )}

                      {/* Info lines */}
                      <div className="grid grid-cols-2 gap-3 my-4 py-2 border-y border-[#1E273F]">
                        <div className="flex items-center space-x-2 text-zinc-200">
                          <Coins className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="text-[10px] font-mono text-zinc-300 uppercase leading-none font-bold">Entry Fee</p>
                            <p className="text-sm font-extrabold text-[#11B981] leading-none mt-1 font-mono">
                              {match.entryFee === 0 ? "FREE" : `৳${match.entryFee}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-zinc-200">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="text-[10px] font-mono text-zinc-300 uppercase leading-none font-bold">Start Time</p>
                            <p className="text-xs font-bold text-zinc-100 leading-none mt-1 whitespace-nowrap">
                              {formatStartDate(match.startTime)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Slots Occupied Indicator */}
                      {!isCompleted && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                            <span className="font-mono text-[10px] text-zinc-500">SLOTS FILLED</span>
                            <span className="font-sans font-bold text-zinc-200">
                              {match.currentSlots}/{match.maxSlots} Players
                            </span>
                          </div>
                          <div className="w-full bg-[#1A2135] h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r transition-all duration-500 ${
                                percentageFilled > 80 
                                  ? "from-rose-500 to-amber-500" 
                                  : "from-emerald-500 to-teal-400"
                              }`}
                              style={{ width: `${percentageFilled}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                     {/* Room details indicator */}
                     {isJoined && (isLive || isUpcoming) && match.roomDetails?.roomId && (
                       <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5 shadow-inner">
                         <div className="flex items-center space-x-1.5 text-emerald-400">
                           <Key className="w-4 h-4 text-emerald-400 shrink-0" />
                           <span className="text-xs font-mono font-bold uppercase tracking-wider">Lobby Access Credentials</span>
                         </div>
                         <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                           <div className="bg-[#111625] p-2 rounded border border-[#232F4D] relative group">
                             <span className="text-zinc-500 text-[9px] block">ROOM ID</span>
                             <span className="text-white font-extrabold text-sm">{match.roomDetails.roomId}</span>
                           </div>
                           <div className="bg-[#111625] p-2 rounded border border-[#232F4D] relative group">
                             <span className="text-zinc-500 text-[9px] block">PASSWORD</span>
                             <span className="text-yellow-400 font-extrabold text-sm">{match.roomDetails.password}</span>
                           </div>
                         </div>
                         <p className="text-[9px] text-zinc-500 font-sans text-center mt-1">
                           Credentials unlocked! Copy these credentials and join via Free Fire.
                         </p>
                       </div>
                     )}

                    {/* Action buttons list */}
                    <div className="space-y-2 mt-4">
                      {isCompleted ? (
                        <button className="w-full py-2.5 bg-zinc-800 text-zinc-400 rounded-xl text-xs sm:text-sm font-semibold cursor-not-allowed">
                          Match Resolved
                        </button>
                      ) : isJoined ? (
                        <div className="w-full py-2.5 bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Joined / Subscribed</span>
                        </div>
                      ) : match.currentSlots >= match.maxSlots ? (
                        <button className="w-full py-2.5 bg-[#171D2D] text-zinc-600 border border-[#2B354D] rounded-xl text-xs sm:text-sm font-bold cursor-not-allowed">
                          Lobby Board Full
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinAttempt(match)}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm tracking-wide shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center space-x-1"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Join Tournament Match</span>
                        </button>
                      )}

                      <button
                        onClick={() => setActiveRuleModal(match)}
                        className="w-full py-2 bg-[#171E31] hover:bg-[#202941] text-zinc-400 hover:text-white rounded-xl text-xs font-sans font-medium border border-[#252F4A] transition-colors flex items-center justify-center space-x-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Read Match Rules</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rules Modal Drawer overlay */}
      {activeRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1424] border border-[#222E4D] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-[#17233E] to-[#121B30] p-4 sm:p-6 border-b border-[#222E4D] flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base sm:text-lg font-bold text-white">{activeRuleModal.title} Rules</h3>
              </div>
              <button 
                onClick={() => setActiveRuleModal(null)}
                className="text-zinc-500 hover:text-white text-lg font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 sm:p-6 max-h-[400px] overflow-y-auto">
              <div className="bg-[#161C2C] p-3 sm:p-4 rounded-xl mb-4 border border-[#242F4D]">
                <p className="text-xs text-zinc-400 font-mono flex items-center mb-1">
                  <Coins className="w-3.5 h-3.5 mr-1 text-emerald-400" /> GAME MODE: {activeRuleModal.type}
                </p>
                <p className="text-xs text-zinc-400 font-mono flex items-center">
                  <Gift className="w-3.5 h-3.5 mr-1 text-yellow-400" /> PRIZE ALLOCATION: ৳{activeRuleModal.prize} BDT
                </p>
              </div>

              {activeRuleModal.description && (
                <div className="mb-4">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5 font-mono">Tournament Overview</h5>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-[#13192B] p-3 rounded-xl border border-[#1C263D]">
                    {activeRuleModal.description}
                  </p>
                </div>
              )}

              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono">Tournament Guidelines</h5>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                {activeRuleModal.rules}
              </p>
            </div>

            <div className="p-4 bg-[#141A2E] border-t border-[#222E4D] flex justify-end">
              <button
                onClick={() => setActiveRuleModal(null)}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
