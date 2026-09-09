import Image from "next/image";

import { siteConfig } from "@/config/site";
import { formatLetterDate, patientSexLabel } from "@/features/clinical-letters/lib/placeholders";
import { letterHeading } from "@/features/clinical-letters/lib/print";
import type { ClinicalLetterType } from "@/features/clinical-letters/types/letter";
import { cn } from "@/lib/utils";

export type ClinicalLetterDocumentProps = {
  letterType: ClinicalLetterType;
  subjectLine?: string | null;
  letterDate: string;
  attendanceDate?: string | null;
  patientName: string;
  patientAge?: string | null;
  patientSex?: string | null;
  recipientName?: string | null;
  body: string;
  physiotherapistName: string;
  qualifications?: string | null;
  practiceName?: string | null;
  contact?: string | null;
  signatureDataUrl?: string | null;
  className?: string;
};

function paragraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function reLine(patientName: string, patientAge?: string | null, patientSex?: string | null) {
  const age = patientAge?.trim();
  const sex = patientSexLabel(patientSex);
  const parts = [patientName];
  if (age) {
    parts.push(sex ? `${age}-year-old ${sex}` : `${age}-year-old`);
  } else if (sex) {
    parts.push(sex);
  }
  return parts.join(" | ");
}

export function ClinicalLetterDocument({
  letterType,
  subjectLine,
  letterDate,
  attendanceDate,
  patientName,
  patientAge,
  patientSex,
  recipientName,
  body,
  physiotherapistName,
  qualifications,
  practiceName = siteConfig.practiceName,
  contact,
  signatureDataUrl,
  className,
}: ClinicalLetterDocumentProps) {
  const headingPractice = practiceName?.trim() || siteConfig.practiceName;
  const isReferral = letterType === "medical_referral";
  const doctor = (recipientName ?? "").replace(/^dr\.?\s+/i, "").trim();
  const heading = letterHeading(letterType, subjectLine);
  const dateLabel = formatLetterDate(letterDate);
  const blocks = paragraphs(body);

  return (
    <article
      className={cn(
        "letter-document mx-auto max-w-[210mm] bg-white text-[#1a1a1a] shadow-sm print:shadow-none",
        className,
      )}
    >
      <div className="space-y-6 p-6 sm:p-8 print:p-0">
        <div className="flex flex-col gap-6 border-b border-[#d8d8d8] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="shrink-0 bg-transparent">
            <Image
              src={siteConfig.images.logoWordmark}
              alt={headingPractice}
              width={252}
              height={131}
              className="h-14 w-auto max-w-[16rem] bg-transparent object-contain object-left print:bg-transparent"
              priority
              unoptimized
            />
          </div>
          <div className="min-w-0 text-left sm:text-right">
            <p className="text-sm font-medium text-[#555]">{headingPractice}</p>
            <p className="text-xs text-[#666]">{siteConfig.address}</p>
            <p className="text-xs text-[#666]">{siteConfig.phoneDisplay}</p>
          </div>
        </div>

        <h1 className="text-center text-lg font-bold tracking-wide uppercase">{heading}</h1>

        {isReferral ? (
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-semibold">To:</span> Dr {doctor || "__________________________"}
            </p>
            <p>
              <span className="font-semibold">Date:</span> {dateLabel}
            </p>
            <p>
              <span className="font-semibold">Re:</span> {reLine(patientName, patientAge, patientSex)}
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p className="font-semibold tracking-wide">TO WHOM IT MAY CONCERN</p>
            <p>
              <span className="font-semibold">Patient:</span> {patientName}
            </p>
            <p>
              <span className="font-semibold">Date:</span> {dateLabel}
              {attendanceDate ? ` · attended ${formatLetterDate(attendanceDate)}` : null}
            </p>
          </div>
        )}

        {isReferral ? (
          <p className="text-sm">Dear Dr {doctor || "__________________"},</p>
        ) : null}

        <div className="space-y-4 text-sm leading-relaxed">
          {blocks.map((block, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {block}
            </p>
          ))}
        </div>

        {isReferral ? (
          <div className="space-y-1 pt-2 text-sm">
            <p>Kind regards,</p>
            <p className="font-semibold">{physiotherapistName}</p>
            <p>Physiotherapist</p>
            {qualifications ? <p>{qualifications}</p> : null}
            <p>{headingPractice}</p>
          </div>
        ) : (
          <div className="space-y-1 pt-4 text-sm">
            <p>
              <span className="font-semibold">Physiotherapist:</span> {physiotherapistName}
            </p>
            {qualifications ? (
              <p>
                <span className="font-semibold">Qualification(s):</span> {qualifications}
              </p>
            ) : null}
          </div>
        )}

        <div className="space-y-3 pt-2 text-sm">
          <div>
            <p className="font-semibold">Signature:</p>
            {signatureDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signatureDataUrl}
                alt="Physiotherapist signature"
                className="mt-2 h-16 w-auto max-w-[16rem] object-contain"
              />
            ) : (
              <p className="mt-6 border-b border-[#1a1a1a] w-64">{"\u00a0"}</p>
            )}
          </div>
          <p>
            <span className="font-semibold">Date:</span> {dateLabel}
          </p>
          {isReferral ? (
            <p>
              <span className="font-semibold">Contact:</span>{" "}
              {contact?.trim() || "___________________________"}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
