-- Run this in Supabase SQL Editor to create/update the projects table
-- Dashboard → SQL Editor → New query → paste & run

create table if not exists public.projects (
  id                        text primary key,
  slug                      text unique not null,
  name                      text not null,
  tagline                   text default '',
  builder_name              text default '',
  builder_slug              text default '',
  locality                  text default '',
  micro_market              text default '',
  address                   text default '',
  rera_id                   text default '',
  rera_url                  text default '',
  status                    text default 'new_launch',
  launch_date               text default '',
  possession_date           text default '',
  project_type              text default '',
  total_units               integer default 0,
  towers                    integer default 1,
  floors                    integer default 0,
  total_area                text default '',
  price_min                 bigint default 0,
  price_max                 bigint default 0,
  display_price             text default '',
  configs                   jsonb default '[]'::jsonb,
  amenities                 jsonb default '[]'::jsonb,
  nearby_it                 jsonb default '[]'::jsonb,
  nearby_places             jsonb default '[]'::jsonb,
  price_history             jsonb default '[]'::jsonb,
  appreciation_3yr          numeric default 0,
  locality_avg_price_per_sqft integer default 0,
  vs_locality_avg           text default '',
  approved_banks            jsonb default '[]'::jsonb,
  sample_emi                jsonb,
  highlights                jsonb default '[]'::jsonb,
  tags                      jsonb default '[]'::jsonb,
  featured                  boolean default false,
  showflat_available        boolean default true,
  site_visit_available      boolean default true,
  show_on_site              boolean default true,
  images                    jsonb default '[]'::jsonb,
  floor_plans               jsonb default '[]'::jsonb,
  seo_description           text default '',
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

-- Enable Row Level Security (public read, service key for write)
alter table public.projects enable row level security;

-- Allow anyone to read projects that are live
create policy if not exists "Public read live projects"
  on public.projects for select
  using (show_on_site = true);

-- Allow service key (admin) to do anything
create policy if not exists "Service key full access"
  on public.projects for all
  using (true)
  with check (true);

-- Trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();
