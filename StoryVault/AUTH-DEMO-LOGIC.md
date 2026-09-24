# StoryVault Authentication & Demo Dashboard Logic

- Login and Sign Up forms only show success/error feedback; they do not redirect to Profile or Dashboard.
- The dashboard credential cards were removed from the Login form.
- `dashboard.html`, `member-dashboard.html`, and `admin-dashboard.html` are public demo pages and require no login.
- Member demo profile: **Arjun Nair — Explorer Member — Bengaluru**.
- Admin demo profile: **Meera Krishnan — Head Librarian & Administrator**.
- Demo dashboards use browser-local sample data so buttons, tables, renewals, request workflows, catalog tools, and metrics can be previewed without authentication.
- Real production authentication would require a backend/session provider; this static template intentionally keeps demo dashboards public.
