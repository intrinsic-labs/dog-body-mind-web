import localFont from "next/font/local";

export const rubik = localFont({
  src: [
    {
      path: "./Rubik/Rubik-VariableFont_wght.ttf",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "./Rubik/Rubik-Italic-VariableFont_wght.ttf",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-rubik",
  display: "swap",
});

export const helvetica = localFont({
  src: [
    {
      path: "./Helvetica/Helvetica.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Helvetica/Helvetica-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./Helvetica/Helvetica-Oblique.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./Helvetica/Helvetica-BoldOblique.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-helvetica",
  display: "swap",
});
