/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User } from "../types";
import { getAllUsers, switchCurrentUser } from "../db";
import { Trophy, Wallet, ShieldAlert, Users, RotateCcw, LogOut, Award } from "lucide-react";

interface HeaderProps {
  currentUser: User;
  onUserChanged: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChanged,
  activeTab,
  setActiveTab,
  onLogout
}) => {
  const allUsers = getAllUsers();

  const handleUserSwap = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchCurrentUser(e.target.value);
    onUserChanged();
  };

  const menuTabs = [
    { id: "matches", label: "Home Feed", icon: Trophy },
    { id: "wallet", label: "My Matches", icon: Wallet },
    { id: "results", label: "Results Board", icon: Trophy },
    { id: "leaderboard", label: "Leaderboard 👑", icon: Award },
    { id: "profile", label: "Profile Wallet", icon: Users },
  ];

  if (currentUser.role === "admin") {
    menuTabs.push({ id: "admin", label: "Admin Panel", icon: ShieldAlert });
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0F1424] border-b border-[#1F2943] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* App Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("matches")}>
            <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl shadow-glow">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold font-sans tracking-tight text-white flex items-center">
                amar <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 ml-1.5">Tournament</span>
              </h1>
              <p className="hidden sm:block text-[10px] font-mono text-zinc-400 uppercase tracking-widest leading-none mt-0.5">
                Championship Edition
              </p>
            </div>
          </div>

          {/* Quick Stats & Select Swapper */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            
            {/* Balance Badge */}
            <div 
              onClick={() => setActiveTab("profile")}
              className="bg-[#1A2238] border border-[#2B385C] rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 flex items-center space-x-2 sm:space-x-3 hover:bg-[#202943] transition-all cursor-pointer hover:border-emerald-500/50 active:scale-95 duration-150"
              title="Click to view Profile, Deposit & Withdraw options"
            >
              <div className="p-1 sm:p-1.5 bg-emerald-500/20 rounded-lg">
                <Wallet className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-400" />
              </div>
              <div className="text-right">
                <p className="text-[9px] sm:text-[10px] font-mono text-zinc-400 leading-none">WALLET</p>
                <p className="text-sm sm:text-base font-bold text-white leading-none mt-1 font-mono">
                  ৳{currentUser.balance.toFixed(0)}
                </p>
              </div>
            </div>

            {/* Simulated Live ID Changer for Demo Review */}
            <div className="flex items-center space-x-1 bg-[#161C2E] border border-[#222B45] rounded-xl px-2 py-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400 hidden lg:block" />
              <select
                value={currentUser.uid}
                onChange={handleUserSwap}
                className="bg-transparent text-xs text-zinc-300 font-sans font-medium focus:outline-none cursor-pointer max-w-[110px] sm:max-w-[150px]"
                title="Switch User Profile to inspect user vs admin features"
              >
                {allUsers.map(user => (
                  <option key={user.uid} value={user.uid} className="bg-[#0F1424] text-white">
                    {user.username} ({user.role === "admin" ? "Admin" : "Player"})
                  </option>
                ))}
              </select>
            </div>

             {/* Avatar block */}
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.username}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-emerald-500/30 object-cover hidden sm:block"
            />

            {/* Logout button */}
            <button
              onClick={onLogout}
              id="logout-btn"
              className="flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/35 cursor-pointer active:scale-95 duration-150 transition-all select-none font-bold text-xs"
              title="Logout from Account"
            >
              <LogOut className="w-3.5 h-3.5 sm:mr-1.5 shrink-0" />
              <span className="hidden sm:inline font-sans">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 overflow-x-auto scroller-hide pb-2 sm:pb-3 mt-1 sm:mt-0">
          {menuTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 border-b-2 border-emerald-400"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
