import clsx from 'clsx';

interface ToggleGroupProps<V extends string> {
  /** Intitulé du groupe (affiché dans le menu des filtres, lu par les lecteurs d'écran partout). */
  label: string;
  options: { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
}

/** Boutons à bascule mutuellement exclusifs (filtres rapides : statut, période…). */
function ToggleGroup<V extends string>({ label, options, value, onChange }: ToggleGroupProps<V>) {
  return (
    <div className="toggle-group" role="group" aria-label={label}>
      <span className="toggle-group__label">{label}</span>
      <div className="admin-filter-pills">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={clsx('admin-pill-btn', { 'admin-pill-btn--active': value === option.value })}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ToggleGroup;
