/**
 * Skickar statusnotis till kund via e-post (Resend) eller SMS (Twilio).
 * E-post kräver: RESEND_API_KEY + avsändaradress (FRESHDROP_FROM_EMAIL eller RESEND_FROM_EMAIL, verifierad domän).
 * SMS kräver: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.
 */

/** Avsändaradress för e-post – verifierad domän (resend.com/domains). Stöd: FRESHDROP_FROM_EMAIL, RESEND_FROM_EMAIL, FROM_EMAIL. Default: kontakt@freshdrop.se. */
function getVerifiedFromEmail() {
  const raw =
    process.env.FRESHDROP_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    "";
  const from = String(raw).replace(/^["'\s]+|["'\s]+$/g, "").trim();
  if (from === "onboarding@resend.dev") return null;
  return from || "kontakt@freshdrop.se";
}

const STATUS_MESSAGES = {
  TVÄTTAS: {
    subject: "Din tvätt tvättas nu – FreshDrop",
    body: "Hej! Din tvätt tvättas nu. Vi återkommer när den är klar. / FreshDrop",
    sms: "Din tvätt tvättas nu. / FreshDrop"
  },
  PÅ_VÄG: {
    subject: "Din tvätt är på väg – FreshDrop",
    body: "Hej! Din tvätt är på väg till dig. / FreshDrop",
    sms: "Din tvätt är på väg till dig. / FreshDrop"
  },
  LEVERERAD: {
    subject: "Din tvätt har levererats – FreshDrop",
    body: "Hej! Din tvätt har levererats. Tack för att du använder FreshDrop! / FreshDrop",
    sms: "Din tvätt har levererats. Tack! / FreshDrop"
  }
};

const ORDER_CONFIRMATION = {
  subject: "Tack för din beställning – FreshDrop",
  body: "Hej!\n\nTack för din beställning hos oss. Vi har mottagit din bokning och återkommer med mer information innan upphämtning och leverans.\n\nMed vänliga hälsningar,\nFreshDrop"
};

export async function sendOrderStatusNotification(order, status, channel) {
  const msg = STATUS_MESSAGES[status];
  if (!msg) return { sent: false, error: "Okänd status" };

  if (channel === "email") {
    const email = order.customer_email?.trim();
    if (!email) return { sent: false, error: "Kunden har ingen e-post" };
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { sent: false, error: "RESEND_API_KEY saknas" };
    const fromEmail = getVerifiedFromEmail();
    if (!fromEmail) {
      return {
        sent: false,
        error:
          "Avsändaradress saknas. Sätt FRESHDROP_FROM_EMAIL (t.ex. noreply@freshdrop.se) i .env.local efter verifiering på resend.com/domains."
      };
    }
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: msg.subject,
        text: msg.body
      });
      if (error) return { sent: false, error: error.message };
      return { sent: true };
    } catch (e) {
      return { sent: false, error: e.message || "Kunde inte skicka e-post" };
    }
  }

  if (channel === "sms") {
    const phone = order.customer_phone?.trim();
    if (!phone) return { sent: false, error: "Kunden har inget telefonnummer" };
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    if (!sid || !token || !fromNumber) {
      return { sent: false, error: "Twilio saknas (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER)" };
    }
    try {
      const twilio = (await import("twilio")).default;
      const client = twilio(sid, token);
      const to = phone.startsWith("+") ? phone : `+46${phone.replace(/^0/, "")}`;
      await client.messages.create({ body: msg.sms, from: fromNumber, to });
      return { sent: true };
    } catch (e) {
      return { sent: false, error: e.message || "Kunde inte skicka SMS" };
    }
  }

  return { sent: false, error: "Välj e-post eller SMS" };
}

/**
 * Skickar statusnotis till angiven e-post eller telefon (t.ex. gäst utan kopplad order).
 * contact = { email?: string, phone?: string }, channel = "email" | "sms".
 */
export async function sendStatusNotificationToContact(contact, status, channel) {
  const msg = STATUS_MESSAGES[status];
  if (!msg) return { sent: false, error: "Okänd status" };

  const email = contact?.email?.trim();
  const phone = contact?.phone?.trim();

  if (channel === "email") {
    if (!email) return { sent: false, error: "Ingen e-post angiven" };
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { sent: false, error: "RESEND_API_KEY saknas" };
    const fromEmail = getVerifiedFromEmail();
    if (!fromEmail) {
      return {
        sent: false,
        error:
          "Avsändaradress saknas. Sätt FRESHDROP_FROM_EMAIL (t.ex. noreply@freshdrop.se) i .env.local efter verifiering på resend.com/domains."
      };
    }
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: msg.subject,
        text: msg.body
      });
      if (error) return { sent: false, error: error.message };
      return { sent: true };
    } catch (e) {
      return { sent: false, error: e.message || "Kunde inte skicka e-post" };
    }
  }

  if (channel === "sms") {
    if (!phone) return { sent: false, error: "Inget telefonnummer angivet" };
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    if (!sid || !token || !fromNumber) {
      return { sent: false, error: "Twilio saknas (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER)" };
    }
    try {
      const twilio = (await import("twilio")).default;
      const client = twilio(sid, token);
      const to = phone.startsWith("+") ? phone : `+46${phone.replace(/^0/, "")}`;
      await client.messages.create({ body: msg.sms, from: fromNumber, to });
      return { sent: true };
    } catch (e) {
      return { sent: false, error: e.message || "Kunde inte skicka SMS" };
    }
  }

  return { sent: false, error: "Välj e-post eller SMS" };
}

/**
 * Skickar beställningsbekräftelse via e-post (Resend).
 * Kräver verifierad avsändardomän (FRESHDROP_FROM_EMAIL eller RESEND_FROM_EMAIL, t.ex. noreply@freshdrop.se).
 * orderOrGuest = { customer_email } (order) eller { email } (gäst).
 */
export async function sendOrderConfirmationEmail(orderOrGuest) {
  const email = (orderOrGuest.customer_email || orderOrGuest.email || "").trim();
  if (!email) return { sent: false, error: "Ingen e-post angiven" };
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, error: "RESEND_API_KEY saknas" };
  const fromEmail = getVerifiedFromEmail();
  if (!fromEmail) {
    return {
      sent: false,
      error:
        "Avsändaradress saknas. Sätt FRESHDROP_FROM_EMAIL (t.ex. noreply@freshdrop.se) i .env.local efter verifiering på resend.com/domains."
    };
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: ORDER_CONFIRMATION.subject,
      text: ORDER_CONFIRMATION.body
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e.message || "Kunde inte skicka e-post" };
  }
}
