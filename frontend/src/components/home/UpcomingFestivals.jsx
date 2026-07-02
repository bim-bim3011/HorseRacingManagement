import FestivalCard from './FestivalCard';
import { Link } from 'react-router-dom';

function UpcomingFestivals() {
  return (
    <section className="flex flex-col gap-10">
      {/* Section Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-outline-variant/40 pb-6">
        <div>
          <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold">
            Upcoming Festivals
          </h2>
          <p className="font-body text-body-md text-on-surface-variant mt-2">
            The pinnacle events of the racing calendar.
          </p>
        </div>
        <a
          href="#"
          className="font-body text-label-caps font-bold text-primary hover:text-on-surface transition-colors flex items-center gap-1 group uppercase no-underline"
        >
          View All{' '}
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </a>
      </header>

      {/* Bento-inspired Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Feature Card (Spans 8 cols) */}
        <Link to="/tournaments/1" className="md:col-span-8 group relative bg-surface-container-lowest rounded-lg border border-secondary-fixed overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-shadow duration-500 block no-underline">
          <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
            <div
              className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-700"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuACI341eh3wx3JppWIv59acRwmsD6u8Fr79sy_Nvm0eRkj4gdLD2oCzJ7VZW3N0LPoKRcbrjwjuBafVCByly7k-4gmBH_ekmRq2Dl6KNi1d40_0DXtlav-AX__7Bw-9nBkkp7wMdbDdVlcvUiU5xYc0d1UPbFBnTNACxueyjSexdzsZoHaS_NnozHhaFWs5oiV2C7KegCNCNJT81AM92twytSH6CtGzjBpYtd26bvFk1Ftkjhpw7axAtLEpcrjuwiuTC2l95PsC6ybr")',
              }}
              role="img"
              aria-label="Thoroughbred racehorses galloping on turf track"
            ></div>
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-3 py-1 bg-primary/10 text-primary font-body text-[10px] font-bold rounded-full uppercase tracking-wider">
                Premium Event
              </span>
              <span className="font-body text-label-caps font-bold text-on-surface-variant">
                12 - 15 Mar 2024
              </span>
            </div>
            <h3 className="font-display text-headline-md text-on-surface mb-3 group-hover:text-primary transition-colors font-semibold">
              The Cheltenham Festival
            </h3>
            <p className="font-body text-body-md text-on-surface-variant mb-8 line-clamp-3">
              Four days of extraordinary racing, featuring the finest horses,
              jockeys, and trainers competing for the highest honors in jump
              racing.
            </p>
            <button className="self-start font-body text-interactive-md font-semibold border-b-2 border-primary text-on-surface pb-1 hover:text-primary transition-colors cursor-pointer">
              View Details
            </button>
          </div>
        </Link>

        {/* Smaller Card 1 */}
        <FestivalCard
          id={2}
          title="Grand National Festival"
          location="Aintree Racecourse"
          dateRange="11 - 13 Apr 2024"
          status="Scheduled"
          isPrimary={true}
        />

        {/* Smaller Card 2 */}
        <FestivalCard
          id={3}
          title="Derby Festival"
          location="Epsom Downs"
          dateRange="31 May - 01 Jun 2024"
          status="Upcoming"
          isPrimary={false}
        />

        {/* Season Overview Stats Block (Spans 8 cols) */}
        <div className="md:col-span-8 bg-inverse-surface rounded-lg p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/10 to-transparent"></div>
          <div className="mb-4 md:mb-0">
            <h4 className="font-display text-[20px] text-surface mb-1 font-semibold">
              Season Overview
            </h4>
            <p className="font-body text-body-md text-surface-dim">
              Quick statistics for the current racing calendar.
            </p>
          </div>
          <div className="flex gap-8 relative z-10">
            <div className="text-center">
              <span className="block font-display text-[32px] text-primary-fixed font-bold">
                14
              </span>
              <span className="font-body text-[10px] font-bold text-surface-variant uppercase tracking-widest">
                Active Meets
              </span>
            </div>
            <div className="w-px bg-surface-dim/30"></div>
            <div className="text-center">
              <span className="block font-display text-[32px] text-primary-fixed font-bold">
                240
              </span>
              <span className="font-body text-[10px] font-bold text-surface-variant uppercase tracking-widest">
                Horses Entered
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UpcomingFestivals;
