type ColorInputProps = {
  color: string;
  onColorChange: (color: string) => void;
  onGenerate: () => void;
};

export default function ColorInput({
  color,
  onColorChange,
  onGenerate,
}: ColorInputProps) {
  return (
    <section className="mb-12 rounded-2xl border border-gray-200 p-6">
      <label
        htmlFor="color"
        className="mb-3 block text-sm font-medium"
      >
        Base color
      </label>

      <div className="flex gap-3">
        <input
          id="color-picker"
          type="color"
          value={color}
          onChange={(event) =>
            onColorChange(event.target.value)
          }
          className="h-12 w-14 cursor-pointer rounded-lg border border-gray-200 p-1"
        />

        <input
          id="color"
          type="text"
          value={color}
          onChange={(event) =>
            onColorChange(event.target.value)
          }
          className="h-12 flex-1 rounded-lg border border-gray-200 px-4 font-mono text-sm uppercase outline-none focus:border-gray-400"
          placeholder="#0066FF"
        />

        <button
          type="button"
          onClick={onGenerate}
          className="rounded-lg bg-black px-6 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Generate
        </button>
      </div>
    </section>
  );
}