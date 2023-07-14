# Pack List Wizard
This is documentation for the "Pack List Wizard" plugin which is a plugin that utilizes PHP and Javascript to take user input from an HTML form, calculate necessary backpack, food, and tent weights, and output custom backpacking and food lists via the OpenAI API.

The plugin composes of 4 files
`wizard.php`: the php file for the plugin. Contains an html form for user input. Users can also click the "?" buttons to get help understanding what to put in each input
`script.js`: javascript for taking the form responses, calculating the max weight of pack, how much food the hiker needs, and inserting all that into a ChatGPT prompt where it's outputted to the user. Also provides notifications to the users when their request has been accepted and when the lists or produced or if there's errors.
`lists.css`: CSS for displaying the backpacking and food lists.
`slider.js`: javascript for displaying the value of the slider to the user.

These files are located in `wp-content/plugins/pack-list-wizard-2` in the Wordpress site and labeled as "Pack List Wizard" in the plugins list in the admin menu. The plugin is inserted into a page via the shortcode `[wizard]`. The source code for the plugin (with sensitive information removed) is included in this repo.

## Including external files and data
External files are included via `wp_enqueue_script` which links a Javascript file to the plugin, and `wp_enqueue_style` which links a CSS file to the plugin.
```php
// Enqueue JavaScript and CSS files
function custom_form_enqueue_scripts() {
    // Enqueue script.js file
    wp_enqueue_script('custom-form-script', plugins_url('script.js', __FILE__), array('jquery'), '1.0', true);

    // Enqueue slider.js file
    wp_enqueue_script('custom-slider-script', plugins_url('slider.js', __FILE__), array(), '1.0', true);

    // Enqueue noty.min.js file
    wp_enqueue_script('noty-script', 'https://cdnjs.cloudflare.com/ajax/libs/noty/3.1.4/noty.min.js', array(), '3.1.4', true);

    // Enqueue noty.min.css file
    wp_enqueue_style('noty-style', 'https://cdnjs.cloudflare.com/ajax/libs/noty/3.1.4/noty.min.css', array(), '3.1.4');
    
    // Enqueue lists.css file
    wp_enqueue_style('slider-style', plugins_url('lists.css', __FILE__), array(), '1.0');

    // Define the API key variable
    $api_key = 'API KEY'; // Replace with your actual API key

    // Pass the ChatGPT API key to the JavaScript file
    wp_localize_script('custom-form-script', 'customFormAjax', array(
        'api_key' => $api_key
    ));
}
add_action('wp_enqueue_scripts', 'custom_form_enqueue_scripts');
```

The API key is exported from the PHP file to the `script.js` file (responsible for OpenAI calls, referenced as `custom-form-script`)
```php
$api_key = 'API KEY'; // Replace with your actual API key

// Pass the ChatGPT API key to the JavaScript file
wp_localize_script('custom-form-script', 'customFormAjax', array(
    'api_key' => $api_key
));
```

## HTML Form
The frontend HTML form is embedded in `wizard.php` in `custom_form_generate_form()`. Modifying the look/functionality of this form is like modifying a traditional HTML/JS/CSS page. Simply edit the files as necessary, go to the file manager and replace the old files with the new modified ones.

## OpenAI API Call

Here is the overall structure of the ajax call required for OpenAI API call
```javascript
$.ajax({
	type: 'POST',
	url: 'https://api.openai.com/v1/engines/text-davinci-003/completions',
	headers: {
	   'Authorization': 'Bearer ' + customFormAjax.api_key,
	   'Content-Type': 'application/json'
	},
	data: JSON.stringify(data),
	success: function(response) {
	  //notify success
	},
	error: function(jqXHR, textStatus, errorThrown) {
	   //notify error
	}
});
```

`$.ajax`: this is used for sending the request via a `POST` API call. The chatGPT token, referenced as `customFormAjax.api_key` is inserted into the auth header.

the `data` object is defined before the ajax call and is used to define properties of the response. Here are the specific values used:
```javascript
var data = {
    'prompt': prompt,
    'max_tokens': 600,
    'temperature': 0.7,
    'top_p': 1
};
```

- `prompt`: The initial input or instruction provided to the model.
- `max_tokens`: The maximum length (in tokens) of the generated output. If you find the response is consistently being cut off prematurely, you should increase this value.
- `temperature`: Controls the randomness of the generated text. Higher values make it more diverse, while lower values make it more focused.
- `top_p`: Constrains the generation by considering only the most probable tokens based on a cumulative probability threshold.

