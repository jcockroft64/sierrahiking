# Wordpress OpenAI Plugin
Documentation on how the plugin was developed, how to maintain it, and design considerations for the future. Plugin was generated through successive prompts with ChatGPT.

## Components of the Plugin
The plugin consists of a PHP file and a Python file. These files are located in `wp-content/plugins/hiking-form-plugin` in the Wordpress site and labeled as "Hiking Form Plugin" in the plugins list in the admin menu. The plugin is inserted into a page via the shortcode `[hiking-form]`. The source code for the plugin (with sensitive information removed) is in the `hiking-form-plugin` folder in the repo.

## How the Plugin Works
The source of the plugin is the PHP file. The file contains the `hiking_form_shotcode` function which is responsible for generating the frontend form, and executing the python script upon submit. Here is an empty skeleton code to show this.
```php
#!/usr/bin/php
<?php
/*
Plugin Name: Hiking Form Plugin
Plugin URI: https://example.com/
Description: A plugin that takes the users age, weight, and hike length and produces a backpacking list for them.
Version: 1.0
Author: Your Name
Author URI: https://example.com/
*/

function hiking_form_shortcode() {
  #code, functions, etc go here
}
add_shortcode('hiking_form', 'hiking_form_shortcode');
```

### Executing Shell Commands

This command executes the file `print_hiking_data.py` (in the same directory as the php file for the plugin).

The variable `$command` is used to produce the text for the command to run the python file given the argument

```php
$command = "/usr/bin/python3 "  .  __DIR__  .  "/"  .  "print_hiking_data.py "  .  $age  .  " "  .  $weight  .  " "  .  $hike_length;
```

- `.`: used to join distinct strings/spaces/variables etc as to properly generate the command.
- `usr/bin/python3`: use this to indicate the location of the python environment to execute python
- `__DIR__`: the current location of the file
- `/` to add a slash
- `print_hiking_data.py`: the python file in question
- `$age`, `$weight`, `$hike_length`: the age, weight, and hike length taken from the frontend form. added to the commandline argument. The commandline arguments are interpreted by the python script

```python
#get user input
age = sys.argv[1]
weight = sys.argv[2]
hike_length = sys.argv[3]

print("Age: " + age)
print("Weight: " + weight)
print("Length of Hike: " + hike_length + " days")
```

From there, the variable `$handle` is defined to run the command through `popen`, which serves as a pointer to the shell command. The variable `$output` is defined to read the output of `$handle`. `pclose()` is used to close the handle, which essentially frees the memory of the pointer.
```php
$handle = popen( $command . ' 2>&1', 'r' );

$output = '';
$output .= "<pre>";

while ( ! feof( $handle ) )
{
    $output .= fread( $handle, 2096 );
}
$output .= "</pre>";
pclose( $handle );
```

The function `generate_hiking_list` takes the age, weight, and length of the hike as inputs and inserts them into a ChatGPT prompt. The model used is gpt 3.5 turbo. The temperature is set to 0. The temperature is the probability the next token is common in the vocabulary.  There isn't a need to change it at this point, but it's open to experimentation. From there, the message content is returned.

```python
# Define function to generate hiking list
def generate_hiking_list(age, weight, hike_length):
    prompt = f"Generate a hiking list for a {age}-year-old, {weight}-pound person going on a {hike_length}-day hike in the Sierra Nevadas."
    prompt += "The list should be displayed in 2 columns, with the left column being the item and the right column being its weight in pounds."
    completion = openai.ChatCompletion.create( # 1. Change the function Completion to ChatCompletion
        model = 'gpt-3.5-turbo',
        messages = [ # 2. Change the prompt parameter to the messages parameter
            {'role': 'user', 'content': prompt}
        ],
        temperature = 0  
    )
    return completion['choices'][0]['message']['content']
```

The function is referenced to print the hiking list
```python
hiking_list = generate_hiking_list(age, weight, hike_length)
print("Backpacking List:")
print(hiking_list)
```
All the printed python text is displayed on the frontend. The usage of `2>&1` for the `$handle` is for redirecting `stderr` to `stdout`, so any errors are also printed on the frontend to give better insight of what is and isn't working.

Other resources for ChatGPT 3.5 in Python

https://stackoverflow.com/questions/75774873/openai-chatgpt-gpt-3-5-api-error-this-is-a-chat-model-and-not-supported-in-t

https://platform.openai.com/docs/models/overview


### Regenerating OpenAI API Key
If you ever need to make a new OpenAI API key, simply go to 
https://platform.openai.com/account/api-keys and click "Create New Secret Key". Make sure to copy/paste the API key, as it cannot be displayed on the OpenAI site after generating it. The only time you would need to make a new API key is when it is "rotated" due to it being know to be exposed publically.

## Updating the Plugin
Whenever you make changes to the two files locally, you need to delete and re-add them in the WP File Manager.

Delete and re-add the updated files in their location in the WP File Manager
If you are updating the Python script, you **MUST** grant it execution permissions.
- log into the EC2 instance on the command line and navigate to `/stack/wordpress/wp-content/plugins/hiking-form-plugin`
- run the command `sudo chmod +x print_hiking_data.py`
- verify it worked by doing `ls`; the python file should be bolded. also use `ls -l` to list permissions. The python file should have execution permissions indicated by the letter `x` in the permission string.
- Go to wp-admin -> plugins. deactivate and reactivate the "Hiking Form Plugin" plugin. Otherwise, the updated changes won't be reflected in the execution of the plugin.

## External Libraries/Programming Environment
This program uses the `openai` Python package. Initally, Wordpress didn't have the adequate permissions to import and use the openai package. Here is how that was fixed.
- in the ec2 instance, navigate to `/usr/sbin`
- grant complete permission via this command
	- `sudo chmod 777 .`
- This command grants complete permissions to `/usr/sbin`, allowing Wordpress to execute the Python environment from the EC2 instance.

## Using the Plugin
The plugin is inserted into a page using the shortcode `[hiking-form]`. It is currently being displayed/run at https://www.sierrahiking.net/python-test-2/

Simply enter the user's age, weight in pounds, and length of the hike in days. From there, a list of items and their weights is outputted on the frontend. Because it uses OpenAI, it takes a few seconds for the response to generate.

## Future Design Considerations

### OpenAI Usage
Building off of the hiking list, the food list be generated by inputting the length of the hike, and perhaps even the weight of the food outputted by the backpacking list prompt. Generating calories burned per day, given the length of the hike, could also be helpful for this.

Frontend input validation: For exceptionally low ages, output doesn't make much sense from a hiking standpoint and is more suitable for babies, including baby food, baby carriage, snacks, etc.

More specifics of the weight of the backpack given age: Backpack weights can be defined as a ratio of the person's weight with different age groups having certain percentages. Younger people are stronger and would be able to carry more and thus have higher percentages. For instance, 20 year olds could be set at 20%, while 50-60 could be set at 17%

### Frontend representation/styling

The frontend text is generated from the PHP code
```php
$output = '';
$output .= "<pre>";

while ( ! feof( $handle ) )
{
    $output .= fread( $handle, 2096 );
}
$output .= "</pre>";
```
Output is returned from the `hiking_form_shortcode()` function from the plugin. The text is surrounded by `<pre>` tags, which encapsulates the output in a div-like box. Building from this, the PHP plugin could be modified to produce more stylized text from the output. Styling can also be specified in the OpenAI prompt in that you could specify it to be outputted as an html table, which could also contribute to better styling/appearance.

Some sort of visual indication should be implemented to indicate to the user the plugin is actually doing something. A loading icon does appear in the tab (does by default for any loading task for any site), but nothing else.