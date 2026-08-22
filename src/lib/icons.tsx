import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (p: P) => {
  const { size = 20, ...rest } = p;
  return { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...rest };
};

export const ICrest = (p: P) => {
  const { size = 32, ...rest } = p;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...rest}>
      <path d="M24 3 43 13.5v21L24 45 5 34.5v-21L24 3Z" stroke="#FFD700" strokeWidth="2" fill="rgba(255,215,0,0.07)" />
      <path d="M24 8.5 38 16.2v15.6L24 39.5 10 31.8V16.2L24 8.5Z" stroke="#C0C0C0" strokeWidth="1" opacity="0.6" />
      <path d="M16 31V17l4 6 4-6 4 6 4-6v14" stroke="#FFD700" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 33.5h22" stroke="#FFD700" strokeWidth="1.4" opacity="0.8" />
      <circle cx="24" cy="13.5" r="1.6" fill="#FFD700" />
    </svg>
  );
};

export const ISend = (p: P) => (
  <svg {...base(p)}><path d="M4 12 20 4l-4.5 16-4-6.5L4 12Z" fill="currentColor" stroke="none" /><path d="M11.5 13.5 20 4" /></svg>
);
export const IMic = (p: P) => (
  <svg {...base(p)}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" /></svg>
);
export const IClip = (p: P) => (
  <svg {...base(p)}><path d="m20 11.5-7.8 7.8a5 5 0 0 1-7-7L13.5 4a3.4 3.4 0 0 1 4.8 4.8L10 17a1.8 1.8 0 0 1-2.5-2.5l7.3-7.3" /></svg>
);
export const ISmile = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M8.5 14.5s1.2 2 3.5 2 3.5-2 3.5-2" /><path d="M9 10h.01M15 10h.01" strokeWidth="2.4" /></svg>
);
export const IPin = (p: P) => (
  <svg {...base(p)}><path d="M9 4h6l-1 6 3.5 3.5H6.5L10 10 9 4Z" /><path d="M12 13.5V21" /></svg>
);
export const IArchive = (p: P) => (
  <svg {...base(p)}><rect x="3.5" y="4" width="17" height="5" rx="1" /><path d="M5.5 9v9.5A1.5 1.5 0 0 0 7 20h10a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4" /></svg>
);
export const IBell = (p: P) => (
  <svg {...base(p)}><path d="M18 15v-4.5a6 6 0 1 0-12 0V15l-1.8 2.5h15.6L18 15Z" /><path d="M10 20a2.2 2.2 0 0 0 4 0" /></svg>
);
export const IBellOff = (p: P) => (
  <svg {...base(p)}><path d="M8.6 6A6 6 0 0 1 18 10.5V15l1.8 2.5H12M6.3 8.5A6 6 0 0 0 6 10.5V15l-1.8 2.5h10M10 20a2.2 2.2 0 0 0 4 0" /><path d="m4 4 16 16" /></svg>
);
export const ISearch = (p: P) => (
  <svg {...base(p)}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.4-4.4" /></svg>
);
export const ICheck = (p: P) => <svg {...base(p)}><path d="m5 13 4 4L19 7" /></svg>;
export const IChecks = (p: P) => <svg {...base(p)}><path d="m2.5 13 4 4 8-9" /><path d="m11 15.5 1.5 1.5 8-9" /></svg>;
export const IReply = (p: P) => <svg {...base(p)}><path d="M9 5 4 10l5 5" /><path d="M4 10h9a7 7 0 0 1 7 7v2" /></svg>;
export const IForward = (p: P) => <svg {...base(p)}><path d="m15 5 5 5-5 5" /><path d="M20 10h-9a7 7 0 0 0-7 7v2" /></svg>;
export const IEdit = (p: P) => (
  <svg {...base(p)}><path d="m14.5 5.5 4 4L8 20H4v-4L14.5 5.5Z" /><path d="m12.5 7.5 4 4" /></svg>
);
export const ITrash = (p: P) => (
  <svg {...base(p)}><path d="M4.5 6.5h15M9 6.5V4.5h6v2M6.5 6.5 7.5 20h9l1-13.5" /><path d="M10 10.5v6M14 10.5v6" /></svg>
);
export const ICopy = (p: P) => (
  <svg {...base(p)}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M5.5 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v.5" /></svg>
);
export const IFlag = (p: P) => <svg {...base(p)}><path d="M5 21V4" /><path d="M5 4.5C8 3 10 6 13 4.5S19 4 19 4v9s-3-1.5-6 0-5-1.5-8 0" /></svg>;
export const ICoin = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M9 9.5h4.2a2 2 0 0 1 0 4H9V8m0 5.5V16M8 8h8" strokeWidth="1.5" /></svg>
);
export const ICrown = (p: P) => (
  <svg {...base(p)}><path d="m4 8 4 4 4-6 4 6 4-4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" fill="rgba(255,215,0,0.15)" /><path d="M8 16.5h8" /></svg>
);
export const IShield = (p: P) => (
  <svg {...base(p)}><path d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6l-7-3Z" /><path d="m9 11.5 2.2 2.2L15.5 9" /></svg>
);
export const ICog = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8" /></svg>
);
export const ILogout = (p: P) => (
  <svg {...base(p)}><path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" /><path d="m17 8 4 4-4 4M21 12H10" /></svg>
);
export const IBack = (p: P) => <svg {...base(p)}><path d="m14 5-7 7 7 7" /></svg>;
export const IClose = (p: P) => <svg {...base(p)}><path d="m5.5 5.5 13 13M18.5 5.5l-13 13" /></svg>;
export const IPlus = (p: P) => <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>;
export const IPlay = (p: P) => <svg {...base(p)}><path d="M8 5.5v13l11-6.5L8 5.5Z" fill="currentColor" stroke="none" /></svg>;
export const IPause = (p: P) => <svg {...base(p)}><rect x="6.5" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" /></svg>;
export const IDoc = (p: P) => (
  <svg {...base(p)}><path d="M6 3.5h8L19 8.5v12H6v-17Z" /><path d="M13.5 3.5v5.5H19M9 13h6M9 16.5h6" /></svg>
);
export const IImage = (p: P) => (
  <svg {...base(p)}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m5 18 4.5-4.5 3 3L16 13l4 4" /></svg>
);
export const ISeal = (p: P) => (
  <svg {...base(p)}><path d="M12 2.5 14.3 4l2.7-.4 1 2.5 2.5 1L20 9.8l1.5 2.2-1.5 2.2.5 2.7-2.5 1-1 2.5-2.7-.4L12 21.5 9.7 20l-2.7.4-1-2.5-2.5-1 .5-2.7L2.5 12 4 9.8l-.5-2.7 2.5-1 1-2.5L9.7 4 12 2.5Z" fill="rgba(255,215,0,0.9)" stroke="none" /><path d="m8.5 12.2 2.4 2.4 4.6-5" stroke="#0a0a20" strokeWidth="2" /></svg>
);
export const IUsers = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8.5" r="3.5" /><path d="M2.5 19.5c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5" /><path d="M15.5 5.5a3.5 3.5 0 0 1 0 6M18 14.5c2 .8 3.2 2.5 3.5 5" /></svg>
);
export const IChevD = (p: P) => <svg {...base(p)}><path d="m6 9.5 6 6 6-6" /></svg>;
export const IStop = (p: P) => <svg {...base(p)}><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" stroke="none" /></svg>;
export const ILaurel = (p: P) => (
  <svg {...base(p)}><path d="M12 21c-5 0-8-3.5-8-8.5M12 21c5 0 8-3.5 8-8.5" stroke="#FFD700" /><path d="M4.5 15.5 3 14l2-.4M5.2 12.3l-1.7-1 1.9-.8M6.4 9.2 5.1 7.6l2-.3M19.5 15.5 21 14l-2-.4M18.8 12.3l1.7-1-1.9-.8M17.6 9.2l1.3-1.6-2-.3" stroke="#FFD700" strokeWidth="1.4" /><circle cx="12" cy="7" r="2.2" stroke="#FFD700" /></svg>
);
export const IBolt = (p: P) => <svg {...base(p)}><path d="M13 2.5 4.5 13.5H11L9.5 21.5 19 10h-6.5l.5-7.5Z" fill="currentColor" stroke="none" /></svg>;
export const IEye = (p: P) => (
  <svg {...base(p)}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const ILock = (p: P) => (
  <svg {...base(p)}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5" /></svg>
);
export const IRefresh = (p: P) => (
  <svg {...base(p)}><path d="M20 12a8 8 0 1 1-2.3-5.6M20 3.5V8h-4.5" /></svg>
);
