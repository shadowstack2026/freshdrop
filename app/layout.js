import "./globals.css";
import NavBar from "@/components/nav-bar";

export const metadata = {
  title: "FreshDrop – Tvätt hämtad och levererad inom 48 timmar",
  description:
    "FreshDrop hämtar dina kläder hemma hos dig, tvättar och levererar tillbaka inom 48 timmar. Enkel bokning, tydligt pris: 60 kr/kg."
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body className="min-h-screen flex flex-col bg-slate-50">
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t bg-white py-6 mt-12 shadow-sm">
          <div className="container flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} FreshDrop.</span>
            <span>Tvätt hämtad, tvättad och levererad inom 48 timmar.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
