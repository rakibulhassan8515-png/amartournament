import React, { useState } from "react";
import { User } from "../types";
import { getAllUsers, switchCurrentUser, registerUser } from "../db";
import { ShieldCheck, UserCheck, Play, Swords, PlusCircle, Check, HelpCircle } from "lucide-react";
import { useToast } from "../context/ToastContext";

interface LoginSectionProps {
  onLoginSuccess: (user: User) => void;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=150&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
];

export const LoginSection: React.FC<LoginSectionProps> = ({ onLoginSuccess }) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<"demo" | "register">("demo");
  const [customUsername, setCustomUsername] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);

  const allUsers = getAllUsers();

  const handleDemoSignIn = (uid: string) => {
    switchCurrentUser(uid);
    const users = getAllUsers();
    const user = users.find(u => u.uid === uid);
    if (user) {
      success(`Welcome back, ${user.username}! Signed in successfully.`);
      onLoginSuccess(user);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = customUsername.trim();
    if (!trimmedName) {
      error("Please choose a valid survivor username!");
      return;
    }

    if (trimmedName.length < 3) {
      error("Username must be at least 3 characters long.");
      return;
    }

    // Check duplicate
    const exists = allUsers.find(
      u => u.username.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (exists) {
      error("This username is already claimed! Choose another name.");
      return;
    }

    try {
      const newUser = registerUser(trimmedName, customEmail, selectedAvatar);
      success("Success! Your brand new Survivor Profile has been created! Welcome to amar Tournament!");
      onLoginSuccess(newUser);
    } catch (err: any) {
      error(err.message || "Failed to register account.");
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4" id="login-container">
      <div className="bg-[#101525] border border-[#1F2943] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Banner */}
        <div className="text-center pb-6 border-b border-[#182136] mb-6">
          <div className="inline-flex p-3 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl shadow-glow mb-4">
            <Swords className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
            amar <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Tournament</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 font-mono uppercase tracking-widest">
            Survivor Authentication
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#0B0F19] p-1 rounded-xl border border-[#202940] mb-6" id="login-tabs">
          <button
            type="button"
            id="login-tab-demo"
            onClick={() => {
              setActiveTab("demo");
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "demo"
                ? "bg-slate-800 text-white shadow-md border-b border-emerald-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Demo Profiles
          </button>
          <button
            type="button"
            id="login-tab-register"
            onClick={() => {
              setActiveTab("register");
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "register"
                ? "bg-slate-800 text-white shadow-md border-b border-emerald-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Create New Profile
          </button>
        </div>

        {/* Demo profiles list */}
        {activeTab === "demo" && (
          <div className="space-y-3" id="demo-profiles-list">
            <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Select an account to login instantly:
            </p>
            {allUsers.map((user) => (
              <button
                key={user.uid}
                type="button"
                onClick={() => handleDemoSignIn(user.uid)}
                className="w-full text-left bg-[#141B2E] hover:bg-[#1A243F] border border-[#212F4D] hover:border-emerald-500/50 rounded-2xl p-3 flex items-center justify-between transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-10 h-10 rounded-xl object-cover border border-[#2B3B5E] group-hover:border-emerald-400/50 transition-colors"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {user.username}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mt-0.5">
                      {user.role === "admin" ? "🛠️ Network Administrator" : "🎮 Tournament Survivalist"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    ৳{user.balance.toFixed(0)}
                  </span>
                  <Play className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Custom registration form */}
        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4" id="custom-register-form">
            <div>
              <label htmlFor="reg-username" className="text-xs font-mono font-black text-zinc-400 block mb-1.5">
                SURVIVOR HANDLE / USERNAME:
              </label>
              <input
                type="text"
                id="reg-username"
                value={customUsername}
                maxLength={18}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="e.g. Syler_Gaming"
                className="w-full bg-[#0B0F19] border border-[#202940] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 font-sans"
                required
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="text-xs font-mono font-black text-zinc-400 block mb-1.5 opacity-80">
                EMAIL ADDRESS (OPTIONAL):
              </label>
              <input
                type="email"
                id="reg-email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="e.g. syler@example.com"
                className="w-full bg-[#0B0F19] border border-[#202940] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            {/* Avatar Select */}
            <div>
              <span className="text-xs font-mono font-black text-zinc-400 block mb-2">
                SELECT GAMING AVATAR:
              </span>
              <div className="flex items-center space-x-2.5 bg-[#0B0F19] p-3 border border-[#202940] rounded-2xl">
                {AVATAR_PRESETS.map((avatar, idx) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedAvatar === avatar
                        ? "border-emerald-500 scale-110 shadow-glow"
                        : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img src={avatar} alt={`Avatar Preset ${idx}`} className="w-10 h-10 object-cover" />
                    {selectedAvatar === avatar && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              id="submit-register-btn"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-350 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-98 flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deploy Account & Sign In</span>
            </button>
            
            <p className="text-[10px] text-zinc-400 font-mono text-center">
              *Registration is 100% free! Select deposit options in your profile wallet to participate.
            </p>
          </form>
        )}
      </div>

      {/* Helper guide */}
      <div className="mt-4 text-center bg-[#101525]/60 border border-[#1a233b]/40 rounded-2xl p-4 text-xs text-zinc-400 flex items-start space-x-2.5 max-w-sm mx-auto">
        <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-left leading-normal font-sans">
          This tournament platform utilizes a fully simulated reactive database synchronized inside your browser's <strong className="text-zinc-200">Local Storage</strong>. You can switch between active roles or custom characters securely!
        </p>
      </div>
    </div>
  );
};
