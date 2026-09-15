import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base(p: P) {
  const { size = 20, ...rest } = p;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export const IChat = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 12a8 8 0 0 1-8 8H4l1.7-3.2A8 8 0 1 1 21 12Z" />
    <path d="M8.5 10.5h7M8.5 13.5h4.5" />
  </svg>
);
export const ISearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);
export const ISend = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 3 10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8 21 3Z" />
  </svg>
);
export const IMic = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);
export const IClip = (p: P) => (
  <svg {...base(p)}>
    <path d="m21 12-8.5 8.5a6 6 0 0 1-8.5-8.5L12.5 3.5a4 4 0 0 1 5.7 5.7L10 17.4a2 2 0 0 1-2.9-2.9l7.8-7.7" />
  </svg>
);
export const ISmile = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01" />
  </svg>
);
export const IReply = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 6 6v4" />
  </svg>
);
export const IForward = (p: P) => (
  <svg {...base(p)}>
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H10a6 6 0 0 0-6 6v4" />
  </svg>
);
export const IPen = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="m14 7 3 3" />
  </svg>
);
export const ITrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12M10 11v6M14 11v6" />
  </svg>
);
export const ICopy = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" transform="translate(2 2)" />
  </svg>
);
export const IFlag = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 21V4a1 1 0 0 1 1-1c4-2 7 2 12 0v10c-5 2-8-2-12 0" />
  </svg>
);
export const IPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 17v5M7 4h10l-1.5 6.5 2.5 3.5H6l2.5-3.5L7 4Z" />
  </svg>
);
export const IBell = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 19a2 2 0 0 0 4 0" />
  </svg>
);
export const IBellOff = (p: P) => (
  <svg {...base(p)}>
    <path d="M8.6 4.2A6 6 0 0 1 18 9c0 3.5 1 5.3 1.6 6.1M6.2 6.5C6.07 7.28 6 8.12 6 9c0 5-2 6-2 6h12M10 19a2 2 0 0 0 4 0" />
    <path d="m3 3 18 18" />
  </svg>
);
export const IArchive = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="5" rx="1" />
    <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4" />
  </svg>
);
export const ICheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
);
export const IChecks = (p: P) => (
  <svg {...base(p)}>
    <path d="m2.5 12.5 4.5 4.5L16.5 7.5" />
    <path d="m11.5 14.5 2.5 2.5L23.5 7.5" />
  </svg>
);
export const IClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);
export const IChevL = (p: P) => (
  <svg {...base(p)}>
    <path d="m14.5 5-7 7 7 7" />
  </svg>
);
export const IChevD = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 9.5 7 7 7-7" />
  </svg>
);
export const IPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IX = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
export const ILock = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2" />
  </svg>
);
export const IShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2 4.5 5v6c0 5 3.2 8.7 7.5 10.5 4.3-1.8 7.5-5.5 7.5-10.5V5L12 2Z" />
    <path d="m9 11.5 2.2 2.2L15.5 9" />
  </svg>
);
export const ICoins = (p: P) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="6" rx="7" ry="3" />
    <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
  </svg>
);
export const IStore = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 8 5.5 3h13L20 8M4 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8M4 8h16M9.5 20v-6h5v6" />
  </svg>
);
export const IUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1.3-3.5 4.1-5 7.5-5s6.2 1.5 7.5 5" />
  </svg>
);
export const IUsers = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M2.5 20c1.1-3 3.5-4.5 6.5-4.5s5.4 1.5 6.5 4.5M15.5 5.4a3.5 3.5 0 0 1 0 6.2M17.5 15.9c2 .6 3.4 1.9 4 4.1" />
  </svg>
);
export const IMega = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 11v3l4 .8L18 19V6L7 10.2 3 11Z" />
    <path d="M18 9.5a3 3 0 0 1 0 6M8 15.5 9 20h2l-.7-4" />
  </svg>
);
export const ILandmark = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 21h18M4 18h16M6 18v-7M10 18v-7M14 18v-7M18 18v-7M3 11 12 4l9 7H3Z" />
  </svg>
);
export const IGear = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19 12a7 7 0 0 0-.15-1.4l2-1.55-2-3.4-2.35.95a7 7 0 0 0-2.4-1.4L13.7 2.7h-3.4l-.4 2.5a7 7 0 0 0-2.4 1.4l-2.35-.95-2 3.4 2 1.55a7 7 0 0 0 0 2.8l-2 1.55 2 3.4 2.35-.95a7 7 0 0 0 2.4 1.4l.4 2.5h3.4l.4-2.5a7 7 0 0 0 2.4-1.4l2.35.95 2-3.4-2-1.55c.1-.45.15-.92.15-1.4Z" />
  </svg>
);
export const ILogout = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8M10 12h11M17 8l4 4-4 4" />
  </svg>
);
export const IPhoto = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m5 18 5-5 3 3 3-3 3 3" />
  </svg>
);
export const IDoc = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 2.5h8L19 7.5v14H6a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1Z" />
    <path d="M13.5 2.5v5.5H19M9 13h7M9 16.5h7" />
  </svg>
);
export const IPlay = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 4.5v15l12-7.5L7 4.5Z" fill="currentColor" stroke="none" />
  </svg>
);
export const IPause = (p: P) => (
  <svg {...base(p)}>
    <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
  </svg>
);
export const IStop = (p: P) => (
  <svg {...base(p)}>
    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />
  </svg>
);
export const IVerified = (p: P) => (
  <svg {...base(p)}>
    <path
      d="m12 1.8 2.5 1.9 3.1-.3 1 3 2.8 1.5-.8 3 1.7 2.6-2 2.4.2 3.1-3 .8-1.6 2.7-3.1-.6-2.6 1.8-2.5-1.8-3.1.6-1.6-2.7-3-.8.2-3.1-2-2.4 1.7-2.6-.8-3L6.4 6.4l1-3 3.1.3L12 1.8Z"
      fill="currentColor"
      stroke="none"
    />
    <path d="m8.7 12.2 2.2 2.2 4.4-4.6" stroke="#0a0a20" strokeWidth="2" fill="none" />
  </svg>
);
export const IStar = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9 2.9-6Z" />
  </svg>
);
export const ISpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19" />
  </svg>
);
export const IWallet = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
    <path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-1Z" />
    <circle cx="16.5" cy="13.5" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);
