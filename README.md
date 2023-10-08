

# Top Of The Poops

Website: [top-of-the-poops.org](https://top-of-the-poops.org)

Seems that [#sewage](https://twitter.com/search?q=%23sewage) is on people's minds right now.

The UK publishes some information about sewage outfalls - here are some scripts to get this information, analyse it, and
perhaps publish some interesting findings.

## Data Reuse and Attribution

Please re-use our data.

Press contact: press [at] top-of-the-poops.org

If you publish data, content, or images from our site, please note it is [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), and as such we require suitable *attribution*

- Derived Data / General Content - should be attributed, with name and hyperlink  [Top of the Poops](https://top-of-the-poops.org)
- Images / Maps - should have caption '(c) top-of-the-poops.org', or similar, either as plain text or hyperlink, and ther should be a hyperlink as above in the main body of the text.

Please refer to: https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution

Derived data is (C) Top-Of-The-Poops - [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), all original data is (C) the original data owner, and is used under appropriate licence 


## Maps

We previously used mapbox but after getting very popular we couldn't afford it anymore!
Maps now rendered ourselves, but it's not going to be as fast as MapBox.

We use [TileServer GL](https://github.com/maptiler/tileserver-gl) in combination with a UK Vector map
from [MapTiler](https://www.maptiler.com/data/)


## How to use

You can clone the repo - I use IntelliJ IDEA to make a hot-reloading web page. 
The build runs locally with `make watch`

All data files are generated on developer machine, only the javascript build runs on CI. This ensures the CI build is acceptably fast.
Currently it runs in about 10 seconds. Which is OK, could be faster.

`make watch` uses inotify - this may not work on MacOS.

## Contributing

Contributions are welcome - especially CSS / Javascript improvements! But please chat before doing any real work - to make sure everyone is aligned with direction. 

### Development Environment

This has been developed on Linux, the makefiles may or may not work on a Mac.

### Pre-requisites

**Ensure you have python3 venv installed**:

```shell
sudo apt install python3.10-venv
```

**Install GDAL/OGR packages**:

https://mothergeo-py.readthedocs.io/en/latest/development/how-to/gdal-ubuntu-pkg.html

**Install  mdbtools**:

```shell
apt-get install mdbtools
```

**Start the PostgreSQL database**:

```shell
docker compose up
```

_If you have postgreSQL installed, you may need to stop your postgreSQL service_

### Setting up the database

```shell
make python
cd db/data
make load-all
```

### Generating json data files

You'll need to have set up the database stuff first

```shell
make generated
```


### React

Why is there a React app per page? 
Because it makes it easy to write the software

### MP Data 

https://www.theyworkforyou.com/mps/?f=csv
https://www.politics-social.com/list/name

#### Not fetched yet

http://everypolitician.org/uk/commons/download.html

https://www.ukinbound.org/wp-content/uploads/2020/07/List-of-MPs-with-active-Twitter-accounts-organised-by.pdf


### Constituency Shapes

https://opendata.arcgis.com/api/v3/datasets/19841da5f8f6403e9fdcfb35c16e11e9_0/downloads/data?format=shp&spatialRefId=27700

Source: Office for National Statistics licensed under the Open Government Licence v.3.0 

Contains OS data © Crown copyright and database right 2021

### Sewage Data

Event Duration Monitoring

https://environment.data.gov.uk/dataset/21e15f12-0df8-4bfc-b763-45226c16a8ac
https://environment.data.gov.uk/portalstg/home/item.html?id=045af51b3be545b79b0c219811d3d243
https://environment.data.gov.uk/portalstg/sharing/rest/content/items/045af51b3be545b79b0c219811d3d243/data

# 2022

https://environment.data.gov.uk/portalstg/home/item.html?id=2f8d9b7628dd4f60a30fb1a8483fc2ae

Consented Discharges with Conditions

https://environment.data.gov.uk/dataset/5fe5ab2e-d465-11e4-8a42-f0def148f590
https://environment.data.gov.uk/portalstg/sharing/rest/content/items/5e618f2b5c7f47cca44eb468aa2e43f0/data

#### Wales
Consented Discharges with Conditions

https://lle.gov.wales/catalogue/item/ConsentedDischargesToControlledWatersWithConditions/?lang=en
https://naturalresourceswales.sharefile.eu/share/view/s05adea6ab5d4df58/fo289e69-abc0-4acb-9923-271512440118
https://storage-eu-205.sharefile.com/download.ashx?dt=dt99e5eec3bd194293acd60049575d41ee&cid=9AQXBd2ldhvlRrRbQ8tE-w&zoneid=zpc3159d90-01f7-41a7-a8ab-3704157466&exp=1637152468&zsid=FB&h=F%2BC3TQBtcWx%2BYjb4jglnxmRAZLWwiRKrwDw7xn%2BoShI%3D


Event Duration Monitoring

2020 - Can't find! - Partial information at: https://www.dwrcymru.com/en/our-services/wastewater/combined-storm-overflows/valleys-and-south-east-wales

2021 - Main page: https://www.dwrcymru.com/en/our-services/wastewater/river-water-quality/combined-storm-overflows
2021 - Seems to be split over 3 files (with different formats), unknown overlap with Environment Agency data.
 - https://www.dwrcymru.com/-/media/Project/Files/Page-Documents/Our-Services/Wastewater/CSO/EDM-Return-Dwr-Cymru-Welsh-Water-Emergency-Overflow-Annual-2021.ashx
 - https://www.dwrcymru.com/-/media/Project/Files/Page-Documents/Our-Services/Wastewater/CSO/EDM-Return-Dwr-Cymru-Welsh-Water-Storm-Overflow-Annual-2021.ashx
 - https://www.dwrcymru.com/-/media/Project/Files/Page-Documents/Our-Services/Wastewater/CSO/EDM-Return-DCWW_Wales-Water-Annual-2021.ashx


# Bathing 

Bathing Water Monitoring Locations
https://www.data.gov.uk/dataset/dcb8bd46-c4cf-4749-bad0-7663da96845c/bathing-waters-monitoring-locations
 Name + Classification by year

Sensitive Areas Bathing
https://www.data.gov.uk/dataset/4e2bbdb4-15d3-49dc-ba22-904045b091fb/sensitive-areas-bathing-waters
https://datamap.gov.wales/layers/inspire-nrw:NRW_UWWTD_SA_BATHING_WATERS





### Postcodes

https://geoportal.statistics.gov.uk/datasets/ons-postcode-directory-february-2020/about

https://data.gov.uk/dataset/6de48d19-b3a0-4e45-b98e-01bd781b035c/ons-postcode-directory-latest-centroids

http://geoportal1-ons.opendata.arcgis.com/datasets/75edec484c5d49bcadd4893c0ebca0ff_0.csv?outSR={%22latestWkid%22:27700,%22wkid%22:27700}

### Software

You'll need the following:

- python3
- libreoffice
- gdal-bin

# Things to do

- Link with voting results - need to find the division results...
- Rivers and beaches by constituency?
- Constituency page showing all the things by constituency?


# Data Quality

To be sure the quality of the data is unbelievably poor. Perhaps it is so poor so that it is hard to understand?

## 2021 Data

### Issues
 - Distributed as an Excel file, which is hard to process
   - Should ideally be a machine readable format. I'll say simple XML, with schema, but a consistent CSV file would be OK.
 - Mix and match of data types 
   - Numeric columns have "N/A", "#N/A", and "#NA"
   - Name columns have "0" in
   - Percentage values scale from 0-1 in some sheets, and 0-100 in others, because some sheets have cells set to "Numeric", and others to "Percent"
 - Continuation rows
   - A few of the sheets don't stick to "one row per record", which is kinda mandatory in a machine readable file.
 - Inconsistent data
   - Particularly consent ids don't match consent ids in the consent database - the formatting differs
   - Consent ids don't have a consistent format.
   - Loads of EDM rows don't match valid consents. 
 - Duplicate data rows 
   - Some data rows are duplicates in many of the source files. It is not clear why, it looks like an extract from a database upstream has maybe repeated rows where there are multiple assets with the same consent information?
 - Wales data is spread over multiple files, with different formats, and may or may not overlap with EA data.


### Noted Improvements
 - The files are now tabs in a single document with *almost* consistent data across the tabs.

### Example Duplicate Data

```
'Anglian Water', 'DAVENTRY SEWER SYSTEM', 'AW5NF181', 'A1'
'Dwr Cymru Welsh Water', '#TBC', '#N/A', '', '', '', '0.25', '1', '100', ''
'Severn Trent Water', 'WITTON - GEORGE ROAD XXX (CSO)', 'TBC', '', '', '', '', '', '', ''
'South West Water', 'KINGSAND SEWAGE PUMPING STATION', '301903', 'A1', '', 'KINGSAND BEACH', '33.72', '21', '100', ''
```

