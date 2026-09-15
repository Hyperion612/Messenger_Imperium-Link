/**
 * Интеграция с государством Империя Гиперион
 * https://hyperion612.github.io/Imperium_Hyperion/
 */

const IMPERIUM_API_BASE = "https://hyperion612.github.io/Imperium_Hyperion/api";

export interface ImperiumCitizen {
  id: string;
  name: string;
  rank: string;
  light: number;
  balance: number;
  title?: string;
  emoji?: string;
}

export interface ImperiumSyncStatus {
  connected: boolean;
  lastSync: number | null;
  citizenId: string | null;
}

const STORAGE_KEY = "imperium-integration";

export function getIntegrationConfig(): ImperiumSyncStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { connected: false, lastSync: null, citizenId: null };
    return JSON.parse(raw);
  } catch {
    return { connected: false, lastSync: null, citizenId: null };
  }
}

export function saveIntegrationConfig(config: ImperiumSyncStatus) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearIntegrationConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Проверка связи с государством
 */
export async function testImperiumConnection(citizenId: string): Promise<boolean> {
  try {
    // Пытаемся получить данные гражданина из государства
    const response = await fetch(`${IMPERIUM_API_BASE}/citizen/${citizenId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Получение данных гражданина из государства
 */
export async function fetchCitizenData(citizenId: string): Promise<ImperiumCitizen | null> {
  try {
    const response = await fetch(`${IMPERIUM_API_BASE}/citizen/${citizenId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Синхронизация данных мессенджера с государством
 */
export async function syncWithImperium(
  citizenId: string,
  messengerData: {
    chats: any;
    messages: any;
    balance: number;
    light: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${IMPERIUM_API_BASE}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        citizenId,
        ...messengerData,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Обновление баланса HYPER в государстве
 */
export async function updateBalance(citizenId: string, balance: number): Promise<boolean> {
  try {
    const response = await fetch(`${IMPERIUM_API_BASE}/citizen/${citizenId}/balance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Обновление Уровня Света в государстве
 */
export async function updateLight(citizenId: string, light: number): Promise<boolean> {
  try {
    const response = await fetch(`${IMPERIUM_API_BASE}/citizen/${citizenId}/light`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ light }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Получение списка каналов государства
 */
export async function fetchImperiumChannels(): Promise<any[]> {
  try {
    const response = await fetch(`${IMPERIUM_API_BASE}/channels`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Отправка сообщения в канал государства
 */
export async function sendToImperiumChannel(
  channelId: string,
  message: { authorId: string; text: string; kind: string }
): Promise<boolean> {
  try {
    const response = await fetch(`${IMPERIUM_API_BASE}/channels/${channelId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    return response.ok;
  } catch {
    return false;
  }
}
