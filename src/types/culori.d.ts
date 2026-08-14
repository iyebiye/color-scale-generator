declare module "culori" {
  export function converter(mode: string): (color: unknown) => any;
  export function formatHex(color: unknown): string;
}