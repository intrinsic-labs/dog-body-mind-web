import localFont from "next/font/local";

export const rubik = localFont({
  src: [
    {
      path: "./fonts/Rubik/Rubik-VariableFont_wght.ttf",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "./fonts/Rubik/Rubik-Italic-VariableFont_wght.ttf",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-rubik",
  display: "swap",
});
