-- Optional starter content for Graze Valley.
-- Run this after schema.sql if you want the site populated instead of
-- empty on first load. Safe to re-run — each insert is skipped if a row
-- with the same title already exists.
-- All image URLs below were checked and are live at the time of writing;
-- Unsplash URLs do occasionally rot, so re-check before relying on them.

insert into public.hubs (title, location, description, auction_date, whatsapp, status, image_url)
select 'Malappuram Hub', 'Malappuram, Kerala', 'A science-forward breeding and animal wellness facility.', '2026-08-18', '919876543210', 'Active', 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80'
where not exists (select 1 from public.hubs where title = 'Malappuram Hub');

insert into public.hubs (title, location, description, auction_date, whatsapp, status, image_url)
select 'Wayanad Hub', 'Wayanad, Kerala', 'Highland grazing, data-led nutrition, and superior care.', '2026-09-02', '919876543210', 'Active', 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=1000&q=80'
where not exists (select 1 from public.hubs where title = 'Wayanad Hub');

insert into public.hubs (title, location, description, auction_date, whatsapp, status, image_url)
select 'Palakkad Hub', 'Palakkad, Kerala', 'Purpose-built spaces for healthy growth and responsible trade.', '2026-09-15', '919876543210', 'Upcoming', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80'
where not exists (select 1 from public.hubs where title = 'Palakkad Hub');

insert into public.blog_posts (title, subheading, content, category, read_time, image_url, status)
select 'The future of sustainable livestock is local', 'A more considered model for India''s livestock future.', 'At Graze Valley, sustainability is a daily practice built through better animal care, transparent systems, and practical local knowledge.', 'Sustainable Farming', '6 min read', 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=900&q=80', 'Published'
where not exists (select 1 from public.blog_posts where title = 'The future of sustainable livestock is local');

insert into public.gallery_images (title, category, tags, slug, image_url, status)
select 'Healthy herd at sunrise', 'Facilities', array['facilities'], 'facilities', 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80', 'Published'
where not exists (select 1 from public.gallery_images where title = 'Healthy herd at sunrise');

insert into public.testimonials (name, role, quote, status)
select 'Dr. Nisha Rahman', 'Veterinary Consultant', 'The approach is refreshingly structured. You can see the care in the animals and the systems behind them.', 'Published'
where not exists (select 1 from public.testimonials where name = 'Dr. Nisha Rahman');

update public.site_settings
set site_name = 'Graze Valley',
    email = 'info@grazevalley.com',
    phone = '+91 98765 43210',
    address = 'Malappuram, Kerala, India',
    hero_image_url = 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=2200&q=90'
where id = 1;
