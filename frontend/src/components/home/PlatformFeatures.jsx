

const featuresData = [
  {
    title: 'Tournament Management',
    description: 'Explore upcoming races, view detailed schedules, and register your champions for premier racing events seamlessly.',
    icon: 'emoji_events',
    colorClass: 'text-primary bg-primary/10',
    link: '/tournaments',
    linkText: 'View Tournaments'
  },
  {
    title: 'Smart Wallet & Payouts',
    description: 'Deposit funds instantly and withdraw your winnings safely using the integrated VietQR automatic payment system.',
    icon: 'account_balance_wallet',
    colorClass: 'text-[var(--md-sys-color-tertiary)] bg-[var(--md-sys-color-tertiary-container)]',
    link: '/profile',
    linkText: 'Manage Wallet'
  },
  {
    title: 'Betting & Predictions',
    description: 'Analyze odds, make informed predictions on your favorite horses, and earn rewards when your champion crosses the finish line.',
    icon: 'monitoring',
    colorClass: 'text-[var(--md-sys-color-secondary)] bg-[var(--md-sys-color-secondary-container)]',
    link: '/tournaments',
    linkText: 'Start Betting'
  },
  {
    title: 'Live Results & Tracking',
    description: 'Get real-time race results, track jockey performances, and stay updated with official referee penalty decisions.',
    icon: 'sports_score',
    colorClass: 'text-[var(--md-sys-color-error)] bg-error-container',
    link: '/tournaments',
    linkText: 'Check Results'
  }
];

function FeatureCard({ title, description, icon, colorClass }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${colorClass}`}>
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="font-display text-title-lg text-on-surface mb-3 font-semibold">{title}</h3>
      <p className="font-body text-body-md text-on-surface-variant flex-grow mb-0">{description}</p>
    </div>
  );
}

function PlatformFeatures() {
  return (
    <section className="flex flex-col gap-12">
      {/* Centered Section Header */}
      <header className="text-center max-w-2xl mx-auto mb-2">
        <h2 className="font-display text-[36px] md:text-[48px] text-on-surface mb-4 font-bold">
          Platform Capabilities
        </h2>
        <div className="h-px w-24 bg-primary mx-auto mb-6"></div>
        <p className="font-body text-body-md text-on-surface-variant">
          Experience a comprehensive ecosystem designed for horse owners, racing enthusiasts, and administrators. Everything you need in one place.
        </p>
      </header>

      {/* Grid Layout for Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuresData.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}

export default PlatformFeatures;
