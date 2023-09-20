# Pack List Wizard
[View Plugin on Site](https://www.sierrahiking.net/pack-list-wizard/)

This is documentation for the "Pack List Wizard" plugin which is a plugin that utilizes PHP and Javascript to take user input from an HTML form, calculate necessary backpack, food, and tent weights, and output custom backpacking and food lists via the OpenAI API. Lists are generated as JSON objects, making it more straightforward to generate the tables on the page and ultimately convert to a CSV on download.

The plugin composes of 13 files
`api-key-manager.css`: css for applying styling to summary labels on the finished form.
`button.css`: css for "submit" and "download" buttons
`dropdown.css`, `dropdown.js`: css and js for the dropdown menu for the 3 sections of the plugin; "Configuration", "Recommendations", "Summary". Also contains CSS for the tabs. This navbar collapses to a hamburger menu on mobile.
`errorHandler.js`: a global error handler that immediately stops the program is any uncovered error occurs.
`pdf.js`: js file to export the lists and summary as a CSV file.
`progress.css`, `progress.js`: css and js for the progress bar. indicates what list is currently being generated, or any errors that occur.
`script.js`: the bulk of the javascript /plugin functionality is in this file. takes in the form responses, gets the max weight of the pack, and sends prompts to ChatGPT to generate the category weights and each of the lists. Each list is outputted as a json object. Generates the table for each json object.
`slider.js`: js to make the elevation sliders show their current value.
`table.css`: css for generating the summary tables
`title.css`: title for css and sidebars
`wizard.php`: the php file for the plugin. Contains an html form for user input.

These files are located in `wp-content/plugins/pack-list-wizard` in the Wordpress site and labeled as "Pack List Wizard" in the plugins list in the admin menu. The plugin is inserted into a page via the shortcode `[wizard]`. The source code for the plugin (with sensitive information removed) is included in this repo.

## OpenAI

### Generating the Prompt
generateCategoryPrompt(itemName, hikeLength, weight)
- location: script.js, line 399
- function: generates the prompt for ChatGPT given the category name (itemName), length of the hike in days (hikeLength), and max weight of that category (weight)
	- there are various if statements for each of the categories

generateMiscList(miscCategory, conversation, hikeLength)
- location: script.js, line 282
- function: generates the misc list given the miscCategory object; contains name and max weight, and hike length
	- this list is generated lists
	- given the context (conversation variable), explicitly state not to generate items in the other lists.

### Calling the API
fetchOpenAI(prompt)
- location: script.js, line 298
- function: given a prompt (string), sends it to ChatGPT and returns the response JSON
	- token limit is defined as follows:
		- 1200 for all prompts, except food
		- 600 * floor(hikeLength/3) for food
			- a 400 error was encountered for food previously and was adjusted accordingly.

getCategoryWeights(prompt)
- location: script.js, line 604
- function: given a prompt, generates the category weights

addQuestion(userQuestion)
- location: script.js, line 598
- function: adds the OpenAI response to the outgoing context list. Used to ensure the misc list doesn't include redundant items.

### API key manager
Zuplo is a 3rd party manager used to secure the OpenAI API key The API is in the environment variable and is used in the request with the fetch URL. Both are ferried from a proxy zuplo.dev fetch URL, which is at line 1 of `script.js`. This won't change.

More info here: https://zuplo.com/blog/2023/02/27/protect-open-ai-api-keys

This is the only external software used for the plugin. Everything else for the functionality is vanilla Javascript, CSS, and PHP

### Backpack weight
The function `maxPackWeight()` calculates the max weight of a person's backpack given their weight and age as follows:

<table cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td>
<p>Age</p>
</td>
<td>
<p>Multiply by weight ratio and person&rsquo;s weight</p>
</td>
</tr>
<tr>
<td>
<p>10-19</p>
</td>
<td>
<p>90%</p>
</td>
</tr>
<tr>
<td>
<p>20-29</p>
</td>
<td>
<p>100%</p>
</td>
</tr>
<tr>
<td>
<p>30-39</p>
</td>
<td>
<p>90%</p>
</td>
</tr>
<tr>
<td>
<p>40-49</p>
</td>
<td>
<p>85%</p>
</td>
</tr>
<tr>
<td>
<p>50-59</p>
</td>
<td>
<p>80%</p>
</td>
</tr>
<tr>
<td>
<p>60-69</p>
</td>
<td>
<p>75%</p>
</td>
</tr>
<tr>
<td>
<p>70-80</p>
</td>
<td>
<p>70%</p>
</td>
</tr>
</tbody>
</table>

Also, there are several weight classes which affect the weightRatio as follows:
```javascript
//weight ratios for the various categories; base ratio to body weight
var ultralight = 0.15;
var light = 0.19;
var standard = 0.23;
var robust = 0.27;
```

It isn't recommended for people under 10 years old or over 80 years old to go backpacking. The form alerts the user via a notification to indicate such.

## Updating the Plugin
Whenever you make changes to the two files locally, you need to delete and re-add them in the WP File Manager.
Unlike the Python plugin I made in April, execution permissions aren't required for any of the scripts, so you don't need to log into the EC2 instance to do so each time. This makes it easier to update the plugin.
If that doesn't seem to work immediately, also change the version number in wizard.php. This enables updates to be accurately reflected if they haven't already; I noticed when developing the plugin that not changing the version number caused changes not to reflect. Make sure to disable and reenable the plugin so changes are reflected, and reload the page if the plugin is already open.
```php
<?php
/**
* Plugin Name: Pack List Wizard
* Description: Generates packing list from HTML form and uses ChatGPT API for responses. Improved prompts! Supports list export as CSV! Lists saved as JSON for straightforward display on page and conversion to CSV. More secure API key storage via Zuplo!
* Version: 25.0
*/
```
If that doesn't, remove and re-add all the files for the plugin. Wordpress isn't this troublesome all the time; just outlining stuff you can do if it is.

## Using the Plugin

The plugin is inserted into a page using the shortcode  `[wizard]`. It is currently being displayed/run at  [https://www.sierrahiking.net/preparation/](https://www.sierrahiking.net/preparation/)

Simply enter the necessary info. From there, a backpacking list, with the max weight of the pack as well as weight of food, water and tent is produced. Because it uses OpenAI, it takes a few seconds for the response to generate. A loading bar is used to show the status of the list generation, and any errors that may appear.

## Future Updates
In the future, the following updates can be added to the plugin to improve functionality and provide more meaningful insight.
- Improved error handling
	- Ability for plugin to "retry" generating a list before sending a failure message of that didn't work.
-   Adding calories with food recommendation
-   Adding daily milage as an input; can be used for approximating the calorie burn rate, and potentially more intelligent food recomendations
	-   Extension of that idea would have the option od “expected calorie burn”. With people having smart watches.
-   Inputting a GPX file and return what the approximate calorie burn rate would be.
-   Potentially using a Weather API in some capacity?
	- Given user's location, provide accurate temperature in the area they plan on hiking in (given the seasons)
-   Searching the internet for up-to-date information on items in the backpacking list (where to get them, price, etc?)