import { Link } from 'react-router-dom';

function Footer() {
  const footerLinks = [
    { label: 'Contact', to: '#' },
    { label: 'About Us', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ];

  return (
    <footer className="bg-inverse-surface w-full mt-12 border-t-[8px] border-primary">
      <div className="w-full py-8 px-4 md:px-10 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-8">
        {/* Links Area */}
        <nav className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="font-body text-label-caps font-bold text-surface hover:text-primary-fixed hover:opacity-80 transition-all duration-300 tracking-[0.1em] uppercase no-underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <div className="text-center md:text-right">
          <span className="font-body text-body-md block mb-2 text-surface">
            © 2026 the elite club. All rights reserved.
          </span>
          {/* Brand Anchor */}
          <span className="font-display text-[16px] text-primary-fixed block uppercase tracking-widest font-semibold">
            The elite club
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
