/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { getCurrentUser } from "./db";
import { Header } from "./components/Header";
import { MatchesSection } from "./components/MatchesSection";
import { MyMatchesSection } from "./components/MyMatchesSection";
import { ResultsSection } from "./components/ResultsSection";
import { ProfileSection } from "./components/ProfileSection";
import { AdminSection } from "./components/AdminSection";
import { LoginSection } from "./components/LoginSection";
import { LeaderboardSection } from "./components/LeaderboardSection";
import { Info, HelpCircle, MessageCircle } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUserState] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>("matches");
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(() => {
    return localStorage.getItem("tournaments_logged_out") === "true";
  });

  const handleRefreshData = () => {
    setCurrentUserState(getCurrentUser());
  };

  const handleSetTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleLogout = () => {
    localStorage.setItem("tournaments_logged_out", "true");
    setIsLoggedOut(true);
  };

  const handleLoginSuccess = (user: any) => {
    localStorage.removeItem("tournaments_logged_out");
    setCurrentUserState(user);
    setIsLoggedOut(false);
  };

  // If logged out, render the authentication section
  if (isLoggedOut) {
    return (
      <div className="bg-[#0B0F19] text-white min-h-screen flex flex-col justify-center items-center py-10 selection:bg-emerald-500/30 selection:text-emerald-300">
        <LoginSection onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="bg-[#0B0F19] text-white min-h-screen flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Header component */}
      <Header
        currentUser={currentUser}
        onUserChanged={handleRefreshData}
        activeTab={activeTab}
        setActiveTab={handleSetTab}
        onLogout={handleLogout}
      />


      {/* Premium Esports Banner under the Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 shadow-2xl group select-none">
          <img 
            src="/src/assets/images/esports_banner_1779686141803.png" 
            alt="Esports Arena Tournament Banner" 
            className="w-full h-auto max-h-[160px] sm:max-h-[220px] md:max-h-[260px] object-cover group-hover:scale-[1.01] transition-transform duration-700 brightness-[0.9] hover:brightness-[1.0]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-black/10 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 z-10 flex items-center space-x-2">
            <span className="px-2 py-1 bg-emerald-500 text-slate-950 text-[9px] sm:text-xs font-black uppercase rounded-lg tracking-wide shadow-lg">
              ★ Active Championships
            </span>
            <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/20 text-[9px] sm:text-xs font-mono rounded-lg tracking-wide">
              ROOMS FULLY CONFIGURABLE
            </span>
          </div>
        </div>
      </div>

      {/* Main Mainframes container viewports */}
      <main className="flex-grow">
        {activeTab === "matches" && (
          <MatchesSection 
            currentUser={currentUser} 
            onRefreshData={handleRefreshData} 
            setActiveTab={handleSetTab}
          />
        )}
        {activeTab === "wallet" && (
          <MyMatchesSection 
            currentUser={currentUser} 
            setActiveTab={handleSetTab} 
          />
        )}
        {activeTab === "results" && (
          <ResultsSection currentUser={currentUser} />
        )}
        {activeTab === "leaderboard" && (
          <LeaderboardSection />
        )}
        {activeTab === "profile" && (
          <ProfileSection 
            currentUser={currentUser} 
            onRefreshData={handleRefreshData} 
          />
        )}
        {activeTab === "admin" && (
          <AdminSection 
            currentUser={currentUser} 
            onRefreshData={handleRefreshData} 
          />
        )}
      </main>

       {/* Footer Branding line */}
      <footer className="bg-[#0A0D18] border-t border-[#1F2943] py-8 text-center text-xs text-zinc-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-sm font-bold text-zinc-300">amar Tournament platform</p>
              <p className="text-[10px] text-zinc-600 mt-1">© 2026 amar Tournament. Developed for professional gaming action in Bangladesh.</p>
            </div>
            
            {/* Quick helper guides with WhatsApp support link */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <span className="text-zinc-500 flex items-center">
                <Info className="w-3.5 h-3.5 mr-1 text-zinc-400" /> Term of Uses
              </span>
              <span className="text-zinc-500 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1 text-zinc-400" /> FAQ Helpline
              </span>
              <a 
                href="https://wa.me/8801832888515" 
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 hover:underline transition-all bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
              >
                <MessageCircle className="w-3.5 h-3.5 animate-pulse text-emerald-400 font-bold" />
                <span>WhatsApp Support: 01832-888515</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Interactive WhatsApp Support Widget */}
      <div className="fixed bottom-6 right-6 z-[999] group">
        <div className="absolute -inset-1 rounded-full bg-emerald-500/30 blur-md animate-pulse"></div>
        <a
          href="https://wa.me/8801832888515"
          target="_blank"
          rel="noreferrer"
          className="relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border border-emerald-400/50"
          title="Direct WhatsApp Support Helpline"
        >
          {/* Animated pulsing sound waves */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-25 animate-ping"></span>
          <MessageCircle className="w-7 h-7 fill-white text-emerald-500 stroke-[2.2]" />
          
          {/* Custom tooltip helper popup on hover */}
          <div className="absolute right-16 bg-[#101626] border border-[#212E4C] text-zinc-200 px-3 py-2 rounded-xl text-[11px] font-sans font-bold whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col items-start leading-tight">
            <span className="text-emerald-400 uppercase tracking-widest text-[9px] font-mono leading-none mb-1">💬 Online Support</span>
            <span className="text-white text-xs">WhatsApp: 01832-888515</span>
            <span className="text-[10px] text-zinc-400 mt-0.5 leading-none font-normal">কোন সমস্যা হলে সরাসরি মেসেজ দিন</span>
          </div>
        </a>
      </div>

    </div>
  );
}
