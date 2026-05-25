/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Match, Transaction, Result, MatchType } from "./types";
// @ts-ignore
import esportsBanner from "./assets/images/esports_banner_1779686141803.png";
// @ts-ignore
import clashSquadBanner from "./assets/images/clash_squad_showcase_1779697502901.png";

const LOCAL_STORAGE_DB_KEY = "amar_tournament_db_store";

interface TournamentDb {
  users: User[];
  currentUserId: string;
  matches: Match[];
  transactions: Transaction[];
  results: Result[];
}

// Pre-populated data for initial load
const INITIAL_USERS: User[] = [
  {
    uid: "user-1",
    username: "Rakib Hassan",
    email: "rakibhassan3930@gmail.com",
    balance: 380, // initial balance in BDT (৳)
    role: "admin", // starts as admin/user togglable for ease of review
    avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=150&auto=format&fit=crop",
    totalMatches: 24,
    totalWins: 11,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    uid: "user-2",
    username: "Saimon_Gaming",
    email: "saimon@gmail.com",
    balance: 50,
    role: "user",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    totalMatches: 45,
    totalWins: 22,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    uid: "user-3",
    username: "Op_Fahim_FF",
    email: "fahim@gmail.com",
    balance: 140,
    role: "user",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop",
    totalMatches: 18,
    totalWins: 4,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    uid: "user-4",
    username: "LudoPro_Mitu",
    email: "mitu@gmail.com",
    balance: 620,
    role: "user",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    totalMatches: 60,
    totalWins: 31,
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_MATCHES: Match[] = [
  // --- BR MATCHES (4 Packages) ---
  {
    id: "br-1",
    title: "Free Fire BR Grand Sunday Cup",
    type: "BR MATCH",
    entryFee: 50,
    prize: 1500,
    status: "upcoming",
    startTime: new Date(Date.now() + 1.2 * 24 * 60 * 60 * 1000).toISOString(),
    maxSlots: 48,
    currentSlots: 32,
    joinedPlayers: ["user-2", "user-3", "user-4"],
    roomDetails: { roomId: "220938", password: "10" },
    rules: "1. No third-party hacks or configuration files allowed.\n2. Tablet and PC emulators are strictly forbidden.\n3. Team teaming is subject to instant ban without prize refunds.\n4. Rooms will be shared exactly 15 minutes before the start time.\n5. Screenshot results with kills to claiming secondary rewards.",
    imageUrl: esportsBanner,
    description: "Prepare to dive into the peak of esports action! This is our flagship Sunday Battle Royale Tournament where forty-eight professional survivors compete on Bermuda for the ultimate title. Team up or go solo to dominate the map and claim your massive prize share!"
  },
  {
    id: "br-2",
    title: "Bermuda Booyah Rush Tournament",
    type: "BR MATCH",
    entryFee: 40,
    prize: 1200,
    status: "upcoming",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    maxSlots: 48,
    currentSlots: 15,
    joinedPlayers: ["user-3"],
    roomDetails: { roomId: "331049", password: "ff7" },
    rules: "1. Respect all players.\n2. Standard BR Mode Rules apply.",
    imageUrl: esportsBanner,
    description: "A fast-paced Bermuda Battle Royale showdown! Highly engaging gameplay map designed to satisfy seasoned veterans and aggressive hot-droppers alike."
  },
  {
    id: "br-3",
    title: "Kalahari desert Sniper Elite Match",
    type: "BR MATCH",
    entryFee: 30,
    prize: 900,
    status: "upcoming",
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    maxSlots: 48,
    currentSlots: 8,
    joinedPlayers: ["user-4"],
    roomDetails: { roomId: "442150", password: "123" },
    rules: "1. Snipers only.\n2. Double sniper setup encouraged.",
    imageUrl: esportsBanner,
    description: "Survive and pick off opponents from the dunes of Kalahari. Precision aim and extreme patience is required to secure the master badge."
  },
  {
    id: "br-4",
    title: "BR Weekly Midnight Champion Showdown",
    type: "BR MATCH",
    entryFee: 20,
    prize: 600,
    status: "upcoming",
    startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    maxSlots: 48,
    currentSlots: 20,
    joinedPlayers: ["user-2", "user-4"],
    roomDetails: { roomId: "553261", password: "mid" },
    rules: "1. Default weapons settings.\n2. No hacking files permitted.",
    imageUrl: esportsBanner,
    description: "Midnight survivors competition for our late-night professional roster. Simple, traditional rules, high speed circle closings."
  },

  // --- CLASH SQUAD (4 Packages) ---
  {
    id: "cs-1",
    title: "Clash Squad Elite 4v4 Sunday League",
    type: "CLASH SQUAD",
    entryFee: 30,
    prize: 800,
    status: "upcoming",
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    maxSlots: 8,
    currentSlots: 6,
    joinedPlayers: ["user-2", "user-3"],
    roomDetails: { roomId: "889912", password: "4v4" },
    rules: "1. Map: Bermuda. Characters Skills: Active.\n2. Gun Attribute: No skin abilities.\n3. Limited Ammo: Yes.",
    imageUrl: clashSquadBanner,
    description: "Experience nail-biting, close-quarter squad combats! The Clash Squad Elite brings together high-coordination 4v4 teams facing off in a best-of-7 gunfight tournament."
  },
  {
    id: "cs-2",
    title: "CS Squad Masterclass Weekly Pro Cup",
    type: "CLASH SQUAD",
    entryFee: 40,
    prize: 1000,
    status: "upcoming",
    startTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    maxSlots: 8,
    currentSlots: 4,
    joinedPlayers: ["user-4"],
    roomDetails: { roomId: "776655", password: "prow" },
    rules: "1. standard tournament Rules.\n2. No team-teaming across rooms.",
    imageUrl: clashSquadBanner,
    description: "Let the ultimate coordination decide who takes home the 1000 BDT pool. Gather your squad and enter."
  },
  {
    id: "cs-3",
    title: "Bermuda Clash Fight Weekend Special",
    type: "CLASH SQUAD",
    entryFee: 25,
    prize: 650,
    status: "upcoming",
    startTime: new Date(Date.now() + 15 * 60 * 60 * 1000).toISOString(),
    maxSlots: 8,
    currentSlots: 2,
    joinedPlayers: [],
    roomDetails: { roomId: "112233", password: "ber" },
    rules: "1. Character skills allowed.\n2. Unlimited Gloo Walls.",
    imageUrl: clashSquadBanner,
    description: "Perfect CS fight layout optimized for fast tactics and spectacular mechanical skills."
  },
  {
    id: "cs-4",
    title: "CS Friday Ultimate Squad Warfare",
    type: "CLASH SQUAD",
    entryFee: 50,
    prize: 1500,
    status: "upcoming",
    startTime: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
    maxSlots: 8,
    currentSlots: 0,
    joinedPlayers: [],
    roomDetails: { roomId: "445566", password: "fri" },
    rules: "1. Red gun skins prohibited.\n2. Standard 7 rounds gameplay.",
    imageUrl: clashSquadBanner,
    description: "Highly anticipated Friday CS tournament. Play against top-tier competitive squads in Bangladesh."
  },

  // --- CS 1v1 2v2 (3 Packages) ---
  {
    id: "cs-1v1-1",
    title: "Desert Eagle Solo Custom Duel 1v1",
    type: "CS 1v1 2v2",
    entryFee: 40,
    prize: 700,
    status: "upcoming",
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    maxSlots: 2,
    currentSlots: 1,
    joinedPlayers: ["user-2"],
    roomDetails: { roomId: "1110022", password: "de" },
    rules: "1. Only Desert Eagle pistols allowed.\n2. One-tap headshots preferred.",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop",
    description: "Classic Desert Eagle solitary duel on the custom courtyard map. Test your direct one-tap accuracy against the top rivals."
  },
  {
    id: "cs-1v1-2",
    title: "Double Impact Team Duel 2v2 Special",
    type: "CS 1v1 2v2",
    entryFee: 60,
    prize: 1100,
    status: "upcoming",
    startTime: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    maxSlots: 4,
    currentSlots: 2,
    joinedPlayers: ["user-3", "user-4"],
    roomDetails: { roomId: "2220033", password: "2v2" },
    rules: "1. M1887 & MP40 enabled.\n2. No grenades allowed.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    description: "Dual coordination tournament! Bring your best companion and demonstrate team aiming supremacy."
  },
  {
    id: "cs-1v1-3",
    title: "CS Speed Aim Solo Champion Duel",
    type: "CS 1v1 2v2",
    entryFee: 50,
    prize: 900,
    status: "upcoming",
    startTime: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
    maxSlots: 2,
    currentSlots: 0,
    joinedPlayers: [],
    roomDetails: { roomId: "3330044", password: "aim" },
    rules: "1. Any shotgun permitted.\n2. No shield skills or passive heals.",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    description: "Test mechanical weapon swap speed and ultimate bullet evasion abilities."
  },
  {
    id: "cs-1v1-4",
    title: "CS Elite Duo Tournament 2v2 Challenge",
    type: "CS 1v1 2v2",
    entryFee: 35,
    prize: 650,
    status: "upcoming",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    maxSlots: 4,
    currentSlots: 1,
    joinedPlayers: ["user-2"],
    roomDetails: { roomId: "4440055", password: "win" },
    rules: "1. No grenade launchers or flashbangs.\n2. Standard 2v2 Clash rules apply.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    description: "Intense coordinate gaming double elimination. Bring your tactical layout and claim the custom champion reward."
  },

  // --- LONE WOLF (4 Packages) ---
  {
    id: "lw-1",
    title: "Lone Wolf Speed Gladiator Arena 1v1",
    type: "LONE WOLF",
    entryFee: 20,
    prize: 350,
    status: "upcoming",
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    maxSlots: 2,
    currentSlots: 1,
    joinedPlayers: ["user-3"],
    roomDetails: { roomId: "888221", password: "lw1" },
    rules: "1. Normal weapon picker cycle.\n2. Standard 1v1 gameplay.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    description: "Prove your personal resilience in the iconic iron cage. Select weapons rapidly and outperform your single target."
  },
  {
    id: "lw-2",
    title: "Duo Wolf pack Tactical Speed Match",
    type: "LONE WOLF",
    entryFee: 30,
    prize: 550,
    status: "upcoming",
    startTime: new Date(Date.now() + 11 * 60 * 60 * 1000).toISOString(),
    maxSlots: 4,
    currentSlots: 2,
    joinedPlayers: ["user-2", "user-4"],
    roomDetails: { roomId: "888222", password: "lw2" },
    rules: "1. Character skills enabled.\n2. Standard 2v2 Lone Wolf custom rules.",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    description: "Two against two close-interval tactical battles. Perfect for testing rapid close-quarters assault setups."
  },
  {
    id: "lw-3",
    title: "Lone Wolf Alpha Warrior Cup 1v1",
    type: "LONE WOLF",
    entryFee: 25,
    prize: 450,
    status: "upcoming",
    startTime: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    maxSlots: 2,
    currentSlots: 0,
    joinedPlayers: [],
    roomDetails: { roomId: "888223", password: "lw3" },
    rules: "1. No heals or shielding abilities.\n2. Melee matches not allowed.",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=650&auto=format&fit=crop",
    description: "Ultimate individual testing ground where weapons swap and tactical gloo wall timing creates stars."
  },
  {
    id: "lw-4",
    title: "Wolf Master Assault Special Tournament",
    type: "LONE WOLF",
    entryFee: 15,
    prize: 250,
    status: "upcoming",
    startTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    maxSlots: 2,
    currentSlots: 0,
    joinedPlayers: [],
    roomDetails: { roomId: "888224", password: "lw4" },
    rules: "1. Snipers prohibited.\n2. Speed run rules.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    description: "Fast-loading Wolf matches designed with low entry fees for entry level gamers to gain instant coin multipliers."
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    userId: "user-1",
    type: "deposit",
    amount: 500,
    status: "approved",
    paymentMethod: "bKash",
    accountNumber: "01723456789",
    transactionId: "BKX992837L2",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "tx-2",
    userId: "user-1",
    type: "withdraw",
    amount: 200,
    status: "approved",
    paymentMethod: "Nagad",
    accountNumber: "01988223344",
    transactionId: "WID33827110",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "tx-3",
    userId: "user-1",
    type: "deposit",
    amount: 100,
    status: "pending",
    paymentMethod: "Rocket",
    accountNumber: "01555112233",
    transactionId: "RCK8827361K",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: "tx-4",
    userId: "user-2",
    type: "deposit",
    amount: 200,
    status: "pending",
    paymentMethod: "bKash",
    accountNumber: "01827384950",
    transactionId: "BKX3372288M",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 mins ago
  }
];

const INITIAL_RESULTS: Result[] = [
  {
    id: "res-1",
    matchId: "match-99",
    matchTitle: "Squad Battle Royale Championship",
    matchType: "BR MATCH",
    winners: [
      { uid: "user-4", username: "LudoPro_Mitu", rank: 1, kills: 12, prize: 800 },
      { uid: "user-2", username: "Saimon_Gaming", rank: 2, kills: 6, prize: 300 },
      { uid: "user-3", username: "Op_Fahim_FF", rank: 3, kills: 4, prize: 150 }
    ],
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export function getDbStore(): TournamentDb {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Standardize/update the banner image for Sunday Cup
      const br1 = parsed.matches.find((m: any) => m.id === "br-1");
      if (br1) {
        br1.imageUrl = esportsBanner;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Local storage read error", e);
  }

  // Create default db if not exists
  const defaultDb: TournamentDb = {
    users: INITIAL_USERS,
    currentUserId: "user-1", // default logged in user is Rakib Hassan (Admin)
    matches: INITIAL_MATCHES,
    transactions: INITIAL_TRANSACTIONS,
    results: INITIAL_RESULTS
  };
  saveDbStore(defaultDb);
  return defaultDb;
}

export function saveDbStore(store: TournamentDb) {
  try {
    localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(store));
  } catch (e) {
    console.error("Local storage save error", e);
  }
}

export function getMatches(): Match[] {
  return getDbStore().matches;
}

export function getTransactions(): Transaction[] {
  return getDbStore().transactions;
}

export function getResults(): Result[] {
  return getDbStore().results;
}

// User helper actions
export function getCurrentUser(): User {
  const db = getDbStore();
  const user = db.users.find(u => u.uid === db.currentUserId);
  return user || db.users[0];
}

export function getAllUsers(): User[] {
  return getDbStore().users;
}

export function switchCurrentUser(uid: string) {
  const db = getDbStore();
  if (db.users.some(u => u.uid === uid)) {
    db.currentUserId = uid;
    saveDbStore(db);
  }
}

export function toggleRole(uid: string): User {
  const db = getDbStore();
  const userIndex = db.users.findIndex(u => u.uid === uid);
  if (userIndex !== -1) {
    const targetUser = db.users[userIndex];
    const isPromotingToAdmin = targetUser.role !== "admin";

    // Strictly restrict Admin role assignment to Rakib Hassan (Primary Organizer)
    if (isPromotingToAdmin && targetUser.uid !== "user-1" && targetUser.email !== "rakibhassan3930@gmail.com") {
      throw new Error("Security Access Denied: Only primary organizer Rakib Hassan (rakibhassan3930@gmail.com) is allowed to hold the Admin role!");
    }

    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    db.users[userIndex].role = nextRole;
    saveDbStore(db);
    return db.users[userIndex];
  }
  throw new Error("User not found");
}

export function updateProfile(uid: string, username: string, avatarUrl: string): User {
  const db = getDbStore();
  const idx = db.users.findIndex(u => u.uid === uid);
  if (idx !== -1) {
    // Check duplicates unless it's own
    const dupe = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.uid !== uid);
    if (dupe) {
      throw new Error("Username already taken!");
    }
    db.users[idx].username = username;
    db.users[idx].avatarUrl = avatarUrl;
    saveDbStore(db);
    return db.users[idx];
  }
  throw new Error("User not found");
}

// Balance Helpers
export function modifyBalance(uid: string, amount: number) {
  const db = getDbStore();
  const idx = db.users.findIndex(u => u.uid === uid);
  if (idx !== -1) {
    db.users[idx].balance = parseFloat((db.users[idx].balance + amount).toFixed(2));
    saveDbStore(db);
  }
}

// Tournament Match Actions
export function addMatch(m: Omit<Match, "id" | "joinedPlayers" | "currentSlots">): Match {
  const db = getDbStore();
  const newMatch: Match = {
    ...m,
    id: "match-" + Math.floor(Math.random() * 10000),
    currentSlots: 0,
    joinedPlayers: [],
  };
  db.matches.unshift(newMatch);
  saveDbStore(db);
  return newMatch;
}

export function deleteMatch(matchId: string) {
  const db = getDbStore();
  db.matches = db.matches.filter(m => m.id !== matchId);
  db.results = db.results.filter(r => r.matchId !== matchId);
  saveDbStore(db);
}

export function updateMatchStatus(matchId: string, status: Match["status"], roomDetails?: Match["roomDetails"]) {
  const db = getDbStore();
  const idx = db.matches.findIndex(m => m.id === matchId);
  if (idx !== -1) {
    db.matches[idx].status = status;
    if (roomDetails) {
      db.matches[idx].roomDetails = roomDetails;
    }
    saveDbStore(db);
  }
}

export function joinMatch(matchId: string, uid: string): Match {
  const db = getDbStore();
  const matchIdx = db.matches.findIndex(m => m.id === matchId);
  const userIdx = db.users.findIndex(u => u.uid === uid);

  if (matchIdx === -1) throw new Error("Match not found");
  if (userIdx === -1) throw new Error("User not found");

  const match = db.matches[matchIdx];
  const user = db.users[userIdx];

  if (match.joinedPlayers.includes(uid)) {
    throw new Error("You have already joined this match");
  }

  if (match.currentSlots >= match.maxSlots) {
    throw new Error("Match slots are fully boarded");
  }

  if (user.balance < match.entryFee) {
    throw new Error(`Insufficient balance! Please add money via bKash/Nagad/Rocket (Entry: ৳${match.entryFee}, Balance: ৳${user.balance})`);
  }

  // Deduct Balance
  user.balance = parseFloat((user.balance - match.entryFee).toFixed(2));
  user.totalMatches += 1;

  // Add back to joined list
  match.joinedPlayers.push(uid);
  match.currentSlots += 1;

  saveDbStore(db);
  return match;
}

// Wallet Transaction Actions
export function requestTransaction(tx: Omit<Transaction, "id" | "status" | "createdAt">): Transaction {
  const db = getDbStore();
  const user = db.users.find(u => u.uid === tx.userId);
  if (!user) {
    throw new Error("User not found");
  }
  
  if (tx.type === "withdraw") {
    if (user.balance < tx.amount) {
      throw new Error("Insufficient balance for withdrawal request!");
    }
    // Deduct balance immediately to reserve the withdrawal amount inside pending state
    user.balance = parseFloat((user.balance - tx.amount).toFixed(2));
  }

  const newTx: Transaction = {
    ...tx,
    id: "tx-" + Math.floor(Math.random() * 100000),
    status: "pending",
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(newTx);
  saveDbStore(db);
  return newTx;
}

export function processTransaction(txId: string, action: "approve" | "reject") {
  const db = getDbStore();
  const txIdx = db.transactions.findIndex(t => t.id === txId);
  if (txIdx === -1) throw new Error("Transaction not found");

  const tx = db.transactions[txIdx];
  if (tx.status !== "pending") throw new Error("Transaction already processed");

  const userIdx = db.users.findIndex(u => u.uid === tx.userId);
  if (userIdx === -1) throw new Error("User not found");

  const user = db.users[userIdx];

  if (action === "approve") {
    tx.status = "approved";
    if (tx.type === "deposit") {
      user.balance = parseFloat((user.balance + tx.amount).toFixed(2));
    }
    // For withdraw, amount is already deducted from standard balance upon request
  } else {
    tx.status = "rejected";
    if (tx.type === "withdraw") {
      // Refund reserved withdrawal amount back into active user balance
      user.balance = parseFloat((user.balance + tx.amount).toFixed(2));
    }
  }

  saveDbStore(db);
}

// Publish Tournament Match Results and distribute prize rewards
export function publishMatchResults(
  matchId: string,
  winnersList: Array<{ uid: string; rank: number; kills: number; prize: number }>
): Result {
  const db = getDbStore();
  const matchIdx = db.matches.findIndex(m => m.id === matchId);
  if (matchIdx === -1) throw new Error("Match not found");

  const match = db.matches[matchIdx];
  match.status = "completed";

  const formattedWinners = winnersList.map(w => {
    const player = db.users.find(u => u.uid === w.uid);
    const username = player ? player.username : "Unknown Player";
    
    // Distribute Prizes Directly to User balance!
    if (player) {
      player.balance = parseFloat((player.balance + w.prize).toFixed(2));
      if (w.rank === 1) {
        player.totalWins += 1;
      }
    }

    return {
      uid: w.uid,
      username,
      rank: w.rank,
      kills: w.kills,
      prize: w.prize
    };
  });

  const newResult: Result = {
    id: "res-" + Math.floor(Math.random() * 10000),
    matchId,
    matchTitle: match.title,
    matchType: match.type,
    winners: formattedWinners,
    publishedAt: new Date().toISOString()
  };

  db.results = db.results.filter(r => r.matchId !== matchId);
  db.results.unshift(newResult);
  saveDbStore(db);
  return newResult;
}

export function registerUser(username: string, email: string, avatarUrl: string): User {
  const db = getDbStore();
  const lowername = username.trim().toLowerCase();
  const existing = db.users.find(u => u.username.toLowerCase() === lowername);
  if (existing) {
    db.currentUserId = existing.uid;
    saveDbStore(db);
    return existing;
  }
  
  const newUserId = "user-" + Math.floor(Math.random() * 10000);
  const newUser: User = {
    uid: newUserId,
    username: username.trim(),
    email: email.trim() || `${username.trim().toLowerCase()}@tournament.com`,
    balance: 0, // registration begins with 0 BDT ৳!
    role: "user",
    avatarUrl: avatarUrl,
    totalMatches: 0,
    totalWins: 0,
    createdAt: new Date().toISOString()
  };
  
  db.users.push(newUser);
  db.currentUserId = newUserId;
  saveDbStore(db);
  return newUser;
}

