import dataclasses
import datetime


@dataclasses.dataclass(frozen=True)
class BBEvent:
    id: str
    eventId: str
    siteUnitNumber: str
    bathingSite: str
    eventStart: str | datetime.datetime
    eventStop: str | datetime.datetime
    duration: int
    activity: str
    associatedSiteId: str
    outfallName: str
    isImpacting: bool
