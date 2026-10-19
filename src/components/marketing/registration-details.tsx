import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Public HPCSA iRegister search. Used only when a real registration number is set. */
export const HPCSA_REGISTER_URL = "https://isystems.hpcsa.co.za/iregister/";

export function RegistrationDetails({
  practiceStyle = "short",
  className,
}: {
  practiceStyle?: "short" | "pcns";
  className?: string;
}) {
  const practice = siteConfig.founder.practiceNumber.trim();
  const hpcsa = siteConfig.founder.hpcsaNumber.trim();

  if (!practice && !hpcsa) return null;

  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
      {practice ? (
        <span>
          {practiceStyle === "pcns" ? "PCNS Practice No." : "Practice No."} {practice}
        </span>
      ) : null}
      {practice && hpcsa ? (
        <span className="mx-1.5" aria-hidden>
          ·
        </span>
      ) : null}
      {hpcsa ? (
        <a
          href={HPCSA_REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          HPCSA No. {hpcsa}
          <span className="sr-only"> (opens the HPCSA online register)</span>
        </a>
      ) : null}
    </p>
  );
}
