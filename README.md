# ECOGENESIS — Environmental Intelligence Platform

## Audit correction pass

This revision corrects the following issues found in the supplied development build:

- Climate aggregation now pairs daily temperature maxima/minima, preserves fully missing months as explicit gaps, applies a 90% daily coverage rule, and reports annual precipitation as the mean of complete calendar-year totals rather than a decade sum. Climate deltas are withheld when decade coverage is insufficient.
- The footprint calculator allocates shared household electricity, LPG/PNG, waste and water across occupants, while keeping the entered user's transport, diet and purchased goods personal. Fossil-CO2 reference figures are not displayed as like-for-like CO2e benchmarks.
- Older saved calculations are recalculated under the corrected allocation using their original factor snapshots when available. The interface flags legacy rows that lack a usable snapshot.
- Quick footprint estimates no longer save automatically; persistence requires the explicit `save: true` request.
- NASA POWER annual irradiation is withheld unless all 12 monthly climatology values are present; the monthly means are day-weighted. Provider retrieval timestamps are retained after a refresh. Solar economics are labelled as a gross bill-value proxy with important exclusions stated.
- OpenAQ and CPCB station values are returned separately from CAMS model estimates. CPCB integration is explicitly city-filtered and reported as station pollutant records, not a universal coordinate-radius feed. Copernicus direct imagery and Global Forest Watch remain clearly marked as not integrated.
- API request rate limits, stricter input validation, production session-secret requirements, secure production cookies and quieter production database logging have been added.

This repository contains the revised ECOGENESIS Next.js application. The dashboard uses real provider datasets where an integration is operational; it distinguishes model estimates, historical reanalysis, satellite climatologies, and ground-station readings. It must not be described as a network of live ground sensors.

## Start here (Windows)

**The easiest route is to double-click `Setup-ECOGENESIS.bat`.** You do not need to edit code or generate the authentication secret yourself.

1. Install Node.js **22.16.0 or newer** from https://nodejs.org/ if it is not already installed.
2. Extract the ZIP to a normal writable folder (for example `C:\ECOGENESIS`). Do not run it from inside the ZIP preview.
3. Double-click `Setup-ECOGENESIS.bat`.
4. When asked, paste your OpenAQ key and data.gov.in key. Press Enter to skip either one; the core environmental dashboard still works from public Open-Meteo, NASA POWER and GBIF endpoints.
5. The setup program creates `.env`, generates a private `AUTH_SECRET`, installs packages, initialises the local database, runs regression tests and starts the website.
6. The local website opens at **http://localhost:3000**. Keep the terminal window open while using it.

To start the application later, double-click `Start-ECOGENESIS.bat`. To see the current configuration status, run `npm run doctor` in the project folder. For API registration instructions, open `API-KEYS.md`.

## Manual setup (Windows / macOS / Linux)

- Requirements: Node.js **22.16.0 or newer**, npm, and internet access during dependency installation and environmental data requests.
- Copy `.env.example` to `.env`.
- Set `OPENAQ_API_KEY` and/or `DATA_GOV_IN_KEY` if you have them. Leave blank to skip those optional ground-station sources.
- Set `AUTH_SECRET` to a random value of at least 32 characters. `scripts/setup.mjs` does this automatically.
- Run `npm install`, `npm run db:setup`, `npm test`, then `npm run dev`.
- Create a production standalone build using `npm run build`; run it with `npm start` after production environment configuration.

The default SQLite database is created under the project `db/` directory. A clean database is intentionally not bundled. The original development database contained guest accounts, session-related records, user-entered activity, and a test observation; those records are not required and are excluded from this distribution.

## Environmental data connectors

| Connector | What the application uses | Important interpretation
|---|---|---|
| Open-Meteo Air Quality / CAMS | Gridded hourly pollutant and AQI model output | Model estimates, not local station readings. The hosted free API is restricted to non-commercial use; follow Open-Meteo attribution/licence terms.
| Open-Meteo Archive / ERA5 | Daily historical temperature and precipitation reanalysis | Historical model reanalysis, not station observations or live weather. The free hosted API is restricted to non-commercial use.
| NASA POWER | Solar irradiance monthly climatology | Long-term climatology, not current-day generation or a site survey. Attribute NASA POWER.
| GBIF | Published biodiversity occurrence records | Presence records from contributing datasets; inspect the underlying dataset licence/attribution.
| OpenAQ (optional) | Nearby ground-station latest readings | Configure `OPENAQ_API_KEY`. Readings are returned separately from CAMS and kept in provider-native units. Underlying source licences vary; inspect dataset/provider attribution.
| data.gov.in / CPCB (optional) | City-filtered CPCB station pollutant records for supported Indian cities | Configure `DATA_GOV_IN_KEY`. The query is city-filtered, not a coordinate-radius station lookup. Follow the portal's access and attribution terms.

**Not integrated in this build:** Copernicus Data Space direct Sentinel imagery workflows and Global Forest Watch forest-change API. Their status is shown as unavailable; no synthetic forest or satellite records are substituted.

The integration-status panel probes provider availability, but a successful health probe is not proof that every location has observations. Each data panel must still be checked for returned coverage, timestamps, and provider metadata. The Windows setup wizard only asks for keys belonging to connectors that are actually implemented in this ZIP; it does not request Copernicus, GFW or NWDP keys because those direct integrations are not present.

## Footprint methodology changes

- Travel, diet, and purchased goods are treated as the individual user's activities.
- Household electricity, LPG/PNG, waste, and water are treated as household totals and allocated evenly over household size.
- Saved pre-revision results are recalculated from their stored inputs when read, because the previous release divided personal activities by household size too. New saves include an allocation-versioned factor snapshot.
- India/world reference values are fossil-CO2-only context and are explicitly not presented as like-for-like comparisons with the wider CO2e estimate.
- The calculator is an estimate, not an audited inventory. Regional and lifecycle boundaries differ.

## Climate data quality

ERA5 daily maximum/minimum temperatures are paired by UTC calendar day before daily mean temperature is calculated. A month is included only when at least 90% of expected days are present. Annual precipitation is averaged across complete calendar years; month-of-year rainfall is averaged across valid years. Period-to-period deltas are withheld unless each decade has at least 90% valid temperature months and at least eight complete precipitation years. No missing days are imputed.

## Security and production notes

- Set `AUTH_SECRET` to a cryptographically random value of at least 32 characters before starting in production. The production session cookie uses the `__Host-` prefix and requires HTTPS.
- Do not expose `.env`, API keys, SQLite files, connector logs, or user exports publicly.
- The included rate limiter is per-process/best-effort. For multi-instance or serverless deployment, enforce equivalent limits at a trusted edge or shared rate-limit service. Ensure your reverse proxy overwrites forwarded-IP headers rather than trusting arbitrary client-supplied values.
- Prisma query logging is limited to development; production logs warnings and errors only.
- Review all third-party API licences before commercial deployment. In particular, Open-Meteo's free hosted API is not a free commercial tier.
- The AI assistant first tries the original `z-ai-web-dev-sdk` runtime; if it is unavailable, a clearly labelled local rule-based guidance mode keeps text advice usable without an extra AI API key. The fallback is not a generative model and does not analyse live datasets. Photo-based waste recognition still requires an available image-capable AI provider; the text waste guide and manual waste logging work without it.

## Regression tests

`npm test` runs eight regression tests covering climate aggregation/coverage, household-versus-personal footprint allocation, and historical factor-snapshot preservation. A complete Next.js build and browser/API integration suite should still be run in an environment where the package registry and all declared dependencies are available.
