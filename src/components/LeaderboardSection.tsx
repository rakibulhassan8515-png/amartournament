import React, { useState } from "react";
import { getAllUsers } from "../db";
import { User } from "../types";
import { Award, Trophy, Medal, Search, Flame, Target, Star, Swords } from "lucide-react";

export const LeaderboardSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const users = getAllUsers();

  // Sort users by total wins (descending) and secondary by total matches
  const sortedUsers = [...users].sort((a, b) => {
    if (b.totalWins !== a.totalWins) {
      return b.totalWins - a.totalWins;
    }
    return b.totalMatches - a.totalMatches;
  });

  const filteredUsers = sortedUsers.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = sortedUsers.slice(0, 3);

  // Helper calculation for win rates
  const calculateWinRate = (wins: number, matches: number) => {
    if (!matches) return 0;
    return Math.round((wins / matches) * 100);
  };

  return (
    <div className="py-6 sm:py-10 bg-[#0B0F19] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Heading with High Contrast Accent */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[#202943] pb-6">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 sm:p-3 bg-gradient-to-tr from-yellow-500 to-amber-500 rounded-2xl shadow-glow-amber">
              <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-black font-sans uppercase tracking-tight text-white flex items-center">
                Global Hall of Fame
              </h2>
              <p className="text-zinc-200 text-xs sm:text-sm font-medium mt-1 leading-relaxed">
                Track top survivors, match achievements, and victory rates on the champion scoreboard.
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search survivor username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111625] border border-[#233157] hover:border-[#384E8B] focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Podium Display for Top 3 Performers */}
        {sortedUsers.length > 0 && !searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-end">
            
            {/* 2nd Place Podium */}
            {topThree[1] && (
              <div className="bg-gradient-to-b from-[#141B30] to-[#0E1324] border border-[#233157] rounded-3xl p-6 text-center shadow-lg relative order-2 md:order-1 transform hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-4 left-4 bg-[#1F2C4E] text-[#9EAAC2] font-mono text-xs font-black px-2.5 py-1 rounded-lg border border-[#3E517C] uppercase">
                  🥈 RANK 2
                </div>
                <div className="relative inline-block mt-4">
                  <img
                    src={topThree[1].avatarUrl}
                    alt={topThree[1].username}
                    className="w-16 h-16 rounded-2xl border-2 border-[#9EAAC2] object-cover mx-auto"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 bg-[#9EAAC2] rounded-lg p-1">
                    <Medal className="w-4 h-4 text-slate-900" />
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-sans mt-3">@{topThree[1].username}</h3>
                <p className="text-zinc-200 text-xs mt-1 font-sans">
                  Wins: <strong className="text-[#9EAAC2] font-extrabold">{topThree[1].totalWins}</strong> • matches: <strong className="text-zinc-100 font-extrabold">{topThree[1].totalMatches}</strong>
                </p>
                <div className="mt-4 pt-3 border-t border-[#1C253D] flex justify-around text-xs font-mono">
                  <div>
                    <span className="text-zinc-400 block text-[9px] uppercase font-bold">WIN RATE</span>
                    <span className="text-[#9EAAC2] font-black text-sm">{calculateWinRate(topThree[1].totalWins, topThree[1].totalMatches)}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[9px] uppercase font-bold">REWARD BALL</span>
                    <span className="text-white font-black text-sm">৳{topThree[1].balance}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place Podium - Grand Champion */}
            {topThree[0] && (
              <div className="bg-gradient-to-b from-[#251E14] to-[#0E1324] border-2 border-yellow-500/40 rounded-3xl p-8 text-center shadow-2xl relative order-1 md:order-2 transform h-full flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-sans text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-slate-950 stroke-none" />
                  <span>PLATFORM LEADER</span>
                </div>
                
                <div className="mt-2">
                  <div className="relative inline-block mt-4">
                    <div className="absolute -inset-1 rounded-full bg-yellow-500/30 blur-md animate-pulse"></div>
                    <img
                      src={topThree[0].avatarUrl}
                      alt={topThree[0].username}
                      className="relative w-24 h-24 rounded-3xl border-4 border-yellow-500 object-cover mx-auto"
                    />
                    <span className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-yellow-500 to-amber-400 rounded-xl p-1.5 shadow-md">
                      <Trophy className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white font-sans mt-4">@{topThree[0].username}</h3>
                  <p className="text-yellow-400 font-sans font-bold text-xs uppercase tracking-widest mt-1">
                    👑 Grand Champion 👑
                  </p>
                  
                  <p className="text-zinc-200 text-sm mt-3 font-sans">
                    Matches Played: <strong className="text-zinc-100 font-extrabold">{topThree[0].totalMatches}</strong>
                  </p>
                  <p className="text-zinc-100 text-sm font-sans mt-0.5">
                    Wins Secured: <strong className="text-yellow-400 font-extrabold text-base">{topThree[0].totalWins} Wins</strong>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-yellow-500/10 flex justify-around text-xs font-mono">
                  <div>
                    <span className="text-yellow-400/75 block text-[10px] uppercase font-bold">WIN RATE</span>
                    <span className="text-yellow-400 font-black text-lg">{calculateWinRate(topThree[0].totalWins, topThree[0].totalMatches)}%</span>
                  </div>
                  <div>
                    <span className="text-yellow-400/75 block text-[10px] uppercase font-bold">REWARD BALL</span>
                    <span className="text-white font-black text-lg">৳{topThree[0].balance}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place Podium */}
            {topThree[2] && (
              <div className="bg-gradient-to-b from-[#171210] to-[#0E1324] border border-[#233157] rounded-3xl p-6 text-center shadow-lg relative order-3 transform hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-4 left-4 bg-[#2A1E18] text-[#CA7F54] font-mono text-xs font-black px-2.5 py-1 rounded-lg border border-[#523A2B] uppercase">
                  🥉 RANK 3
                </div>
                <div className="relative inline-block mt-4">
                  <img
                    src={topThree[2].avatarUrl}
                    alt={topThree[2].username}
                    className="w-16 h-16 rounded-2xl border-2 border-[#CA7F54] object-cover mx-auto"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 bg-[#CA7F54] rounded-lg p-1">
                    <Medal className="w-4 h-4 text-slate-900" />
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-sans mt-3">@{topThree[2].username}</h3>
                <p className="text-zinc-200 text-xs mt-1 font-sans">
                  Wins: <strong className="text-[#CA7F54] font-extrabold">{topThree[2].totalWins}</strong> • matches: <strong className="text-zinc-100 font-extrabold">{topThree[2].totalMatches}</strong>
                </p>
                <div className="mt-4 pt-3 border-t border-[#1C253D] flex justify-around text-xs font-mono">
                  <div>
                    <span className="text-zinc-400 block text-[9px] uppercase font-bold">WIN RATE</span>
                    <span className="text-[#CA7F54] font-black text-sm">{calculateWinRate(topThree[2].totalWins, topThree[2].totalMatches)}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[9px] uppercase font-bold">REWARD BALL</span>
                    <span className="text-white font-black text-sm">৳{topThree[2].balance}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Global Standings Board Table */}
        <div className="bg-[#101525] border border-[#1E253D] rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 sm:p-6 border-b border-[#182136] bg-[#12192A]">
            <h3 className="font-bold text-lg text-white font-sans uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-5 h-5 text-emerald-400" />
              <span>Full Survivor Standings</span>
            </h3>
            <p className="text-zinc-300 text-xs mt-1">Sorted by total tourney wins list</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-[#1E253D] text-zinc-300 bg-[#0E1324] font-bold text-xs">
                  <th className="py-4 px-6 uppercase w-12 text-center text-zinc-300">Rank</th>
                  <th className="py-4 px-4 uppercase text-zinc-300">Player Profile</th>
                  <th className="py-4 px-4 uppercase text-center text-zinc-300">Matches Played</th>
                  <th className="py-4 px-4 uppercase text-center text-zinc-300">Wins</th>
                  <th className="py-4 px-4 uppercase text-center text-zinc-300">Win Rate</th>
                  <th className="py-4 px-6 uppercase text-right text-zinc-300">Wallet balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182035]/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-400 text-sm font-medium">
                      No matching survivors found in current leaderboard!
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => {
                    const originalIndex = sortedUsers.findIndex(u => u.uid === user.uid);
                    const rank = originalIndex + 1;
                    const winRate = calculateWinRate(user.totalWins, user.totalMatches);

                    const isRank1 = rank === 1;
                    const isRank2 = rank === 2;
                    const isRank3 = rank === 3;

                    return (
                      <tr key={user.uid} className="hover:bg-[#12182B]/40 transition-all duration-150">
                        
                        {/* Rank cell */}
                        <td className="py-4 px-6 text-center">
                          {isRank1 ? (
                            <span className="inline-flex w-7 h-7 bg-yellow-500/20 rounded-full items-center justify-center border border-yellow-500 text-yellow-450 font-bold font-mono">
                              🥇
                            </span>
                          ) : isRank2 ? (
                            <span className="inline-flex w-7 h-7 bg-[#9EAAC2]/20 rounded-full items-center justify-center border border-[#9EAAC2] text-[#9EAAC2] font-bold font-mono">
                              🥈
                            </span>
                          ) : isRank3 ? (
                            <span className="inline-flex w-7 h-7 bg-[#CA7F54]/20 rounded-full items-center justify-center border border-[#CA7F54] text-[#CA7F54] font-bold font-mono">
                              🥉
                            </span>
                          ) : (
                            <span className="text-zinc-400 font-mono font-bold text-xs">
                              #{rank}
                            </span>
                          )}
                        </td>

                        {/* User Handle */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className="w-9 h-9 rounded-xl border border-[#212E4C] object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-white text-sm">@{user.username}</span>
                                {user.role === "admin" && (
                                  <span className="bg-[#1F2C4E] text-[#9EAAC2] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-mono">{user.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Matches count */}
                        <td className="py-4 px-4 text-center font-mono font-bold text-zinc-200">
                          {user.totalMatches}
                        </td>

                        {/* Wins count */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded font-mono font-bold ${
                            user.totalWins > 0 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "text-zinc-400 bg-zinc-950/40"
                          }`}>
                            {user.totalWins} Wins
                          </span>
                        </td>

                        {/* Win Rate Progress */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-center">
                            <span className="font-mono font-bold text-xs text-zinc-100">{winRate}%</span>
                            <div className="w-16 bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                className="bg-emerald-400 h-full rounded-full" 
                                style={{ width: `${winRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* User balance */}
                        <td className="py-4 px-6 text-right font-mono font-extrabold text-emerald-400">
                          ৳{user.balance.toFixed(0)}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
