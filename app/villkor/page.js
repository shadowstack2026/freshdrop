import Link from "next/link";
import LegalPageLayout, { LegalSection } from "@/components/legal-page-layout";

export const metadata = {
  title: "Användarvillkor – FreshDrop",
  description: "Villkor för användning av FreshDrops tvätttjänst."
};

const TOC = [
  { id: "tjanstebeskrivning", label: "Tjänstebeskrivning" },
  { id: "betalning", label: "Betalning" },
  { id: "leverans", label: "Leverans" },
  { id: "avbokning", label: "Avbokning och återbetalning" },
  { id: "ansvar", label: "Ansvar" },
  { id: "ovrigt", label: "Övrigt" },
  { id: "kontakt-villkor", label: "Kontakt" }
];

export default function VillkorPage() {
  return (
    <LegalPageLayout
      title="Användarvillkor"
      description="Genom att använda FreshDrops tjänster godkänner du dessa villkor. Här finns allt från tjänstebeskrivning och betalning till leverans och ansvar."
      toc={TOC}
      currentPath="/villkor"
    >
      <LegalSection id="tjanstebeskrivning" title="Tjänstebeskrivning">
        <p>
          FreshDrop AB (&quot;FreshDrop&quot;, &quot;vi&quot;) erbjuder tvätttjänst där vi hämtar tvätt hos kunden, tvättar och levererar tillbaka. Tjänsten omfattar bokning via webb eller app, val av påsstorlek och eventuellt abonnemang enligt gällande prislista på webbplatsen.
        </p>
      </LegalSection>

      <LegalSection id="betalning" title="Betalning">
        <p>
          Betalning sker via säker betalningslösning (Stripe). Du godkänner Stripes villkor vid genomförd betalning. Priser anges i svenska kronor inklusive moms där tillämpligt. Vid abonnemang debiteras du enligt vald plan (t.ex. månadsvis) tills du avslutar. Vi förbehåller oss rätt att justera priser för framtida beställningar; löpande abonnemang meddelas i förväg.
        </p>
      </LegalSection>

      <LegalSection id="leverans" title="Leverans">
        <p>
          Vi strävar efter att leverera tvätt tillbaka inom <strong>48 timmar</strong> från upphämtning, i det tidsfönster du valt. Vid förseningar informerar vi dig och gör rimliga anpassningar. Leverans sker till angiven adress; kunden ansvarar för att någon kan ta emot eller att tvätten kan lämnas på ett säkert sätt enligt överenskommelse.
        </p>
      </LegalSection>

      <LegalSection id="avbokning" title="Avbokning och återbetalning">
        <p>
          Avbokning av en enskild upphämtning bör ske enligt de tidsregler som anges i bokningsflödet eller per e-post. Vid avbokning inom angiven tid kan eventuell förbetalning återbetalas eller krediteras enligt vår policy. Abonnemang kan avslutas med uppsägningstid enligt vad som gäller för din plan; återbetalning för redan debiterade perioder ges normalt inte.
        </p>
      </LegalSection>

      <LegalSection id="ansvar" title="Ansvar">
        <p>
          Vi utför tvätt med omsorg och enligt angivna standarder. Vid skador eller fel ska kunden rapportera detta inom rimlig tid (t.ex. 48 timmar efter leverans) för att vi ska kunna utreda. Vårt ansvar är i så fall begränsat till ersättning enligt gällande konsumentköplag eller avtal. Vi ansvarar inte för indirekta skador eller följdskador utöver vad lagen kräver.
        </p>
      </LegalSection>

      <LegalSection id="ovrigt" title="Övrigt">
        <p>
          Svensk lag tillämpas. Tvister söks lösa i minne; du kan även vända dig till Allmänna reklamationsnämnden (ARN). Ändringar av dessa villkor publiceras på webbplatsen; fortsatt användning efter ändring innebär godkännande.
        </p>
      </LegalSection>

      <LegalSection id="kontakt-villkor" title="Kontakt">
        <p>
          FreshDrop AB. Frågor om villkor eller tjänsten: <a href="mailto:hej@freshdrop.se">hej@freshdrop.se</a>. Se även vår <Link href="/integritet">integritetspolicy</Link> och <Link href="/cookies">cookiesida</Link>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
