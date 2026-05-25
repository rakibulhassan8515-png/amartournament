/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  uid: string;
  username: string;
  email: string;
  balance: number;
  role: "user" | "admin";
  avatarUrl: string;
  totalMatches: number;
  totalWins: number;
  createdAt: string;
}

export type MatchType = 
  | "BR MATCH"
  | "CLASH SQUAD"
  | "LONE WOLF"
  | "CS 1V1"
  | "CS 2V2"
  | "CS 1v1 2v2"
  | "LUDO MATCH"
  | "FREE MATCH";

export type MatchStatus = "upcoming" | "live" | "completed";

export interface RoomDetails {
  roomId?: string;
  password?: string;
}

export interface Match {
  id: string;
  title: string;
  type: MatchType;
  entryFee: number;
  prize: number;
  status: MatchStatus;
  startTime: string;
  maxSlots: number;
  currentSlots: number;
  joinedPlayers: string[]; // List of user UIDs
  roomDetails?: RoomDetails;
  rules: string;
  imageUrl: string;
  description: string;
}

export type TransactionType = "deposit" | "withdraw";
export type TransactionStatus = "pending" | "approved" | "rejected";
export type PaymentMethod = "bKash" | "Nagad" | "Rocket";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  accountNumber: string;
  transactionId: string; // TrxID provided by user or system
  createdAt: string;
}

export interface Winner {
  uid: string;
  username: string;
  rank: number;
  kills: number;
  prize: number;
}

export interface Result {
  id: string;
  matchId: string;
  matchTitle: string;
  matchType: MatchType;
  winners: Winner[];
  publishedAt: string;
}
