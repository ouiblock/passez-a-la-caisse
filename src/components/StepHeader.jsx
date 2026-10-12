export function StepHeader({ step, title, subtitle }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="bg-gold text-gray-950 text-sm font-bold px-4 py-2 rounded-full shadow-lg">
          Étape {step}/4
        </span>
      </div>
      <h2 className="text-2xl sm:text-4xl font-bold text-gold mb-3 drop-shadow-lg">{title}</h2>
      {subtitle && <p className="text-gray-400 text-base sm:text-lg">{subtitle}</p>}
    </div>
  );
}
