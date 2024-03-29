# sierrahiking
Contains all the raw files for sierrahiking.net

The general workflow should be that all raw or initial content should be saved here before they are entered into the Wordpress site.  Once they enter the Wordpress site, they may be changed as needed.  For instance the writeup.txt file simply contains the initial text for the write-up on a hike.  Once the text is entered into the wordpress site, it may be modified as needed.  Those modifications do not need to be synced back to this page.   Further site back-up and downloads will be done in other Folders.

The Design folder should contain concrete notes about the site which includes info on what plugsins we use, cloud platforms, snapshots of our design diagrmas from Miro, etc.

The Notes folder contains any free-form notes that we have.   Significant emails or MacOS Notes can be stored here.

The Tutorials folder contains instructions on various aspects of site and feature customization outside the scope of plugins.

HikePages folder contains all the content for the individual hikes.  The subfolders must start with a year, followed by the title.   The content within a Hiking page must include, .jpgs, write-up, GPX, KML files, etc.   

The OpenAI folder contains information about the usage of the OpenAI API as a means to produce a curated hiking list for the user given their age, weight, and length of the hike in days. Also includes the source code for a plugin that generates a frontend form, to which submitting a form invokes a python function that generates a response given the user input into the prompt. OpenAI secret key is not included in the file on this public repo for security purposes.