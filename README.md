## FreshDrop

FreshDrop är en enkel tvättjänst där vi hämtar dina kläder hemma hos dig, tvättar och levererar tillbaka inom 48 timmar från upphämtning.

### Teknik

- **Next.js** med App Router (`app`-mapp, JavaScript)
- **Tailwind CSS** för styling
- **Supabase** för auth och databas (Postgres)
- **Stripe** för betalning (Checkout i testläge)
- **lucide-react** för ikoner

### Funktioner

- **Landing page** med information om tjänsten, pris (60 kr/kg) och call-to-actions
- **Bokningsflöde** på `/order/new` för att skapa en tvättbeställning (gäst eller inloggad)
- **Stripe Checkout** i testläge med riktig kassa
- **Dashboard** på `/dashboard` med lista över användarens beställningar
- **Orderdetalj** på `/orders/[id]`
- **Konto** på `/account` för att visa och uppdatera profil/adress
- **Admin** på `/admin` för att se och uppdatera alla beställningar (endast roll `admin`)
- **Gästbeställningar kopplas** till konto automatiskt när användaren loggar in/skapar konto med samma e-post

### Kom igång lokalt

1. **Klona repo och installera beroenden**

   ```bash
   npm install
   ```

2. **Skapa projekt i Supabase**

   - Skapa ett nytt Supabase-projekt.
   - Hämta `project URL` och `anon public key` från Supabase dashboard.
   - Skapa en `service role key` (finns under inställningar → API).

3. **Applicera databas-schema**

   - Öppna SQL-editor i Supabase.
   - Kör innehållet i `supabase/schema.sql`.
   - Kontrollera att tabellerna `profiles`, `orders` och `order_status_history` skapas och att RLS är aktiverat.

4. **Miljövariabler**

   - Kopiera `.env.example` till `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   - Fyll i värden:
     - `NEXT_PUBLIC_SUPABASE_URL` – projektets URL från Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon public key
     - `SUPABASE_SERVICE_ROLE_KEY` – service role key (används av Stripe-webhook)
     - `STRIPE_SECRET_KEY` – Stripe secret key (testläge)
     - `STRIPE_WEBHOOK_SECRET` – Stripe webhook secret (testläge)
     - `NEXT_PUBLIC_APP_URL` – bas-URL för appen, t.ex. `http://localhost:3000` lokalt

5. **Stripe-konfiguration (testläge)**

   - Skapa ett konto på Stripe (eller använd befintligt).
   - Gå till utvecklarpanelen och hämta test-nycklar:
     - `STRIPE_SECRET_KEY`
   - Skapa en webhook-endpoint som pekar på:
     - `https://din-app-url/api/stripe/webhook`
   - Kopiera webhook-secret till `STRIPE_WEBHOOK_SECRET`.
   - Använd Stripes test-kortnummer vid betalning (t.ex. 4242 4242 4242 4242).

6. **Starta utvecklingsserver**

   ```bash
   npm run dev
   ```

   Applikationen körs nu på `http://localhost:3000`.

### Roller och behörighet

- **profiles**
  - `id` kopplas till `auth.users.id`.
  - `role` är `user` som standard.
  - Sätt `role = 'admin'` manuellt i databasen för de användare som ska ha adminåtkomst.

- **orders**
  - Beställning kan skapas som gäst (utan `user_id`).
  - Inloggade användare får `user_id` satt på sina beställningar.
  - När en användare loggar in/konto skapas körs `/api/auth/claim-orders` som kopplar gästbeställningar (`user_id IS NULL` och `customer_email` matchar) till användarens `user_id`.

### Viktiga rutter

- **Publika sidor**
  - `/` – landing page
  - `/order/new` – bokningsflöde
  - `/login` – logga in
  - `/signup` – skapa konto
  - `/checkout/success` – tack-sida efter lyckad Stripe-betalning, uppdaterar ordern till `paid`
  - `/checkout/cancel` – sida när betalning avbryts

- **Skyddade sidor**
  - `/dashboard` – användarens beställningar (kräver inloggning)
  - `/orders/[id]` – detaljer för en specifik order (kräver inloggning)
  - `/account` – konto och adress (kräver inloggning)
  - `/admin` – adminpanel (kräver roll `admin`)

### API-routes

- `POST /api/orders/create` – skapar order och Stripe Checkout Session
- `GET /api/orders/[id]` – hämtar en order (autentiserad enligt RLS)
- `GET /api/admin/orders` – listar alla beställningar för admin
- `POST /api/admin/orders/[id]/status` – uppdaterar orderstatus (admin)
- `POST /api/auth/claim-orders` – kopplar gästbeställningar till inloggad användare
- `POST /api/stripe/webhook` – Stripe-webhook som markerar order som betald

### Datamodell (översikt)

- **profiles**
  - `id` (uuid, PK, auth.users.id)
  - `email`, `full_name`, `phone`
  - `address_line1`, `address_line2`, `postal_code`, `city`
  - `role` (`user` eller `admin`)

- **orders**
  - `id` (uuid, PK)
  - `user_id` (uuid, nullable, FK -> profiles.id)
  - `customer_email`, `customer_name`, `customer_phone`
  - `address_line1`, `address_line2`, `postal_code`, `city`
  - `pickup_date`, `pickup_window`
  - `estimated_weight_kg`, `price_per_kg` (60), `estimated_total_price`
  - `delivery_estimate_at`
  - `status` (t.ex. `MOTTAGEN`, `BOKAD`, `HÄMTAD`, `TVÄTTAS`, `PÅ_VÄG`, `LEVERERAD`, `AVBRUTEN`)
  - `payment_status` (`unpaid`, `paid` osv)
  - `stripe_checkout_session_id`

- **order_status_history** (valfri men inkluderad)
  - `order_id`, `status`, `note`, `created_at`

### Deploy till Vercel

1. Skapa ett nytt projekt på Vercel och koppla mot detta repo.
2. Sätt samma miljövariabler som i `.env.local` under projektets inställningar på Vercel.
3. Deploya.
4. Uppdatera `NEXT_PUBLIC_APP_URL` till din produktionsdomän.
5. I Stripe:
   - Lägg till webhook mot produktionsdomänen (`/api/stripe/webhook`).
   - Använd live-nycklar om du går över till skarpt läge.

### Övrigt

- Alla texter i UI är på svenska.
- Ingen dark mode är aktiverad, layouten är ljus och minimalistisk med ljusblå accentfärg.
- Pris per kilo är fast satt till 60 kr/kg och används konsekvent i både UI och backend-logik.

