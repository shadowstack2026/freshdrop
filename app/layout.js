import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import NavBar from "@/components/nav-bar";
import Footer from "@/components/footer";

export const metadata = {
  title: "FreshDrop – Tvätt hämtad och levererad inom 48 timmar",
  description:
    "FreshDrop hämtar dina kläder hemma hos dig, tvättar och levererar tillbaka inom 48 timmar. Enkel bokning, fast pris per påse."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body className="min-h-screen flex flex-col bg-slate-50">
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
