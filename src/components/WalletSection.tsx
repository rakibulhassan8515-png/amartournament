/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Transaction, PaymentMethod } from "../types";
import { getTransactions, requestTransaction } from "../db";
import { CreditCard, ArrowDownCircle, ArrowUpCircle, Info, Landmark, HelpCircle, FileText, CheckCircle, Clock, AlertTriangle, Copy, Check } from "lucide-react";

interface WalletSectionProps {
  currentUser: User;
  onRefreshData: () => void;
}

export const WalletSection: React.FC<WalletSectionProps> = ({
  currentUser,
  onRefreshData
}) => {
  const transactions = getTransactions().filter(t => t.userId === currentUser.uid);
  
  const [activeForm, setActiveForm] = useState<"deposit" | "withdraw">("deposit");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bKash");
  const [amount, setAmount] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = (numStr: string) => {
    const rawNum = numStr.split(" ")[0].replace(/-/g, "");
    navigator.clipboard.writeText(rawNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Constants
  const ADMIN_BILLING_NUMBERS = {
    bKash: "01832-888515 (Send Money)",
    Nagad: "01832-888515 (Send Money)",
    Rocket: "01832-888515 (Send Money)"
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      triggerFeedback("error", "Please enter a valid amount!");
      return;
    }

    if (numAmount < 10) {
      triggerFeedback("error", "Minimum transaction limit is ৳10!");
      return;
    }

    if (!accountNumber.match(/^01[3-9]\d{8}$/)) {
      triggerFeedback("error", "Please enter a valid 11-digit Bangladeshi mobile number!");
      return;
    }

    if (activeForm === "withdraw" && currentUser.balance < numAmount) {
      triggerFeedback("error", "Insufficient wallet balance to request this cashout!");
      return;
    }

    if (activeForm === "deposit" && !transactionId.trim()) {
      triggerFeedback("error", "Transaction ID (TrxID) is mandatory to verify deposits!");
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

      triggerFeedback(
        "success", 
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
      triggerFeedback("error", err.message || "Failed to submit request");
    }
  };

  const triggerFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 6000);
  };

  return (
    <div className="py-6 sm:py-10 bg-[#0B0F19] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Wallet Overview Grid column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Pocket Balance Card & Actions */}
          <div className="space-y-6">
            
            {/* Visual Balance Card */}
            <div className="bg-gradient-to-br from-[#1b2a47] to-[#121c33] border border-[#2b3a5c] rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <Landmark className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase">
                    Personal Wallet
                  </span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-450 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold uppercase">
                  Active
                </span>
              </div>

              <div className="mb-4">
                <p className="text-[10px] sm:text-xs text-zinc-400 uppercase font-mono tracking-wider">AVAILABLE BALANCE</p>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-1 flex items-baseline">
                  ৳{currentUser.balance.toFixed(2)}
                  <span className="text-sm font-sans font-medium text-emerald-400 ml-1.5">BDT</span>
                </h3>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-[#263556]">
                <p className="font-sans">Player: <span className="text-zinc-200 font-semibold">{currentUser.username}</span></p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-mono text-[10px] text-emerald-400">SECURE NODE</span>
                </div>
              </div>
            </div>

            {/* Toggle deposit/withdraw card */}
            <div className="bg-[#101525] border border-[#1E273F] rounded-2xl p-2 flex space-x-2">
              <button
                onClick={() => { setActiveForm("deposit"); setFeedback(null); }}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  activeForm === "deposit"
                    ? "bg-emerald-500 text-slate-950 font-extrabold shadow-glow-emerald"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 scale-110" />
                <span>Deposit Money</span>
              </button>
              <button
                onClick={() => { setActiveForm("withdraw"); setFeedback(null); }}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  activeForm === "withdraw"
                    ? "bg-emerald-500 text-slate-950 font-extrabold shadow-glow-emerald"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <ArrowUpCircle className="w-4 h-4 scale-110" />
                <span>Withdraw Cash</span>
              </button>
            </div>

            {/* Helpline guide box */}
            <div className="bg-[#0F1424] border border-[#212E4C] rounded-2xl p-5 text-xs text-zinc-400 space-y-3 font-sans">
              <div className="flex items-center space-x-2 text-zinc-300 font-bold mb-1">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Need Support? Contact Admin</span>
              </div>
              <p>For instant assistance with transactional delays or wrong TrxID input, please capture your cash send screenshots and message us:</p>
              <p className="font-mono text-emerald-400">Telegram / WhatsApp: +8801723456789</p>
              <p className="text-[10px] leading-relaxed text-zinc-500">Note: amar Tournament charges 0% fees on bKash deposit. standard out-fees apply on withdraw request.</p>
            </div>

          </div>

          {/* Column 2: Selected action Form */}
          <div className="bg-[#101525] border border-[#1D263E] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            
            <form onSubmit={handleTransactionSubmit} className="space-y-5">
              
              {/* Header inside Form */}
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold font-sans">
                    {activeForm === "deposit" ? "Add Money Gate" : "Request Cashout"}
                  </h4>
                  <p className="text-zinc-500 text-xs">Fill details for instant system checking</p>
                </div>
              </div>

              {/* Feedback messages */}
              {feedback && (
                <div className={`p-4 rounded-xl flex items-start space-x-2 border text-xs sm:text-sm font-sans ${
                  feedback.type === "success"
                    ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-950/60 border-rose-500/30 text-rose-300"
                }`}>
                  {feedback.type === "success" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Payment Methods choice list */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-400 block mb-2 uppercase tracking-wide">
                  Choose financial Gateway:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["bKash", "Nagad", "Rocket"] as PaymentMethod[]).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 px-2 border rounded-xl flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                        paymentMethod === method
                          ? "bg-slate-800 border-emerald-400 text-white shadow-md text-emerald-400"
                          : "bg-transparent border-[#232F4C] text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold font-sans">
                        {method}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* If Deposit Mode: Show ADMIN numbers as target */}
              {activeForm === "deposit" && (
                <div className="bg-[#172138] border border-[#26375E] p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest leading-none">
                      Admin Cash-In Receiver:
                    </p>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Send Money
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 border border-[#25355D] p-3 rounded-xl mt-2">
                    <p className="text-sm font-extrabold text-yellow-300 font-mono tracking-wide">
                      {ADMIN_BILLING_NUMBERS[paymentMethod]}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(ADMIN_BILLING_NUMBERS[paymentMethod])}
                      className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-sans font-extrabold cursor-pointer transition-all select-none duration-150 shrink-0 ${
                        copied
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-400"
                          : "bg-slate-800 border-[#3b4f85] hover:bg-slate-700 hover:border-zinc-400 text-zinc-200 active:scale-95"
                      }`}
                      title="Copy exact dialable number"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied! ({ADMIN_BILLING_NUMBERS[paymentMethod].split(" ")[0].replace(/-/g, "")})</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Copy Number</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans mt-2.5 leading-normal">
                    💡 <strong className="text-zinc-400">কিভাবে রিচার্জ করবেন:</strong> আপনার bKash/Nagad/Rocket অ্যাপ ওপেন করে উপরে দেওয়া নাম্বারে <strong className="text-emerald-400 font-bold">Send Money</strong> করুন, এরপর নিচে টাকার পরিমাণ, আপনার প্রেরক মোবাইল নাম্বার এবং TrxID বসিয়ে সাবমিট করুন।
                  </p>
                </div>
              )}

              {/* Amount input block */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">
                  Transaction Amount (৳):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-zinc-400 font-mono text-sm sm:text-base">৳</span>
                  <input
                    type="number"
                    placeholder="Enter amount (e.g. 200)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#111726] border border-[#202940] rounded-xl pl-8 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    min="10"
                    required
                  />
                </div>
              </div>

              {/* Receptant mobile number input block */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">
                  {activeForm === "deposit" ? "Sender Mobile Number:" : "Recipient Mobile Number:"}
                </label>
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#111726] border border-[#202940] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                  maxLength={11}
                  required
                />
              </div>

              {/* TrxID field strictly only for Deposit verification */}
              {activeForm === "deposit" && (
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">
                    Transaction ID (TrxID):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BKX992837L2"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-[#111726] border border-[#202940] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono font-bold uppercase placeholder-zinc-600"
                    required
                  />
                </div>
              )}

              {/* Submit trigger button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm tracking-wide shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase"
              >
                Submit {activeForm === "deposit" ? "Deposit" : "Withdrawal"} Request
              </button>

            </form>

          </div>

          {/* Column 3: Historic balance Logs */}
          <div className="bg-[#101525] border border-[#1D263E] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2.5 mb-5 border-b border-[#1E2943] pb-3">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base sm:text-lg font-bold font-sans">Ledger History</h4>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 font-sans">
                  <p className="text-xs">No previous transaction requests recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {transactions.map(tx => (
                    <div 
                      key={tx.id}
                      className="bg-[#13192B] border border-[#1F2A47] rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded-lg ${
                          tx.type === "deposit" ? "bg-emerald-500/10 text-emerald-400" : "bg-teal-500/10 text-teal-400"
                        }`}>
                          {tx.type === "deposit" ? (
                            <ArrowDownCircle className="w-4.5 h-4.5" />
                          ) : (
                            <ArrowUpCircle className="w-4.5 h-4.5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white font-sans capitalize">
                            {tx.type} ({tx.paymentMethod})
                          </p>
                          <p className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                            {new Date(tx.createdAt).toLocaleDateString()} • {tx.accountNumber}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-xs font-bold font-mono ${
                          tx.type === "deposit" ? "text-emerald-400" : "text-zinc-300"
                        }`}>
                          {tx.type === "deposit" ? "+" : "-"}৳{tx.amount}
                        </p>
                        
                        {/* Compact Status Badges */}
                        <div className="mt-1 flex justify-end">
                          {tx.status === "approved" && (
                            <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase flex items-center">
                              <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Approved
                            </span>
                          )}
                          {tx.status === "pending" && (
                            <span className="text-[8px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase flex items-center">
                              <Clock className="w-2.5 h-2.5 mr-0.5" /> Pending
                            </span>
                          )}
                          {tx.status === "rejected" && (
                            <span className="text-[8px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-[#111727] text-zinc-500 text-[10px] rounded-xl border border-zinc-900 leading-tight">
              A copy of the invoice transaction is permanently compiled in our secure Firestore blockchain ledger.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
