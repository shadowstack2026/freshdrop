"use client";

import Link from "next/link";
import Image from "next/image";
import { Droplets } from "lucide-react";
import { useState } from "react";

/**
 * FreshDrop-logo: bild om den finns i public/brand/freshdrop-logo.png, annars ikon.
 * blendBg: true = mix-blend-multiply så vit bakgrund i bilden "försvinner" och bara droppen syns.
 */
export function LogoImage({
  width = 32,
  height = 32,
  className = "h-8 w-8",
  alt = "FreshDrop",
  blendBg = false
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <Droplets className={`${className} text-sky-500`} aria-hidden />;
  }

  return (
    <Image
      src="/brand/freshdrop-logo.png"
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${blendBg ? "mix-blend-multiply" : ""}`}
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}

/**
 * Länk + logo + text "FreshDrop" (för header och footer).
 * variant: "light" (mörk text) | "dark" (ljus text för mörk footer)
 * blendBg: bara droppen syns (vit bakgrund i loggan blandas bort)
 */
const sizeClasses = {
  32: "h-8 w-8",
  40: "h-10 w-10",
  48: "h-12 w-12",
  56: "h-14 w-14",
  64: "h-16 w-16",
  72: "h-[72px] w-[72px]",
  80: "h-20 w-20"
};

function getSizeClass(logoSize) {
  if (logoSize >= 80) return sizeClasses[80];
  if (logoSize >= 72) return sizeClasses[72];
  if (logoSize >= 64) return sizeClasses[64];
  if (logoSize >= 56) return sizeClasses[56];
  if (logoSize >= 48) return sizeClasses[48];
  if (logoSize >= 40) return sizeClasses[40];
  return sizeClasses[32];
}

export default function Logo({
  href = "/",
  showText = true,
  logoSize = 48,
  variant = "light",
  blendBg = false
}) {
  const textClass = variant === "dark" ? "text-white" : "text-slate-900";
  const sizeClass = getSizeClass(logoSize);
  const textSizeClass = logoSize >= 56 ? "text-xl" : logoSize >= 48 ? "text-lg" : "text-lg";
  return (
    <Link
      href={href}
      aria-label={showText ? undefined : "FreshDrop"}
      className={`inline-flex items-center gap-2 font-semibold ${textSizeClass} ${textClass}`}
    >
      <LogoImage
        width={logoSize}
        height={logoSize}
        className={`${sizeClass} object-contain`}
        blendBg={blendBg}
      />
      {showText && <span>FreshDrop</span>}
    </Link>
  );
}
