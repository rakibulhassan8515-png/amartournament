/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { getResults, getAllUsers } from "../db";
import { Award, Trophy, Medal, Star, ShieldCheck, Flame, BookOpen, Skull, Search, X, Download, Copy, Check } from "lucide-react";
import { User } from "../types";

interface ResultsSectionProps {
  currentUser?: User;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedTitles, setCopiedTitles] = useState(false);
  const [copiedFirstId, setCopiedFirstId] = useState(false);
  const results = getResults();
  const allUsers = [...getAllUsers()].sort((a, b) => b.totalWins - a.totalWins || b.balance - a.balance);

  const isAdmin = currentUser?.role === "admin";

  const filteredResults = results.filter((result) =>
    result.matchTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ordinalSuffix = (num: number) => {
    if (num === 1) return <span className="text-yellow-400">1st Place</span>;
    if (num === 2) return <span className="text-zinc-300">2nd Place</span>;
    if (num === 3) return <span className="text-amber-600">3rd Place</span>;
    return `${num}th Place`;
  };

  const exportToCSV = () => {
    const headers = [
      "Match ID",
      "Match Title",
      "Match Type",
      "Resolved Date",
      "Winner Username",
      "Winner UID",
      "Rank Placement",
      "Total Kills",
      "Prize Awarded (BDT)"
    ];

    const rows = results.flatMap((result) =>
      result.winners.map((winner) => [
        result.matchId || result.id,
        result.matchTitle,
        result.matchType,
        new Date(result.publishedAt).toISOString().split("T")[0],
        winner.username,
        winner.uid,
        winner.rank,
        winner.kills,
        winner.prize
      ])
    );

    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => {
            const escapedString = String(value ?? "").replace(/"/g, '""');
            if (escapedString.includes(",") || escapedString.includes('"') || escapedString.includes("\n") || escapedString.includes("\r")) {
              return `"${escapedString}"`;
            }
            return escapedString;
          })
          .join(",")
      )
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Tournament_Match_Results_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const summaryLines = [
      "🏆 TOURNAMENT MATCH OUTCOMES SUMMARY 🏆",
      `Generated on: ${new Date().toLocaleString()}`,
      searchQuery ? `Search Query: "${searchQuery}"` : "Search Query: [None]",
      `Matching Tournaments: ${filteredResults.length} of ${results.length}`,
      "======================================",
      ""
    ];

    if (filteredResults.length === 0) {
      summaryLines.push("No matches match the search filter.");
    } else {
      filteredResults.forEach((result, idx) => {
        const dateStr = result.publishedAt ? new Date(result.publishedAt).toLocaleDateString() : "N/A";
        summaryLines.push(`${idx + 1}. ${result.matchTitle || "Match Title"} (${result.matchType || "Tournament"})`);
        summaryLines.push(`   Date Resolved: ${dateStr}`);
        if (result.winners && result.winners.length > 0) {
          summaryLines.push("   Standings:");
          result.winners.forEach((winner) => {
            summaryLines.push(`     - Rank ${winner.rank}: ${winner.username} | Kills: ${winner.kills} | Prize: ৳${winner.prize} BDT`);
          });
        } else {
          summaryLines.push("   Standings: No winners listed.");
        }
        summaryLines.push("--------------------------------------");
      });
    }

    const textToCopy = summaryLines.join("\n");
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy summary to clipboard", err);
      });
  };

  const handleCopyTitles = () => {
    const titles = filteredResults.map((result) => result.matchTitle || "Match Title").join("\n");
    navigator.clipboard.writeText(titles)
      .then(() => {
        setCopiedTitles(true);
        setTimeout(() => setCopiedTitles(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy match titles to clipboard", err);
      });
  };

  const handleCopyFirstId = () => {
    if (filteredResults.length === 0) return;
    const firstMatchId = filteredResults[0].matchId || filteredResults[0].id;
    navigator.clipboard.writeText(firstMatchId)
      .then(() => {
        setCopiedFirstId(true);
        setTimeout(() => setCopiedFirstId(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy match ID to clipboard", err);
      });
  };

  return (
    <div className="py-6 sm:py-10 bg-[#0B0F19] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Grid split: Left is Match Results, Right is Global Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Match Outcomes */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6" id="results-header-container">
              <div className="flex items-center space-x-2.5">
                <Award className="w-6 h-6 text-emerald-400" />
                <div className="text-left">
                  <h3 className="text-lg sm:text-xl font-bold font-sans">Recent Match Outcomes</h3>
                  <p className="text-xs text-zinc-500 font-sans">Official tournament results audited by server moderators</p>
                </div>
              </div>

              {/* Controls Wrapper: Search & Export CSV for Admins */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto px-4 py-3" id="results-controls-wrapper">
                {isAdmin && results.length > 0 && (
                  <button
                    id="export-results-csv-btn"
                    onClick={exportToCSV}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 sm:px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-[#060A10] font-bold rounded-xl shadow-lg transition-all text-xs cursor-pointer inline-flex whitespace-nowrap"
                    title="Export Match Outcomes Table to CSV"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Export CSV</span>
                  </button>
                )}

                {/* Copy Summary Button */}
                {results.length > 0 && (
                  <button
                    id="copy-results-summary-btn"
                    onClick={handleCopySummary}
                    className={`flex items-center justify-center space-x-1.5 px-3 py-2 sm:px-4 ${
                      copied 
                        ? "bg-emerald-500 text-[#060A10]" 
                        : "bg-[#101525] border border-[#1E253D] hover:bg-[#182035] text-zinc-300 hover:text-white"
                    } font-bold rounded-xl shadow-lg transition-all text-xs cursor-pointer inline-flex whitespace-nowrap`}
                    title="Copy Search Outcomes Text Summary to Clipboard"
                    aria-label="Copy search results text summary"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4.5 h-4.5 shrink-0 text-[#060A10]" />
                        <span>Copied Summary!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                )}

                {/* Copy Titles Button */}
                {results.length > 0 && (
                  <button
                    id="copy-results-titles-btn"
                    onClick={handleCopyTitles}
                    className={`flex items-center justify-center space-x-1.5 px-3 py-2 sm:px-4 ${
                      copiedTitles 
                        ? "bg-emerald-500 text-[#060A10]" 
                        : "bg-[#101525] border border-[#1E253D] hover:bg-[#182035] text-zinc-300 hover:text-white"
                    } font-bold rounded-xl shadow-lg transition-all text-xs cursor-pointer inline-flex whitespace-nowrap`}
                    title="Copy Search Outcomes Match Titles list to Clipboard"
                    aria-label="Copy search results match titles list"
                  >
                    {copiedTitles ? (
                      <>
                        <Check className="w-4.5 h-4.5 shrink-0 text-[#060A10]" />
                        <span>Copied Titles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>Copy Titles</span>
                      </>
                    )}
                  </button>
                )}

                {/* Copy First Match ID Button */}
                {filteredResults.length > 0 && (
                  <button
                    id="copy-first-match-id-btn"
                    onClick={handleCopyFirstId}
                    className={`flex items-center justify-center space-x-1.5 px-3 py-2 sm:px-4 ${
                      copiedFirstId 
                        ? "bg-emerald-500 text-[#060A10]" 
                        : "bg-[#101525] border border-[#1E253D] hover:bg-[#182035] text-zinc-300 hover:text-white"
                    } font-bold rounded-xl shadow-lg transition-all text-xs cursor-pointer inline-flex whitespace-nowrap`}
                    title="Copy Match ID of the first match in the filtered results"
                    aria-label="Copy first match ID to clipboard"
                  >
                    {copiedFirstId ? (
                      <>
                        <Check className="w-4.5 h-4.5 shrink-0 text-[#060A10]" />
                        <span>Copied First ID!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>Copy First ID</span>
                      </>
                    )}
                  </button>
                )}

                {/* Search Bar */}
                {results.length > 0 && (
                  <div className="relative max-w-xs w-full sm:w-64" id="results-search-wrapper">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      id="results-search-input"
                      type="text"
                      placeholder="Search past tournaments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#101525] border border-[#1E253D] rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans"
                    />
                    {searchQuery && (
                      <button
                        id="results-search-clear-btn"
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-20 bg-[#101422] rounded-3xl border border-[#1C243B]">
                <Flame className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-500">No tournaments have been resolved yet.</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-16 bg-[#101422] rounded-3xl border border-[#1C243B] px-4">
                <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-400">No tournament records matched "{searchQuery}"</p>
                <p className="text-xs text-zinc-500 mt-1">Please try modifying your search, or click below to reset the filter.</p>
                <button
                  id="reset-search-btn"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-400 text-xs font-semibold hover:border-emerald-450 transition-all"
                >
                  Reset Search Filter
                </button>
              </div>
            ) : (
              filteredResults.map(result => (
                <div 
                  key={result.id}
                  className="bg-[#101525] border border-[#1E253D] rounded-2xl overflow-hidden shadow-lg hover:border-[#2C3B63] transition-all"
                >
                  {/* Result Header */}
                  <div className="bg-[#151D33] p-4 sm:p-5 border-b border-[#1E253D] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-400/25 rounded text-[9px] font-mono font-bold uppercase tracking-wider mb-2 inline-block">
                        {result.matchType}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white">{result.matchTitle}</h4>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase leading-none">RESOLVED ON</p>
                      <p className="text-xs font-semibold text-zinc-300 mt-1">
                        {new Date(result.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Winners Rows */}
                  <div className="p-4 sm:p-5 divide-y divide-[#182035]">
                    {result.winners.map(winner => (
                      <div 
                        key={winner.uid}
                        className="py-3 sm:py-3.5 flex items-center justify-between first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          
                          {/* Rank Icon */}
                          <div className="flex-shrink-0">
                            {winner.rank === 1 ? (
                              <div className="p-1.5 bg-yellow-500/15 rounded-lg border border-yellow-500/30">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                              </div>
                            ) : winner.rank === 2 ? (
                              <div className="p-1.5 bg-zinc-350/15 rounded-lg border border-zinc-400/30">
                                <Medal className="w-5 h-5 text-zinc-300" />
                              </div>
                            ) : (
                              <div className="p-1.5 bg-amber-600/15 rounded-lg border border-amber-600/30">
                                <Medal className="w-5 h-5 text-amber-600" />
                              </div>
                            )}
                          </div>

                          {/* Winner statistics */}
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                              <span>{winner.username}</span>
                              {winner.rank === 1 && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                            </p>
                            <p className="text-[10px] font-mono text-zinc-500 mt-0.5 uppercase tracking-wide">
                              Placed {ordinalSuffix(winner.rank)}
                            </p>
                          </div>

                        </div>

                        {/* Stats block kills / prize BDT */}
                        <div className="flex items-center space-x-6 sm:space-x-10 text-right">
                          <div className="hidden sm:block">
                            <span className="text-[9px] font-mono text-zinc-500 block leading-none">TOTAL KILLS</span>
                            <span className="text-xs font-mono font-bold text-rose-400 mt-1 inline-flex items-center">
                              <Skull className="w-3.5 h-3.5 mr-1" /> {winner.kills} Kills
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-zinc-500 block leading-none">PRIZE DEPOSITED</span>
                            <span className="text-sm font-mono font-bold text-emerald-450 mt-1">
                              ৳{winner.prize}
                            </span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              ))
            )}

          </div>

          {/* Column 3: Leaderboard panel */}
          <div className="space-y-6">
            
            <div className="flex items-center space-x-2.5 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-sans">Leaderboard</h3>
                <p className="text-xs text-zinc-500 font-sans">Top tournament players in Bangladesh</p>
              </div>
            </div>

            <div className="bg-[#101525] border border-[#1E253D] rounded-2xl p-5 shadow-lg space-y-4">
              
              {/* Leaderboard Table rows */}
              <div className="space-y-3.5">
                {allUsers.slice(0, 10).map((user, idx) => {
                  const place = idx + 1;
                  return (
                    <div 
                      key={user.uid}
                      className={`p-3 rounded-xl flex items-center justify-between border ${
                        place === 1
                          ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/5 border-yellow-500/20"
                          : place === 2
                          ? "bg-[#172036] border-[#2A395F]"
                          : "bg-[#121829] border-[#1D2743]"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Place placement */}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold text-zinc-400">
                          {place === 1 ? (
                            <span className="text-yellow-400 font-black text-sm">👑</span>
                          ) : place === 2 ? (
                            <span className="text-zinc-300">🥈</span>
                          ) : place === 3 ? (
                            <span className="text-amber-600">🥉</span>
                          ) : (
                            `#${place}`
                          )}
                        </div>

                        {/* Player details */}
                        <img 
                          src={user.avatarUrl} 
                          alt={user.username} 
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700" 
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white leading-none">
                            {user.username}
                          </p>
                          <p className="text-[9px] font-mono text-zinc-500 mt-1 uppercase leading-none">
                            {user.totalWins} Wins / {user.totalMatches} Matches
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-mono text-zinc-500 block leading-none">EST. WORTH</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block">
                          ৳{user.balance.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informative info badge */}
              <div className="p-3 bg-[#131A2D] rounded-xl flex items-start space-x-2 text-[10px] text-zinc-500 font-sans leading-relaxed border border-zinc-900">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <span>Wins and match counts are updated synchronously upon official match outcomes publication. Leaderboard sorting takes player roles and current values into account.</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