export const IArrowR = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);
export const IAlert = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 1.8 20.2h20.4L12 3ZM12 10v4.5M12 17.8h.01" />
  </svg>
);
export const ICrown = (p: P) => (
  <svg {...base(p)}>
    <path d="m3 8 4 4 5-7 5 7 4-4v10H3V8Z" />
    <path d="M3 21h18" />
  </svg>
);
export const ISignal = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 19a13 13 0 0 1 16 0M7 15.5a9 9 0 0 1 10 0M9.8 12.3a5 5 0 0 1 4.4 0M12 19h.01" />
  </svg>
);
export const IDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v11M7.5 10 12 14.5 16.5 10M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);
export const IEye = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

/* Имперская печать — герб приложения */
export function ImperialSeal({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={className} fill="none">
      <circle cx="48" cy="48" r="45" stroke="url(#sealG)" strokeWidth="2.5" />
      <circle cx="48" cy="48" r="38" stroke="rgba(255,215,0,0.35)" strokeWidth="1" strokeDasharray="3 5" />
      <g stroke="url(#sealG)" strokeWidth="3" strokeLinecap="round">
        <path d="M34 30v36M62 30v36M34 48h28" />
        <path d="M28 30h12M28 66h12M56 30h12M56 66h12" strokeWidth="2" />
      </g>
      <path d="M48 12l4 7h-8l4-7Z" fill="#ffd700" />
      <path d="M48 84l4-7h-8l4 7Z" fill="#ffd700" />
      <g fill="#ffd700">
        <circle cx="14" cy="48" r="2" />
        <circle cx="82" cy="48" r="2" />
      </g>
      <defs>
        <linearGradient id="sealG" x1="10" y1="10" x2="86" y2="86">
          <stop stopColor="#ffe25c" />
          <stop offset="0.5" stopColor="#d4af00" />
          <stop offset="1" stopColor="#f5e6a8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Лавровые ветви для рангов */
export function Laurel({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M24 20C14 20 6 14 4 4c6 2 10 5 12 9M24 20c10 0 18-6 20-16-6 2-10 5-12 9" />
      <path d="M8 7l3.5 1M11 11l3.2.4M15 15l2.8-.6M40 7l-3.5 1M37 11l-3.2.4M33 15l-2.8-.6" strokeWidth="1.2" />
    </svg>
  );
}
