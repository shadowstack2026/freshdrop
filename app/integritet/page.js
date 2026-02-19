import Link from "next/link";
import LegalPageLayout, { LegalSection } from "@/components/legal-page-layout";

export const metadata = {
  title: "Integritetspolicy – FreshDrop",
  description: "Så hanterar FreshDrop dina personuppgifter och integritet."
};

const TOC = [
  { id: "integritetspolicy", label: "Integritetspolicy" },
  { id: "vilka-uppgifter", label: "Vilka uppgifter vi samlar in" },
  { id: "hur-vi-anvander", label: "Hur vi använder data" },
  { id: "delning-av-data", label: "Delning av data" },
  { id: "cookies-integritet", label: "Cookies" },
  { id: "kontakt-integritet", label: "Kontakt" }
];

export default function IntegritetPage() {
  return (
    <LegalPageLayout
      title="Integritetspolicy"
      description="Så samlar vi in, använder och skyddar dina personuppgifter när du använder FreshDrops tjänster. Vi följer tillämplig dataskyddslagstiftning, inklusive GDPR."
      toc={TOC}
      currentPath="/integritet"
    >
      <LegalSection id="integritetspolicy" title="Integritetspolicy">
        <p>
          Denna integritetspolicy beskriver hur FreshDrop AB, org.nr 559000-0000, samlar in, använder och skyddar dina personuppgifter när du använder våra tjänster (tvätt hämtad och levererad), webbplats och relaterade tjänster.
        </p>
      </LegalSection>

      <LegalSection id="vilka-uppgifter" title="Vilka uppgifter vi samlar in">
        <p>Vi kan samla in följande kategorier av uppgifter:</p>
        <ul>
          <li><strong>Identitets- och kontaktuppgifter:</strong> namn, e-postadress, telefonnummer och leveransadress.</li>
          <li><strong>Boknings- och betalningsuppgifter:</strong> bokningshistorik, valda tider, betalningsmetod och transaktionsdata (via Stripe; vi lagrar inte kortnummer).</li>
          <li><strong>Konto- och användardata:</strong> lösenord (krypterat), inloggningshistorik och preferenser kopplade till ditt konto.</li>
          <li><strong>Tekniska data:</strong> IP-adress, enhetsinformation och loggdata vid användning av webbplatsen (se även Cookies).</li>
        </ul>
      </LegalSection>

      <LegalSection id="hur-vi-anvander" title="Hur vi använder data">
        <p>Vi använder dina uppgifter för att:</p>
        <ul>
          <li>Leverera och administrera tvätttjänsten (upphämtning, leverans, fakturering).</li>
          <li>Hantera ditt konto, bokningar och eventuella abonnemang.</li>
          <li>Processa betalningar via Stripe enligt deras villkor.</li>
          <li>Kommunicera med dig (bekräftelser, påminnelser, kundservice).</li>
          <li>Förbättra våra tjänster, webbplats och säkerhet.</li>
          <li>Uppfylla lagkrav (t.ex. bokföring, skatter).</li>
        </ul>
        <p>Vi förlitar oss på avtal (tjänsteutförande), rättslig förpliktelse och i vissa fall legitima intressen för drift och förbättring.</p>
      </LegalSection>

      <LegalSection id="delning-av-data" title="Delning av data">
        <p>Vi delar inte dina personuppgifter med tredje part utöver vad som behövs för tjänsten:</p>
        <ul>
          <li><strong>Betalningsleverantör (Stripe):</strong> för att processa betalningar. Stripe har egna integritetspolicyer och uppfyller höga säkerhetskrav.</li>
          <li><strong>Molntjänster och hosting:</strong> för att driva webbplats och databas (t.ex. Supabase, Vercel) enligt avtal med dataskydd.</li>
          <li><strong>Myndigheter:</strong> om lag kräver det.</li>
        </ul>
        <p>Vi säljer inte dina uppgifter till tredje part.</p>
      </LegalSection>

      <LegalSection id="cookies-integritet" title="Cookies">
        <p>
          Vi använder cookies och liknande teknik enligt vår <Link href="/cookies">cookiesida</Link>. Detta inkluderar nödvändiga cookies för inloggning och sessioner samt, vid behov, analys för att förbättra webbplatsen.
        </p>
      </LegalSection>

      <LegalSection id="kontakt-integritet" title="Kontakt">
        <p>
          För frågor om denna policy eller dina personuppgifter (åtkomst, rättelse, radering, invändning), kontakta oss på <a href="mailto:hej@freshdrop.se">hej@freshdrop.se</a>. Du har rätt att inge klagan till Integritetsskyddsmyndigheten.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
