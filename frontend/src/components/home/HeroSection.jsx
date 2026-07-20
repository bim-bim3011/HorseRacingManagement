import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <section className="w-full flex flex-col md:flex-row h-auto md:h-[614px] min-h-[500px]">
      {/* Left: Typography & Call to Action */}
      <div className="w-full md:w-1/2 bg-[#fdfbf8] flex flex-col justify-center items-center px-8 py-16 md:px-16 text-center relative overflow-hidden">
        {/* Decorative Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-primary/40"></div>
          <h2 className="font-body text-label-caps font-bold text-primary tracking-[0.2em] uppercase">
            Elite Management
          </h2>
          <div className="h-px w-12 bg-primary/40"></div>
        </div>

        <h1 className="font-display text-[40px] md:text-display-lg text-on-surface mb-8 max-w-lg leading-tight font-bold">
          Command the <br />
          <span className="italic text-primary">Season</span>
        </h1>

        <p className="font-body text-body-md text-on-surface-variant max-w-md mb-10">
          A distinguished platform for overseeing premier racing events,
          managing champion profiles, and accessing historic results with
          unparalleled precision.
        </p>


      </div>

      {/* Right: Atmospheric Image */}
      <div className="w-full md:w-1/2 h-64 md:h-full relative">
        <div
          className="bg-cover bg-center w-full h-full absolute inset-0"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAVscOP-4j56GQvmLeZI22Ib9OqpeDra9Fzm7_rL5l7UQd4CV4I9Xt3v0IuTz2Pty8bbyeYtnaF94mYybIRbD1JJlz6zo6FOZw7cASleMWvUxY522p9VEi3GIESWRd49W65arg11vP69Ljg1QI7RAqmS_QeMITSAs4T-e-bhuxL_V91m87hINRZdmde8oqzAwEyKLpXT6QMRczEs-DLufKQQXXS8M77ehrTreLPTdOaYicmf9EnZRcJWNiD8PIM1adua1rB5DRW8Omo")',
          }}
          role="img"
          aria-label="Pristine racecourse track under bright sky with VIP hospitality area"
        ></div>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
    </section>
  );
}

export default HeroSection;
