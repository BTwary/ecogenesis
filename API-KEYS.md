# ECOGENESIS — API key setup

## You only need to provide the optional keys you want to use

The following integrations are already implemented in this build:

| Provider | Key required? | Function |
|---|---:|---|
| Open-Meteo Air Quality / CAMS | No | Gridded hourly air-quality model estimates |
| Open-Meteo Archive / ERA5 | No | Historical daily weather reanalysis |
| NASA POWER | No | Solar radiation and temperature climatology |
| GBIF | No | Published biodiversity occurrence records |
| OpenAQ | Yes, optional | Nearby ground-station air-quality readings |
| data.gov.in / CPCB | Yes, optional | City-filtered Indian station pollutant records |

## 1. OpenAQ

1. Register at https://explore.openaq.org/register.
2. Sign in and create/copy an API key from your account settings.
3. Paste the key when `Setup-ECOGENESIS.bat` asks for it, or set `OPENAQ_API_KEY` in `.env`.

The connector sends the key in the `X-API-Key` request header. The key is used only by the server and must not be exposed in browser code.

## 2. data.gov.in / CPCB

1. Register or sign in at https://data.gov.in/.
2. Open the account/API key area and generate a key.
3. Paste the key when `Setup-ECOGENESIS.bat` asks for it, or set `DATA_GOV_IN_KEY` in `.env`.

The connector queries the CPCB real-time air-quality resource:
`3b01bcb8-0b14-4abf-b6f2-c74bfdca3340`.

It uses the selected Indian city as a dataset filter. It is not a coordinate-radius search and a city can return no records if the provider has no matching rows.

## 3. No key required

Open-Meteo, NASA POWER and GBIF use public endpoints in this build. Do not create API keys for these connectors unless their provider changes its access policy.

## 4. Not connected in this ZIP

The current application does not yet implement direct API connectors for:

- Copernicus Data Space Sentinel imagery workflows.
- Global Forest Watch forest-change API.
- National Water Data Portal direct APIs.

The integration-status page labels these as unavailable/not integrated. Do not add credentials for them expecting them to activate; code changes are required first.

## 5. Keep credentials safe

- Keep keys in `.env` only.
- Never paste provider keys into chat, public issue trackers, screenshots, or source code.
- `.env` is excluded by `.gitignore`.
- If a key is exposed, revoke it at the provider and generate a replacement.
- API keys are server-side; website visitors do not need provider accounts.

## 6. AI and photo recognition

The text sustainability assistant falls back to curated local guidance if the original hosted AI runtime is unavailable. This fallback is not a generative AI model and does not query environmental measurements. Photo-based waste identification requires an image-capable AI provider and is not enabled by the two environmental API keys above; text-based waste guidance and logging remain available.

## 7. Verify after setup

Start the site and open:

- Dashboard: http://localhost:3000
- Provider status: http://localhost:3000/api/env/status
- Example air query: http://localhost:3000/api/env/air?lat=25.61&lng=85.14&city=Patna

A provider marked `operational` passed the status probe. This does not guarantee measurements exist for every city or time. Check returned readings, timestamps, coverage and provenance.

## 8. Commercial use and hosting

Open-Meteo's free hosted API is for non-commercial use. A commercial ECOGENESIS deployment needs an appropriate Open-Meteo licence or another suitable source for those data. Also check provider and dataset licences for OpenAQ and GBIF records.

The included SQLite setup is intended for a single local installation. A public multi-user deployment needs a persistent server/database, HTTPS, environment variables configured in the hosting provider, backups, and production security review. Do not expose a local development server directly to the internet.
