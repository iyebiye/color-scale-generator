type ColorValueProps = {
  label: string;
  value: string;
  copiedValue: string | null;
  onCopy: (value: string) => void;
};

export default function ColorValue({
  label,
  value,
  copiedValue,
  onCopy,
}: ColorValueProps) {
  const isCopied = copiedValue === value;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <div className="min-w-0">
        <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </div>

        <div className="truncate font-mono text-xs text-gray-700">
          {value}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onCopy(value)}
        className="shrink-0 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium transition hover:bg-gray-100"
      >
        {isCopied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}