import argparse
import csv
import pathlib

from bbevent import BBEvent

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=pathlib.Path)
    parser.add_argument("output", type=pathlib.Path)

    args = parser.parse_args()

    with open(args.input) as ih:
        csvinput = csv.DictReader(ih)

        with open(args.output, "w") as oh:
            csvoutput = csv.DictWriter(oh, fieldnames=[
                "id", "eventId", "siteUnitNumber", "bathingSite",
                "eventStart", "eventStop", "duration", "activity",
                "associatedSiteId", "outfallName", "genuine", "impacting"])

            csvoutput.writeheader()

            for row in csvinput:
                event = BBEvent(**row)

                genuine =  "Not Genuine" not in event.activity
                impacting = genuine and ("Non Impacting" not in event.activity)

                csvoutput.writerow({
                    "id": event.id,
                    "eventId": event.eventId,
                    "siteUnitNumber": event.siteUnitNumber,
                    "bathingSite": event.bathingSite,
                    "eventStart": event.eventStart,
                    "eventStop": event.eventStop,
                    "duration": event.duration,
                    "activity": event.activity.strip(),
                    "associatedSiteId": event.associatedSiteId,
                    "outfallName": event.outfallName,
                    "genuine": genuine,
                    "impacting": impacting
                })



