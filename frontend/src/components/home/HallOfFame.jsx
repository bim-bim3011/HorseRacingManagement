import HallOfFameCard from './HallOfFameCard';

const hallOfFameData = [
  {
    name: 'Lester Piggott',
    title: 'Legendary Jockey',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARoqZyXHeLThkfIfr54XVCs4ttc6Ywhultgd6XjnSw3_aBS-eyvKsB2heEVCN22TTtqhwPQrJGcyATXnWUQK4vTDXJTi0ycj6eklDeVL6tJf945XapitU6pBAGRKfI1ZkL8yJobqJy6dLOoAKwJSv58r0WzVpboC5cA9ywEnL7BS9Hpt5BiBPyjjggnykYrFNiwnj63Flm4KAajBpW4SZEa4qdpFfxlbqLIpwQ-nOWNrbA4NkV1pQYgpcXFiHvHnfIAf4fcyzmQmx-',
    imageAlt: 'Champion jockey in racing silks',
    isOffset: false,
  },
  {
    name: 'Frankel',
    title: 'Undefeated Champion',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDXQqWMyJ2FrxRJaI3tunt30mJPofN_69oY_BnpCTwZBXa0KNd2tPisd37UG1gj5EetQ3KMbK59g82loAmi4-gJfsW_-rC_KLC7_q2dsEqvlW4rpdK1Vpv98ulZn99xyo7pELZkdB_GIhrRYnFB_ctogmWPqFNpOY61wKvl7_tNjbyaPRgkQ69X-nEvBQmdQi8yYvX7YBOEScVXC88yaMoWC9_ec75thAtdF9e30HIoKgX1JMm-Xozj8Iro0VGlBmv8wMhFs6nYwmBR',
    imageAlt: 'Dark bay thoroughbred racehorse',
    isOffset: true,
  },
  {
    name: 'Sir Henry Cecil',
    title: 'Master Trainer',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDADG1WBLhMYwXAGcCnmmxcVSEGSJk1tSK7dyIl6mXE0KMRXdHouf-TeB2d7KqljsWbM0EFOYfy9RIcptrzQu5h-Jzr1u-u6tiV6Dy4QG0Dn-5p_ciF7MJ_RLSk7vnSgaiXfvz4DU1EtpBj0MoFAgYH7xgfHlnzg9v7ntAJ_o4DtvInjx-TsGBl9kfnqccUEA2sRLS69tD0DZtdF_BOtB3996wWuE5J2Ra9o31N715K7SuWiZOiCQ4IoNMME2QMlTh9UoTpwmHiKJIc',
    imageAlt: 'Experienced racehorse trainer at dawn',
    isOffset: false,
  },
  {
    name: 'Gold Cup',
    title: 'The Ultimate Prize',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDeR_jFJ33BwpIeb72bKpU23fik_7-YR4yAOnQjEJK4_VASDtqhEzgSIo5QghNrIv3PPXlBDcYfZSD7-vMd6KV0f9FRCXd5xdB9xvxc5xCNIZeMxArhpZXUA_t5u_9YBUEGVYvLcgeLwXZDKusndkk-gBBnS4NSruQ2__DoyXDesK1X0SK9GhCbWTUDP-sNHtTSictmi6_AMnGitd2zgxNyOYZ5jMu0uPTUrqL5Hyq4KByjy95blpWhZXYfXzEWA6FdvZSHhxKtvijw',
    imageAlt: 'Silver trophy chalice under spotlight',
    isOffset: true,
  },
];

function HallOfFame() {
  return (
    <section className="flex flex-col gap-10">
      {/* Centered Section Header */}
      <header className="text-center max-w-2xl mx-auto mb-4">
        <h2 className="font-display text-[36px] md:text-[48px] text-on-surface mb-4 font-bold">
          Hall of Fame
        </h2>
        <div className="h-px w-24 bg-primary mx-auto mb-6"></div>
        <p className="font-body text-body-md text-on-surface-variant">
          Celebrating the legends of the turf. Exceptional athletes whose
          achievements have shaped the history of the sport.
        </p>
      </header>

      {/* Portrait Grid with Staggered Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {hallOfFameData.map((item) => (
          <HallOfFameCard key={item.name} {...item} />
        ))}
      </div>
    </section>
  );
}

export default HallOfFame;
