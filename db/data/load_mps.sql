\copy mps from 'download/mps.csv' delimiter ',' csv header;

/* unfortunately the pcon_july_2024_uk_bfc dataset has w not ŵ, so make consistent */
update mps set constituency = 'Montgomeryshire and Glyndwr' where constituency = 'Montgomeryshire and Glyndŵr';