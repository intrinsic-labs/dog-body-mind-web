const HeroSection = () => {
  return (
    <section className="flex flex-col items-center text-center gap-6 w-full px-4 py-8">
      <h1 className="text-blue font-rubik text-2xl font-medium uppercase leading-8">
        LOREM IPSUM DOLOR SIT AMET CONSECTETUR
      </h1>
      <p className="text-foreground font-sans text-base leading-5 max-w-md">
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <div className="w-full max-w-2xl h-64 bg-gray-300 flex items-center justify-center text-gray-500">
        Video Placeholder
      </div>
    </section>
  );
};

export default HeroSection; 