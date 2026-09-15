export type Rank =
  | "НОВИЧОК"
  | "ГРАЖДАНИН"
  | "СТРАЖ"
  | "ОФИЦЕР"
  | "ГЕНЕРАЛ"
  | "СЕНАТОР"
  | "ИМПЕРАТОР";

export type Presence = "online" | "offline" | "recent";

export interface Citizen {
  id: string; // HIT-XXXXX
  name: string;
  title: string;
  rank: Rank;
  hue: number;
  emoji: string;
  presence: Presence;
  lastSeen: number;
  light: number; // Уровень Света
}

export type MsgKind =
  | "text"
  | "image"
  | "file"
  | "voice"
  | "transfer"
  | "system"
  | "law"
  | "edict"
  | "market";

export type MsgStatus = "sending" | "sent" | "delivered" | "read";

export interface Message {
  id: string;
  chatId: string;
  authorId: string;
  kind: MsgKind;
  text: string;
  ts: number;
  status: MsgStatus;
  mine?: boolean;
  edited?: boolean;
  deleted?: boolean;
  replyTo?: string;
  image?: string;
  file?: { name: string; size: string };
  voice?: { duration: number; waveform: number[] };
  transfer?: { amount: number; note?: string };
}

export type ChatKind = "dm" | "group" | "channel" | "province";

export interface Chat {
  id: string;
  kind: ChatKind;
  title: string;
  emoji: string;
  hue: number;
  memberIds: string[];
  subscribers?: number;
  pinned?: boolean;
  archived?: boolean;
  muted?: boolean;
  verified?: boolean;
  readonly?: boolean;
  description: string;
}

export interface Toast {
  id: number;
  kind: "info" | "success" | "warning" | "award" | "mention" | "push";
  title: string;
  text: string;
}

export type ModalKind =
  | null
  | "transfer"
  | "market"
  | "treasury"
  | "report"
  | "newGroup"
  | "profile"
  | "citizen"
  | "search"
  | "admin"
  | "connection"
  | "dev";

export interface UIState {
  activeChatId: string | null;
  replyTo: string | null;
  editingId: string | null;
  forwardMsg: Message | null;
  modal: ModalKind;
  modalChatId: string | null;
  reportTarget: { chatId: string; msgId: string } | null;
  citizenId: string | null;
}

export interface Settings {
  sound: boolean;
  push: boolean;
}

export interface Award {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  need: number; // sent messages threshold
}

export interface MarketItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  desc: string;
}

export interface Session {
  citizenId: string;
  issuedAt: number;
  expiresAt: number;
}

export interface AppState {
  session: Session | null;
  citizens: Record<string, Citizen>;
  chats: Record<string, Chat>;
  messages: Record<string, Message[]>;
  unread: Record<string, number>;
  typing: Record<string, string | null>;
  ui: UIState;
  toasts: Toast[];
  balance: number;
  light: number;
  awards: string[];
  sentCount: number;
  settings: Settings;
}
