import { CreateNotePayload, FinancialNote, UpdateNotePayload } from "@/lib/types/notes";
import { INITIAL_DEMO_NOTES } from "./notes-data";
import { createClient } from "@/lib/supabase/client";

const NOTES_STORAGE_KEY = "useaimly_financial_notes_v1";

function getLocalNotes(): FinancialNote[] {
  if (typeof window === "undefined") return INITIAL_DEMO_NOTES;
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_NOTES));
      return INITIAL_DEMO_NOTES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading local notes:", err);
    return INITIAL_DEMO_NOTES;
  }
}

function saveLocalNotes(notes: FinancialNote[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error("Error saving local notes:", err);
  }
}

export async function fetchUserNotes(): Promise<FinancialNote[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return getLocalNotes();
    }

    const { data, error } = await supabase
      .from("financial_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.warn("Supabase fetch financial_notes error, using local fallback:", error);
      return getLocalNotes();
    }

    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      content: item.content,
      category: item.category,
      isPinned: item.is_pinned,
      tags: item.tags || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (err) {
    console.error("Error fetching notes:", err);
    return getLocalNotes();
  }
}

export async function createFinancialNote(payload: CreateNotePayload): Promise<FinancialNote> {
  const newNote: FinancialNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: payload.title.trim(),
    content: payload.content.trim(),
    category: payload.category,
    isPinned: payload.isPinned || false,
    tags: payload.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("financial_notes")
        .insert({
          user_id: user.id,
          title: payload.title.trim(),
          content: payload.content.trim(),
          category: payload.category,
          is_pinned: payload.isPinned || false,
          tags: payload.tags || [],
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          content: data.content,
          category: data.category,
          isPinned: data.is_pinned,
          tags: data.tags || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }
  } catch (err) {
    console.warn("Supabase create note error, falling back to local:", err);
  }

  // Local fallback
  const local = getLocalNotes();
  const updated = [newNote, ...local];
  saveLocalNotes(updated);
  return newNote;
}

export async function updateFinancialNote(
  id: string,
  payload: UpdateNotePayload
): Promise<FinancialNote | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const updateData: any = {};
      if (payload.title !== undefined) updateData.title = payload.title.trim();
      if (payload.content !== undefined) updateData.content = payload.content.trim();
      if (payload.category !== undefined) updateData.category = payload.category;
      if (payload.isPinned !== undefined) updateData.is_pinned = payload.isPinned;
      if (payload.tags !== undefined) updateData.tags = payload.tags;

      const { data, error } = await supabase
        .from("financial_notes")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          content: data.content,
          category: data.category,
          isPinned: data.is_pinned,
          tags: data.tags || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }
  } catch (err) {
    console.warn("Supabase update note error, updating local:", err);
  }

  // Local fallback
  const local = getLocalNotes();
  const index = local.findIndex((n) => n.id === id);
  if (index === -1) return null;

  const updatedNote: FinancialNote = {
    ...local[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  local[index] = updatedNote;
  saveLocalNotes(local);
  return updatedNote;
}

export async function deleteFinancialNote(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("financial_notes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (!error) return true;
    }
  } catch (err) {
    console.warn("Supabase delete note error, updating local:", err);
  }

  // Local fallback
  const local = getLocalNotes();
  const filtered = local.filter((n) => n.id !== id);
  saveLocalNotes(filtered);
  return true;
}
