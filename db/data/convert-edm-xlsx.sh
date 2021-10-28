#!/bin/bash

cd $1

for i in EAv*.xlsx
do
  libreoffice --headless --convert-to csv "$i"
done

