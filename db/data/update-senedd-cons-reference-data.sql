
drop table if exists senedd_cons;

create unique index if not exists pcon_july_2024_uk_bfc_nm on pcon_july_2024_uk_bfc(pcon24nm);

create table senedd_cons (
    ogc_fid integer,
    pcon24nm text references pcon_july_2024_uk_bfc(pcon24nm)
);

create unique index senedd_cons_cons on senedd_cons(pcon24nm);

-- Afan Ogwr Rhondda
insert into senedd_cons values (1,'Aberafan Maesteg');
insert into senedd_cons values (1,'Rhondda and Ogmore');

-- Fflint Wrecsam
insert into senedd_cons values (2,'Alyn and Deeside');
insert into senedd_cons values (2,'Wrexham');

-- Bangor Conwy Môn
insert into senedd_cons values (3,'Bangor Aberconwy');
insert into senedd_cons values (3,'Ynys Môn');

-- Blaenau Gwent Caerffili Rhymni
insert into senedd_cons values (4,'Blaenau Gwent and Rhymney');
insert into senedd_cons values (4,'Caerphilly');

-- Brycheiniog Tawe Nedd
insert into senedd_cons values (5,'Brecon, Radnor and Cwm Tawe');
insert into senedd_cons values (5,'Neath and Swansea East');

-- Caerdydd Ffynnon Taf
insert into senedd_cons values (6,'Cardiff North');
insert into senedd_cons values (6,'Cardiff East');

-- Caerdydd Penarth
insert into senedd_cons values (7,'Cardiff West');
insert into senedd_cons values (7,'Cardiff South and Penarth');

-- Sir Gaerfyrddin
insert into senedd_cons values (8,'Caerfyrddin');
insert into senedd_cons values (8,'Llanelli');

-- Ceredigion Penfro
insert into senedd_cons values (9,'Ceredigion Preseli');
insert into senedd_cons values (9,'Mid and South Pembrokeshire');

-- Clwyd
insert into senedd_cons values (10,'Clwyd East');
insert into senedd_cons values (10,'Clwyd North');

-- Gwynedd Maldwyn
insert into senedd_cons values (11,'Dwyfor Meirionnydd');
insert into senedd_cons values (11,'Montgomeryshire and Glyndwr');

-- Gŵyr Abertawe
insert into senedd_cons values (12,'Gower');
insert into senedd_cons values (12,'Swansea West');

-- Pontypridd Cynon Merthyr
insert into senedd_cons values (13,'Merthyr Tydfil and Aberdare');
insert into senedd_cons values (13,'Pontypridd');

-- Sir Fynwy Torfaen
insert into senedd_cons values (14,'Monmouthshire');
insert into senedd_cons values (14,'Torfaen');

-- Casnewydd Islwyn
insert into senedd_cons values (15,'Newport East');
insert into senedd_cons values (15,'Newport West and Islwyn');

-- Pen-y-bont Bro Morgannwg
insert into senedd_cons values (16,'Bridgend');
insert into senedd_cons values (16,'Vale of Glamorgan');
