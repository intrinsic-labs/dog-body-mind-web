import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="flex flex-col items-center text-center gap-6 w-full px-4 py-8">
      <h1 className="text-blue font-rubik text-2xl font-medium uppercase leading-8">
        LOREM IPSUM DOLOR SIT AMET CONSECTETUR
      </h1>
      <Link href="/blog" className="bg-main-accent text-white font-sans font-medium uppercase px-4 py-2 rounded-md">
        View Blog
      </Link>
    </section>
  );
};

export default HeroSection; 