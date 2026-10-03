import type { StationConfig } from '../config/exhibition';

type PaintingSelectorProps = {
  focusedPosition: number | null;
  onSelect: (position: number | null) => void;
  stations: readonly StationConfig[];
};

export function PaintingSelector({
  focusedPosition,
  onSelect,
  stations,
}: PaintingSelectorProps) {
  return (
    <div className="painting-navigation">
      <label className="painting-selector" htmlFor="painting-number">
        <span>Go to painting</span>
        <select
          id="painting-number"
          aria-label="Go to painting"
          value={focusedPosition === null ? '' : String(focusedPosition)}
          onChange={(event) => onSelect(Number(event.currentTarget.value))}
        >
          <option value="" disabled hidden />
          {stations.map((station, index) => (
            <option key={station.position} value={station.position}>
              {index + 1}
            </option>
          ))}
        </select>
      </label>
      <button
        className="overview-button"
        type="button"
        aria-label="Return to overview"
        onClick={() => onSelect(null)}
      >
        Overview
      </button>
    </div>
  );
}
