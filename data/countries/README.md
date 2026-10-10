# data/countries — TODO list

Every field below is `null` or `verified: false` **on purpose** (CONTRACT.md section 9):
no visa, fee or rent number is ever invented. A human copies each value from an
official page, sets `last_verified` to today (YYYY-MM-DD), then flips `verified: true`.

Official starting points — **confirm each URL before trusting it**:

- Germany: https://www.make-it-in-germany.com/ · https://www.auswaertiges-amt.de/en/service/visa
- Spain: https://exteriores.gob.es/
- France: https://france-visas.gouv.fr/
- Italy: https://vistoperitalia.esteri.it/

## How to fill a value

1. Open the official page and copy the number exactly.
2. Set the value **and** its `source_url` + `last_verified` (fee rule: an amount may
   only exist together with `source_url` and `last_verified`).
3. Set the route's `verified: true` only when **all** of its numbers are copied.
4. Run `pytest tests/api/test_relocation.py` — it rejects any number without a source.

## Germany (de) — all null / unverified

- [ ] `routes.de-skilled-work`: fee "National visa application (type D)" amount; fee "Residence permit issuance (after arrival)" amount; `required_language_level`; `official_url` confirmed; `last_verified`
- [ ] `routes.de-job-seeker`: fee amount; living-costs figure in eligibility (currently "amount not yet verified"); `required_language_level`; `official_url` confirmed
- [ ] `routes.de-student`: fee amount; living-costs figure; course language requirement; `official_url` confirmed
- [ ] `cities`: rent_range_eur for Berlin, Munich, Hamburg, Frankfurt (a rent may only be set with a source URL inside `note`)
- [ ] `sources`: `last_verified` for both entries
- [ ] `checklist`: confirm needs_translation / needs_apostille flags for degree, birth certificate, contract, insurance

## Spain (es) — all null / unverified

- [ ] `routes.es-work`: both fee amounts; criminal-record document rules; `required_language_level`; `official_url` confirmed; `last_verified`
- [ ] `routes.es-non-lucrative`: fee amount; **required financial means figure**; `official_url` confirmed
- [ ] `routes.es-student`: fee amount; living-costs figure; course language requirement; `official_url` confirmed
- [ ] `cities`: rent_range_eur for Madrid, Barcelona, Valencia, Seville
- [ ] `sources`: `last_verified` for both entries
- [ ] `checklist`: confirm translation/apostille flags (criminal record, degree)

## France (fr) — all null / unverified

- [ ] `routes.fr-talent`: both fee amounts; **salary/contract threshold figures**; `required_language_level`; `official_url` confirmed; `last_verified`
- [ ] `routes.fr-student`: fee amount; living-costs figure; course language requirement; `official_url` confirmed
- [ ] `routes.fr-family`: fee amount; sponsor housing/income figures; `official_url` confirmed
- [ ] `cities`: rent_range_eur for Paris, Lyon, Marseille, Lille
- [ ] `sources`: `last_verified` for both entries (also recheck the note about 2026 format changes in the group chat)
- [ ] `checklist`: confirm translation/apostille flags

## Italy (it) — all null / unverified

- [ ] `routes.it-work`: both fee amounts; **annual quota numbers**; `required_language_level`; `official_url` confirmed; `last_verified`
- [ ] `routes.it-student`: fee amount; living-costs figure; course language requirement; `official_url` confirmed
- [ ] `routes.it-family`: fee amount; sponsor housing details; `official_url` confirmed
- [ ] `cities`: rent_range_eur for Rome, Milan, Turin, Bologna
- [ ] `sources`: `last_verified` for both entries
- [ ] `checklist`: confirm translation/apostille flags

## Standing rules

- Unknown stays `null`. UI shows "Not yet verified" / "Not legal advice, check the official site".
- `last_verified` format is always YYYY-MM-DD.
- All amounts in EUR unless the official source says otherwise (`currency` field).
