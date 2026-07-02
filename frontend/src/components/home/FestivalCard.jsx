import { Link } from 'react-router-dom';

function FestivalCard({ id, title, location, dateRange, status, isPrimary = false }) {
  return (
    <Link to={`/tournaments/${id || 1}`} className="md:col-span-4 bg-surface-container-lowest rounded-lg border border-secondary-fixed p-6 flex flex-col justify-between hover:border-primary/50 transition-colors duration-300 block no-underline">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">
              event
            </span>
          </div>
          <span className="font-body text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
            {dateRange}
          </span>
        </div>
        <h3 className="font-display text-[20px] text-on-surface mb-2 font-semibold">
          {title}
        </h3>
        <p className="font-body text-[14px] text-on-surface-variant">
          {location}
        </p>
      </div>
      <div className="mt-8 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
        <span
          className={`font-body text-label-caps font-bold uppercase ${
            isPrimary ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          {status}
        </span>
        <button
          aria-label="Details"
          className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </Link>
  );
}

export default FestivalCard;
