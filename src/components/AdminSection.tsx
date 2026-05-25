/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Match, MatchType, Transaction, Winner } from "../types";
import { addMatch, getMatches, getTransactions, processTransaction, getAllUsers, publishMatchResults, updateMatchStatus, modifyBalance, toggleRole, getResults, deleteMatch } from "../db";
import { ShieldCheck, PlusCircle, CheckCircle, XCircle, Award, Users, FilePlus, RefreshCw, Key, Skull, AlertTriangle, TrendingUp, Bold, List, Heading, Trash2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useToast } from "../context/ToastContext";
// @ts-ignore
import esportsBanner from "../assets/images/esports_banner_1779686141803.png";
// @ts-ignore
import clashSquadBanner from "../assets/images/clash_squad_showcase_1779697502901.png";

interface AdminSectionProps {
  currentUser: User;
  onRefreshData: () => void;
}

export const AdminSection: React.FC<AdminSectionProps> = ({
  currentUser,
  onRefreshData
}) => {
  const { success, error } = useToast();
  // Authorization check
  if (currentUser.role !== "admin") {
    return (
      <div className="py-20 text-center bg-[#0B0F19] text-white">
        <h3 className="text-xl font-bold text-rose-500">Access Denied</h3>
        <p className="text-zinc-500 text-sm mt-2">Only registered network administrators can access this console.</p>
      </div>
    );
  }

  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "bKash" | "Nagad" | "Rocket">("ALL");

  const matches = getMatches();
  const allPendingTransactions = getTransactions().filter(t => t.status === "pending");
  const pendingTransactions = allPendingTransactions.filter(
    t => paymentFilter === "ALL" || t.paymentMethod === paymentFilter
  );
  const allPlayers = getAllUsers();

  // Generate last 7 days metrics for dual-axis platform growth chart
  const getSevenDayPlatformGrowthData = () => {
    const results = getResults();
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      
      const dStart = new Date(d);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);
      
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      // Filter players registered on this day
      const dayRegistrationsList = allPlayers.filter(p => {
        if (!p.createdAt) return false;
        const pDate = new Date(p.createdAt);
        return pDate >= dStart && pDate <= dEnd;
      });
      
      // Filter results published on this day
      const dayResults = results.filter(r => {
        if (!r.publishedAt) return false;
        const rDate = new Date(r.publishedAt);
        return rDate >= dStart && rDate <= dEnd;
      });
      
      // Sum winner prizes from all dayResults
      let totalDayPrizes = 0;
      dayResults.forEach(r => {
        if (r.winners && Array.isArray(r.winners)) {
          r.winners.forEach(w => {
            totalDayPrizes += (w.prize || 0);
          });
        }
      });
      
      data.push({
        date: label,
        "Registrations": dayRegistrationsList.length,
        "Prize Dispersed (৳)": Math.round(totalDayPrizes)
      });
    }
    return data;
  };

  const chartData = getSevenDayPlatformGrowthData();

  const handleExportCSV = () => {
    const csvHeaders = ["Match ID", "Title", "Type", "Entry Fee (BDT)", "Prize Pool (BDT)", "Status", "Starting Time", "Registered Count", "Max Slots", "Registered Players"];
    const csvRows = matches.map(m => {
      const joinedUsernames = m.joinedPlayers.map(uid => {
        const p = allPlayers.find(user => user.uid === uid);
        return p ? p.username : uid;
      }).join("; ");

      return [
        m.id,
        m.title,
        m.type,
        m.entryFee,
        m.prize,
        m.status,
        m.startTime,
        m.joinedPlayers.length,
        m.maxSlots,
        joinedUsernames
      ].map(val => {
        const cleaned = String(val).replace(/"/g, '""');
        return `"${cleaned}"`;
      });
    });

    const csvContent = [csvHeaders.map(h => `"${h}"`).join(","), ...csvRows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tournament_matches_participation_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Successfully exported tournament participation report to CSV format!");
  };

  // 1. ADD MATCH STATE
  const [matchTitle, setMatchTitle] = useState<string>("");
  const [matchType, setMatchType] = useState<MatchType>("BR MATCH");
  const [entryFee, setEntryFee] = useState<string>("50");
  const [prize, setPrize] = useState<string>("1000");
  const [startTime, setStartTime] = useState<string>("");
  const [maxSlots, setMaxSlots] = useState<string>("48");
  const [description, setDescription] = useState<string>("");
  const [rules, setRules] = useState<string>("");
  const [imagePreset, setImagePreset] = useState<string>(esportsBanner);

  // Form input validation errors
  const [formErrors, setFormErrors] = useState<{
    matchTitle?: string;
    maxSlots?: string;
    entryFee?: string;
    prize?: string;
    startTime?: string;
    description?: string;
  }>({});

  const handleFieldChange = (name: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name as keyof typeof formErrors];
        return updated;
      });
    }
  };

  const insertMarkdown = (tag: "bold" | "bullet" | "header") => {
    const el = document.getElementById("admin-match-desc") as HTMLTextAreaElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end);
    let replacement = "";
    
    if (tag === "bold") {
      replacement = `**${selected || "bold text"}**`;
    } else if (tag === "bullet") {
      replacement = `\n- ${selected || "bullet item"}`;
    } else if (tag === "header") {
      replacement = `### ${selected || "Heading"}`;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setDescription(newValue);
    
    setTimeout(() => {
      el.focus();
      const newCursorPos = start + replacement.length;
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // 2. OUTCOME BOARD STATE
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [firstPlaceUid, setFirstPlaceUid] = useState<string>("");
  const [firstPlaceKills, setFirstPlaceKills] = useState<string>("5");
  const [firstPlacePrize, setFirstPlacePrize] = useState<string>("500");

  const [secondPlaceUid, setSecondPlaceUid] = useState<string>("");
  const [secondPlaceKills, setSecondPlaceKills] = useState<string>("3");
  const [secondPlacePrize, setSecondPlacePrize] = useState<string>("300");

  const [lobbyMatchId, setLobbyMatchId] = useState<string>("" );
  const [lobbyRoomId, setLobbyRoomId] = useState<string>("");
  const [lobbyPass, setLobbyPass] = useState<string>("");

  // Wallet Transaction confirmation states
  const [confirmTx, setConfirmTx] = useState<{ id: string; action: "approve" | "reject" } | null>(null);

  // Match Deletion state and helper
  const [matchToDeleteId, setMatchToDeleteId] = useState<string>("");
  const handleDeleteMatchConfirm = (matchId: string) => {
    try {
      deleteMatch(matchId);
      triggerFeedback("success", "Successfully deleted the tournament package and linked results.");
      setMatchToDeleteId("");
      onRefreshData();
    } catch (err: any) {
      error(err.message || "Failed to delete package");
    }
  };

  // User Administration States
  const [billingAddUid, setBillingAddUid] = useState<string>("");
  const [billingAmount, setBillingAmount] = useState<string>("");
  const [billingType, setBillingType] = useState<"add" | "deduct">("add");

  const handleModifyPlayerBalance = (uid: string, e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(billingAmount);
    if (!parsed || parsed <= 0) {
      error("Please enter a valid BDT value!");
      return;
    }
    try {
      modifyBalance(uid, billingType === "add" ? parsed : -parsed);
      triggerFeedback(
        "success", 
        `Successfully updated player balance! ${billingType === "add" ? "Added" : "Deducted"} ৳${parsed} BDT.`
      );
      setBillingAmount("");
      setBillingAddUid("");
      onRefreshData();
    } catch (err: any) {
      error(err.message || "Failed to adjust balance");
    }
  };

  const handleTogglePlayerRole = (uid: string) => {
    try {
      toggleRole(uid);
      triggerFeedback("success", "Successfully updated account access authorization role.");
      onRefreshData();
    } catch (err: any) {
      error(err.message || "Failed to toggle role");
    }
  };

  const triggerFeedback = (type: "success" | "error", text: string) => {
    if (type === "success") {
      success(text);
    } else {
      error(text);
    }
  };

  // Image Presets depending on game selection
  const presets = [
    { name: "Battle Royale Banner", url: esportsBanner },
    { name: "Clash Squad Showcase", url: clashSquadBanner },
    { name: "Ludo Board Playgrounds", url: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=600&auto=format&fit=crop" }
  ];

  // Create match trigger with robust validation
  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof formErrors = {};

    if (!matchTitle.trim()) {
      errors.matchTitle = "Tournament Title is mandatory!";
    } else if (matchTitle.trim().length < 5) {
      errors.matchTitle = "Tournament Title must be at least 5 characters long.";
    }

    const numSlots = parseInt(maxSlots);
    if (!maxSlots) {
      errors.maxSlots = "Max player count slots is mandatory!";
    } else if (isNaN(numSlots) || numSlots < 2) {
      errors.maxSlots = "Dynamic slots must allow at least 2 players.";
    } else if (numSlots > 100) {
      errors.maxSlots = "Max slots cannot exceed 100 players.";
    }

    const numFee = parseInt(entryFee);
    if (entryFee === "") {
      errors.entryFee = "Entry fee is required (enter 0 for free matches).";
    } else if (isNaN(numFee) || numFee < 0) {
      errors.entryFee = "Entry fee must be a valid non-negative number.";
    }

    const numPrize = parseInt(prize);
    if (!prize) {
      errors.prize = "Prize pool is required!";
    } else if (isNaN(numPrize) || numPrize < 10) {
      errors.prize = "Prize pool must be at least ৳10 BDT.";
    }

    if (!startTime) {
      errors.startTime = "Starting Calendar Date and Time is mandatory.";
    } else {
      const parsedTime = new Date(startTime).getTime();
      if (isNaN(parsedTime)) {
        errors.startTime = "Invalid date/time standard representation.";
      } else if (parsedTime < Date.now()) {
        errors.startTime = "Starting time cannot be scheduled in the past.";
      }
    }

    if (!description.trim()) {
      errors.description = "Detailed Match Description is mandatory!";
    } else if (description.trim().length < 15) {
      errors.description = "Match description is too brief (minimum 15 characters required).";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      triggerFeedback("error", "Error: Data entry contains invalid fields. Please resolve red highlights!");
      return;
    }

    // Clear matching errors
    setFormErrors({});

    try {
      addMatch({
        title: matchTitle.trim(),
        type: matchType,
        entryFee: numFee,
        prize: numPrize,
        startTime: new Date(startTime).toISOString(),
        maxSlots: numSlots,
        description: description.trim(),
        rules: rules.trim() || "1. Standard Match rules apply.\n2. Do not use emulators or cheat mechanisms.",
        imageUrl: imagePreset,
        status: "upcoming"
      });

      triggerFeedback("success", `Match "${matchTitle}" has been hosted and published successfully!`);
      // Reset
      setMatchTitle("");
      setDescription("");
      setRules("");
      setStartTime("");
      onRefreshData();
    } catch (err: any) {
      triggerFeedback("error", err.message || "Failed to host match");
    }
  };

  // Process transaction approvals
  const handleTransactionApproval = (txId: string, action: "approve" | "reject") => {
    try {
      processTransaction(txId, action);
      triggerFeedback(
        "success", 
        action === "approve"
          ? `Transaction invoice #${txId} approved! Balance added to player pouch successfully.`
          : `Transaction invoice #${txId} rejected successfully.`
      );
      onRefreshData();
    } catch (err: any) {
      triggerFeedback("error", err.message || "Approval process failed");
    }
  };

  // Add Room Details credentials
  const handlePublishLobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lobbyMatchId) {
      triggerFeedback("error", "Select a target Match to share lobby room details!");
      return;
    }
    if (!lobbyRoomId.trim()) {
      triggerFeedback("error", "Room ID is mandatory!");
      return;
    }

    try {
      updateMatchStatus(lobbyMatchId, "live", {
        roomId: lobbyRoomId.trim(),
        password: lobbyPass.trim() || "123"
      });
      triggerFeedback("success", "Custom server room lobby credentials published! Participants notified.");
      setLobbyRoomId("");
      setLobbyPass("");
      onRefreshData();
    } catch (err: any) {
      triggerFeedback("error", err.message || "Lobby generation failed");
    }
  };

  // Publish match winners & Prizes
  const handlePublishOutcome = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMatchId) {
      triggerFeedback("error", "Select a Match to resolve outcomes first!");
      return;
    }

    if (!firstPlaceUid) {
      triggerFeedback("error", "1st Winner selection is mandatory!");
      return;
    }

    const winners: Winner[] = [
      {
        uid: firstPlaceUid,
        username: "", // will be resolved in db
        rank: 1,
        kills: parseInt(firstPlaceKills) || 0,
        prize: parseInt(firstPlacePrize) || 0
      }
    ];

    if (secondPlaceUid) {
      winners.push({
        uid: secondPlaceUid,
        username: "",
        rank: 2,
        kills: parseInt(secondPlaceKills) || 0,
        prize: parseInt(secondPlacePrize) || 0
      });
    }

    try {
      publishMatchResults(selectedMatchId, winners);
      triggerFeedback("success", "Results published! prize money dispatched instantly into winners' account wallets!");
      setSelectedMatchId("");
      setFirstPlaceUid("");
      setSecondPlaceUid("");
      onRefreshData();
    } catch (err: any) {
      triggerFeedback("error", err.message || "Results publication failed");
    }
  };

  return (
    <div className="py-6 sm:py-10 bg-[#0B0F19] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Title Section */}
        <div className="flex items-center space-x-3 mb-8 border-b border-[#202A44] pb-4">
          <ShieldCheck className="w-8 h-8 text-rose-500" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-sans uppercase">Admin Management Console</h2>
            <p className="text-zinc-500 text-xs">Create matches, audit transactions, and disperse tournament prize money</p>
          </div>
        </div>



        {/* 7-Day Performance & Platform Growth Tracking */}
        <div className="bg-[#101525] border border-[#1E253D] rounded-3xl p-5 sm:p-6 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-[#182136] pb-4">
            <div className="flex items-center space-x-2.5">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-base sm:text-lg">Platform Growth & Disbursement</h3>
                <p className="text-zinc-500 text-[11px]">Daily survivor registrations and total tournament prize pools distributed over the last 7 days</p>
              </div>
            </div>
            {/* Visual Indicators */}
            <div className="flex items-center space-x-4 text-[10px] sm:text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                <span className="text-zinc-400">Prize Dispersed (৳)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-455 block" style={{ backgroundColor: "#818cf8" }}></span>
                <span className="text-zinc-400 font-sans">New Registrations</span>
              </div>
            </div>
          </div>

          <div className="w-full">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#10b981" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `৳${v}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#818cf8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${v} Users`}
                />
                <Tooltip 
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#141B2F] border border-[#212E4C] p-3 rounded-xl shadow-2xl font-sans text-xs space-y-1">
                          <p className="font-bold text-zinc-300 mb-1 border-b border-[#1E253D] pb-1">{label}</p>
                          {payload.map((entry: any) => (
                            <p key={entry.name} style={{ color: entry.stroke || entry.color }} className="font-semibold flex items-center justify-between gap-4">
                              <span>{entry.name}:</span>
                              <span className="font-mono font-bold">
                                {entry.name.includes("Prize") ? `৳${entry.value} BDT` : `${entry.value} Users`}
                              </span>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="Prize Dispersed (৳)" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }} 
                  dot={{ r: 3, strokeWidth: 1 }}
                  name="Prize Money (৳)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="Registrations" 
                  stroke="#818cf8" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }} 
                  dot={{ r: 3, strokeWidth: 1 }}
                  name="Daily Registrations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 1 Split: Auditor and create match */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Box 1: Transaction Auditor */}
          <div className="space-y-6">
            
            <div className="bg-[#101525] border border-[#1E253D] rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-[#182136] pb-3">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base sm:text-lg">Audit Wallet Actions</h3>
                </div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <select
                    id="payment-method-filter"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value as any)}
                    className="bg-[#141B2F] border border-[#212E4C] rounded-lg px-2.5 py-1 text-[11px] text-zinc-300 font-sans focus:outline-none focus:border-emerald-500 cursor-pointer active:scale-95 transition-transform"
                  >
                    <option value="ALL">All Methods</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                  </select>
                  <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg font-mono text-[10px] font-bold uppercase shrink-0">
                    {pendingTransactions.length} Pending
                  </span>
                </div>
              </div>

              {pendingTransactions.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 font-sans">
                  <p className="text-xs">
                    {allPendingTransactions.length > 0 
                      ? `No pending ${paymentFilter} transactions found!`
                      : "All deposits and withdrawal actions are fully audited!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTransactions.map(tx => {
                    const requester = allPlayers.find(p => p.uid === tx.userId);
                    return (
                      <div 
                        key={tx.id}
                        className="bg-[#141B2F] border border-[#1D2B4D] rounded-xl p-4 space-y-3.5"
                      >
                        <div className="flex items-center justify-between border-b border-[#212E4C] pb-2.5">
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                              tx.type === "deposit" ? "bg-emerald-500/15 text-emerald-400" : "bg-teal-500/15 text-teal-400"
                            }`}>
                              {tx.type} ({tx.paymentMethod})
                            </span>
                            <p className="text-xs font-semibold text-white mt-1">
                              Requester: <span className="text-zinc-300 font-bold">{requester?.username || "Player"}</span>
                            </p>
                          </div>
                          <span className="text-sm font-mono font-bold text-white">৳{tx.amount} BDT</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                          <div>
                            <span className="text-zinc-500 text-[9px]">Sender Ac:</span>
                            <p className="font-bold text-zinc-200">{tx.accountNumber}</p>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px]">TrxID Received:</span>
                            <p className="font-bold text-yellow-300 uppercase">{tx.transactionId}</p>
                          </div>
                        </div>

                        {/* Audit verification triggers */}
                        {confirmTx && confirmTx.id === tx.id ? (
                          <div className="bg-[#1C1523] border border-amber-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in text-xs mt-2">
                            <div className="flex items-center space-x-1.5 text-amber-400">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-bold text-[10px] uppercase tracking-wider">
                                Confirm {confirmTx.action === "approve" ? "Approval" : "Rejection"}?
                              </span>
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleTransactionApproval(tx.id, confirmTx.action);
                                  setConfirmTx(null);
                                }}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold uppercase text-[10px] rounded-lg cursor-pointer transition-colors"
                              >
                                Yes, Secure
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmTx(null)}
                                className="px-2.5 py-1 bg-[#13192B] border border-[#222F4D] text-zinc-400 hover:text-white uppercase text-[10px] rounded-lg cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setConfirmTx({ id: tx.id, action: "approve" })}
                              className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Confirm / Credit Balance</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmTx({ id: tx.id, action: "reject" })}
                              className="py-1.5 px-3 bg-[#111726] border border-rose-500/35 hover:bg-rose-950/20 text-rose-450 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-450" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Set Room Details and Room password (LIVE) */}
            <div className="bg-[#101525] border border-[#1E253D] rounded-3xl p-6 shadow-xl">
              <div className="flex items-center space-x-2 mb-4 border-b border-[#182136] pb-3">
                <Key className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base sm:text-lg">Publish Lobby Room Code</h3>
              </div>

              <form onSubmit={handlePublishLobby} className="space-y-4 font-sans">
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-400 block mb-1">
                    Select Target Match:
                  </label>
                  <select
                    value={lobbyMatchId}
                    onChange={(e) => setLobbyMatchId(e.target.value)}
                    className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none"
                    required
                  >
                    <option value="">-- Choose active Match --</option>
                    {matches.filter(m => m.status === "upcoming").map(m => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono font-bold text-zinc-400 block mb-1">
                      Room ID (Custom):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5543202"
                      value={lobbyRoomId}
                      onChange={(e) => setLobbyRoomId(e.target.value)}
                      className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-zinc-200 focus:outline-none"
                      required={!!lobbyMatchId}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-zinc-400 block mb-1">
                      Password:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 119"
                      value={lobbyPass}
                      onChange={(e) => setLobbyPass(e.target.value)}
                      className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-zinc-200 focus:outline-none"
                      required={!!lobbyMatchId}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!lobbyMatchId}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs sm:text-sm tracking-wide transition-all uppercase"
                >
                  Publish server code
                </button>
              </form>
            </div>

          </div>

          {/* Box 2: Create a Match Form */}
          <div className="space-y-6">
            
            <div className="bg-[#101525] border border-[#1E253D] rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center space-x-2.5 mb-5 border-b border-[#182136] pb-3">
                <FilePlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base sm:text-lg">Host Tournament Match</h3>
              </div>

              <form onSubmit={handleCreateMatch} className="space-y-4 font-sans" noValidate>
                
                {/* Title */}
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-400 block mb-1">
                    Tournament Title:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Free Fire Squad Cup"
                    value={matchTitle}
                    onChange={(e) => handleFieldChange("matchTitle", e.target.value, setMatchTitle)}
                    className={`w-full bg-[#111624] border ${
                      formErrors.matchTitle ? "border-rose-500 bg-rose-950/10 focus:ring-1 focus:ring-rose-500/55" : "border-[#202941] focus:border-[#425078]"
                    } rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none transition-all`}
                    required
                  />
                  {formErrors.matchTitle && (
                    <div className="flex items-center space-x-1.5 text-rose-400 mt-1.5 font-mono text-[11px] leading-tight">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{formErrors.matchTitle}</span>
                    </div>
                  )}
                </div>

                {/* Grid Type / Category select and Max Slots */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono font-bold text-zinc-400 block mb-1">
                      Game Type Category:
                    </label>
                    <select
                      value={matchType}
                      onChange={(e) => setMatchType(e.target.value as MatchType)}
                      className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none"
                    >
                      <option value="BR MATCH">BR Match</option>
                      <option value="CLASH SQUAD">Clash Squad</option>
                      <option value="CS 1v1 2v2">CS 1v1 2v2</option>
                      <option value="LONE WOLF">Lone Wolf</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-zinc-400 block mb-1">
                      Max Slots Players:
                    </label>
                    <input
                      type="number"
                      value={maxSlots}
                      onChange={(e) => handleFieldChange("maxSlots", e.target.value, setMaxSlots)}
                      className={`w-full bg-[#111624] border ${
                        formErrors.maxSlots ? "border-rose-500 bg-rose-950/10 focus:ring-1 focus:ring-rose-500/55" : "border-[#202941] focus:border-[#425078]"
                      } rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-zinc-200 focus:outline-none transition-all`}
                      min="2"
                      required
                    />
                    {formErrors.maxSlots && (
                      <div className="flex items-center space-x-1.5 text-rose-400 mt-1.5 font-mono text-[11px] leading-tight">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{formErrors.maxSlots}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Entry fee and prizes BDT */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono font-bold text-zinc-400 block mb-1">
                      Entry Fee (৳ BDT):
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={entryFee}
                      onChange={(e) => handleFieldChange("entryFee", e.target.value, setEntryFee)}
                      className={`w-full bg-[#111624] border ${
                        formErrors.entryFee ? "border-rose-500 bg-rose-950/10 focus:ring-1 focus:ring-rose-500/55" : "border-[#202941] focus:border-[#425078]"
                      } rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-zinc-200 focus:outline-none transition-all`}
                      min="0"
                      required
                    />
                    {formErrors.entryFee && (
                      <div className="flex items-center space-x-1.5 text-rose-400 mt-1.5 font-mono text-[11px] leading-tight">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{formErrors.entryFee}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-zinc-400 block mb-1">
                      Prize Pool (৳ BDT):
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={prize}
                      onChange={(e) => handleFieldChange("prize", e.target.value, setPrize)}
                      className={`w-full bg-[#111624] border ${
                        formErrors.prize ? "border-rose-500 bg-rose-950/10 focus:ring-1 focus:ring-rose-500/55" : "border-[#202941] focus:border-[#425078]"
                      } rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-zinc-200 focus:outline-none transition-all`}
                      min="10"
                      required
                    />
                    {formErrors.prize && (
                      <div className="flex items-center space-x-1.5 text-rose-400 mt-1.5 font-mono text-[11px] leading-tight">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{formErrors.prize}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date start datetime picker */}
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-400 block mb-1">
                    Starting Time Calendar Date:
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => handleFieldChange("startTime", e.target.value, setStartTime)}
                    className={`w-full bg-[#111624] border ${
                      formErrors.startTime ? "border-rose-500 bg-rose-950/10 focus:ring-1 focus:ring-rose-500/55" : "border-[#202941] focus:border-[#425078]"
                    } rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none font-sans transition-all`}
                    required
                  />
                  {formErrors.startTime && (
                    <div className="flex items-center space-x-1.5 text-rose-400 mt-1.5 font-mono text-[11px] leading-tight">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{formErrors.startTime}</span>
                    </div>
                  )}
                </div>

                {/* Image presetter list */}
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-400 block mb-2">
                    Tournament Banner / Package Image:
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {presets.map(ps => {
                      const isSelected = imagePreset === ps.url;
                      return (
                        <div 
                          key={ps.name}
                          onClick={() => setImagePreset(ps.url)}
                          className={`p-2 bg-[#13192B] border rounded-lg text-center cursor-pointer transition-all ${
                            isSelected ? "border-emerald-400 scale-[1.03]" : "border-[#202941] hover:border-zinc-700"
                          }`}
                        >
                          <span className="text-[9px] font-sans text-zinc-300 block truncate">{ps.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Custom URL Input block */}
                  <div className="bg-[#141b2e] border border-[#212f4d] rounded-2xl p-3.5 mt-2.5">
                    <label className="text-[11px] font-sans font-bold text-zinc-300 block mb-1.5 uppercase tracking-wide">
                      🔗 Use Custom Package Image URL:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <input
                        type="url"
                        placeholder="Paste image link here (e.g. https://i.ibb.co/..."
                        value={imagePreset}
                        onChange={(e) => setImagePreset(e.target.value)}
                        className="w-full bg-[#0d1222] border border-[#253255] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none transition-all font-mono"
                      />
                      {imagePreset ? (
                        <div className="w-16 h-10 rounded-lg overflow-hidden border border-[#2e3e68] shrink-0 bg-zinc-900 shadow-md">
                          <img 
                            src={imagePreset} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop';
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                      পছন্দসই যে কোন টুর্নামেন্ট বা ম্যাচের ছবির লিংক এখানে দিয়ে দিতে পারবেন। / Paste any image web link directly to render it dynamically on the homepage cards.
                    </p>
                  </div>
                </div>

                {/* Description textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="admin-match-desc" className="text-xs font-mono font-bold text-zinc-400 block">
                      Detailed Match Description:
                    </label>
                    <div className="flex items-center space-x-1.5 bg-[#141b2e] border border-[#212f4d] rounded-lg px-2 py-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => insertMarkdown("bold")}
                        title="Add Bold Text"
                        className="p-1 text-zinc-400 hover:text-emerald-400 hover:bg-[#1e293b] rounded cursor-pointer transition-all active:scale-95"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("bullet")}
                        title="Add Bullet Point"
                        className="p-1 text-zinc-400 hover:text-emerald-400 hover:bg-[#1e293b] rounded cursor-pointer transition-all active:scale-95"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("header")}
                        title="Add Section Heading"
                        className="p-1 text-zinc-400 hover:text-emerald-400 hover:bg-[#1e293b] rounded cursor-pointer transition-all active:scale-95"
                      >
                        <Heading className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="admin-match-desc"
                    placeholder="Provide a detailed description of the tournament (mode, weapon limits, prize info, etc.)..."
                    value={description}
                    onChange={(e) => handleFieldChange("description", e.target.value, setDescription)}
                    rows={3}
                    className={`w-full bg-[#111624] border ${
                      formErrors.description ? "border-rose-500 bg-rose-950/10 focus:ring-1 focus:ring-rose-500/55" : "border-[#202941] focus:border-[#425078]"
                    } rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none transition-all`}
                    required
                  ></textarea>
                  {formErrors.description && (
                    <div className="flex items-center space-x-1.5 text-rose-400 mt-1.5 font-mono text-[11px] leading-tight">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{formErrors.description}</span>
                    </div>
                  )}
                </div>

                {/* Rules textareas */}
                <div>
                  <label htmlFor="admin-match-rules" className="text-xs font-mono font-bold text-zinc-400 block mb-1">
                    Special Match Rules:
                  </label>
                  <textarea
                    id="admin-match-rules"
                    placeholder="Enter guidelines line by line..."
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    rows={4}
                    className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none"
                  ></textarea>
                </div>

                {/* Submit trigger button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm tracking-wide shadow-lg cursor-pointer transform hover:-translate-y-0.5 transition-all text-center uppercase"
                >
                  Publish and Host Match
                </button>

              </form>

            </div>

          </div>

        </div>

        {/* MATCHES LIST & CSV PARTICIPATION REPORT */}
        <div className="bg-[#101525] border border-[#1E253D] rounded-3xl p-6 sm:p-8 mt-8 shadow-xl" id="admin-match-participation-list">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#182136] pb-4">
            <div className="flex items-center space-x-2.5">
              <List className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white font-sans uppercase">Tournament Matches & Registrations</h3>
                <p className="text-[#94A3B8] text-xs">Overview of all active and past tournaments with live participant stats</p>
              </div>
            </div>

            {/* CSV EXPORT BUTTON */}
            <button
              type="button"
              id="csv-export-btn"
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-[#141B30] hover:bg-[#1C2644] border border-[#23355C] hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 font-sans text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>📥 Export CSV Report</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans" id="admin-matches-table">
              <thead>
                <tr className="border-b border-[#1E253D] text-[#64748B] font-bold text-[10px] sm:text-xs">
                  <th className="pb-3 uppercase text-zinc-400">Tournament / Game Type</th>
                  <th className="pb-3 text-center uppercase text-zinc-400">Status</th>
                  <th className="pb-3 text-center uppercase text-zinc-400">Entry / Prize Pool</th>
                  <th className="pb-3 text-center uppercase text-zinc-400">Slots Registered</th>
                  <th className="pb-3 text-right uppercase text-zinc-400">Registered Survivor Handles</th>
                  <th className="pb-3 text-right uppercase text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182035]/50">
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                      No matches found in the platform database!
                    </td>
                  </tr>
                ) : (
                  matches.map((m) => {
                    const progressVal = Math.min(100, (m.joinedPlayers.length / m.maxSlots) * 100);
                    return (
                      <tr key={m.id} className="hover:bg-[#12182B]/30 transition-colors">
                        <td className="py-4">
                          <p className="font-extrabold text-white text-xs sm:text-sm">{m.title}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{m.type} • ID: {m.id}</p>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-black uppercase ${
                            m.status === "completed"
                              ? "bg-zinc-800 text-zinc-400 border border-zinc-700/30"
                              : m.status === "live"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse"
                              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-4 text-center font-mono">
                          <p className="text-zinc-200">Fee: ৳{m.entryFee}</p>
                          <p className="text-emerald-400 font-bold mt-0.5">Pool: ৳{m.prize}</p>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-mono text-[11px] font-bold text-zinc-300">
                              {m.joinedPlayers.length} / {m.maxSlots}
                            </span>
                            <div className="w-20 bg-zinc-850 h-1.5 rounded-full mt-1.5 overflow-hidden border border-zinc-800">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-teal-450 h-full rounded-full" 
                                style={{ width: `${progressVal}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          {m.joinedPlayers.length === 0 ? (
                            <span className="text-zinc-500 text-[10px] font-mono">No survivors registered</span>
                          ) : (
                            <div className="flex flex-wrap gap-1 justify-end max-w-xs ml-auto">
                              {m.joinedPlayers.map((uid) => {
                                const p = allPlayers.find((user) => user.uid === uid);
                                return (
                                  <span 
                                    key={uid} 
                                    className="px-1.5 py-0.5 bg-[#141B30] border border-[#212E4C] rounded-md font-mono text-[9px] text-zinc-300 font-medium"
                                  >
                                    @{p?.username || uid}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          {matchToDeleteId === m.id ? (
                            <div className="flex items-center justify-end space-x-1.5 animate-pulse bg-slate-950/60 p-2 rounded-xl border border-rose-500/30">
                              <span className="text-[10px] text-rose-400 font-bold font-mono">মুছে ফেলবেন?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteMatchConfirm(m.id)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] uppercase font-black tracking-tight cursor-pointer"
                              >
                                Yes, Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setMatchToDeleteId("")}
                                className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-350 rounded-lg text-[9px] uppercase font-medium tracking-tight cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setMatchToDeleteId(m.id)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 rounded-xl text-[10px] font-bold tracking-tight uppercase cursor-pointer select-none transition-all active:scale-95"
                              title="Delete this tournament package permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                              <span>Delete</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Form 3: Outcomes and winners Board (Standalone Row bottom) */}
        <div className="bg-[#101525] border border-[#1E253D] rounded-3xl p-6 sm:p-8 mt-8 shadow-xl">
          <div className="flex items-center space-x-2.5 mb-5 border-b border-[#182136] pb-3">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base sm:text-lg">Publish Match Winners & Prizes</h3>
          </div>

          <form onSubmit={handlePublishOutcome} className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
            
            {/* Match Select Column */}
            <div>
              <label className="text-xs font-mono font-bold text-zinc-400 block mb-1.5 uppercase">
                Select Complete Match:
              </label>
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none"
                required
              >
                <option value="">-- Choose Match to settle --</option>
                {matches.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.type}){m.status === "completed" ? " ⭐ Completed (Overwritable)" : m.status === "live" ? " 🔴 Live" : ""}
                  </option>
                ))}
              </select>

              <span className="text-[10px] text-zinc-550 leading-relaxed block mt-2">
                Note: Settle and close registries. This automatically adds the defined prize amounts directly into winners' balance and locks future match actions.
              </span>
            </div>

            {/* Settle Column 2: First Winner */}
            <div className="p-4 bg-[#141B2D] border border-yellow-500/20 rounded-xl space-y-3">
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest block leading-none">
                🥇 1st Place Winner:
              </span>
              
              <div>
                <span className="text-[10px] font-mono text-zinc-500 block mb-1">Select player user:</span>
                <select
                  value={firstPlaceUid}
                  onChange={(e) => setFirstPlaceUid(e.target.value)}
                  className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  required={!!selectedMatchId}
                >
                  <option value="">-- Choose User --</option>
                  {allPlayers.map(p => (
                    <option key={p.uid} value={p.uid}>{p.username}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block mb-1">Kills:</span>
                  <input
                    type="number"
                    value={firstPlaceKills}
                    onChange={(e) => setFirstPlaceKills(e.target.value)}
                    className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-1 text-xs font-mono text-zinc-200 focus:outline-none"
                    min="0"
                    required={!!selectedMatchId}
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block mb-1">Prize ৳ BDT:</span>
                  <input
                    type="number"
                    value={firstPlacePrize}
                    onChange={(e) => setFirstPlacePrize(e.target.value)}
                    className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-1 text-xs font-mono text-zinc-200 focus:outline-none"
                    min="0"
                    required={!!selectedMatchId}
                  />
                </div>
              </div>
            </div>

            {/* Settle Column 3: Second Winner / Actions */}
            <div className="p-4 bg-[#141B2D] border border-zinc-500/20 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest block leading-none">
                  🥈 2nd Place (Optional):
                </span>
                
                <div className="mt-2">
                  <span className="text-[10px] font-mono text-zinc-500 block mb-1">Select player user:</span>
                  <select
                    value={secondPlaceUid}
                    onChange={(e) => setSecondPlaceUid(e.target.value)}
                    className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="">-- None --</option>
                    {allPlayers.map(p => (
                      <option key={p.uid} value={p.uid}>{p.username}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Kills:</span>
                    <input
                      type="number"
                      value={secondPlaceKills}
                      onChange={(e) => setSecondPlaceKills(e.target.value)}
                      className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-1 text-xs font-mono text-zinc-200 focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">Prize ৳ BDT:</span>
                    <input
                      type="number"
                      value={secondPlacePrize}
                      onChange={(e) => setSecondPlacePrize(e.target.value)}
                      className="w-full bg-[#111624] border border-[#202941] rounded-xl px-3 py-1 text-xs font-mono text-zinc-200 focus:outline-none"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Settle Action submission trigger */}
              <button
                type="submit"
                disabled={!selectedMatchId}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm tracking-wide disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg hover:from-yellow-400 hover:to-amber-400 mt-4 uppercase"
              >
                Publish Results & Credit Winners
              </button>
            </div>

          </form>
        </div>

        {/* PLAYER ACCOUNTS & WALLET BALANCES CONTROLLER */}
        <div className="mt-8 bg-[#101525] border border-[#1E253D] rounded-3xl p-6 sm:p-8 shadow-xl" id="admin-players-controls">
          <div className="flex items-center space-x-2.5 mb-6">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-base sm:text-lg font-bold font-sans uppercase">Player Accounts Administration</h4>
              <p className="text-[#94A3B8] text-xs">Directly credit/debit player wallets and update authorization roles</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans" id="admin-players-table">
              <thead>
                <tr className="border-b border-[#1E253D] text-[#64748B] font-bold text-[10px] sm:text-xs">
                  <th className="pb-3 uppercase">Player Name & Email</th>
                  <th className="pb-3 text-center uppercase">Role Badge</th>
                  <th className="pb-3 text-center uppercase">Matches/Wins</th>
                  <th className="pb-3 text-right uppercase">Wallet Balance</th>
                  <th className="pb-3 text-right uppercase">Actions Console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182035]/50">
                {allPlayers.map((player) => {
                  const isCurrentAdmin = player.uid === currentUser.uid;
                  const isUserSelected = billingAddUid === player.uid;

                  return (
                    <tr key={player.uid} className="hover:bg-[#12182B]/30 transition-colors" id={`player-row-${player.uid}`}>
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={player.avatarUrl} 
                            alt={player.username} 
                            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-cover border border-[#2B354D]" 
                          />
                          <div>
                            <p className="font-extrabold text-white text-xs sm:text-sm">{player.username}</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500 font-mono mt-0.5">{player.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-black uppercase ${
                          player.role === "admin" 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {player.role}
                        </span>
                      </td>
                      <td className="py-4 text-center font-mono text-[11px] sm:text-xs text-zinc-300">
                        {player.totalMatches} Matches / {player.totalWins} Wins
                      </td>
                      <td className="py-4 text-right font-mono text-xs sm:text-sm font-black text-white">
                        ৳{player.balance.toFixed(0)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          
                          {/* Inline balance adjustment tool */}
                          {isUserSelected ? (
                            <form 
                              onSubmit={(e) => handleModifyPlayerBalance(player.uid, e)} 
                              className="bg-[#13192C] border border-[#2D395C] p-2 rounded-xl flex items-center space-x-2 animate-fade-in"
                            >
                              <select
                                value={billingType}
                                onChange={(e) => setBillingType(e.target.value as "add" | "deduct")}
                                className="bg-[#0B0F19] text-white p-1 rounded font-mono text-[10px] border border-zinc-700 outline-none"
                              >
                                <option value="add">ADD</option>
                                <option value="deduct">SUB</option>
                              </select>
                              <input
                                type="number"
                                required
                                placeholder="৳ Amount"
                                value={billingAmount}
                                onChange={(e) => setBillingAmount(e.target.value)}
                                className="w-16 bg-[#0B0F19] text-white p-1 rounded font-mono text-[10px] focus:outline-none border border-zinc-700 font-sans"
                                min="1"
                              />
                              <button 
                                type="submit"
                                className="bg-emerald-500 text-slate-950 px-2 py-1 rounded text-[10px] font-extrabold uppercase cursor-pointer"
                              >
                                Apply
                              </button>
                              <button 
                                type="button"
                                onClick={() => setBillingAddUid("")}
                                className="text-zinc-500 hover:text-white px-1 text-[10px] font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setBillingAddUid(player.uid);
                                setBillingType("add");
                              }}
                              className="px-2.5 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm hover:translate-y-[-1px] cursor-pointer duration-100"
                            >
                              Modify Balance
                            </button>
                          )}

                          {/* Toggle access control roll for developer audit */}
                          <button
                            type="button"
                            disabled={isCurrentAdmin}
                            onClick={() => handleTogglePlayerRole(player.uid)}
                            className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border cursor-pointer duration-100 disabled:opacity-30 disabled:cursor-not-allowed ${
                              player.role === "admin"
                                ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                                : "border-[#3A435E] text-zinc-300 hover:border-zinc-500"
                            }`}
                            title={isCurrentAdmin ? "You cannot demote yourself" : "Switch user role permissions"}
                          >
                            Update Privilege
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
