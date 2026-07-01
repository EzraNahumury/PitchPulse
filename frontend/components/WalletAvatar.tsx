/**
 * Deterministic gradient avatar derived from a wallet public key — a small
 * RainbowKit-style identicon with no extra dependency.
 */
export default function WalletAvatar({
  pubkey,
  size = 28,
}: {
  pubkey: string;
  size?: number;
}) {
  let h = 0;
  for (let i = 0; i < pubkey.length; i++) {
    h = (h * 31 + pubkey.charCodeAt(i)) >>> 0;
  }
  const a = h % 360;
  const b = (a + 60 + (h % 80)) % 360;
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, hsl(${a} 85% 62%), hsl(${b} 80% 48%))`,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
      }}
    />
  );
}
