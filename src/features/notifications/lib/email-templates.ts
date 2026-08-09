import { siteConfig } from "@/config/site";

type Payload = Record<string, unknown>;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrap(body: string) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4fbfb;font-family:Arial,Helvetica,sans-serif;color:#4a4a4c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4fbfb;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #d7ecee;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#59C9D5;font-weight:700;">
                ${escapeHtml(siteConfig.practiceName)}
              </p>
              ${body}
              <p style="margin:28px 0 0;font-size:12px;line-height:1.5;color:#7a7a7c;">
                ${escapeHtml(siteConfig.address)} · ${escapeHtml(siteConfig.phoneDisplay)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function cta(href: string, label: string) {
  return `<p style="margin:24px 0 0;">
    <a href="${escapeHtml(href)}" style="display:inline-block;background:#59C9D5;color:#1a1a1a;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;">
      ${escapeHtml(label)}
    </a>
  </p>`;
}

export function renderEmailTemplate(
  templateKey: string,
  payload: Payload,
): { subject: string; html: string } {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? siteConfig.url).replace(/\/$/, "");
  const magicLink = typeof payload.magicLink === "string" ? payload.magicLink : null;
  const firstName = typeof payload.firstName === "string" ? payload.firstName : "there";
  const startsAt =
    typeof payload.startsAt === "string"
      ? new Date(payload.startsAt).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })
      : null;

  if (templateKey === "portal.invite") {
    const link = magicLink ?? `${appUrl}/login`;
    return {
      subject: "Complete your Fouza Physiotherapy forms before your visit",
      html: wrap(`
        <h1 style="margin:0 0 12px;font-size:22px;color:#3a3a3c;">Hi ${escapeHtml(firstName)},</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          Your patient portal is ready. Please complete your informed consent and intake forms
          before your appointment.
        </p>
        ${cta(link, "Open forms securely")}
        <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#7a7a7c;">
          This secure link signs you in automatically. If it expires, use Sign in on our website
          with the same email and reset your password if needed.
        </p>
      `),
    };
  }

  if (templateKey === "booking.confirmed") {
    const appointmentsHref = `${appUrl}/portal/appointments`;
    return {
      subject: "Appointment confirmed — Fouza Physiotherapy",
      html: wrap(`
        <h1 style="margin:0 0 12px;font-size:22px;color:#3a3a3c;">You're booked in</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          Hi ${escapeHtml(firstName)}, thank you for booking with ${escapeHtml(siteConfig.practiceName)}.
        </p>
        ${
          startsAt
            ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;"><strong>When:</strong> ${escapeHtml(startsAt)}</p>`
            : ""
        }
        <p style="margin:16px 0 0;font-size:15px;line-height:1.6;">
          <strong>Where:</strong> ${escapeHtml(siteConfig.address)}
        </p>
        <p style="margin:16px 0 0;font-size:15px;line-height:1.6;">
          You can view and manage this appointment anytime in your patient portal.
        </p>
        ${cta(appointmentsHref, "View my appointments")}
      `),
    };
  }

  const patientName =
    typeof payload.patientName === "string" ? payload.patientName : "a patient";
  const serviceName =
    typeof payload.serviceName === "string" ? payload.serviceName : "Physiotherapy";
  const notes = typeof payload.notes === "string" ? payload.notes : null;

  if (templateKey === "booking.practitioner_alert") {
    const adminHref = `${appUrl}/admin/appointments`;
    return {
      subject: `New booking — ${patientName}`,
      html: wrap(`
        <h1 style="margin:0 0 12px;font-size:22px;color:#3a3a3c;">New appointment booked</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          <strong>${escapeHtml(patientName)}</strong> has booked <strong>${escapeHtml(serviceName)}</strong>.
        </p>
        ${
          startsAt
            ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;"><strong>When:</strong> ${escapeHtml(startsAt)}</p>`
            : ""
        }
        ${
          notes
            ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;"><strong>Notes:</strong> ${escapeHtml(notes)}</p>`
            : ""
        }
        ${cta(adminHref, "Open appointments")}
      `),
    };
  }

  if (templateKey === "booking.cancelled.patient") {
    return {
      subject: "Appointment cancelled — Fouza Physiotherapy",
      html: wrap(`
        <h1 style="margin:0 0 12px;font-size:22px;color:#3a3a3c;">Appointment cancelled</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          Hi ${escapeHtml(firstName)}, your appointment at ${escapeHtml(siteConfig.practiceName)} has been cancelled.
        </p>
        ${
          startsAt
            ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;"><strong>Was scheduled for:</strong> ${escapeHtml(startsAt)}</p>`
            : ""
        }
        ${cta(`${appUrl}/book`, "Book a new appointment")}
      `),
    };
  }

  if (templateKey === "booking.cancelled.practitioner") {
    const adminHref = `${appUrl}/admin/appointments`;
    return {
      subject: `Cancelled — ${patientName}`,
      html: wrap(`
        <h1 style="margin:0 0 12px;font-size:22px;color:#3a3a3c;">Appointment cancelled</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          <strong>${escapeHtml(patientName)}</strong> / <strong>${escapeHtml(serviceName)}</strong> was cancelled.
        </p>
        ${
          startsAt
            ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;"><strong>Was scheduled for:</strong> ${escapeHtml(startsAt)}</p>`
            : ""
        }
        ${cta(adminHref, "Open appointments")}
      `),
    };
  }

  if (templateKey === "booking.rescheduled.patient") {
    return {
      subject: "Appointment rescheduled — Fouza Physiotherapy",
      html: wrap(`
        <h1 style="margin:0 0 12px;font-size:22px;color:#3a3a3c;">Your appointment was moved</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          Hi ${escapeHtml(firstName)}, your appointment at ${escapeHtml(siteConfig.practiceName)} has a new time.
        </p>
        ${
          startsAt
            ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;"><strong>New time:</strong> ${escapeHtml(startsAt)}</p>`
            : ""
        }
        <p style="margin:16px 0 0;font-size:15px;line-height:1.6;">
          <strong>Where:</strong> ${escapeHtml(siteConfig.address)}
        </p>
        ${cta(`${appUrl}/portal/appointments`, "View appointments")}
      `),
    };
  }

  if (templateKey === "booking.rescheduled.practitioner") {
    const adminHref = `${appUrl}/admin/appointments`;
    return {
      subject: `Rescheduled — ${patientName}`,
      html: wrap(`
        <h1 style="margin:0 0 12px;font-size:22px;color:#3a3a3c;">Appointment rescheduled</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          <strong>${escapeHtml(patientName)}</strong> / <strong>${escapeHtml(serviceName)}</strong> was moved.
        </p>
        ${
          startsAt
            ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;"><strong>New time:</strong> ${escapeHtml(startsAt)}</p>`
            : ""
        }
        ${cta(adminHref, "Open appointments")}
      `),
    };
  }

  if (templateKey === "booking.reminder.patient") {
    const formsHref = magicLink ?? `${appUrl}/portal/forms`;
    return {
      subject: "Appointment reminder — Fouza Physiotherapy",
      html: wrap(`
        <h1 style="margin:0 0 12px;font-size:22px;color:#3a3a3c;">Reminder: your visit is coming up</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          Hi ${escapeHtml(firstName)}, this is a reminder of your upcoming appointment at
          ${escapeHtml(siteConfig.practiceName)}.
        </p>
        ${
          startsAt
            ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;"><strong>When:</strong> ${escapeHtml(startsAt)}</p>`
            : ""
        }
        <p style="margin:16px 0 0;font-size:15px;line-height:1.6;">
          <strong>Where:</strong> ${escapeHtml(siteConfig.address)}
        </p>
        <p style="margin:16px 0 0;font-size:15px;line-height:1.6;">
          If you have not yet completed your forms, please do so before your visit.
        </p>
        ${cta(formsHref, "View portal / forms")}
      `),
    };
  }

  if (templateKey === "booking.reminder.practitioner") {
    const adminHref = `${appUrl}/admin/appointments`;
    return {
      subject: `Reminder — ${patientName}`,
      html: wrap(`
        <h1 style="margin:0 0 12px;font-size:22px;color:#3a3a3c;">Upcoming appointment</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          Reminder: <strong>${escapeHtml(patientName)}</strong> is booked for
          <strong>${escapeHtml(serviceName)}</strong>.
        </p>
        ${
          startsAt
            ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;"><strong>When:</strong> ${escapeHtml(startsAt)}</p>`
            : ""
        }
        ${cta(adminHref, "Open appointments")}
      `),
    };
  }

  if (templateKey === "invoice.sent" || templateKey === "invoice.receipt") {
    const invoiceNumber =
      typeof payload.invoiceNumber === "string" ? payload.invoiceNumber : "your invoice";
    const description =
      typeof payload.description === "string" ? payload.description : "Physiotherapy services";
    const totalCents = typeof payload.totalCents === "number" ? payload.totalCents : null;
    const amountLabel =
      totalCents != null
        ? new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
            totalCents / 100,
          )
        : null;
    const invoiceId = typeof payload.invoiceId === "string" ? payload.invoiceId : null;
    const invoicesHref = invoiceId
      ? `${appUrl}/portal/invoices/${invoiceId}`
      : `${appUrl}/portal/invoices`;
    const bankName = typeof payload.bankName === "string" ? payload.bankName : null;
    const accountName = typeof payload.accountName === "string" ? payload.accountName : null;
    const accountNumber =
      typeof payload.accountNumber === "string" ? payload.accountNumber : null;
    const branchCode = typeof payload.branchCode === "string" ? payload.branchCode : null;
    const proofEmail = typeof payload.proofEmail === "string" ? payload.proofEmail : siteConfig.email;
    const isReceipt = templateKey === "invoice.receipt";

    return {
      subject: isReceipt
        ? `Receipt ${invoiceNumber} — Fouza Physiotherapy`
        : `Invoice ${invoiceNumber} — Fouza Physiotherapy`,
      html: wrap(`
        <h1 style="margin:0 0 12px;font-size:22px;color:#3a3a3c;">${
          isReceipt ? "Payment receipt" : "Invoice ready"
        }</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          Hi ${escapeHtml(firstName)}, ${
            isReceipt
              ? `thank you — here is your receipt from ${escapeHtml(siteConfig.practiceName)}.`
              : `an invoice from ${escapeHtml(siteConfig.practiceName)} is ready to view.`
          }
        </p>
        <p style="margin:16px 0 0;font-size:15px;line-height:1.6;">
          <strong>${isReceipt ? "Receipt" : "Invoice"}:</strong> ${escapeHtml(invoiceNumber)}<br/>
          <strong>For:</strong> ${escapeHtml(description)}
          ${amountLabel ? `<br/><strong>Total:</strong> ${escapeHtml(amountLabel)}` : ""}
        </p>
        ${
          !isReceipt && bankName && accountNumber
            ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.6;">
                <strong>Banking details</strong><br/>
                Bank: ${escapeHtml(bankName)}<br/>
                Account name: ${escapeHtml(accountName ?? "")}<br/>
                Account number: ${escapeHtml(accountNumber)}<br/>
                Branch code: ${escapeHtml(branchCode ?? "")}<br/>
                Kindly send proof of payment to ${escapeHtml(proofEmail)}
              </p>`
            : ""
        }
        ${cta(invoicesHref, isReceipt ? "View receipt" : "View invoice")}
      `),
    };
  }

  return {
    subject: `Fouza Physiotherapy — ${templateKey}`,
    html: wrap(
      `<p style="margin:0;font-size:14px;line-height:1.6;">${escapeHtml(templateKey)}</p>
       <pre style="white-space:pre-wrap;font-size:12px;background:#f6f8f8;padding:12px;border-radius:8px;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`,
    ),
  };
}
