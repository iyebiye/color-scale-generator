type ColorInputProps = {
  name: string;
  color: string;
  error: string;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onGenerate: () => void;
};

export default function ColorInput({
  name,
  color,
  error,
  onNameChange,
  onColorChange,
  onGenerate,
}: ColorInputProps) {
  return (
    <section className="mb-12 rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <label htmlFor="color-name" className="mb-3 block text-sm font-medium">
          Color name
        </label>

        <input
          id="color-name"
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-400"
          placeholder="Primary"
        />
      </div>

      <label htmlFor="color" className="mb-3 block text-sm font-medium">
        Base color
      </label>

      <div className="flex gap-3">
        <input
          id="color-picker"
          type="color"
          value={color}
          onChange={(event) => onColorChange(event.target.value)}
          className="h-12 w-14 cursor-pointer rounded-lg border border-gray-200 p-1"
        />

        <div className="flex-1">
          <input
            id="color"
            type="text"
            value={color}
            onChange={(event) => onColorChange(event.target.value)}
            className={`h-12 w-full rounded-lg border px-4 font-mono text-sm uppercase outline-none ${
              error
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-gray-400"
            }`}
            placeholder="#0066FF"
            aria-invalid={!!error}
            aria-describedby={error ? "color-error" : undefined}
          />

          {error && (
            <p
              id="color-error"
              className="mt-2 text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onGenerate}
          className="h-12 rounded-lg bg-black px-6 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Generate
        </button>
      </div>
    </section>
  );
}
