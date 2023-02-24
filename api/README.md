
# Thames Water Live API

This is licenced CC BY-NC-ND 4.0 - https://creativecommons.org/licenses/by-nc-nd/4.0/

You may not use this code for commercial purposes.

Please contact us if you wish alternative licensing arrangements.


### State Machine

Events are retrieved from Thames Water API and processed through the following state machine to create an
aggregate, then mapped into daily summaries. 

As of writing, the data starts from 2022-12-01

As CSOs are supposed to be Emergency use only, we have taken the decision to remove "Stop" events when they are received at exactly 
the same time as an "Offline", we then transition to a "Potentially Overflowing" state.
The reasoning is that, if it were possible to just stop the sewage, this would have been done, so it is only the monitoring that
has been switched off. This is completely open to discussion.


![State Machine](twstate.png)

