'use client';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      {label && <span className="text-sm text-[#6B7280] font-poppins">{label}</span>}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="w-11 h-6 rounded-full border-none cursor-pointer relative transition-colors duration-200 flex-shrink-0"
        style={{ background: checked ? '#4CAF50' : '#D1D5DB' }}
        aria-checked={checked}
        role="switch"
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ left: checked ? 22 : 2 }}
        />
      </button>
    </div>
  );
}
