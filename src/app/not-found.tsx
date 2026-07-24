import Link from "next/link";

import { routes } from "@/config/routes";

/** Minimal 404 — avoids client-context UI during static generation. */
export default function GlobalNotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "1.5rem",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", margin: 0 }}>Page not found</h1>
      <p style={{ margin: 0, maxWidth: "28rem", opacity: 0.75 }}>
        The page you are looking for does not exist or has moved.
      </p>
      <p style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
        <Link href={routes.marketing.contact}>Contact us</Link>
        <Link href={routes.marketing.home}>Back to home</Link>
      </p>
    </main>
  );
}
