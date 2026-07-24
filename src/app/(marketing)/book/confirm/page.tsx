import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default function BookConfirmPage() {
  redirect(routes.booking.root);
}
