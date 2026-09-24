import "./globals.css";

export const metadata = {
  title: "PlayMart — Top Up Game & Produk Digital",
  description: "PlayMart demo marketplace top up game dan produk digital.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
