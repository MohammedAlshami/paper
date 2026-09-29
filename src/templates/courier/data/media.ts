/** Stand-ins for photos, drawn as SVG so the demos work offline. */
function svgUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** A front door with a parcel on the step: a drop-off "photo". */
export const DROP_OFF_PHOTO = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">
  <defs><linearGradient id="w" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f4e4d8"/><stop offset="1" stop-color="#e9cfbd"/></linearGradient></defs>
  <rect width="640" height="400" fill="url(#w)"/>
  <rect y="318" width="640" height="82" fill="#cfc6bd"/>
  <rect x="236" y="70" width="168" height="252" rx="6" fill="#3b3b3f"/>
  <rect x="252" y="86" width="136" height="104" rx="4" fill="#4a4a50"/>
  <rect x="252" y="204" width="136" height="104" rx="4" fill="#4a4a50"/>
  <circle cx="376" cy="200" r="7" fill="#e2b9c9"/>
  <rect x="206" y="300" width="228" height="22" fill="#b8aea4"/>
  <rect x="272" y="262" width="92" height="58" fill="#d9a86a"/>
  <rect x="272" y="262" width="92" height="12" fill="#c4935a"/>
  <rect x="312" y="262" width="12" height="58" fill="#f3e2c0"/>
</svg>`);

/** A shopfront: a place "photo". */
export const SHOPFRONT_PHOTO = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">
  <defs><linearGradient id="s" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f6d9e6"/><stop offset="1" stop-color="#f2c1d6"/></linearGradient></defs>
  <rect width="640" height="400" fill="url(#s)"/>
  <rect y="330" width="640" height="70" fill="#d9c3cc"/>
  <rect x="90" y="120" width="460" height="210" fill="#fff7fa"/>
  <path d="M70 120h500l-30-56H100z" fill="#ec4899"/>
  <path d="M100 64h60l-16 56h-60zM220 64h60l-8 56h-60zM340 64h60v56h-60zM460 64h60l16 56h-60z" fill="#fff" opacity=".85"/>
  <rect x="130" y="160" width="150" height="120" rx="4" fill="#e9d3dc"/>
  <rect x="360" y="160" width="150" height="120" rx="4" fill="#e9d3dc"/>
  <rect x="290" y="190" width="60" height="140" rx="3" fill="#7a4a5c"/>
</svg>`);

/** A signature, as an SVG path in a 200 × 64 box. */
export const SIGNATURE_PATH =
  'M10 42 C 18 14, 30 12, 28 34 S 22 52, 34 30 C 42 14, 50 20, 46 36 S 58 44, 64 26 C 68 16, 74 22, 72 34 C 84 30, 92 26, 98 34 S 116 44, 128 22 C 136 8, 142 20, 138 34 S 150 46, 172 26';
