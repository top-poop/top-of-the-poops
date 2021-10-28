#!/usr/bin/env python
import os
import subprocess
import sys
import argparse


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Convert access db to csv files")

    parser.add_argument("input", help="accessdb file ")
    parser.add_argument("--output", default=".", help="Output directory")

    args = parser.parse_args()

    database = args.input

    # Get table names using mdb-tables
    table_names = subprocess.run(['mdb-tables', '-1', database], stdout=subprocess.PIPE, encoding="utf-8").stdout
    tables = table_names.split('\n')

    # Walk through each table and dump as CSV file using 'mdb-export'
    # Replace ' ' in table names with '_' when generating CSV filename
    for table in tables:
        if table != '':
            filename = table.replace(' ', '_') + '.csv'
            print('Exporting ' + table)
            with open(os.path.join(args.output, filename), 'wb') as f:
                subprocess.run(['mdb-export', database, table], stdout=f)
