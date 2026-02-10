# Google OAuth – konfiguration i Supabase

Felet **"Error 401: invalid_client" / "The OAuth client was not found"** betyder att Google inte får rätt (eller några) klientuppgifter. Med Supabase Auth ska dessa anges i **Supabase Dashboard**, inte i din app.

## Steg 1: Supabase Dashboard → Google-provider

1. Gå till [Supabase Dashboard](https://supabase.com/dashboard) och välj ditt projekt.
2. **Authentication** → **Providers** → **Google**.
3. Sätt **Enable Sign in with Google** till på.
4. Fyll i (från Google Cloud Console → din OAuth-klient):
   - **Client ID (for OAuth):** ditt Client ID (t.ex. `….apps.googleusercontent.com`)
   - **Client Secret (for OAuth):** din Client Secret (t.ex. `GOCSPX-…`)
   - *(Lägg dessa endast i Supabase Dashboard – inte i koden eller i .env.)*
5. Spara (Save).

## Steg 2: Redirect-URL:er i Supabase

1. **Authentication** → **URL Configuration**.
2. **Site URL:**  
   - Produktion: `https://freshdrop-snowy.vercel.app`  
   - (eller den URL du använder som huvudsida.)
3. Under **Redirect URLs**, lägg till:
   - `https://freshdrop-snowy.vercel.app/auth/callback`
   - `http://localhost:3001/auth/callback`
4. Spara.

## Steg 3: Google Cloud (redan gjort)

I Google Cloud Console ska du ha:

- **Authorized JavaScript origins:**  
  `https://freshdrop-snowy.vercel.app`, `http://localhost:3001`
- **Authorized redirect URI:**  
  `https://huuheyuqbmrpdiwoilfc.supabase.co/auth/v1/callback`  
  (din projekt-specifika Supabase Auth-URL – kontrollera att den stämmer under Supabase → Project Settings → API.)

## Säkerhet

- **Lägg inte** Client ID eller Client Secret i din repo eller i `.env` som committas.
- De ska bara finnas i Supabase Dashboard (Providers → Google).

## Säkerställ att inga hemligheter läcker

- [ ] **Supabase:** Client ID och Client Secret finns *endast* under Authentication → Providers → Google (inte i koden).
- [ ] **.gitignore:** Filer som `.env`, `.env.local` och `.env*.local` är listade (så de committas aldrig).
- [ ] **Repo:** Kör `git status` – ingen fil som `.env` eller `.env.local` ska vara staged/committad.
- [ ] **Kod:** Det finns inga strängar med ditt riktiga Client ID eller Client Secret i `.js`/`.ts`/andra källfiler.

Efter att du sparat i Supabase kan det ta några minuter innan ändringarna slår igenom. Testa sedan "Fortsätt med Google" igen.

---

## Varför får jag fortfarande "401: invalid_client"?

Det är **sällan bara väntetid**. Felet betyder att Google får ett Client ID den inte känner igen (eller inget alls). Gå igenom detta:

### 1. Samma OAuth-klient överallt

- I **Google Cloud Console** → APIs & Services → **Credentials** → öppna din **Web client** (OAuth 2.0 Client ID).
- Den här klienten ska ha **Authorized redirect URI:**  
  `https://<DITT-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback`
- **Samma** klientens **Client ID** (som slutar på `.apps.googleusercontent.com`) ska stå i **Supabase** under Authentication → Providers → Google. Om du har flera OAuth-klienter i Google – använd alltid den där du la in Supabase-redirect-URL:en.

### 2. Supabase-projektets URL stämmer

- Supabase Dashboard → **Project Settings** (kugghjulet) → **API**.
- Under **Project URL** står något i stil med `https://huuheyuqbmrpdiwoilfc.supabase.co`.
- **Exakt den** domänen + `/auth/v1/callback` ska finnas som **en** av "Authorized redirect URIs" i Google (utan extra mellanslag eller `/` i slutet utom det som behövs).

### 3. Inga extra mellanslag i Supabase

- Under Authentication → Providers → Google: kopiera **Client ID** och **Client Secret** på nytt från Google Cloud (klistra in igen), spara, och testa igen. Undvik mellanslag i början eller slutet.

### 4. Vänta några minuter (om du just sparade)

- Google skriver att inställningar kan ta "5 minutes to a few hours". Om du **precis** sparade i Supabase eller i Google, vänta 5–10 minuter och testa igen.
- Om felet kvarstår efter det är det nästan alltid punkt 1 eller 2 ovan som är fel.
