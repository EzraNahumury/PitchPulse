"use client";

import Image from "next/image";
import WalletAvatar from "./WalletAvatar";

/**
 * The connected wallet's own logo (Phantom, Solflare, MetaMask, …) from the
 * adapter. Falls back to a deterministic gradient avatar if the adapter exposes
 * no icon.
 */
export default function WalletIcon({
  icon,
  name,
  pubkey,
  size = 28,
  className = "rounded-full",
}: {
  icon?: string;
  name?: string;
  pubkey: string;
  size?: number;
  className?: string;
}) {
  if (!icon) return <WalletAvatar pubkey={pubkey} size={size} />;
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden ring-1 ring-black/5 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={icon}
        alt={name ? `${name} logo` : "Wallet logo"}
        width={size}
        height={size}
        unoptimized
        className="h-full w-full object-cover"
      />
    </span>
  );
}
