import argparse
import datetime


class DateArgAction(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        setattr(namespace, self.dest, datetime.date.fromisoformat(values))
