/**
 * Skickar statusnotis till kund via e-post (Resend) eller SMS (Twilio).
 * Kräver env: RESEND_API_KEY + FRESHDROP_FROM_EMAIL (valfritt) för e-post, TWILIO_* för SMS.
 * Med Resend test/onboarding (from = onboarding@resend.dev) får man bara skicka till
 * samma konto; vi skickar då till RESEND_TEST_TO_EMAIL (t.ex. shadowstack2026@gmail.com).
 * Verifiera domän på resend.com/domains och sätt FRESHDROP_FROM_EMAIL för att skicka till valfria mottagare.
 */

const RESEND_TEST_TO_EMAIL = process.env.RESEND_TEST_TO_EMAIL || "shadowstack2026@gmail.com";

function isResendTestFrom(from) {
  return !from || from === "onboarding@resend.dev";
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

export async function sendOrderStatusNotification(order, status, channel) {
  const msg = STATUS_MESSAGES[status];
  if (!msg) return { sent: false, error: "Okänd status" };

  if (channel === "email") {
    const email = order.customer_email?.trim();
    if (!email) return { sent: false, error: "Kunden har ingen e-post" };
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FRESHDROP_FROM_EMAIL || "onboarding@resend.dev";
    if (!apiKey) return { sent: false, error: "RESEND_API_KEY saknas" };
    const toEmail = isResendTestFrom(fromEmail) ? RESEND_TEST_TO_EMAIL : email;
    const textBody = isResendTestFrom(fromEmail) && toEmail !== email
      ? `${msg.body}\n\n(Test: mailet var avsett för ${email})`
      : msg.body;
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: msg.subject,
        text: textBody
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
    const fromEmail = process.env.FRESHDROP_FROM_EMAIL || "onboarding@resend.dev";
    if (!apiKey) return { sent: false, error: "RESEND_API_KEY saknas" };
    const toEmail = isResendTestFrom(fromEmail) ? RESEND_TEST_TO_EMAIL : email;
    const textBody = isResendTestFrom(fromEmail) && toEmail !== email
      ? `${msg.body}\n\n(Test: mailet var avsett för ${email})`
      : msg.body;
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: msg.subject,
        text: textBody
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
