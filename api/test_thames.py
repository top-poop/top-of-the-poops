import datetime
from datetime import timezone


def test_parsing_date():
    assert datetime.datetime.fromisoformat('2022-04-01T00:00:00') == datetime.datetime(2022, 3, 31, 23, 0, 0, tzinfo=timezone.utc)