Together, these parameters allow you to set the context, control the length, adjust the randomness, and determine the probability distribution of the generated text.

Several values are calculated from user input and inserted into the prompt to ChatGPT.

### Backpack weight
The function `maxPackWeight()` calculates the max weight of a person's backpack given their weight and age as follows:

<table cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td>
<p>Age</p>
</td>
<td>
<p>Multiply by 19% and person&rsquo;s weight</p>
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

It isn't recommended for people under 10 years old or over 80 years old to go backpacking. The form alerts the user via a notification to indicate such.

### Food/water weight
Much less involved; all that's done is multiply 2.5 pounds per day by the number of days the person is hiking. For water weight, 4 pounds (64 oz) is used.

### Tent
The user specifies how many people (including them) will be in their tent; anywhere from 1 to 10+. For x people to share a tent, it's recommended they use a x+1 person tent. For instance:
* 1 person would use a 2-person tent
* 2 people would share a 3-person tent, etc.

A x-person tent is 2.5x pounds. Meaning that:
* 1 person uses a 2-person tent which is 5 pounds.
* 2 people share a 3-person tent which is 7.5 lbs, etc.

### Average and Max Elevation
The user specifies these via sliders ranging from 1000ft to 15,000ft. These are specified in the input prompt for ChatGPT.

### Season
The user can select which season they are hiking in (Spring, Summer, Fall, Winter). If the user selects Spring or Fall, extra context is added to the prompt as for what to expect and what to bring in response:


<table>
<thead>
<tr>
<th>Spring</th>
<th>Fall</th>
</tr>
</thead>
<tbody>
<tr>
<td>Runoff from snow; swollen streams and rivers</td>
<td>Water scarcity due to streams drying up</td>
</tr>
<tr>
<td>Increased mosquito activity; must bring insect repellent</td>
<td>Snow at higher elevations</td>
</tr>
<tr>
<td>Snow at higher elevations</td>
<td>Potential surprise temperature drops</td>
</tr>
<tr>
<td>Exercise caution when crossing water</td>
<td>More predictable water levels</td>
</tr>
</tbody>
</table>


## Updating the Plugin
Whenever you make changes to the two files locally, you need to delete and re-add them in the WP File Manager.
Unlike the Python plugin I made in April, execution permissions aren't required for any of the scripts, so you don't need to log into the EC2 instance to do so each time. This makes it easier to update the plugin.

## Using the Plugin

The plugin is inserted into a page using the shortcode  `[wizard]`. It is currently being displayed/run at  [https://www.sierrahiking.net/preparation/](https://www.sierrahiking.net/preparation/)

Simply enter the user's age, weight in pounds, length of the hike in days, preferred season, average and max elevation, and how many people will share your tent. From there, a backpacking list, with the max weight of the pack as well as weight of food, water and tent is produced. Because it uses OpenAI, it takes a few seconds for the response to generate. Javascript toast notifications are used to indicate the following situations:
- their request is valid and the program will produce the lists
- the lists were produced via OpenAI successfully
- there was an error in producing the lists via OpenAI

## 7/14 Update: Categorization
Modified the plugin to do the following:
- First, ask ChatGPT to provide a weight distribution for an x-day hike with a weight close to, but not exceeding, the max pack weight. Weight is divided in 5 categories:
	- Clothing
	- Cooking Equipment
	- Sleeping Equipment
	- Food
	- Other
- ChatGPT produces a weight for each category. For each category, ask ChatGPT to produce a list of items for that category as close to, but not exceeding, the weight of that category.
- Results are printed out in 5 columns. Each item has a weight listed with them. The total weight of the category is also displayed. Toast notifications are used to indicate each step of the process (producing category weights, producing each category list)

## Updating Plugin; Caching Issues
When updating the plugin, I noticed there are odd issues with machine, specifically with the `wizard.js` file. Specifically, the version of the file is June is used, even though it was deleted and replaced with the current version. This is remedied by deleting the folder, re-adding the contents, and changing its name. Perhaps this was a result of the file not being edited for awhile, or perhaps something with the file manager plugin? Unsure about that, but it doesn't need extensive investigation as an easy, effective solution already exists.