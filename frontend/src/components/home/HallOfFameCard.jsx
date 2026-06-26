function HallOfFameCard({ name, title, imageUrl, imageAlt, isOffset = false }) {
  return (
    <article className={`group cursor-pointer ${isOffset ? 'mt-0 md:mt-12' : ''}`}>
      <div className="w-full aspect-[3/4] relative overflow-hidden rounded-sm mb-4">
        <div
          className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
          style={{ backgroundImage: `url("${imageUrl}")` }}
          role="img"
          aria-label={imageAlt}
        ></div>
      </div>
      <div className="text-center">
        <h3 className="font-display text-[18px] text-on-surface mb-1 font-semibold">
          {name}
        </h3>
        <p className="font-body text-[10px] font-bold text-primary tracking-widest uppercase">
          {title}
        </p>
      </div>
    </article>
  );
}

export default HallOfFameCard;
