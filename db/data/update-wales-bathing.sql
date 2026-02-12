
/*
  welsh water only gave bathing information in 2021, so copy the information across
  to other years
  new CSOs won't have that information.. but probably ok?
*/

UPDATE edm AS target
SET bathing = source.bathing
FROM edm AS source
WHERE source.reporting_year = 2021
  AND target.consent_id = source.consent_id
  AND target.reporting_year IN (2020, 2022, 2023, 2024)
  AND target.bathing IS NULL
  and source.bathing is not null
  and target.bathing is null
  and source.company_name = 'Dwr Cymru Welsh Water'
  and target.company_name = source.company_name
;
