// This root layout is minimal - middleware redirects to locale-specific routes
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
