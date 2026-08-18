-- Per-line and whole-invoice discounts (percent or rand).

alter table public.invoice_line_items
  add column if not exists discount_percent numeric(5,2),
  add column if not exists discount_cents integer not null default 0;

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_discount_percent_check;

alter table public.invoice_line_items
  add constraint invoice_line_items_discount_percent_check
  check (discount_percent is null or (discount_percent >= 0 and discount_percent <= 100));

alter table public.invoice_line_items
  drop constraint if exists invoice_line_items_discount_cents_check;

alter table public.invoice_line_items
  add constraint invoice_line_items_discount_cents_check
  check (discount_cents >= 0);

alter table public.invoices
  add column if not exists discount_percent numeric(5,2),
  add column if not exists discount_cents integer not null default 0,
  add column if not exists discount_note text;

alter table public.invoices
  drop constraint if exists invoices_discount_percent_check;

alter table public.invoices
  add constraint invoices_discount_percent_check
  check (discount_percent is null or (discount_percent >= 0 and discount_percent <= 100));

alter table public.invoices
  drop constraint if exists invoices_discount_cents_check;

alter table public.invoices
  add constraint invoices_discount_cents_check
  check (discount_cents >= 0);
