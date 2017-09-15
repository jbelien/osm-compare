# Roadmap

This is about: what is the ambition of this project and tries to define a roadmap to get there.

## Overview

We want a tool that can compare points from a external sources to points from OSM. We want to be able to provide a comparision of what's missing, bidirectionally. We want to make things easier to sync up datesets with what's in OSM.

It's important that this happens using the community, meaning human eyes need to verify what get's uploaded. That doesn't mean we can try and minimize whatever mappers need to do.

## Version Ultimate

So where do we want to end up:

- A tool where people can upload points or add URL's to files containing points.
- Comparison process that reruns to keep datadets up-to-date.
- A script that can optionally be added to translate attributes.
- A nice and convenient output that can be fed into the tasking manager/to fix/maproulette or whatever other tool that's appropriate.

## How can we get there

We try to divide this into different user stories.

### Compare on a map

_A user wants to compare points to whatever is in OSM._

How we see this done:

- Upload a GeoJSON file containing points.
- Define an overpass query to get the OSM data.
- Show them next to eachother on two maps.

**DONE**

### Generate differences

_A user wants to know what is still missing in OSM_

How we see this working:

Generate two difference maps:

- Whatever is on OSM but not in the external sources.
- Whatever is in the external source but not in OSM.

### Support false-positives

_A user wants to be able to mark data that is incorrect_

Data can be wrong. We want to support signaling false-positives to prevent invalid data from tainting the comparision process.

How we see this working:

- Add the option to add false positives apart from the source. Usually the source will be an external URL and immutable.

### Support saving 'tasks'

_A user wants to save a comparison process to prevent the need to recreate it over and over again._

How we see this working:

- Use the OSM OAuth or others to authenticate users.
- Provide an overiew of 'task'.
- Allow to save a 'task' that consists of:
  - Source URL or file.
  - Overpass Query.
  - Name

### Recomparing a project

_A user want to recompare a saved task._

How we see this working:

- Add a button that triggers the comparison process.
- Updated the maps after.

### Auto recompare a project.

_A user wants to be notified if something needs to be done._

How we see this working:

- Add notification settions to tasks.
- Add a process that recompares automatically.
