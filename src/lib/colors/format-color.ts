import { converter } from "culori";

const toRgb = converter("rgb");
const toOklch = converter("oklch");

export function getRgb(hex: string): string {
  const rgb = toRgb(hex);

  if (!rgb) {
    return "";
  }

  const r = Math.round((rgb.r ?? 0) * 255);
  const g = Math.round((rgb.g ?? 0) * 255);
  const b = Math.round((rgb.b ?? 0) * 255);

  return `rgb(${r}, ${g}, ${b})`;
}

export function getOklch(hex: string): string {
  const oklch = toOklch(hex);

  if (!oklch) {
    return "";
  }

  const l = (oklch.l ?? 0).toFixed(3);
  const c = (oklch.c ?? 0).toFixed(3);
  const h = Math.round(oklch.h ?? 0);

  return `oklch(${l} ${c} ${h})`;
}