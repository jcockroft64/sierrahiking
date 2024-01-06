function capitalizeFirstLetter(inputString) {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}

/**download the csv */
function downloadCSV(combinedString) {
  //make a custom filename
  // Format the date as month-day-year (e.g., "08-02-2023")
  const formattedDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const lengthOfHike = document.getElementById('hikeLength').value;

  // Combine the hike length and formatted date in the filename
  const filename = `hike_data_${lengthOfHike}days_${formattedDate}.csv`;
  // Convert the combinedString into a Blob object
  const csvData = new Blob([combinedString], { type: 'text/csv' });

  // Create a downloadable link for the Blob
  const csvUrl = URL.createObjectURL(csvData);

  // Create a link element
  const link = document.createElement('a');
  link.setAttribute('href', csvUrl);
  link.setAttribute('download', filename);

  // Trigger a click on the link to prompt the user to download the CSV file
  document.body.appendChild(link);
  link.click();

  // Clean up the URL object after the download is initiated
  URL.revokeObjectURL(csvUrl);
}

/**section for hiking info */
function generateHikerInfo() {
  const age = document.getElementById('age').value;
  const weight = document.getElementById('weight').value + " lbs";
  const sex = capitalizeFirstLetter(document.getElementById('sex').value);
  const packWeight = capitalizeFirstLetter(document.getElementById('packweight').value);
  const hikeLength = document.getElementById('hikeLength').value + " days";
  const season = capitalizeFirstLetter(document.getElementById('season').value);
  const avgElevation = document.getElementById('avgOutput').textContent + " feet";
  const maxElevation = document.getElementById('maxOutput').textContent + " feet";
  const tentCapacity = document.getElementById('tentCapacity').value;
  const dietaryPreference = capitalizeFirstLetter(document.getElementById('dietary-preference').value);

  // Assuming you have an array or a variable holding all the data as objects.
  const data = [
    { name: "Hiker Info", value: "", empty: "" },
    { name: "Age", value: age, empty: "" },
    { name: "Sex", value: sex, empty: "" },
    { name: "Length of Hike", value: hikeLength, empty: "" },
    { name: "Season", value: season, empty: "" },
    { name: "Avg Elevation", value: avgElevation, empty: "" },
    { name: "Max Elevation", value: maxElevation, empty: "" },
    { name: "Pack Weight", value: weight, empty: "" },
    { name: "Diet", value: dietaryPreference, empty: "" },
    { name: "People In Tent", value: tentCapacity, empty: "" },
  ];

  // Convert the data to CSV format
  const csv = data.map(item => `${item.name},${item.value},${item.empty}`).join('\n');

  // You can now use this 'csv' variable to save the CSV or use it as needed.
  console.log(csv);
  return csv;

}

/**convert food to json */
function convertFoodJSONtoCSV(jsonData) {
  const separator = ',';
  const mealKeys = ["Breakfast", "Lunch", "Snack", "Dinner"];

  // Create rows of data
  const dataRows = jsonData.items.flatMap(item => {
      const day = `Day ${item.day}`;
      return [
          [day].join(separator),
          ...mealKeys.map(mealKey => {
              const mealData = item[mealKey];
              return [mealData.Item, mealData.Weight, mealData.Price, mealData.Calories].join(separator);
          })
      ];
  });

  // Create a row for totalWeight and totalPrice
  const totalRow = ["Total", jsonData.totalWeight, jsonData.totalPrice, jsonData.totalCalories].join(separator);

  // Combine data rows and add the total row
  const csvContent = [dataRows.join('\n'), totalRow].join('\n');

  return csvContent;
}

/**convert clothing, cooking, sleeping, and misc to json */
function json2csv(jsonData) {
  const separator = ',';
  const keys = Object.keys(jsonData.items[0]);

  // Create the header row
  const headerRow = keys.join(separator);

  // Create rows of data
  const dataRows = jsonData.items.map(item => {
    return keys.map(key => {
      return item[key];
    }).join(separator);
  });
  
  // Add a row for totalWeight and totalPrice
  const totalRow = `"Total","${jsonData.totalWeight}","${jsonData.totalPrice}"`;

  // Combine header, data rows, and totalWeight and totalPrice rows
  const csvContent = [headerRow, ...dataRows, totalRow].join('\n');

  return csvContent;
}

function calorieCSV(dayCalories) {
  let csvContent = 'Day,Weight,Cost,Calories\n'; // Header row

  // Loop through each object in the array and create a CSV row
  dayCalories.forEach(entry => {
    csvContent += `${entry.Day},${entry.Weight},${entry.Price},${entry.Calories}\n`;
  });

  return csvContent;
}

/**function to generate the csv given json objects */
function generateTables() {
  const hikerInfo = generateHikerInfo() + '\n\n';

  var clothingCSV = 'Clothing\n' + json2csv(clothingJson) + '\n\n';
  var cookingCSV = 'Cooking\n' + json2csv(cookingJson) + '\n\n';
  var sleepingCSV = 'Sleeping\n' + json2csv(sleepingJson) + '\n\n';
  var foodCSV = 'Food\n' + convertFoodJSONtoCSV(foodJson) + '\n\n';
  var caloriesCSV = "Calorie\n" + calorieCSV(dayCalories) + '\n\n';
  var miscCSV = 'Miscellaneous\n' + json2csv(miscJson) + '\n\n';

  //var totalRow = "Total, Total Weight, Total Price\n," + globalTotalWeight + ", $" + globalTotalPrice;
  const totalRow = `"Total","${globalTotalWeight}lbs","$${globalTotalPrice}"`;


  var combinedCSV = hikerInfo + clothingCSV + cookingCSV + sleepingCSV + foodCSV + caloriesCSV + miscCSV + totalRow;
  
  console.log(combinedCSV);
  downloadCSV(combinedCSV);
}

// jQuery document ready block
jQuery(document).ready(function($) {
  // Attach event handler for .export-button class using event delegation
  $(document).on('click', '.export-button', function() {
      //disable submit button
      $(".export-button").prop("disabled", true);
      
      //generate CSV
      generateTables();

      //renable download button
      $(".export-button").prop("disabled", false);
  });
});