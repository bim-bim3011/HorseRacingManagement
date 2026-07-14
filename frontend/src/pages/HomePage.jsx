import HeroSection from '../components/home/HeroSection';
import UpcomingTournaments from '../components/home/UpcomingTournaments';
import PlatformFeatures from '../components/home/PlatformFeatures';

function HomePage() {
  return (
    <>
      <HeroSection />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-16 md:py-24 flex flex-col gap-24">
        <UpcomingTournaments />
        <PlatformFeatures />
      </main>
    </>
  );
}

export default HomePage;
