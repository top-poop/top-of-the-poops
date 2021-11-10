

# Top Of The Poops

Website: [top-of-the-poops.org](https://top-of-the-poops.org)

Seems that [#sewage](https://twitter.com/search?q=%23sewage) is on people's minds right now.

The UK publishes some information about sewage outfalls - here are some scripts to get this information, analyse it, and
perhaps publish some interesting findings.

## How to use

You can clone the repo - I use IntelliJ IDEA to make a hot-reloading web page. 
The javascript build runs with `make watch` - then make sure to `make prod` before pushing to prod.

`make watch` uses inotify - this may not work on MacOS.

## Contributing

Contributions are welcome - especially CSS / Javascript improvements! But please chat before doing any real work - to make sure everyone is aligned with direction. 

### Development Environment

This has been developed on Linux, the makefiles may or may not work on a Mac.

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

### MP Data 

https://www.theyworkforyou.com/mps/?f=csv

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

Consented Discharges with Conditions

https://environment.data.gov.uk/dataset/5fe5ab2e-d465-11e4-8a42-f0def148f590
https://environment.data.gov.uk/portalstg/sharing/rest/content/items/5e618f2b5c7f47cca44eb468aa2e43f0/data


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

- Improve matching of constituencies - some points lie just outside
- Link with voting results - need to find the division results...
- Add sewage dump count to beaches & shellfisheries
- Add Tweet to MP / Facebook MP.