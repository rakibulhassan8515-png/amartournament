/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Transaction, PaymentMethod } from "../types";
import { updateProfile, toggleRole, getTransactions, requestTransaction } from "../db";
import { ShieldCheck, UserCheck, ShieldAlert, Award, Hash, Zap, Percent, Clock, Mail, CheckCircle, AlertTriangle, Wallet, CreditCard, ArrowDownCircle, ArrowUpCircle, Landmark, HelpCircle, FileText, Copy, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { useToast } from "../context/ToastContext";

interface ProfileSectionProps {
  currentUser: User;
  onRefreshData: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  currentUser,
  onRefreshData
}) => {
  const { success, error } = useToast();
  const [username, setUsername] = useState<string>(currentUser.username);
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl);

  // Wallet Transactional States
  const [activeForm, setActiveForm] = useState<"deposit" | "withdraw">("deposit");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bKash");
  const [amount, setAmount] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");

  const transactions = getTransactions().filter(t => t.userId === currentUser.uid);

  const [copied, setCopied] = useState(false);

  const handleCopyNumber = (numStr: string) => {
    const rawNum = numStr.split(" ")[0].replace(/-/g, "");
    navigator.clipboard.writeText(rawNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ADMIN_BILLING_NUMBERS = {
    bKash: "01832-888515 (Send Money)",
    Nagad: "01832-888515 (Send Money)",
    Rocket: "01832-888515 (Send Money)"
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      error("Please enter a valid amount!");
      return;
    }

    if (numAmount < 10) {
      error("Minimum transaction limit is ৳10!");
      return;
    }

    if (!accountNumber.match(/^01[3-9]\d{8}$/)) {
      error("Please enter a valid 11-digit Bangladeshi mobile number!");
      return;
    }

    if (activeForm === "withdraw" && currentUser.balance < numAmount) {
      error("Insufficient wallet balance to request this cashout!");
      return;
    }

    if (activeForm === "deposit" && !transactionId.trim()) {
      error("Transaction ID (TrxID) is mandatory to verify deposits!");
      return;
    }

    try {
      requestTransaction({
        userId: currentUser.uid,
        type: activeForm,
        amount: numAmount,
        paymentMethod,
        accountNumber,
        transactionId: activeForm === "deposit" ? transactionId : "WID-" + Math.floor(Math.random() * 100000)
      });

      success(
        activeForm === "deposit"
          ? "Deposit requested! An admin will match the TrxID and credit your wallet shortly."
          : "Withdrawal request received! Funds will reach your mobile wallet within 2-4 hours."
      );

      // Reset
      setAmount("");
      setAccountNumber("");
      setTransactionId("");
      onRefreshData();
    } catch (err: any) {
      error(err.message || "Failed to submit request");
    }
  };

  // Preset Gaming avatars lists
  const PRESET_AVATARS = [
    { id: "ava-1", name: "Red Gunner", url: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=150&auto=format&fit=crop" },
    { id: "ava-2", name: "Cyber Samurai", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop" },
    { id: "ava-3", name: "Stealth Ninja", url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop" },
    { id: "ava-4", name: "Phoenix Gamer", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" }
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      error("Username cannot be empty!");
      return;
    }

    try {
      updateProfile(currentUser.uid, username, avatarUrl);
      success("Gamer profile card saved cleanly!");
      onRefreshData();
    } catch (err: any) {
      error(err.message || "Failed to update profile");
    }
  };

  const handleToggleAdminStatus = () => {
    try {
      const updatedUser = toggleRole(currentUser.uid);
      success(
        `Role updated! You are now logged in as: ${updatedUser.role.toUpperCase()}`
      );
      onRefreshData();
    } catch (err: any) {
      error("Failed to swap roles");
    }
  };

  // Math stats variables
  const winRate = currentUser.totalMatches > 0 
    ? Math.round((currentUser.totalWins / currentUser.totalMatches) * 100) 
    : 0;

  return (
    <div className="py-6 sm:py-10 bg-[#0B0F19] text-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Core Profile split container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Career Statistics Grid card */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Player Visual Card */}
            <div className="bg-[#101525] border border-[#1E253D] rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500/20 to-teal-500/10"></div>
              
              {/* Profile Avatar Frame */}
              <div className="relative mt-8 mb-4">
                <img 
                  src={avatarUrl} 
                  alt={currentUser.username} 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-emerald-500 shadow-glow"
                />
                <div className="absolute -bottom-1.5 -right-1.5 p-2 bg-[#0F1424] border border-[#2A375F] rounded-xl">
                  {currentUser.role === "admin" ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400" title="System Administrator" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-emerald-400" title="Verified Player" />
                  )}
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1">
                {currentUser.username}
              </h3>
              <p className="text-zinc-500 text-xs flex items-center space-x-1.5 justify-center">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>{currentUser.email}</span>
              </p>

              {/* Status block row */}
              <div className="mt-6 pt-5 border-t border-[#1C243B] w-full grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase leading-none">TOTAL BALANCE</p>
                  <p className="text-base sm:text-lg font-bold text-emerald-400 mt-2 font-mono">
                    ৳{currentUser.balance.toFixed(0)}
                  </p>
                </div>
                <div className="text-center border-l border-[#1C243B]">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase leading-none">ROLE LEVEL</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase mt-2.5 inline-block ${
                    currentUser.role === "admin" 
                      ? "bg-rose-500/20 text-rose-450 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-450 border border-emerald-500/30"
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

            </div>

            {/* Simulated Admin Mode Access Panel */}
            <div className="bg-[#101525] border border-[#212E4D] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-rose-400" />
                <h4 className="text-xs sm:text-sm font-bold uppercase font-mono tracking-wider text-rose-400">
                  DEVELOPER / ADMIN SWITCH
                </h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Toggling this switch lets you register as an **Administrator** or a standard **Player** on the fly, making it easy to test match creations, approval flows, and user wallets directly.
              </p>

              {currentUser.uid === "user-1" || currentUser.email === "rakibhassan3930@gmail.com" ? (
                <div className="flex items-center justify-between p-3 bg-[#131A2C] rounded-xl border border-rose-500/20">
                  <div>
                    <span className="text-xs font-bold font-sans text-white block">Simulate Admin Role:</span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Currently: {currentUser.role.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleAdminStatus}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentUser.role === "admin"
                        ? "bg-rose-500 hover:bg-rose-400 text-white"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    }`}
                  >
                    {currentUser.role === "admin" ? "Demote to User" : "Promote to Admin"}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-rose-500/10 flex items-start space-x-2.5">
                  <span className="text-rose-400 text-lg mt-0.5">🔒</span>
                  <div>
                    <span className="text-xs font-black font-mono text-rose-400 block uppercase tracking-wide">ORGANIZER ACCESS LOCKED</span>
                    <span className="text-[10px] text-zinc-500 leading-relaxed block font-sans mt-0.5">
                      Regular survivor profiles are not authorized to elevate their roles on this platform. Access is secured and limited to primary organizer **Rakib Hassan**.
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Column 2 & 3: Performance metrics and Configuration Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Career Performance Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-[#101525] border border-[#1E253D] p-5 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-450">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase leading-none">Matches Played</p>
                  <p className="text-lg sm:text-2xl font-bold font-mono mt-1.5">{currentUser.totalMatches}</p>
                </div>
              </div>

              <div className="bg-[#101525] border border-[#1E253D] p-5 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase leading-none">Total Wins</p>
                  <p className="text-lg sm:text-2xl font-bold font-mono mt-1.5">{currentUser.totalWins}</p>
                </div>
              </div>

              <div className="bg-[#101525] border border-[#1E253D] p-5 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase leading-none">Win Ratio</p>
                  <p className="text-lg sm:text-2xl font-bold font-mono mt-1.5 text-indigo-400">{winRate}%</p>
                </div>
              </div>

            </div>

            {/* Career Performance Trend Chart Card */}
            <div className="bg-[#101525] border border-[#1E253D] rounded-3xl p-6 shadow-xl" id="performance-showcase-card">
              <div className="flex items-center space-x-2.5 mb-6" id="performance-card-header">
                <Award className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <h4 className="text-base sm:text-lg font-bold font-sans">Performance Showcase</h4>
                  <p className="text-zinc-500 text-xs">A visual tracking of tournaments joined versus victories secured</p>
                </div>
              </div>
              
              <div className="h-56 sm:h-64 w-full" id="performance-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Total Matches",
                        Count: currentUser.totalMatches,
                        fill: "#10b981", // Emerald
                      },
                      {
                        name: "Wins Claimed",
                        Count: currentUser.totalWins,
                        fill: "#fbbf24", // Gold Yellow
                      },
                      {
                        name: "Defeats",
                        Count: Math.max(0, currentUser.totalMatches - currentUser.totalWins),
                        fill: "#f43f5e", // Rose Red
                      }
                    ]}
                    margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#0f1424] border border-[#202941] px-3 py-2 rounded-xl shadow-xl font-sans" id="profile-chart-tooltip">
                              <p className="text-xs font-semibold text-white">{data.name}</p>
                              <p className="text-sm font-black mt-1 font-mono" style={{ color: data.fill }}>
                                {data.Count} {data.Count === 1 ? 'Match' : 'Matches'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="Count" radius={[8, 8, 0, 0]} maxBarSize={50}>
                      {[
                        { name: "Total Matches", fill: "#10b981" },
                        { name: "Wins Claimed", fill: "#fbbf24" },
                        { name: "Defeats", fill: "#f43f5e" }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legends */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] sm:text-xs font-mono text-zinc-400 bg-[#0c101d] p-3 rounded-xl border border-[#1b233a]" id="performance-legends-grid">
                <div className="flex flex-col items-center border-r border-[#1b233a]" id="legend-matches">
                  <span className="text-emerald-400 font-bold text-sm sm:text-base font-mono">{currentUser.totalMatches}</span>
                  <span>Total Matches</span>
                </div>
                <div className="flex flex-col items-center border-r border-[#1b233a]" id="legend-wins">
                  <span className="text-yellow-400 font-bold text-sm sm:text-base font-mono">{currentUser.totalWins}</span>
                  <span>Won Match</span>
                </div>
                <div className="flex flex-col items-center" id="legend-losses">
                  <span className="text-rose-400 font-bold text-sm sm:text-base font-mono">
                    {Math.max(0, currentUser.totalMatches - currentUser.totalWins)}
                  </span>
                  <span>Defeated</span>
                </div>
              </div>
            </div>

            {/* Profile Config Form Card */}
            <div className="bg-[#101525] border border-[#1E253D] rounded-3xl p-6 sm:p-8 shadow-xl">
              
              <div className="flex items-center space-x-2.5 mb-6">
                <Zap className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-base sm:text-lg font-bold font-sans">Modify Gamer Details</h4>
                  <p className="text-zinc-500 text-xs">Configure your nickname and profile visual display card</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                {/* Nickname input */}
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">
                    Gamer Username / Nickname:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter nickname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#111726] border border-[#202940] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 font-sans"
                    maxLength={20}
                  />
                  <p className="text-[10px] text-zinc-550 font-sans mt-1">This name will be displayed publicly on active tournament match charts and leaderboards.</p>
                </div>

                {/* Preset Avatar choice list */}
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-400 block mb-3 uppercase tracking-wide">
                    Select Avatar Preset:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {PRESET_AVATARS.map(avatar => {
                      const isSelected = avatarUrl === avatar.url;
                      return (
                        <div 
                          key={avatar.id}
                          onClick={() => setAvatarUrl(avatar.url)}
                          className={`p-3 bg-[#13192B] border rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all ${
                            isSelected 
                              ? "border-emerald-400 ring-2 ring-emerald-500/30 scale-105" 
                              : "border-[#202940] hover:border-zinc-700"
                          }`}
                        >
                          <img 
                            src={avatar.url} 
                            alt={avatar.name} 
                            className="w-12 h-12 rounded-xl object-cover mb-2" 
                          />
                          <span className="text-[10px] font-sans font-medium text-zinc-300">
                            {avatar.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Joined timeframe banner */}
                <div className="bg-[#12192A] border border-[#202C4E] p-4 rounded-xl flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 block leading-none">SINCE JOINED</span>
                    <p className="text-xs font-semibold text-zinc-300 mt-1">
                      Member since {new Date(currentUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Submit trigger buttons */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm tracking-wide shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase"
                >
                  Save Gamer Card Settings
                </button>

              </form>

            </div>

          </div>

        </div>

        {/* Dynamic Pocket Wallet, Deposit & Withdraw options */}
        <div className="mt-12 bg-[#101525] border border-[#1E253D] rounded-3xl p-6 sm:p-8 shadow-xl" id="profile-wallet-console">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A2238] pb-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-3 bg-emerald-500/15 rounded-2xl border border-emerald-500/20">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase font-sans">Gamer Pocket Wallet</h3>
                <p className="text-zinc-500 text-xs">Instantly deposit and withdraw BDT safely using bKash, Nagad, or Rocket</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-[#13192B] p-1.5 rounded-xl border border-[#212E4C]" id="profile-wallet-toggles">
              <button
                type="button"
                onClick={() => setActiveForm("deposit")}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all uppercase cursor-pointer ${
                  activeForm === "deposit"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Deposit Funds
              </button>
              <button
                type="button"
                onClick={() => setActiveForm("withdraw")}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all uppercase cursor-pointer ${
                  activeForm === "withdraw"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Withdraw Cashout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-7 space-y-6">
              
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                
                {/* Method selector */}
                <div>
                  <label className="text-xs font-bold font-mono text-zinc-400 block mb-3 uppercase tracking-wider">
                    Select Gateway Account
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["bKash", "Nagad", "Rocket"] as const).map(method => {
                      const isSelected = paymentMethod === method;
                      return (
                        <div
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`p-3 bg-[#13192B] border rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            isSelected
                              ? "border-emerald-500 ring-2 ring-emerald-500/20 text-white"
                              : "border-[#1E253D] hover:border-zinc-750 text-zinc-400"
                          }`}
                        >
                          <span className="text-sm font-black font-sans tracking-wide uppercase">{method}</span>
                          <span className="text-[9px] text-zinc-500 font-mono mt-0.5">MANUAL</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Instruction Card for Sender */}
                <div className="bg-[#13192A] border border-blue-500/20 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold uppercase">Payment Guide</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {activeForm === "deposit" ? (
                      <>
                        Please complete a <strong className="text-emerald-400 font-semibold">Send Money</strong> of BDT of your choice to our designated gateway number below:
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 border border-yellow-500/20 px-3 py-2 mt-2 rounded-xl">
                          <span className="text-yellow-400 font-mono font-bold text-sm tracking-wide">
                            {ADMIN_BILLING_NUMBERS[paymentMethod]}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyNumber(ADMIN_BILLING_NUMBERS[paymentMethod])}
                            className={`flex items-center justify-center space-x-1.5 px-3 py-1 rounded-lg border text-[11px] font-sans font-extrabold cursor-pointer transition-all select-none duration-150 shrink-0 ${
                              copied
                                ? "bg-emerald-500/20 border-emerald-400 text-emerald-400"
                                : "bg-slate-800 border-[#3b4f85] hover:bg-slate-700 hover:border-zinc-400 text-zinc-200 active:scale-95"
                            }`}
                          >
                            {copied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied! ({ADMIN_BILLING_NUMBERS[paymentMethod].split(" ")[0].replace(/-/g, "")})</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-zinc-400" />
                                <span>Copy Number</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="mt-2 text-[10px] text-zinc-400 leading-relaxed font-sans">
                          💡 <strong className="text-zinc-300">কিভাবে রিচার্জ করবেন:</strong> আপনার bKash/Nagad/Rocket অ্যাপ ওপেন করে উপরে দেওয়া নাম্বারে <strong className="text-emerald-400 font-bold">Send Money</strong> করুন, এরপর নিচে তথ্যগুলো বসিয়ে সাবমিট করুন।
                        </div>
                      </>
                    ) : (
                      <>
                        Request the cashout of your direct winnings! Provide your 11-digit personal / agent wallet mobile number below. Payment processing will clear in 2-4 hours.
                      </>
                    )}
                  </p>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-zinc-400 block mb-2 uppercase">
                      Sender / Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 017xxxxxxxx"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-[#13192B] border border-[#202940] rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-400 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-zinc-400 block mb-2 uppercase">
                      Amount (BDT)
                    </label>
                    <input
                      type="number"
                      required
                      min="10"
                      placeholder="e.g. 50"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#13192B] border border-[#202940] rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-400 transition"
                    />
                  </div>
                </div>

                {activeForm === "deposit" && (
                  <div>
                    <label className="text-xs font-mono font-bold text-zinc-400 block mb-2 uppercase">
                      Payment Transaction Code (TrxID)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9H3829DU8"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-[#13192B] border border-[#202940] rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-400 transition"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm tracking-wide shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase"
                >
                  {activeForm === "deposit" ? "Request Deposit Funds" : "Request Instant Withdrawal"}
                </button>

              </form>

            </div>

            {/* Ledger Column */}
            <div className="lg:col-span-5 bg-[#0C101D] border border-[#1B233A] rounded-2xl p-4 sm:p-6 flex flex-col justify-between" id="profile-wallet-ledger">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#171F34] mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Transaction Ledger</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#12192A] border border-[#1F2C4C] text-[#10B981] text-[9px] font-mono rounded">
                    {transactions.length} ITEMS
                  </span>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">
                    <CreditCard className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                    <p className="text-xs font-mono text-zinc-600">No transaction ledger history recorded under this account</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {transactions.map(item => {
                      const isDeposit = item.type === "deposit";
                      const isApproved = item.status === "approved";
                      const isRejected = item.status === "rejected";
                      return (
                        <div
                          key={item.id}
                          className="p-3 bg-[#111729] rounded-xl border border-[#1F2C4C] text-xs font-mono flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className={`p-1.5 rounded-lg ${
                              isDeposit ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            }`}>
                              {isDeposit ? <ArrowDownCircle className="w-3.5 h-3.5" /> : <ArrowUpCircle className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1">
                                <span className="font-extrabold text-white text-[10px] uppercase">{item.type}</span>
                                <span className="text-[9px] text-zinc-400 bg-zinc-850 px-1 rounded uppercase">
                                  {item.paymentMethod}
                                </span>
                              </div>
                              <span className="text-[9px] text-zinc-500 block mt-0.5">
                                {new Date(item.createdAt).toLocaleDateString()} • {item.accountNumber}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`font-bold text-[11px] ${isDeposit ? "text-emerald-400" : "text-rose-400"}`}>
                              {isDeposit ? "+" : "-"}৳{item.amount}
                            </p>
                            <span className={`text-[9px] uppercase font-bold tracking-wide ${
                              isApproved 
                                ? "text-emerald-400 font-extrabold" 
                                : isRejected 
                                ? "text-rose-500" 
                                : "text-yellow-400 animate-pulse"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#171F34] mt-6 text-[10px] text-zinc-500 leading-snug">
                <strong>Secured Node Transfer:</strong> All financial entries are processed manually via encrypted ledgers. For direct escalation, contact admin support desk.
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
