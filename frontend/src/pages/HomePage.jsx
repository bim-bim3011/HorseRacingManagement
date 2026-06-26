import HeroSection from '../components/home/HeroSection';
import UpcomingFestivals from '../components/home/UpcomingFestivals';
import HallOfFame from '../components/home/HallOfFame';

function HomePage() {
  return (
    <>
      <HeroSection />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-16 md:py-24 flex flex-col gap-24">
        <UpcomingFestivals />
        <HallOfFame />
      </main>
    </>
  );
}

export default HomePage;
