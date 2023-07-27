alter table "public"."membership" drop constraint "membership_product_id_key";

drop index if exists "public"."membership_product_id_key";

alter table "public"."membership" drop column "product_id";

alter table "public"."membership" add column "price_id" text not null;

CREATE UNIQUE INDEX membership_product_id_key ON public.membership USING btree (price_id);

alter table "public"."membership" add constraint "membership_product_id_key" UNIQUE using index "membership_product_id_key";


