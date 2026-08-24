"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Pin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Edit3,
  CheckCircle2,
  Filter,
  BrainCircuit,
  Lock,
  Tag,
  Calendar,
  X,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  CreateNotePayload,
  FinancialNote,
  NoteCategory,
  NOTE_CATEGORY_LABELS,
} from "@/lib/types/notes";
import {
  createFinancialNote,
  deleteFinancialNote,
  fetchUserNotes,
  updateFinancialNote,
} from "@/lib/notes/notes-service";
import { useAuth } from "@/lib/auth/auth-context";
import { canAccessAiNotes } from "@/lib/auth/plan-permissions";
import { PlanUpgradeGate } from "@/components/finance/PlanUpgradeGate";

export default function NotesPage() {
  const { user, profile } = useAuth();
  const [notes, setNotes] = useState<FinancialNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | "ALL">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<FinancialNote | null>(null);
  const [showUpgradeGateModal, setShowUpgradeGateModal] = useState(false);
  const [formData, setFormData] = useState<CreateNotePayload>({
    title: "",
    content: "",
    category: "RULES_CONSTRAINTS",
    isPinned: false,
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const hasNotesAccess = canAccessAiNotes(profile?.plan_tier, user?.email);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    const data = await fetchUserNotes();
    setNotes(data);
    setLoading(false);
  }

  function handleOpenCreateModal() {
    if (!hasNotesAccess) {
      setShowUpgradeGateModal(true);
      return;
    }
    setEditingNote(null);
    setFormData({
      title: "",
      content: "",
      category: "RULES_CONSTRAINTS",
      isPinned: false,
      tags: [],
    });
    setTagInput("");
    setIsModalOpen(true);
  }

  function handleOpenEditModal(note: FinancialNote) {
    if (!hasNotesAccess) {
      setShowUpgradeGateModal(true);
      return;
    }
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      isPinned: note.isPinned,
      tags: note.tags || [],
    });
    setTagInput((note.tags || []).join(", "));
    setIsModalOpen(true);
  }

  async function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    const parsedTags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      ...formData,
      tags: parsedTags,
    };

    if (editingNote) {
      await updateFinancialNote(editingNote.id, payload);
    } else {
      await createFinancialNote(payload);
    }

    setIsModalOpen(false);
    loadNotes();
  }

  async function handleDeleteNote(id: string) {
    if (confirm("Are you sure you want to delete this strategic note?")) {
      await deleteFinancialNote(id);
      loadNotes();
    }
  }

  async function handleTogglePin(note: FinancialNote) {
    await updateFinancialNote(note.id, { isPinned: !note.isPinned });
    loadNotes();
  }

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesCategory = selectedCategory === "ALL" || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div className="max-w-7xl 2xl:max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* Strategic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Financial Notepad
            </h1>
            <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-primary/20 text-primary text-[10px] font-extrabold px-3 py-1 border border-primary/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              AI Context Sync
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Your personal financial journal and handwritten constraints. Write down custom rules, upcoming non-recurring purchases, and thoughts — UseAimly&apos;s AI Decision Engine dynamically cross-references every note to protect your goals.
          </p>
        </div>

        {/* Action Button & AI Sync Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>{notes.length} Notes Synced to AI</span>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white px-4 py-2.5 text-xs font-extrabold hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Note / Rule</span>
          </button>
        </div>
      </div>

      {/* Value Proposition Callout Card */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-background to-amber-500/10 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                How Your Notes Power UseAimly Decision Intelligence
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                Unlike simple note-taking apps, UseAimly treats your notes as <strong>active AI directives</strong>. When you test a decision in the <em>Decide Studio</em> or ask the <em>AI Financial Advisor</em>, the system checks your handwritten notes (like reserve floors, spending limits, or Q4 commitments) to warn you if a purchase violates your personal financial philosophy.
              </p>
            </div>
          </div>

          <Link
            href="/app/decide"
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group"
          >
            <span>Test Decision with AI Notes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes by title, content, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border/80 bg-card text-foreground focus:outline-hidden focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            All Notes ({notes.length})
          </button>
          {(Object.keys(NOTE_CATEGORY_LABELS) as NoteCategory[]).map((cat) => {
            const count = notes.filter((n) => n.category === cat).length;
            const meta = NOTE_CATEGORY_LABELS[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <span>{meta.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background/50 border border-border/60">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Notes Cards Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Loading your financial notes & AI context...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-16 border border-dashed border-border/80 rounded-2xl text-center space-y-3 bg-card/40">
          <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No financial notes found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || selectedCategory !== "ALL"
              ? "No notes match your search or category filter. Try clearing filters."
              : "Create your first handwritten rule or financial note to sync with UseAimly AI."}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Note</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Pinned AI Directive Rules ({pinnedNotes.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => handleOpenEditModal(note)}
                    onDelete={() => handleDeleteNote(note.id)}
                    onTogglePin={() => handleTogglePin(note)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Standard Notes Section */}
          {unpinnedNotes.length > 0 && (
            <div className="space-y-3">
              {pinnedNotes.length > 0 && (
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Other Strategic Notes ({unpinnedNotes.length})
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => handleOpenEditModal(note)}
                    onDelete={() => handleDeleteNote(note.id)}
                    onTogglePin={() => handleTogglePin(note)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal / Dialog for Creating or Editing Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-background border border-border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-scaleUp">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {editingNote ? "Edit Strategic Note" : "Create New Strategic Note"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              {/* Note Title */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Note / Rule Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Health Reserve Lock, Q4 Gear Upgrade..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:border-primary transition-colors"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Category Type
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as NoteCategory })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:border-primary transition-colors"
                >
                  {(Object.keys(NOTE_CATEGORY_LABELS) as NoteCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {NOTE_CATEGORY_LABELS[cat].label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {NOTE_CATEGORY_LABELS[formData.category].description}
                </p>
              </div>

              {/* Note Content */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Content / Constraint Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write down your rule, planned budget, timeline, or notes. AI will cross-reference this whenever you run purchase simulations."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:border-primary transition-colors resize-y"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Safety, Buffer, Equipment, Business"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:border-primary transition-colors"
                />
              </div>

              {/* Pin Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPinnedCheck"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="isPinnedCheck" className="text-xs font-semibold text-foreground flex items-center gap-1 cursor-pointer">
                  <Pin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pin as High-Priority AI Directive Rule</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white px-5 py-2 text-xs font-extrabold hover:shadow-lg hover:shadow-orange-500/25 transition-all cursor-pointer"
                >
                  {editingNote ? "Save Changes" : "Create Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRO PLAN UPGRADE GATE MODAL FOR NOTES */}
      {showUpgradeGateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl my-auto">
            <button
              type="button"
              onClick={() => setShowUpgradeGateModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <PlanUpgradeGate
              requiredTier="pro"
              featureTitle="Unlock AI Financial Notepad & Strategic Directives"
              featureTitleFr="Débloquez le Bloc-Notes Financier Stratégique & Règles IA"
              featureDescription="The Free plan provides basic reading. Upgrade to Aimly Pro to write custom financial constraints, pin high-priority rules, and synchronize guidelines across your decision engine."
              featureDescriptionFr="La formule Gratuite est en lecture seule. Passez à Aimly Pro pour rédiger vos propres règles, épingler des directives d'arbitrage et synchroniser votre contexte avec l'IA."
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface NoteCardProps {
  note: FinancialNote;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

function NoteCard({ note, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  const meta = NOTE_CATEGORY_LABELS[note.category] || NOTE_CATEGORY_LABELS.GENERAL;
  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`rounded-2xl border bg-card p-5 space-y-3 flex flex-col justify-between transition-all hover:shadow-md ${
        note.isPinned
          ? "border-amber-500/50 ring-1 ring-amber-500/20 bg-gradient-to-b from-amber-500/5 to-card"
          : "border-border/80"
      }`}
    >
      <div className="space-y-2.5">
        {/* Card Top: Category Badge + Actions */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${meta.badgeColor}`}
          >
            {meta.label}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePin}
              title={note.isPinned ? "Unpin Note" : "Pin as High Priority AI Directive Rule"}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                note.isPinned
                  ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? "fill-amber-500" : ""}`} />
            </button>

            <button
              onClick={onEdit}
              title="Edit Note"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onDelete}
              title="Delete Note"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-foreground leading-snug flex items-center gap-1.5">
          {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
          <span>{note.title}</span>
        </h4>

        {/* Content */}
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
          {note.content}
        </p>
      </div>

      {/* Card Footer: Tags & Date */}
      <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1 flex-wrap">
          {note.tags && note.tags.length > 0 ? (
            note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-secondary/70 border border-border/60 text-[10px] font-medium text-foreground/80"
              >
                <Tag className="w-2.5 h-2.5 text-muted-foreground" />
                {tag}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
              <BrainCircuit className="w-3 h-3 text-primary/70" />
              AI Active Directive
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
