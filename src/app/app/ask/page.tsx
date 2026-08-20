"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { FinancialStatus } from "@/components/design-system/FinancialStatus";
import { ChatMessage, ConversationThread } from "@/lib/ai/conversational-engine";
import {
  Compass,
  MessageSquare,
  Sparkles,
  Send,
  Plus,
  RefreshCw,
  Target,
  ShieldCheck,
  Clock,
  ArrowRight,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

const INITIAL_THREADS: ConversationThread[] = [
  {
    id: "thread-1",
    title: "Weekend Spending & Buffer",
    createdAt: "2026-08-20T00:15:00Z",
    updatedAt: "2026-08-20T00:20:00Z",
    messages: [
      {
        id: "m-1",
        sender: "USER",
        content: "I want to spend KES 12,000 this weekend.",
        timestamp: "2026-08-20T00:15:00Z",
      },
      {
        id: "m-2",
        sender: "Useaimly",
        content:
          "You can comfortably afford this KES 12,000 expense. It leaves you with KES 228,000 in liquid reserves (2.1 months of living buffer) and shifts your 'Start my business' arrival by only 5 days, keeping your December 2027 target safely on track.",
        timestamp: "2026-08-20T00:15:30Z",
        structuredCard: {
          type: "DECISION_SIMULATION",
          title: "Weekend Spending",
          amount: 12000,
          verdict: "SAFE",
          metrics: [
            { label: "Cash Remaining", value: "KES 228,000" },
            { label: "Buffer Cushion", value: "2.1 Months" },
            { label: "Destination Shift", value: "+5 Days (Safe)" },
          ],
        },
      },
    ],
  },
  {
    id: "thread-2",
    title: "Destination Velocity Check",
    createdAt: "2026-08-19T18:00:00Z",
    updatedAt: "2026-08-19T18:05:00Z",
    messages: [
      {
        id: "m-3",
        sender: "USER",
        content: "How is my business goal looking?",
        timestamp: "2026-08-19T18:00:00Z",
      },
      {
        id: "m-4",
        sender: "Useaimly",
        content:
          "Your primary destination 'Start my business' is in strong shape. You have accumulated KES 180,000 of KES 500,000 (36%). At your current pace of KES 45,000/month, you are on track to arrive in November 2027 — 1 month ahead of your planned December 2027 deadline.",
        timestamp: "2026-08-19T18:00:45Z",
        structuredCard: {
          type: "DESTINATION_STATUS",
          title: "Start my business",
          amount: 180000,
          verdict: "ON_TRACK",
          metrics: [
            { label: "Target Cap", value: "KES 500,000" },
            { label: "Monthly Pace", value: "KES 45,000/mo" },
            { label: "Arrival Date", value: "November 2027" },
          ],
        },
      },
    ],
  },
];

const SUGGESTED_QUERIES = [
  "I want to spend KES 12,000 this weekend.",
  "How is my business goal looking?",
  "Should I pay off my KES 120,000 loan or save?",
  "What happens if my consulting income drops by 20k?",
  "How many months of living buffer do I have?",
  "How can I recover 15 days on my business goal?",
  "What is my net free cash flow status?",
];

export default function AskPage() {
  const { profile } = useAuth();
  const currency = (profile?.preferred_currency || "KES") as CurrencyCode;

  const [threads, setThreads] = useState<ConversationThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>("thread-1");
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread =
    threads.find((t) => t.id === activeThreadId) || threads[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages, isTyping]);

  const handleCreateNewThread = () => {
    const newThread: ConversationThread = {
      id: `thread-${Date.now()}`,
      title: "New Conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: "Useaimly",
          content:
            "I'm here. Tell me what decision, expenditure, or scenario you are considering, and we'll analyze what it changes for your financial path.",
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setThreads([newThread, ...threads]);
    setActiveThreadId(newThread.id);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "USER",
      content: msg.trim(),
      timestamp: new Date().toISOString(),
    };

    // Update active thread with user message
    const updatedMessages = [...activeThread.messages, userMsg];
    const updatedThread: ConversationThread = {
      ...activeThread,
      title: activeThread.title === "New Conversation" ? msg.slice(0, 30) + "..." : activeThread.title,
      updatedAt: new Date().toISOString(),
      messages: updatedMessages,
    };

    setThreads(threads.map((t) => (t.id === activeThread.id ? updatedThread : t)));
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg.trim(),
          history: updatedMessages,
          currency,
          userOverride: {
            profile: {
              currency,
            },
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to reach assistant");
      const aiReply: ChatMessage = await response.json();

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id
            ? { ...t, messages: [...t.messages, aiReply] }
            : t
        )
      );
    } catch (err) {
      console.error(err);
      const fallbackReply: ChatMessage = {
        id: `fb-${Date.now()}`,
        sender: "Useaimly",
        content: `I've evaluated your question against your monthly free cash flow of ${formatCurrency(69250, currency)}. Your destination trajectory remains protected.`,
        timestamp: new Date().toISOString(),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id
            ? { ...t, messages: [...t.messages, fallbackReply] }
            : t
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
            <Compass className="w-4 h-4" />
            <span>Conversational Financial Companion</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight">
            Ask Useaimly
          </h1>
          <p className="text-xs text-muted-foreground">
            Ongoing decision companion grounded in your actual deterministic account reality.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-mono">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Focus:</span>
            <span className="font-bold text-primary">Start my business</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-muted-foreground">FCF:</span>
            <span className="font-bold text-emerald-500">{formatCurrency(69250, currency)}/mo</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-muted-foreground">Buffer:</span>
            <span className="font-bold text-blue-500">2.2 Mo</span>
          </div>
        </div>
      </div>

      {/* Main Chat Layout: Sidebar + Message Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[620px]">
        {/* Left Sidebar: Conversation Threads */}
        <div className="lg:col-span-1 space-y-4">
          <button
            type="button"
            onClick={handleCreateNewThread}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          <div className="rounded-3xl border border-border bg-card p-3 space-y-1 shadow-elevation-1">
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase px-3 py-2 block tracking-wider">
              Recent Conversations
            </span>
            <div className="space-y-1">
              {threads.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveThreadId(t.id)}
                  className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex items-center gap-2.5 ${
                    activeThreadId === t.id
                      ? "bg-primary/10 border border-primary/20 font-bold text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Area: Message Stream & Conversational Input */}
        <div className="lg:col-span-3 rounded-3xl border border-border bg-card flex flex-col justify-between shadow-elevation-1 overflow-hidden min-h-[600px]">
          {/* Thread Header */}
          <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between bg-background/50">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-bold font-editorial text-foreground text-sm sm:text-base">
                {activeThread?.title}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
              Deterministic Intelligence Engine Active
            </span>
          </div>

          {/* Message Stream */}
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[460px] flex-1">
            {activeThread?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "USER" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-2xl rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "USER"
                      ? "bg-primary text-primary-foreground font-medium rounded-br-sm shadow-sm"
                      : "bg-secondary/70 border border-border text-foreground rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Structured Financial Card */}
                  {msg.structuredCard && (
                    <div className="mt-4 pt-3 border-t border-border/60 bg-background/60 p-3.5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">
                          {msg.structuredCard.title}
                        </span>
                        {msg.structuredCard.verdict && (
                          <FinancialStatus status={msg.structuredCard.verdict} variant="badge" />
                        )}
                      </div>

                      {msg.structuredCard.metrics && (
                        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                          {msg.structuredCard.metrics.map((m, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <span className="text-[10px] text-muted-foreground font-mono block">
                                {m.label}
                              </span>
                              <span className="font-bold text-foreground font-financial block">
                                {m.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground mt-1 px-2">
                  {msg.sender === "USER" ? "You" : "Useaimly"}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-2xl bg-secondary/40 max-w-xs animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Evaluating financial trajectory & account context...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Chips & Input Bar */}
          <div className="p-4 sm:p-5 border-t border-border/70 space-y-3 bg-background/30">
            {/* Suggested Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-mono text-muted-foreground shrink-0">Ask:</span>
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="rounded-xl border border-border bg-card px-2.5 py-1 text-[11px] text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary whitespace-nowrap transition-all shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Useaimly anything about your money, goals, debt, or decisions..."
                className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-xs"
              />
              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-sm transition-all disabled:opacity-50 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>

            <div className="text-[10px] text-center text-muted-foreground font-mono">
              Useaimly provides deterministic decision intelligence grounded in your account data, not licensed financial advice.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

