import { Link } from 'react-router-dom';

function AdminDashboardPage() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      {/* Top App Bar */}
      <header className="fixed top-0 right-0 w-full md:w-[calc(100%-18rem)] h-16 flex justify-between items-center px-4 md:px-10 z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-4">
          {/* Search Bar placeholder */}
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
            <input className="bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-colors w-64" placeholder="Search..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span></button>
          <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>settings</span></button>
          <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>help</span></button>
          <img alt="Administrator Profile" className="w-10 h-10 rounded-full object-cover border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnXm12wA8D2l4tyX6h3WnbUqmygy8FJN6TuTAvqGkNIcQsfcUA7DVtj480uv1lh3E8FnqvGFg1Z4p64vOEzsmLarL3t_zvY2ZnCR2bETl2D9SendIPRKFu74XVbIF5qhWue9WH_KyIrjE4nkaf_v4iuOMA4gJr0eohaZCg8ABC3c-wpI_M6lWi7GtZqk5beybiqDuEM8_BfSH9aV-fZoHjupTkKfmFi36n8RNvdG8rHD5SJ3ieTDriJ6IIkM1bujZCjzu0aIsVAKut" />
        </div>
      </header>

      {/* Side Navigation */}
      <nav className="fixed left-0 top-0 h-full w-72 flex-col z-40 overflow-y-auto px-2 bg-surface border-r border-outline-variant hidden md:flex">
        <div className="py-4 px-2 flex items-center gap-2 border-b border-outline-variant mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded">
              <div className="w-4 h-4 bg-surface-container-lowest rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-[20px] leading-none text-on-surface uppercase tracking-wider font-bold">The Elite Club</h1>
              <p className="font-body text-xs text-on-surface-variant mt-1 uppercase tracking-widest font-bold">Admin Dashboard</p>
            </div>
          </div>
        </div>
        <ul className="flex flex-col gap-1 flex-grow">
          <li>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant font-body text-sm font-semibold hover:text-primary hover:bg-surface-container-highest transition-colors duration-200 rounded">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_today</span>
              Tournament Scheduling
            </Link>
          </li>
          <li>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant font-body text-sm font-semibold hover:text-primary hover:bg-surface-container-highest transition-colors duration-200 rounded">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>fact_check</span>
              Entry Approvals
            </Link>
          </li>
          <li>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant font-body text-sm font-semibold hover:text-primary hover:bg-surface-container-highest transition-colors duration-200 rounded">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>pets</span>
              Jockey &amp; Horse Listings
            </Link>
          </li>
          <li>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant font-body text-sm font-semibold hover:text-primary hover:bg-surface-container-highest transition-colors duration-200 rounded">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>assignment_ind</span>
              Referee Assignment
            </Link>
          </li>
          <li>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant font-body text-sm font-semibold hover:text-primary hover:bg-surface-container-highest transition-colors duration-200 rounded">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>publish</span>
              Result Publishing
            </Link>
          </li>
          <li>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant font-body text-sm font-semibold hover:text-primary hover:bg-surface-container-highest transition-colors duration-200 rounded">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>online_prediction</span>
              Prediction Management
            </Link>
          </li>
          <li>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant font-body text-sm font-semibold hover:text-primary hover:bg-surface-container-highest transition-colors duration-200 rounded">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>verified_user</span>
              Role Permissions
            </Link>
          </li>
          <li>
            <Link to="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant font-body text-sm font-semibold hover:text-primary hover:bg-surface-container-highest transition-colors duration-200 rounded">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>manage_accounts</span>
              Account Management
            </Link>
          </li>
        </ul>
        <div className="mt-auto mb-4 px-2">
          <button className="w-full bg-surface-container-low border border-primary text-primary font-body text-sm font-semibold py-2 rounded-lg hover:bg-primary hover:text-on-primary transition-colors cursor-pointer">
            Add New Tournament
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="md:ml-72 pt-16 p-4 md:p-10 bg-surface-container-lowest min-h-screen">
        <div className="max-w-[1280px] mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex justify-between items-end border-b border-outline-variant pb-2">
            <div>
              <h2 className="font-display text-4xl text-on-surface font-bold tracking-tight">System Overview</h2>
              <p className="font-body text-lg text-on-surface-variant mt-1">Live administrative metrics and recent club activity.</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary font-body text-sm font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>download</span>
                Export Report
              </button>
            </div>
          </div>

          {/* Bento Grid Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric Card 1 */}
            <div className="bg-surface rounded-xl border border-outline-variant p-4 flex flex-col justify-between relative overflow-hidden group hover:border-primary transition-colors">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-body text-xs font-bold tracking-widest text-on-surface-variant uppercase">Active Tournaments</span>
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>emoji_events</span>
              </div>
              <div>
                <span className="font-display text-5xl font-bold text-on-surface tracking-tight">4</span>
                <div className="flex items-center gap-1 mt-1 text-primary">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 0" }}>trending_up</span>
                  <span className="font-body text-xs font-semibold">+1 this week</span>
                </div>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-surface rounded-xl border border-outline-variant p-4 flex flex-col justify-between relative overflow-hidden group hover:border-primary transition-colors">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-body text-xs font-bold tracking-widest text-on-surface-variant uppercase">Pending Registrations</span>
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>how_to_reg</span>
              </div>
              <div>
                <span className="font-display text-5xl font-bold text-on-surface tracking-tight">12</span>
                <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
                  <span className="font-body text-xs font-semibold">Requires review</span>
                </div>
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="bg-surface rounded-xl border border-outline-variant p-4 flex flex-col justify-between relative overflow-hidden group hover:border-primary transition-colors">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-body text-xs font-bold tracking-widest text-on-surface-variant uppercase">Registered Jockeys</span>
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>sports_kabaddi</span>
              </div>
              <div>
                <span className="font-display text-5xl font-bold text-on-surface tracking-tight">86</span>
                <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 0" }}>check_circle</span>
                  <span className="font-body text-xs font-semibold">Fully verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-display text-2xl font-bold text-on-surface">Recent Activity</h3>
              <button className="text-primary font-body text-sm font-semibold hover:underline cursor-pointer">View All</button>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary bg-surface text-on-surface-variant">
                    <th className="py-2 px-4 font-body text-xs font-bold tracking-widest uppercase">Date &amp; Time</th>
                    <th className="py-2 px-4 font-body text-xs font-bold tracking-widest uppercase">Action</th>
                    <th className="py-2 px-4 font-body text-xs font-bold tracking-widest uppercase">User / Subject</th>
                    <th className="py-2 px-4 font-body text-xs font-bold tracking-widest uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="font-body text-base text-on-surface">
                  <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                    <td className="py-2 px-4">Oct 24, 09:30 AM</td>
                    <td className="py-2 px-4">New Entry Submission</td>
                    <td className="py-2 px-4 font-semibold">Jockey: Arthur Pendelton</td>
                    <td className="py-2 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-container border border-outline-variant text-[12px] font-semibold">Pending</span>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                    <td className="py-2 px-4">Oct 23, 16:45 PM</td>
                    <td className="py-2 px-4">Tournament Scheduled</td>
                    <td className="py-2 px-4 font-semibold">Royal Ascot Qualifier</td>
                    <td className="py-2 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[12px] font-semibold">Confirmed</span>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                    <td className="py-2 px-4">Oct 23, 11:15 AM</td>
                    <td className="py-2 px-4">Referee Assigned</td>
                    <td className="py-2 px-4 font-semibold">Match #402 - Stewart, D.</td>
                    <td className="py-2 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[12px] font-semibold">Confirmed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
