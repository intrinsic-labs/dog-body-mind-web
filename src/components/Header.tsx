import TinifyImage from './TinifyImage';

const Header = () => {
  return (
    <header className="flex justify-between items-center w-full px-4 py-2 bg-background">
      <div>
        <TinifyImage src="/images/logo-alpha.png" alt="Dog Body Mind Logo" width={200} height={50} />
      </div>
      <div className="text-main-accent font-heading text-lg">
        LAN
      </div>
    </header>
  );
};

export default Header; 