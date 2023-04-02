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
  $output = '';
  $output .= '<form method="post" action="">';
  $output .= '<label for="age">Age:</label>';
  $output .= '<input type="number" id="age" name="age" required>';
  $output .= '<label for="weight">Weight:</label>';
  $output .= '<input type="number" id="weight" name="weight" required>';
  $output .= '<label for="hike-length">Length of Hike (days):</label>';
  $output .= '<input type="number" id="hike-length" name="hike-length" required>';
  $output .= '<input type="submit" name="submit" value="Submit">';
  $output .= '</form>';

  if (isset($_POST['submit'])) {
    $age = $_POST['age'];
    $weight = $_POST['weight'];
    $hike_length = $_POST['hike-length'];

    // Use escapeshellarg() function to sanitize the input arguments
    $age = escapeshellarg($age);
    $weight = escapeshellarg($weight);
    $hike_length = escapeshellarg($hike_length);

    #shell_exec("pip install openai"); //do a pip list to see if openai package is there
    
    $command = "/usr/bin/python3 " . __DIR__ . "/" . "print_hiking_data.py " . $age . " " . $weight . " " . $hike_length;

    $handle = popen( $command . ' 2>&1', 'r' );

    $output = '';
    $output .= "<pre>";

    while ( ! feof( $handle ) )
    {
        $output .= fread( $handle, 2096 );
    }
    $output .= "</pre>";
    pclose( $handle );
  }

  return $output;
}
add_shortcode('hiking_form', 'hiking_form_shortcode');