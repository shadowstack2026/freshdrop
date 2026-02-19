import Link from "next/link";
import LegalPageLayout, { LegalSection } from "@/components/legal-page-layout";

export const metadata = {
  title: "Cookies – FreshDrop",
  description: "Hur FreshDrop använder cookies på webbplatsen."
};

const TOC = [
  { id: "vad-ar-cookies", label: "Vad cookies är" },
  { id: "hur-vi-anvander-cookies", label: "Hur vi använder cookies" },
  { id: "tredjepart", label: "Tredjepart (Stripe m.fl.)" },
  { id: "hur-man-stanger-av", label: "Hur man stänger av cookies" },
  { id: "kontakt-cookies", label: "Kontakt" }
];

export default function CookiesPage() {
  return (
    <LegalPageLayout
      title="Cookies"
      description="Denna sida beskriver hur vi använder cookies på FreshDrops webbplats – från nödvändiga cookies till analys och tredjepartstjänster."
      toc={TOC}
      currentPath="/cookies"
    >
      <LegalSection id="vad-ar-cookies" title="Vad cookies är">
        <p>
          Cookies är små textfiler som webbplatsen eller tredje part lagrar i din enhet (dator, surfplatta eller telefon) när du besöker vår webbplats. De används för att webbplatsen ska fungera korrekt, komma ihåg dina val och i vissa fall för statistik och marknadsföring. Cookies kan vara &quot;förstaparts&quot; (satta av FreshDrop) eller &quot;tredjeparts&quot; (satta av externa tjänster vi använder).
        </p>
      </LegalSection>

      <LegalSection id="hur-vi-anvander-cookies" title="Hur vi använder cookies">
        <p>Vi använder cookies för följande ändamål:</p>
        <ul>
          <li><strong>Nödvändiga:</strong> för inloggning, sessionshantering och säkerhet så att tjänsten fungerar (t.ex. att du förblir inloggad och att formulär kan skickas). Dessa kan inte stängas av utan att funktionaliteten påverkas.</li>
          <li><strong>Funktionella:</strong> för att komma ihåg dina preferenser (t.ex. språk eller region) och förbättra användarupplevelsen.</li>
          <li><strong>Analys:</strong> för att förstå hur webbplatsen används (t.ex. antal besök, populära sidor) så att vi kan förbättra innehåll och tjänster. Vi strävar efter att använda analys på ett sätt som respekterar din integritet.</li>
        </ul>
      </LegalSection>

      <LegalSection id="tredjepart" title="Tredjepart (Stripe m.fl.)">
        <p>
          Vid betalning använder vi Stripe. Stripe kan sätta cookies för att säkert hantera betalningsflödet och bedrägeriskydd. Dessa styrs av Stripes egna principer. Läs mer på <a href="https://stripe.com/se/privacy" target="_blank" rel="noopener noreferrer">Stripe Privacy</a>. Vi kan även använda andra tekniska leverantörer (t.ex. för hosting eller analys) som i sin tur kan använda cookies enligt deras policyer.
        </p>
      </LegalSection>

      <LegalSection id="hur-man-stanger-av" title="Hur man stänger av cookies">
        <p>
          Du kan styra och radera cookies via din webbläsares inställningar. Vanligtvis hittar du detta under &quot;Integritet&quot;, &quot;Säkerhet&quot; eller &quot;Cookies&quot;. Om du blockerar eller raderar nödvändiga cookies kan vissa delar av webbplatsen (t.ex. inloggning eller bokning) sluta fungera. För mer information om cookies i allmänhet kan du besöka <a href="https://www.pts.se/sv/bransch/internet/integritet/" target="_blank" rel="noopener noreferrer">PTS</a> eller <a href="https://www.imy.se/" target="_blank" rel="noopener noreferrer">Integritetsskyddsmyndigheten</a>.
        </p>
      </LegalSection>

      <LegalSection id="kontakt-cookies" title="Kontakt">
        <p>
          Frågor om vår användning av cookies: <a href="mailto:hej@freshdrop.se">hej@freshdrop.se</a>. Se även vår <Link href="/integritet">integritetspolicy</Link> och <Link href="/villkor">användarvillkor</Link>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
