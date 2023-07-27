create table "public"."attendance_record" (
    "id" uuid not null default gen_random_uuid(),
    "meeting_id" uuid not null,
    "member_id" uuid not null
);


create table "public"."meeting" (
    "created_at" timestamp with time zone default now(),
    "meeting_date" date not null,
    "is_active" boolean not null default false,
    "id" uuid not null default gen_random_uuid()
);


create table "public"."member" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "email" text not null,
    "first_name" text not null,
    "last_name" text not null,
    "password" text not null,
    "is_confirmed" boolean not null default false,
    "membership_id" uuid,
    "full_name" text generated always as (
CASE
    WHEN (first_name IS NULL) THEN last_name
    WHEN (last_name IS NULL) THEN first_name
    ELSE ((first_name || ' '::text) || last_name)
END) stored
);


create table "public"."membership" (
    "id" uuid not null default gen_random_uuid(),
    "type" text not null,
    "price" double precision not null default '0'::double precision,
    "price_id" text not null
);


create table "public"."payment_record" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "membership_id" uuid not null,
    "member_id" uuid not null
);


create table "public"."pitch" (
    "created_at" timestamp with time zone default now(),
    "stock_id" uuid not null,
    "direction" text not null,
    "id" uuid not null default gen_random_uuid(),
    "meeting_id" uuid not null
);


create table "public"."stock" (
    "created_at" timestamp with time zone default now(),
    "name" text not null,
    "ticker" text not null,
    "price" double precision not null default '0'::double precision,
    "id" uuid not null default gen_random_uuid()
);


create table "public"."vote" (
    "created_at" timestamp with time zone default now(),
    "member_id" uuid not null,
    "pitch_id" uuid not null,
    "meeting_id" uuid not null,
    "id" uuid not null default gen_random_uuid(),
    "direction" text not null,
    "price" double precision not null default '0'::double precision
);


CREATE UNIQUE INDEX attendance_record_member_id_meeting_id_key ON public.attendance_record USING btree (member_id, meeting_id);

CREATE UNIQUE INDEX meeting_meeting_date_key ON public.meeting USING btree (meeting_date);

CREATE UNIQUE INDEX meeting_pkey ON public.meeting USING btree (id);

CREATE UNIQUE INDEX meeting_user_pkey ON public.attendance_record USING btree (id);

CREATE UNIQUE INDEX membership_pkey ON public.membership USING btree (id);

CREATE UNIQUE INDEX membership_product_id_key ON public.membership USING btree (price_id);

CREATE UNIQUE INDEX membership_type_key ON public.membership USING btree (type);

CREATE UNIQUE INDEX payment_membership_id_member_id_key ON public.payment_record USING btree (membership_id, member_id);

CREATE UNIQUE INDEX payment_pkey ON public.payment_record USING btree (id);

CREATE UNIQUE INDEX pitch_meeting_id_key ON public.pitch USING btree (meeting_id);

CREATE UNIQUE INDEX pitch_pkey ON public.pitch USING btree (id);

CREATE UNIQUE INDEX stock_name_key ON public.stock USING btree (name);

CREATE UNIQUE INDEX stock_pkey ON public.stock USING btree (id);

CREATE UNIQUE INDEX stock_ticker_key ON public.stock USING btree (ticker);

CREATE UNIQUE INDEX user_email_key ON public.member USING btree (email);

CREATE UNIQUE INDEX user_pkey ON public.member USING btree (id);

CREATE UNIQUE INDEX vote_pitch_id_member_id_meeting_id_key ON public.vote USING btree (pitch_id, member_id, meeting_id);

CREATE UNIQUE INDEX vote_pkey ON public.vote USING btree (id);

alter table "public"."attendance_record" add constraint "meeting_user_pkey" PRIMARY KEY using index "meeting_user_pkey";

alter table "public"."meeting" add constraint "meeting_pkey" PRIMARY KEY using index "meeting_pkey";

alter table "public"."member" add constraint "user_pkey" PRIMARY KEY using index "user_pkey";

