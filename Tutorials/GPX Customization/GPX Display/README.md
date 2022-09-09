# GPX Elevation Data
Exporting KML files from Google Earth yields files with no elevation data. Here is how to convert a KML file to a GPX file with Elevation Data.

First, go to this site: https://www.gpsvisualizer.com/convert_input, and select a file to convert.
Then, go to "Add DEM elevation data:” and select the elevation data to use. I used one based in the U.S., as I figured it be most accurate for our maps.

<img src = "1. Options Selected.png">

From there, click the convert button, and you should see something like this:

<img src = "2. Elevation Data acquired.png">

Here is a line from the resulting file. Notice how the resulting file now has elevation data, as the elevation field isn’t zero.
```
<trkpt lat="38.147820943" lon="-119.377481824">
    <ele>2164.352</ele>
```

# Merging Multiple GPX Files Together
Multiple polylines can be dispalyed on the same map by merging all of the GPX files together into one file, and importing that file into a map.

Info source: https://www.mapsmarker.com/kb/faq/can-i-add-multiple-gpx-tracks-to-a-map

Here’s a GPX merger with an easy-to-use interface: https://gpx.studio/
User guide: https://gpx.studio/about.html#guide

Load GPX files into the site by clicking “Load GPX”. From there, you can choose whether to upload a file from your computer or from Google Drive. There appears to be no limit as to how many files you can load/merge.
Once you loaded in all the GPX files you want to merge, click “Export” and select “Merge all traces” to merge all the GPX files into one file. Click the “Download” button to download the resulting file.
On this site, you can also edit existing GPX files or make your own.

A particular trail can be selected by clicking the buttons in the upper righthand corner of the map.