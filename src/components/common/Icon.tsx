const paths: Record<string, string> = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  exam: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6',
  learn: 'M3 7l9-4 9 4-9 4zM7 9v5c0 1.5 2.2 3 5 3s5-1.5 5-3V9',
  results: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  book: 'M4 4h7a2 2 0 012 2v14a2 2 0 00-2-2H4zM20 4h-7a2 2 0 00-2 2v14a2 2 0 012-2h7z',
  clock: 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}
export function Icon({ name, size = 18 }: { name: keyof typeof paths | string; size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>)
}