alter table "public"."membership" add constraint "membership_pkey" PRIMARY KEY using index "membership_pkey";

alter table "public"."payment_record" add constraint "payment_pkey" PRIMARY KEY using index "payment_pkey";

alter table "public"."pitch" add constraint "pitch_pkey" PRIMARY KEY using index "pitch_pkey";

alter table "public"."stock" add constraint "stock_pkey" PRIMARY KEY using index "stock_pkey";

alter table "public"."vote" add constraint "vote_pkey" PRIMARY KEY using index "vote_pkey";

alter table "public"."attendance_record" add constraint "attendance_record_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES meeting(id) ON DELETE CASCADE not valid;

alter table "public"."attendance_record" validate constraint "attendance_record_meeting_id_fkey";

alter table "public"."attendance_record" add constraint "attendance_record_member_id_fkey" FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE not valid;

alter table "public"."attendance_record" validate constraint "attendance_record_member_id_fkey";

alter table "public"."attendance_record" add constraint "attendance_record_member_id_meeting_id_key" UNIQUE using index "attendance_record_member_id_meeting_id_key";

alter table "public"."meeting" add constraint "meeting_meeting_date_key" UNIQUE using index "meeting_meeting_date_key";

alter table "public"."member" add constraint "member_membership_id_fkey" FOREIGN KEY (membership_id) REFERENCES membership(id) ON DELETE CASCADE not valid;

alter table "public"."member" validate constraint "member_membership_id_fkey";

alter table "public"."member" add constraint "user_email_key" UNIQUE using index "user_email_key";

alter table "public"."membership" add constraint "membership_product_id_key" UNIQUE using index "membership_product_id_key";

alter table "public"."membership" add constraint "membership_type_key" UNIQUE using index "membership_type_key";

alter table "public"."payment_record" add constraint "payment_membership_id_member_id_key" UNIQUE using index "payment_membership_id_member_id_key";

alter table "public"."payment_record" add constraint "payment_record_member_id_fkey" FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE not valid;

alter table "public"."payment_record" validate constraint "payment_record_member_id_fkey";

alter table "public"."payment_record" add constraint "payment_record_membership_id_fkey" FOREIGN KEY (membership_id) REFERENCES membership(id) ON DELETE CASCADE not valid;

alter table "public"."payment_record" validate constraint "payment_record_membership_id_fkey";

alter table "public"."pitch" add constraint "pitch_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES meeting(id) ON DELETE CASCADE not valid;

alter table "public"."pitch" validate constraint "pitch_meeting_id_fkey";

alter table "public"."pitch" add constraint "pitch_meeting_id_key" UNIQUE using index "pitch_meeting_id_key";

alter table "public"."pitch" add constraint "pitch_stock_id_fkey" FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE CASCADE not valid;

alter table "public"."pitch" validate constraint "pitch_stock_id_fkey";

alter table "public"."stock" add constraint "stock_name_key" UNIQUE using index "stock_name_key";

alter table "public"."stock" add constraint "stock_ticker_check" CHECK ((length(ticker) <= 5)) not valid;

alter table "public"."stock" validate constraint "stock_ticker_check";

alter table "public"."stock" add constraint "stock_ticker_key" UNIQUE using index "stock_ticker_key";

alter table "public"."vote" add constraint "vote_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES meeting(id) ON DELETE CASCADE not valid;

alter table "public"."vote" validate constraint "vote_meeting_id_fkey";

alter table "public"."vote" add constraint "vote_member_id_fkey" FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE not valid;

alter table "public"."vote" validate constraint "vote_member_id_fkey";

alter table "public"."vote" add constraint "vote_pitch_id_fkey" FOREIGN KEY (pitch_id) REFERENCES pitch(id) ON DELETE CASCADE not valid;

alter table "public"."vote" validate constraint "vote_pitch_id_fkey";

alter table "public"."vote" add constraint "vote_pitch_id_member_id_meeting_id_key" UNIQUE using index "vote_pitch_id_member_id_meeting_id_key";

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


