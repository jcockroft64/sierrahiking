<?php
/*
Plugin Name: Pack List Wizard 3
Description: Generates packing list from HTML form and uses ChatGPT API for responses. Improved prompts!
Version: 3.0
*/

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

// Generate HTML form
function custom_form_generate_form() {
    ob_start(); ?>

    <h1>Pack List Wizard</h1>

    <!-- Chat History goes Here -->
    <div id="responseContainer"></div>

    <form id="infoForm" action="" method="post">
      <label for="age">Age:</label>
      <input type="text" id="age" placeholder="Enter age" required>
      <!-- <button class="help-button" onclick="showHelp('age')">?</button><br> -->
      <div class="button" data-field="age">?</div><br>

      <label for="weight">Weight:</label>
      <input type="text" id="weight" placeholder="Enter weight" required>
      <!-- <button class="help-button" onclick="showHelp('weight')">?</button><br> -->
      <div class="button" data-field="weight">?</div><br>

      <label for="hikeLength">Length of Hike:</label required>
      <input type="text" id="hikeLength" placeholder="Enter length of the hike">
      <!-- <button class="help-button" onclick="showHelp('hikeLength')">?</button><br> -->
      <div class="button" data-field="hikeLength">?</div><br>

      <label for="season">Preferred Season:</label>
      <select id="season" name="season" required>
        <option value="spring">Spring</option>
        <option value="summer">Summer</option>
        <option value="fall">Fall</option>
        <option value="winter">Winter</option>
      </select>
      <!-- <button class="help-button" onclick="showHelp('season')">?</button><br> -->
      <div class="button" data-field="season">?</div><br>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/14.6.1/nouislider.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/14.6.1/nouislider.min.js"></script>

      
      <label for="avg" style="display: inline-block; width: 170px;">Average Elevation: <output id="avgOutput">0</output></label>
      <!-- <button class="help-button" onclick="showHelp('avg')">?</button> -->
      <div class="button" data-field="avg">?</div>
      <span id="avgMin">0</span>
      <input type="range" id="avgSlider" min="0" max="15000" value="0" oninput="updateAvgOutput()">
      <span id="avgMax">15000</span><br>

      <label for="max" style="display: inline-block; width: 170px;">Max Elevation: <output id="maxOutput">0</output></label>
      <!-- <button class="help-button" onclick="showHelp('max')">?</button> -->
      <div class="button" data-field="max">?</div>
      <span id="maxMin">0</span>
      <input type="range" id="maxSlider" min="0" max="15000" value="0" oninput="updateMaxOutput()">
      <span id="maxMax">15000</span><br>
      
      <label for="tentCapacity">Number of people in your tent:</label>
      <select id="tentCapacity" name="tentCapacity">
        <!-- Generate the options dynamically -->
        <script>
          var maxCapacity = 10;
          for (var i = 1; i <= maxCapacity; i++) {
            document.write('<option value="' + i + '">' + i + '</option>');
          }
          document.write('<option value="' + (maxCapacity + 1) + '">' + maxCapacity + '+</option>');
        </script>
      </select>
      <!-- <button class="help-button" onclick="showHelp('tentCapacity')">?</button> -->
      <div class="button" data-field="tentCapacity">?</div><br>

      <label for="dietary-preference">Diet Restrictions/Preference</label>
      <select id="dietary-preference">
          <option value="flexible" selected>No Dietary Restrictions (Flexible)</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
      </select>
      <!-- <button class="help-button" onclick="showHelp('diet')">?</button> -->
      <div class="button" data-field="diet">?</div><br>

      <br>

      <input type="submit" value="Submit">


    </form>

    <div class="container">
      <div class="list">
        <h2>Clothing List</h2>
        <div id="clothing-weight"></div>
        <div id="clothing"></div>
      </div>
      <div class="list">
        <h2>Cooking Equipment</h2>
        <div id="cookingequipment-weight"></div>
        <div id="cookingequipment"></div>
      </div>
      <div class="list">
        <h2>Sleeping Equipment</h2>
        <div id="sleeping-weight"></div>
        <div id="sleeping"></div>
      </div>
      <div class="list">
        <h2>Other Items</h2>
        <div id="misc-weight"></div>
        <div id="misc"></div>
      </div>
    </div>
    <div class = "container">
      <div class="list">
        <h2>Food List</h2>
        <div id="food-weight"></div>
        <div id="food"></div>
      </div>
    </div>
    <div class = "container">
      <div class = "list">
        <h2 id="total">Total Weight</h2>
        <h2 id="totalInsert"></h2>
      </div>
    </div>

    <?php
    return ob_get_clean();
}
add_shortcode('wizard', 'custom_form_generate_form');
?>
