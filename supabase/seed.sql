insert into coins.categories (name)
values
  ('українська'),
  ('закордонна')
on conflict (name) do nothing;
