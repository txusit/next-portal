alter table "public"."meeting" drop constraint "meeting_stock_id_fkey";

alter table "public"."member" drop constraint "user_first_name_key";

alter table "public"."member" drop constraint "user_is_confirmed_key";

alter table "public"."member" drop constraint "user_last_name_key";

alter table "public"."member" drop constraint "user_password_key";

drop index if exists "public"."user_first_name_key";

drop index if exists "public"."user_is_confirmed_key";

drop index if exists "public"."user_last_name_key";

drop index if exists "public"."user_password_key";

create table "public"."payment_record" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "membership_id" uuid not null,
    "member_id" uuid not null
);


alter table "public"."payment_record" enable row level security;

alter table "public"."meeting" drop column "stock_id";

alter table "public"."pitch" drop column "votes_against";

alter table "public"."pitch" drop column "votes_for";

alter table "public"."pitch" add column "meeting_id" uuid not null;

alter table "public"."vote" add column "direction" text not null;

alter table "public"."vote" add column "price" double precision not null default '0'::double precision;

CREATE UNIQUE INDEX payment_membership_id_member_id_key ON public.payment_record USING btree (membership_id, member_id);

CREATE UNIQUE INDEX payment_pkey ON public.payment_record USING btree (id);

CREATE UNIQUE INDEX pitch_meeting_id_key ON public.pitch USING btree (meeting_id);

alter table "public"."payment_record" add constraint "payment_pkey" PRIMARY KEY using index "payment_pkey";

alter table "public"."payment_record" add constraint "payment_membership_id_member_id_key" UNIQUE using index "payment_membership_id_member_id_key";

alter table "public"."payment_record" add constraint "payment_record_member_id_fkey" FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE not valid;

alter table "public"."payment_record" validate constraint "payment_record_member_id_fkey";

alter table "public"."payment_record" add constraint "payment_record_membership_id_fkey" FOREIGN KEY (membership_id) REFERENCES membership(id) ON DELETE CASCADE not valid;

alter table "public"."payment_record" validate constraint "payment_record_membership_id_fkey";

alter table "public"."pitch" add constraint "pitch_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES meeting(id) ON DELETE CASCADE not valid;

alter table "public"."pitch" validate constraint "pitch_meeting_id_fkey";

alter table "public"."pitch" add constraint "pitch_meeting_id_key" UNIQUE using index "pitch_meeting_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.deactivate_old_active_meetings()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE meeting
  set is_active = false
  where is_active = true;
END;
$function$
;


