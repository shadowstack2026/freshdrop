import Link from "next/link";
import LegalPageLayout, { LegalSection } from "@/components/legal-page-layout";

export const metadata = {
  title: "Integritetspolicy – FreshDrop",
  description: "Så hanterar FreshDrop dina personuppgifter och integritet."
};

const TOC = [
  { id: "integritetspolicy", label: "Integritetspolicy" },
  { id: "vilka-uppgifter", label: "Vilka uppgifter vi samlar in" },
  { id: "hur-vi-anvander", label: "Hur vi använder dina uppgifter" },
  { id: "dokumentation-sakerhet", label: "Dokumentation och säker hantering" },
  { id: "foremal", label: "Föremål kvarlämnade i plagg" },
  { id: "pasar", label: "FreshDrop-påsar" },
  { id: "delning-av-data", label: "Delning av data" },
  { id: "lagring", label: "Lagring av uppgifter" },
  { id: "cookies-integritet", label: "Cookies" },
  { id: "dina-rattigheter", label: "Dina rättigheter" },
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
          Denna integritetspolicy beskriver hur FreshDrop AB, org.nr 559000-0000, samlar in,
          använder och skyddar dina personuppgifter när du använder våra tjänster, vår webbplats
          och relaterade tjänster.
        </p>
        <p>Genom att använda FreshDrops tjänster accepterar du denna policy.</p>
      </LegalSection>

      <LegalSection id="vilka-uppgifter" title="Vilka uppgifter vi samlar in">
        <p>Vi kan samla in följande kategorier av uppgifter:</p>
        <ul>
          <li>
            <strong>Identitets- och kontaktuppgifter</strong>
            <ul>
              <li>namn</li>
              <li>e-postadress</li>
              <li>telefonnummer</li>
              <li>leveransadress</li>
            </ul>
          </li>
          <li>
            <strong>Boknings- och betalningsuppgifter</strong>
            <ul>
              <li>bokningshistorik</li>
              <li>valda tider</li>
              <li>orderinformation</li>
              <li>betalningsmetod</li>
              <li>transaktionsdata</li>
            </ul>
            <p className="mt-2">
              Betalningar behandlas via Stripe. FreshDrop lagrar aldrig fullständiga kortuppgifter.
            </p>
          </li>
          <li>
            <strong>Konto- och användardata</strong>
            <ul>
              <li>krypterade lösenord</li>
              <li>inloggningshistorik</li>
              <li>användarpreferenser</li>
              <li>abonnemangsuppgifter</li>
            </ul>
          </li>
          <li>
            <strong>Teknisk information</strong>
            <ul>
              <li>IP-adress</li>
              <li>enhetsinformation</li>
              <li>webbläsardata</li>
              <li>loggdata</li>
              <li>cookies och sessionsinformation</li>
            </ul>
          </li>
          <li>
            <strong>Order- och säkerhetsdokumentation</strong>
            <p className="mt-2">
              För att säkerställa trygg hantering av kunders tvätt kan FreshDrop samla in och lagra:
            </p>
            <ul>
              <li>bilddokumentation av tvättpåsar och ordrar</li>
              <li>dokumentation av ordervikt</li>
              <li>tidsstämplar vid upphämtning och leverans</li>
              <li>dokumentation kopplad till reklamationer</li>
              <li>kameraövervakningsmaterial från våra lokaler</li>
            </ul>
            <p className="mt-2">Dokumentationen används endast för:</p>
            <ul>
              <li>kvalitetssäkring</li>
              <li>säkerhet</li>
              <li>reklamationshantering</li>
              <li>förebyggande av bedrägerier och felhantering</li>
            </ul>
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="hur-vi-anvander" title="Hur vi använder dina uppgifter">
        <p>Vi använder personuppgifter för att:</p>
        <ul>
          <li>leverera och administrera FreshDrops tjänster</li>
          <li>hantera upphämtning och leverans</li>
          <li>behandla betalningar</li>
          <li>kommunicera med kunder</li>
          <li>hantera support och reklamationer</li>
          <li>förbättra våra tjänster och vår säkerhet</li>
          <li>förebygga bedrägerier och felhantering</li>
          <li>uppfylla rättsliga skyldigheter enligt svensk lag</li>
        </ul>
        <p>Vi behandlar personuppgifter med stöd av:</p>
        <ul>
          <li>avtal (för att kunna utföra tjänsten)</li>
          <li>rättslig förpliktelse</li>
          <li>berättigat intresse för drift, säkerhet och kvalitetskontroll</li>
        </ul>
      </LegalSection>

      <LegalSection id="dokumentation-sakerhet" title="Dokumentation och säker hantering">
        <p>
          FreshDrop arbetar med dokumenterad hantering för att skapa trygghet och spårbarhet genom
          hela tvättprocessen.
        </p>
        <p>Vid upphämtning kan följande ske:</p>
        <ul>
          <li>kunden placerar tvätten i FreshDrops tvättpåse</li>
          <li>påsen försluts direkt vid upphämtning</li>
          <li>ordern vägs</li>
          <li>bilddokumentation sparas</li>
        </ul>
        <p>Vid hantering i FreshDrops lokaler kan:</p>
        <ul>
          <li>ordern vägas igen</li>
          <li>vikt och order dokumenteras</li>
          <li>ytterligare bilddokumentation sparas</li>
        </ul>
        <p>
          FreshDrops lokaler kan vara kameraövervakade för säkerhets- och kvalitetssyfte. All
          orderrelaterad dokumentation sparas i upp till 30 dagar från leveransdatum och raderas
          därefter automatiskt. Reklamationer måste inkomma inom denna period för att kunna
          behandlas.
        </p>
      </LegalSection>

      <LegalSection id="foremal" title="Föremål kvarlämnade i plagg">
        <p>Kunden ansvarar för att tömma samtliga fickor innan upphämtning.</p>
        <p>FreshDrop ansvarar inte för:</p>
        <ul>
          <li>kontanter</li>
          <li>smycken</li>
          <li>nycklar</li>
          <li>elektronik</li>
          <li>dokument</li>
          <li>eller andra föremål som lämnats kvar i plagg eller tvättpåsar.</li>
        </ul>
      </LegalSection>

      <LegalSection id="pasar" title="FreshDrop-påsar">
        <p>Vid första beställningen erhåller kunden:</p>
        <ul>
          <li>en standardpåse</li>
          <li>samt en större tvättpåse</li>
        </ul>
        <p>utan extra kostnad.</p>
        <p>
          Påsarna tillhör FreshDrop och är avsedda för återanvändning vid framtida beställningar.
          Vid förlust, skada eller utebliven återlämning har FreshDrop rätt att debitera en
          ersättningsavgift.
        </p>
      </LegalSection>

      <LegalSection id="delning-av-data" title="Delning av data">
        <p>
          FreshDrop delar endast personuppgifter med tredje part när det krävs för att
          tillhandahålla tjänsten. Detta kan inkludera:
        </p>
        <ul>
          <li>betalningsleverantörer såsom Stripe</li>
          <li>hosting- och molntjänster såsom Supabase och Vercel</li>
          <li>logistik- och kommunikationstjänster</li>
          <li>myndigheter när lag kräver det</li>
        </ul>
        <p>Samtliga samarbetspartners behandlar data enligt tillämpliga dataskyddslagar.</p>
        <p>FreshDrop säljer aldrig personuppgifter till tredje part.</p>
      </LegalSection>

      <LegalSection id="lagring" title="Lagring av uppgifter">
        <p>Vi sparar personuppgifter endast så länge det är nödvändigt för:</p>
        <ul>
          <li>tjänstens utförande</li>
          <li>reklamationer</li>
          <li>bokföringskrav</li>
          <li>rättsliga skyldigheter</li>
          <li>säkerhets- och kvalitetsarbete</li>
        </ul>
        <p>Orderrelaterad dokumentation såsom bilder och viktdata sparas normalt i högst 30 dagar.</p>
      </LegalSection>

      <LegalSection id="cookies-integritet" title="Cookies">
        <p>
          FreshDrop använder cookies och liknande teknik för:
        </p>
        <ul>
          <li>inloggning och sessionshantering</li>
          <li>webbplatsfunktionalitet</li>
          <li>säkerhet</li>
          <li>analys och förbättring av tjänsten</li>
        </ul>
        <p>
          Mer information finns i vår <Link href="/cookies">cookiepolicy</Link>.
        </p>
      </LegalSection>

      <LegalSection id="dina-rattigheter" title="Dina rättigheter">
        <p>Du har rätt att:</p>
        <ul>
          <li>begära utdrag av dina personuppgifter</li>
          <li>få felaktiga uppgifter rättade</li>
          <li>begära radering av uppgifter</li>
          <li>invända mot viss behandling</li>
          <li>begränsa behandling</li>
          <li>lämna klagomål till Integritetsskyddsmyndigheten (IMY)</li>
        </ul>
      </LegalSection>

      <LegalSection id="kontakt-integritet" title="Kontakt">
        <p>
          FreshDrop AB
          <br />
          Org.nr: 559000-0000
          <br />
          E-post: <a href="mailto:hej@freshdrop.se">hej@freshdrop.se</a>
          <br />
          Webbplats:{" "}
          <a href="https://www.freshdrop.se" target="_blank" rel="noreferrer">
            www.freshdrop.se
          </a>
        </p>
        <p>
          För frågor kring personuppgifter eller denna policy, kontakta oss via e-post ovan. Du har
          rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY).
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
