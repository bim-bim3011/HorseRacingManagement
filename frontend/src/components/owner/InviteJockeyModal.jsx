import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableJockeysPaginated, sendInvitation } from '../../api/jockeyInvitationApi';

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function InviteJockeyModal({ raceId, horseId, horseName, onClose, onSuccess }) {
  const [jockeys, setJockeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  // Search, Sort, Pagination, Filter states
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filterGender, setFilterGender] = useState('');
  const [filterMinExp, setFilterMinExp] = useState('');
  const [filterMaxWeight, setFilterMaxWeight] = useState('');
  
  const [sortBy, setSortBy] = useState('experienceYears');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchJockeys();
  }, [searchQuery, filterGender, filterMinExp, filterMaxWeight, sortBy, sortDir, currentPage]);

  const fetchJockeys = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAvailableJockeysPaginated({
        keyword: searchQuery,
        gender: filterGender || undefined,
        minExperience: filterMinExp ? parseInt(filterMinExp) : undefined,
        maxWeight: filterMaxWeight ? parseFloat(filterMaxWeight) : undefined,
        sortBy: sortBy,
        sortDir: sortDir,
        page: currentPage,
        size: 10
      });
      setJockeys(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch available jockeys. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(0);
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortDir] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortDir(newSortDir);
    setCurrentPage(0);
  };

  const handleInvite = async (jockeyId) => {
    try {
      setIsSending(true);
      setError('');
      await sendInvitation(raceId, horseId, jockeyId);
      onSuccess(); // Triggers parent to close modal and refresh
    } catch (err) {
      setError(err.message || 'Failed to send invitation. They might already be invited.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-surface rounded-2xl shadow-2xl border border-outline-variant w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] relative z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center sticky top-0 z-10">
            <div>
              <h3 className="font-display text-xl text-on-surface font-bold uppercase tracking-tight">Invite Jockey</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-error-container text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 flex flex-col h-full overflow-hidden">
            {/* Horse Context Banner */}
            <div className="bg-primary-container text-on-primary-container rounded-xl p-4 mb-6 flex items-center gap-4 shadow-sm shrink-0">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px] text-primary">pets</span>
              </div>
              <div>
                <p className="text-sm font-label-md uppercase tracking-wider opacity-80">Looking for a Jockey for</p>
                <h4 className="text-xl font-display font-bold mt-1">{horseName || `Horse #${horseId}`}</h4>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-label-md uppercase tracking-wider opacity-80">Race Entry</p>
                <p className="font-bold">#{raceId}</p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 shrink-0 items-start lg:items-center justify-between">
              <form onSubmit={handleSearch} className="w-full lg:w-1/3 flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                  <input
                    type="text"
                    placeholder="Search jockey name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-on-surface font-interactive-md focus:outline-none focus:border-primary transition-colors h-[42px]"
                  />
                </div>
                <button type="submit" className="px-4 py-2 h-[42px] bg-secondary text-on-secondary rounded-lg font-bold font-interactive-md hover:bg-secondary-fixed-dim transition-colors flex items-center justify-center">
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                {/* Advanced Filters */}
                <select
                  value={filterGender}
                  onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(0); }}
                  className="bg-surface-container border border-outline-variant text-on-surface rounded-lg px-3 py-2 font-interactive-md focus:outline-none focus:border-primary cursor-pointer max-w-[120px]"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                
                <div className="relative max-w-[120px]">
                  <input
                    type="number"
                    placeholder="Min Exp"
                    min="0"
                    value={filterMinExp}
                    onChange={(e) => { setFilterMinExp(e.target.value); setCurrentPage(0); }}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg pl-3 pr-8 py-2 text-on-surface font-interactive-md focus:outline-none focus:border-primary transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-bold pointer-events-none">Yrs</span>
                </div>
                
                <div className="relative max-w-[120px]">
                  <input
                    type="number"
                    placeholder="Max Wt"
                    min="0"
                    step="0.1"
                    value={filterMaxWeight}
                    onChange={(e) => { setFilterMaxWeight(e.target.value); setCurrentPage(0); }}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg pl-3 pr-7 py-2 text-on-surface font-interactive-md focus:outline-none focus:border-primary transition-colors"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-bold pointer-events-none">kg</span>
                </div>
                
                {/* Sort */}
                <div className="h-8 w-[1px] bg-outline-variant mx-1"></div>
                <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-on-surface-variant">sort</span>
                <select
                  value={`${sortBy}-${sortDir}`}
                  onChange={handleSortChange}
                  className="bg-surface-container border border-outline-variant text-on-surface rounded-lg px-4 py-2 font-interactive-md focus:outline-none focus:border-primary cursor-pointer min-w-[200px]"
                >
                  <option value="experienceYears-desc">Most Experienced</option>
                  <option value="experienceYears-asc">Least Experienced</option>
                  <option value="weight-asc">Lightest Weight</option>
                  <option value="weight-desc">Heaviest Weight</option>
                  <option value="fullName-asc">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg font-interactive-sm flex items-center gap-2 shrink-0">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {error}
              </div>
            )}

            {/* Jockey Table */}
            <div className="flex-1 overflow-auto rounded-xl border border-outline-variant bg-surface">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-on-surface-variant font-interactive-md animate-pulse">Finding available jockeys...</p>
                </div>
              ) : jockeys.length === 0 ? (
                <div className="text-center py-20 h-full flex flex-col items-center justify-center border-dashed border-outline-variant bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-[64px] text-on-surface-variant opacity-30 mb-4">sports_kabaddi</span>
                  <h4 className="text-xl font-display text-on-surface mb-2">No Jockeys Found</h4>
                  <p className="text-on-surface-variant font-interactive-md max-w-sm">There are no available jockeys matching your search criteria right now.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="bg-surface-container-low sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="py-3 px-4 font-label-caps text-on-surface-variant">Jockey Name</th>
                      <th className="py-3 px-4 font-label-caps text-on-surface-variant">Experience</th>
                      <th className="py-3 px-4 font-label-caps text-on-surface-variant">Weight</th>
                      <th className="py-3 px-4 font-label-caps text-on-surface-variant">Height</th>
                      <th className="py-3 px-4 font-label-caps text-on-surface-variant text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {jockeys.map((jockey, idx) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        key={jockey.id}
                        className="hover:bg-surface-container-highest transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center font-bold text-lg">
                              {jockey.fullName ? jockey.fullName.charAt(0).toUpperCase() : 'J'}
                            </div>
                            <span className="font-bold text-on-surface">{jockey.fullName || jockey.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-interactive-md text-on-surface">
                            <span className="material-symbols-outlined text-[16px] text-primary">military_tech</span>
                            {jockey.experienceYears != null ? `${jockey.experienceYears} Yrs` : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-interactive-md text-on-surface">
                            <span className="material-symbols-outlined text-[16px] text-secondary">weight</span>
                            {jockey.weight ? `${jockey.weight} kg` : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-interactive-md text-on-surface">
                            <span className="material-symbols-outlined text-[16px] text-tertiary">height</span>
                            {jockey.height ? `${jockey.height} cm` : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleInvite(jockey.id)}
                            disabled={isSending}
                            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-lg font-bold font-interactive-sm group-hover:bg-primary group-hover:text-on-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSending ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <span className="material-symbols-outlined text-[16px]">send</span>
                            )}
                            Invite
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-outline-variant shrink-0">
                <span className="text-sm text-on-surface-variant">
                  Page <span className="font-bold text-on-surface">{currentPage + 1}</span> of <span className="font-bold text-on-surface">{totalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 border border-outline-variant rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-interactive-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 border border-outline-variant rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-interactive-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
