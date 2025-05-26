import "./globals.css";
import { rubik, helvetica } from "./fonts";

export const metadata = {
  title: "Dog Body Mind",
  description: "Dog Body Mind",
  keywords: ["Dog Body Mind", "Dog Body Mind", "Dog Body Mind"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`
          ${rubik.variable} 
          ${helvetica.variable} 
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}
