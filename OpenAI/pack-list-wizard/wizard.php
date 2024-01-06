<?php
/**
 * Plugin Name: Pack List Wizard
 * Description: Generates packing list from HTML form and uses ChatGPT API for responses. Improved prompts! Supports list export as CSV! Lists saved as JSON for straightforward display on page and conversion to CSV. More secure API key storage via Zuplo!
 * Version: 43.0
 */

// Enqueue JavaScript and CSS files
function custom_form_enqueue_scripts() {
    // Enqueue script.js file
    wp_enqueue_script('custom-form-script', plugins_url('script.js', __FILE__), array('jquery'), '1.0', true);

    // Enqueue slider.js file
    wp_enqueue_script('custom-slider-script', plugins_url('slider.js', __FILE__), array(), '1.0', true);

    // Enqueue dropdown.js file
    wp_enqueue_script('custom-dropdown-script', plugins_url('dropdown.js', __FILE__), array(), '1.0', true);

    // Enqueue noty.min.js file
    wp_enqueue_script('noty-script', 'https://cdnjs.cloudflare.com/ajax/libs/noty/3.1.4/noty.min.js', array(), '3.1.4', true);

    // Enqueue noty.min.css file
    wp_enqueue_style('noty-style', 'https://cdnjs.cloudflare.com/ajax/libs/noty/3.1.4/noty.min.css', array(), '3.1.4');
    
    // Enqueue lists.css file
    wp_enqueue_style('button-style', plugins_url('button.css', __FILE__), array(), '1.0');

    // Enqueue dropdown.css file
    wp_enqueue_style('dropdown-style', plugins_url('dropdown.css', __FILE__), array(), '1.0');

    // Enqueue pdf.js file
    wp_enqueue_script('pdf-script', plugins_url('pdf.js', __FILE__), array('jquery'), '1.0', true);

    // Enqueue table.js file
    wp_enqueue_script('table-script', plugins_url('table.js', __FILE__), array('jquery'), '1.0', true);

    // Enqueue Font Awesome CSS
    wp_enqueue_style('font-awesome-6-style', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css', array(), '6.0.0-beta3');

    // Enqueue the custom CSS file for admin api key manager
    wp_enqueue_style('api-key-manager-css', plugin_dir_url(__FILE__) . 'api-key-manager.css');

    // Enqueue title.css file
    wp_enqueue_style('title-style', plugins_url('title.css', __FILE__), array(), '1.0');

    // Enqueue progress.js file
    wp_enqueue_script('progress-script', plugins_url('progress.js', __FILE__), array('jquery'), '1.0', true);

    // Enqueue progress.css file
    wp_enqueue_style('progress-style', plugins_url('progress.css', __FILE__), array(), '1.0');

    // Enqueue errorHandler.js file
    wp_enqueue_script('error-handler-script', plugins_url('errorHandler.js', __FILE__), array('jquery'), '1.0', true);
}
add_action('wp_enqueue_scripts', 'custom_form_enqueue_scripts');

// Generate HTML form
function custom_form_generate_form() {
    ob_start(); ?>

    <div class="container">
      <div class="header">
          <div class="hamburger" id="hamburger">&#9776;</div>
      </div>
      <div class="sidebar">
        <div class="sidebar-menu">
          <div class="sidebar-title selected" id="configTitle">Configuration</div>
          <div class="sidebar-title" id="recommendationsTitle">Recommendations</div>
          <div class="sidebar-title" id="summaryTitle">Summary</div>
          <div class="sidebar-title" id="aboutTitle">About</div>
        </div>
      </div>
      <div class="content" id="content">
        <div id="configContent" class="section-content">

          <form id="infoForm" action="" method="post">
              <fieldset>
                <legend><i class="fa fa-user"></i> About You</legend>
                <div class="config-row">
                  <div class="config-title">Age:</div>
                  <div class="config-field">
                    <input type="text" id="age" placeholder="years" required>
                  </div>
                </div>
                <div class="config-row">
                  <div class="config-title">Weight:</div>
                  <div class="config-field">
                    <input type="text" id="weight" placeholder="pounds" required>
                  </div>
                </div>
                <div class="config-row">
                  <div class="config-title">Sex:</div>
                  <div class="config-field">
                    <select id="sex" class="form-control small-input" name="sex" required>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </fieldset>
          
              <fieldset>
                <legend><i class="fa fa-hiking"></i> Your Hike</legend>
                <div class="config-row">
                  <div class="config-title">Length of Hike:</div>
                  <div class="config-field">
                    <input type="text" id="hikeLength" placeholder="days" required>
                  </div>
                </div>
                <div class="config-row">
                  <div class="config-title">Season:</div>
                  <div class="config-field">
                    <select id="season" name="season" required>
                      <option value="spring">Spring</option>
                      <option value="summer">Summer</option>
                      <option value="fall">Fall</option>
                    </select>
                  </div>
                </div>
                <div class="config-row">
                  <div class="config-title">Average Elevation:</div>
                  <div class="config-field">
                    <input required class = "elevation" type="range" id="avgSlider" min="0" max="15000" step="100" value="3500" oninput="updateAvgOutput()">
                    <div class="output-container">
                      <span id="avgMin">0</span>
                      <output id="avgOutput">0</output>
                      <span id="avgMax">15k</span>
                    </div>
                  </div>
                </div>
                <div class="config-row">
                  <div class="config-title">Max Elevation:</div>
                  <div class="config-field">
                    <input required class = "elevation" type="range" id="maxSlider" min="0" max="15000" step="100" value="7500" oninput="updateMaxOutput()">
                    <div class="output-container">
                      <span id="maxMin">0</span>
                      <output id="maxOutput">0</output>
                      <span id="maxMax">15k</span>
                    </div>
                  </div>
                </div> 
              </fieldset>
          
              <fieldset>
                <legend><i class="fa fa-heart"></i> Personal Preferences</legend>
                <div class="config-row">
                  <div class="config-title">Pack Weight:</div>
                  <div class="config-field">
                    <select required id="packweight" class="form-control small-input" name="packweight">
                        <option value="ultralight">Ultralight</option>
                        <option value="light">Light</option>
                        <option value="standard" selected>Standard</option>
                        <option value="robust">Robust</option>
                    </select>
                  </div>
                </div>
                <div class="config-row">
                  <div class="config-title">Diet:</div>
                  <div class="config-field">
                    <select required id="dietary-preference">
                      <option value="flexible" selected>No Restrictions</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                    </select>
                  </div>
                </div>
                <div class="config-row">
                  <div class="config-title">Tent Capacity:</div>
                  <div class="config-field">
                    <select id="tentCapacity" name="tentCapacity">
                      <!-- Generate the options dynamically -->
                      <script>
                        var maxCapacity = 6;
                        for (var i = 1; i <= maxCapacity; i++) {
                          document.write('<option value="' + i + '">' + i + '</option>');
                        }
                      </script>
                    </select>
                  </div>
                </div>
              </fieldset>
          
              <div class="submit-container">
                  <input class = "submit" type="submit" value="Submit">
              </div>
            </form>
            

        </div>
        <div id="recommendationsContent" class="section-content">
          <div id="myProgress">
            <div id="myBar">0%</div>
            <div class="loader"></div>
          </div>

          <div class="tabs">
              <div class="tab clothing-tab" data-tab="clothing" onclick="openTab('clothing')">Clothing</div>
              <div class="tab cooking-tab" data-tab="cookingequipment" onclick="openTab('cookingequipment')">Cooking</div>
              <div class="tab sleeping-tab" data-tab="sleeping" onclick="openTab('sleeping')">Sleeping</div>
              <div class="tab food-tab" data-tab="food" onclick="openTab('food')">Food</div>
              <div class="tab misc-tab" data-tab="misc" onclick="openTab('misc')">Misc</div>
          </div>        
        
          <div id="clothing" class="tabcontent">
            <p>Please fill out the form to generate clothing recommendations.</p>
          </div>
        
          <div id="cookingequipment" class="tabcontent">
            <p>Please fill out the form to generate recommendations for cooking equipment.</p>
          </div>
        
          <div id="sleeping" class="tabcontent">
            <p>Please fill out the form to generate recommendations for sleeping gear.</p>
          </div>
        
          <div id="food" class="tabcontent">
            <p>Please fill out the form to generate food recommendations.</p>
          </div>
        
          <div id="misc" class="tabcontent">
            <p>Please fill out the form to generate recommendations for other items.</p>
          </div>
        </div>
        
        <div id="summaryContent" class="section-content">
          <div id="before">
              <p>Please fill the form and wait. Summary will generate after all recommendation lists have been generated.</p>
              <p>After that, you will be able to download a CSV of all the recommendation lists.</p>
          </div>
          <div id="during" style="display:none">
              <p>Generating recommendation lists. Please wait.</p>
          </div>
          <div id="error" style="display:none">
              <p>An error occured. Please check the recomendations tabs for more information and make the neccesary corrections in the hiker form.</p>
          </div>
          <div id="complete" style="display:none">
              <!-- Download Button -->
              <div class="parent-div">
                <div class="btn btn-primary export-button" style="display: inline-block; line-height: normal;">
                  <i class="fa fa-download"></i> Download
                </div>
              </div>

              <!-- Hiker Summary Info-->
              <h4 id="hiker">Configuration</h4>
              <div id="hiker-container"></div>

              <!-- Total Weight and Price-->
              <h4 id="total">Total Weight & Cost</h4>
              <div id="total-container"></div>

              <!-- Weight and Price Summary-->
              <h4>Weight & Cost Summary</h4>
              <div id="table-container"></div>

              <h4 id="total">Daily Food Summary</h4>
              <div id="calorie-container"></div>
          </div>
          
        </div>
        <div id="aboutContent" class="section-content">
          <p>About:</p>
          <p>Pack List Wizard 0.9</p>
          <p>December 20, 2023</p>
          <p>Developed by the engineers at <a href="https://sierrahiking.net">SierraHiking.net</a></p>
        </div>
      </div>
    </div>


    <?php
    return ob_get_clean();
}
add_shortcode('wizard', 'custom_form_generate_form');
?>
