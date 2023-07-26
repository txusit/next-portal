alter table "public"."membership" add column "product_id" text not null;

CREATE UNIQUE INDEX membership_product_id_key ON public.membership USING btree (product_id);

alter table "public"."membership" add constraint "membership_product_id_key" UNIQUE using index "membership_product_id_key";


