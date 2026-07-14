import React, { useState, useEffect } from 'react';
import FestivalCard from './FestivalCard';
import { Link } from 'react-router-dom';
import { getAllTournaments } from '../../api/tournamentApi';

function UpcomingTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getAllTournaments();
        const activeTournaments = data
          .filter((t) => t.status && (t.status.toUpperCase() === 'UPCOMING' || t.status.toUpperCase() === 'ONGOING'))
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 3);
        setTournaments(activeTournaments);
      } catch (error) {
        console.error('Failed to fetch tournaments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  // Format date range helper
  const formatDateRange = (start, end) => {
    if (!start) return 'TBA';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;
    
    const startStr = startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    if (!endDate) return startStr + ' ' + startDate.getFullYear();
    
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
    }
    return `${startStr} - ${endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  };

  const primaryTournament = tournaments[0];
  const otherTournaments = tournaments.slice(1, 3);

  return (
    <section className="flex flex-col gap-10">
      {/* Section Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-outline-variant/40 pb-6">
        <div>
          <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold">
            Upcoming Tournaments
          </h2>
          <p className="font-body text-body-md text-on-surface-variant mt-2">
            The pinnacle events of the racing calendar.
          </p>
        </div>
        <Link
          to="/tournaments"
          className="font-body text-label-caps font-bold text-primary hover:text-on-surface transition-colors flex items-center gap-1 group uppercase no-underline"
        >
          View All{' '}
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">event_busy</span>
          <h3 className="font-display text-title-lg text-on-surface mb-2">No Upcoming Tournaments</h3>
          <p className="font-body text-body-md text-on-surface-variant">Check back later for new events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Feature Card (Spans 8 cols) */}
          {primaryTournament && (
            <Link to={`/tournaments/${primaryTournament.id}`} className="md:col-span-8 group relative bg-surface-container-lowest rounded-lg border border-secondary-fixed overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-shadow duration-500 block no-underline">
              <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                <div
                  className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-700 bg-surface-container-high"
                  style={{
                    backgroundImage: primaryTournament.banner 
                      ? `url(${primaryTournament.banner})` 
                      : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuACI341eh3wx3JppWIv59acRwmsD6u8Fr79sy_Nvm0eRkj4gdLD2oCzJ7VZW3N0LPoKRcbrjwjuBafVCByly7k-4gmBH_ekmRq2Dl6KNi1d40_0DXtlav-AX__7Bw-9nBkkp7wMdbDdVlcvUiU5xYc0d1UPbFBnTNACxueyjSexdzsZoHaS_NnozHhaFWs5oiV2C7KegCNCNJT81AM92twytSH6CtGzjBpYtd26bvFk1Ftkjhpw7axAtLEpcrjuwiuTC2l95PsC6ybr")',
                  }}
                  role="img"
                ></div>
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="px-3 py-1 bg-primary/10 text-primary font-body text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {primaryTournament.status}
                  </span>
                  <span className="font-body text-label-caps font-bold text-on-surface-variant">
                    {formatDateRange(primaryTournament.startDate, primaryTournament.endDate)}
                  </span>
                </div>
                <h3 className="font-display text-headline-md text-on-surface mb-3 group-hover:text-primary transition-colors font-semibold">
                  {primaryTournament.name}
                </h3>
                <p className="font-body text-body-md text-on-surface-variant mb-4 font-semibold">
                  <span className="material-symbols-outlined text-[16px] align-text-bottom mr-1">location_on</span>
                  {primaryTournament.location || 'TBA'}
                </p>
                <p className="font-body text-body-md text-on-surface-variant mb-8 line-clamp-3">
                  {primaryTournament.description || 'Join us for this premier racing event featuring top horses and jockeys competing for glory.'}
                </p>
                <button className="self-start font-body text-interactive-md font-semibold border-b-2 border-primary text-on-surface pb-1 hover:text-primary transition-colors cursor-pointer">
                  View Details
                </button>
              </div>
            </Link>
          )}

          {/* Smaller Cards */}
          {otherTournaments.map((tournament) => (
            <FestivalCard
              key={tournament.id}
              id={tournament.id}
              title={tournament.name}
              location={tournament.location || 'TBA'}
              dateRange={formatDateRange(tournament.startDate, tournament.endDate)}
              status={tournament.status}
              isPrimary={tournament.status === 'ONGOING'}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default UpcomingTournaments;
