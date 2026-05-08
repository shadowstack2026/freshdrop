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
  { id: "avbokning", label: "Avbeställning och ångerrätt" },
  { id: "integritet", label: "Integritet och personuppgifter" },
  { id: "ansvar", label: "Ansvar" },
  { id: "flackar", label: "Fläckar och fläckbehandling" },
  { id: "reklamation", label: "Reklamation" },
  { id: "pasar", label: "FreshDrop-påsar" },
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

      <LegalSection id="avbokning" title="Avbeställning och ångerrätt">
        <p>
          Kunden har rätt att avboka en beställning innan upphämtning. Avbokning som sker minst åtta
          (8) timmar före bokad upphämtningstid sker utan kostnad. Vid avbokning senare än åtta (8)
          timmar före bokad upphämtningstid förbehåller sig FreshDrop rätten att debitera en
          avbokningsavgift. Bokad upphämtningstid avser första tidpunkten inom det valda
          tidsintervallet.
        </p>
      </LegalSection>

      <LegalSection id="integritet" title="Integritet och personuppgifter">
        <p>
          När du använder FreshDrops tjänster behandlar vi personuppgifter för att kunna leverera
          tjänsten, hantera betalningar, support och säkerhet. Läs mer om vilka uppgifter vi
          samlar in, hur de används och dina rättigheter i vår{" "}
          <Link href="/integritet">integritetspolicy</Link>.
        </p>
        <p>
          Vi använder även cookies och liknande teknik för bland annat inloggning, funktionalitet
          och säkerhet. Mer information finns i vår <Link href="/cookies">cookiepolicy</Link>.
        </p>
      </LegalSection>

      <LegalSection id="ansvar" title="Ansvar">
        <p>
          Ansvar och risk för tvätten övergår till FreshDrop när ordern har hämtats upp från
          kunden. Ansvar och risk övergår tillbaka till kunden när tvätten har levererats till den
          adress eller plats som kunden angett vid beställning.
        </p>
        <p>
          Om kunden väljer kontaktlös upphämtning eller leverans utanför dörr ansvarar FreshDrop
          för tvätten från det att ordern hämtats upp tills den har placerats tillbaka på den
          angivna platsen vid leverans.
        </p>
        <p>
          FreshDrop arbetar med dokumenterad hantering av samtliga ordrar. Vid upphämtning kan
          tvätten vägas, fotograferas och förslutas i FreshDrops tvättpåse. Ytterligare
          dokumentation, inklusive vikt och bildmaterial, kan sparas vid hantering i FreshDrops
          lokaler.
        </p>
        <p>
          FreshDrops lokaler kan vara kameraövervakade för säkerhets-, kvalitets- och
          reklamationsändamål. Orderrelaterad dokumentation sparas i upp till trettio (30) dagar
          från leveransdatum och raderas därefter automatiskt.
        </p>
        <p>
          Vid händelser utanför FreshDrops kontroll — inklusive men inte begränsat till brand,
          vattenläckage, strömavbrott, strejk, myndighetsbeslut, naturhändelser, krig,
          leveransstörningar eller fel hos underleverantörer — ansvarar FreshDrop inte för
          förseningar, uteblivna leveranser eller skador som uppstår till följd av sådana
          omständigheter.
        </p>
      </LegalSection>

      <LegalSection id="flackar" title="Fläckar och fläckbehandling">
        <p>
          FreshDrop följer alltid plaggets angivna tvättråd samt använder professionella tvätt- och
          behandlingsmetoder.
        </p>
        <p>
          FreshDrop kan dock inte garantera att samtliga fläckar avlägsnas helt. Resultatet av
          fläckbehandling påverkas bland annat av:
        </p>
        <ul>
          <li>fläckens typ</li>
          <li>hur länge fläcken funnits</li>
          <li>materialets egenskaper</li>
          <li>tidigare behandlingar av plagget</li>
        </ul>
        <p>
          Vissa fläckar eller missfärgningar kan vara permanenta trots professionell behandling.
          FreshDrop rekommenderar kunder att informera om särskilt känsliga plagg eller svåra
          fläckar innan upphämtning.
        </p>
      </LegalSection>

      <LegalSection id="reklamation" title="Reklamation">
        <p>
          Om du är missnöjd skall klagomålet/reklamationen tillhandages FreshDrop inom skälig tid
          efter att tvätten har levererats tillbaka till dig – klagomål/reklamation som lämnas inom
          fyrtioåtta (48) timmar från återlämnande av tvätten och/eller plaggen/varorna är alltid
          inom skälig tid.
        </p>
        <p>
          Vid reklamation åligger det dig att lämna de defekta plaggen tillbaka till FreshDrop för
          bedömning av eventuella åtgärder.
        </p>
        <p>
          FreshDrop ansvarar ej för skador eller förlorade spännen, knappar, skärp, pärlor eller
          annan dekoration som tillhör ett plagg och/eller varor.
        </p>
        <p>FreshDrop ansvarar ej för lösa föremål som av misstag har skickats med tvätten.</p>
        <p>
          FreshDrop tar ej ansvar för om viskos/silkes, tencel och bambu mattor krymper marginellt
          efter en tvätt. Dessa tvättas på egen risk.
        </p>
        <p>
          FreshDrop ansvarar således inte för direkta eller indirekta skador inkluderat men inte
          begränsat till utebliven vinst, förlorat anseende, eller avbrott i näringsverksamhet.
        </p>
        <p>
          För att ersättning för skador eller åverkan på tvätten skall ersättas åligger det dig att
          uppvisa underlag för värdet på tvätten. För det fall att FreshDrop skall ersätta
          totalförstörd tvätt kommer hänsyn till värdeminskning att tas. Totalförstörd eller saknad
          tvätt kommer således ersättas med hänsyn till plaggets värde i nytt tillstånd, vilket
          skick det befann sig i vid inlämning och plaggets uppskattade livslängd.
        </p>
        <p>
          För det fall det angivna värdet på tvätten eller enskilda plagg/varor angivits till ett
          lägre än det faktiska värdet ansvarar FreshDrop inte för eventuella skador eller åverkan
          på tvätten och/eller enskilda plagg/varor.
        </p>
        <p>
          FreshDrop sparar orderrelaterad dokumentation i upp till trettio (30) dagar från
          leveransdatum för kvalitetssäkring och reklamationshantering. Reklamationer som inkommer
          efter denna period kan inte behandlas.
        </p>
      </LegalSection>

      <LegalSection id="pasar" title="FreshDrop-påsar">
        <p>Vid första beställningen erhåller kunden:</p>
        <ul>
          <li>en standardpåse</li>
          <li>samt en större FreshDrop-påse</li>
        </ul>
        <p>utan extra kostnad.</p>
        <p>
          Påsarna tillhör FreshDrop och är avsedda för återanvändning vid framtida beställningar.
          Vid förlust, skada eller utebliven återlämning förbehåller sig FreshDrop rätten att
          debitera en ersättningsavgift.
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
