import { createClient, SupabaseClient } from "@supabase/supabase-js";

const STORAGE_KEY = "imperium-supabase-config";

export interface SupabaseConfig {
  url: string;
  key: string;
  connected: boolean;
  connectedAt: number;
}

export function getSavedConfig(): SupabaseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveConfig(config: SupabaseConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

let client: SupabaseClient | null = null;

export function initSupabase(url: string, key: string): SupabaseClient {
  client = createClient(url, key);
  return client;
}

export function getClient(): SupabaseClient | null {
  return client;
}

export async function testConnection(url: string, key: string): Promise<boolean> {
  try {
    const testClient = createClient(url, key);
    const { error } = await testClient.from("users").select("count", { count: "exact", head: true });
    return !error || error.code === "42P01";
  } catch {
    return false;
  }
}

export async function syncData(
  url: string,
  key: string,
  data: { chats: any; messages: any; citizens: any }
): Promise<{ success: boolean; error?: string }> {
  try {
    const sb = createClient(url, key);

    const { error: chatsErr } = await sb.from("chats").upsert(
      Object.entries(data.chats).map(([id, chat]) => ({ id, ...chat as any })),
      { onConflict: "id" }
    );
    if (chatsErr && chatsErr.code !== "42P01") return { success: false, error: chatsErr.message };

    const allMsgs = Object.values(data.messages).flat();
    if (allMsgs.length > 0) {
      const { error: msgsErr } = await sb.from("messages").upsert(
        allMsgs.map((m) => ({ ...m as any })),
        { onConflict: "id" }
      );
      if (msgsErr && msgsErr.code !== "42P01") return { success: false, error: msgsErr.message };
    }

    const { error: usersErr } = await sb.from("users").upsert(
      Object.entries(data.citizens).map(([id, c]) => ({ id, ...c as any })),
      { onConflict: "id" }
    );
    if (usersErr && usersErr.code !== "42P01") return { success: false, error: usersErr.message };

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function loadData(url: string, key: string) {
  try {
    const sb = createClient(url, key);
    const [chatsRes, msgsRes, usersRes] = await Promise.all([
      sb.from("chats").select("*"),
      sb.from("messages").select("*").order("ts", { ascending: true }),
      sb.from("users").select("*"),
    ]);

    const chats: Record<string, any> = {};
    if (chatsRes.data) {
      for (const c of chatsRes.data) {
        const { id, ...rest } = c;
        chats[id] = rest;
      }
    }

    const messages: Record<string, any[]> = {};
    if (msgsRes.data) {
      for (const m of msgsRes.data) {
        (messages[m.chatId] ??= []).push(m);
      }
    }

    const citizens: Record<string, any> = {};
    if (usersRes.data) {
      for (const u of usersRes.data) {
        const { id, ...rest } = u;
        citizens[id] = rest;
      }
    }

    return { chats, messages, citizens };
  } catch (e: any) {
    return null;
  }
}
