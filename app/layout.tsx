// app/layout.tsx
export const metadata = {
  title: 'VC Simulator',
  description: 'Simulate venture fund performance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
