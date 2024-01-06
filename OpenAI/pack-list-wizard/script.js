const url = "ZUPLO URL";

//list of hiking list json objects
var clothingJson = new Object();
var cookingJson = new Object();
var sleepingJson = new Object();
var foodJson = new Object();
var miscJson = new Object();
var dayCalories = new Object();

var globalTotalWeight = 0;
var globalTotalPrice = 0;

//weight ratios for the various categories; base ratio to body weight
var ultralight = 0.15;
var light = 0.19;
var standard = 0.23;
var robust = 0.27;


//putting this in global context so it can be accessed from other files
function notification(message, type, length) {
    new Noty({
        text: message,
        type: type,
        timeout: length // Display duration in milliseconds
    }).show();
}

jQuery(document).ready(function ($) {
    updateAvgOutput(); // Call updateAvgOutput() when the page loads
    updateMaxOutput(); // Call updateMaxOutput() when the page loads

    //sidebar option highlight logic
    $(".sidebar-title").click(function () {
        // Remove active class from all sidebar titles
        $(".sidebar-title").removeClass("selected");

        // Add active class to the clicked sidebar title
        $(this).addClass("selected");

        // ... Rest of your code ...
    });

    //code for the sidebar stuff
    $(".list-group-item").click(function () {
        $(".list-group-item").removeClass("active");
        $(this).addClass("active");
        var sectionId = $(this).text().toLowerCase();
        $(".section").hide();
        $("#" + sectionId).show();

        // Close the sidebar on mobile when an option is clicked
        if ($(window).width() < 768) {
            $("body").removeClass("show-sidebar");
        }
    });

    $("#toggleSidebar").click(function () {
        $("body").toggleClass("show-sidebar");
    });

    // Trigger a click on the "Configuration" list item when the page loads
    $(".list-group-item.active").click();

    // Run JavaScript function on form submit
    $('#infoForm').submit(function (e) {
        e.preventDefault();

        var age = parseInt($('#age').val());
        var weight = parseInt($('#weight').val());
        var hikeLength = parseInt($('#hikeLength').val());

        var ageValid = age >= 10 && age <= 93; //age is between 10 and 93
        var weightValid = weight >= 30 && weight <= 350;
        var hikeLengthValid = hikeLength >= 1 && hikeLength <= 10;

        if (!ageValid || !weightValid || !hikeLengthValid) {
            $(".tabcontent").each(function() {
                var errorMessages = [];
                if (!ageValid) {
                    errorMessages.push("Age must be between 10 and 93.");
                }
                if (!weightValid) {
                    errorMessages.push("Weight must be between 30 and 350 lbs.");
                }
                if (!hikeLengthValid) {
                    errorMessages.push("Length of Hike must be between 1 and 10 days.");
                }
                
                if (errorMessages.length > 0) {
                    $(this).html("<p>Error: " + errorMessages.join("<br>") + "</p>");
                }
            });

            //toast notifications
            if (!ageValid) {
                notification("Age must be between 10 and 93.", "error", 3000);
            }
            if (!weightValid) {
                notification("Weight must be between 30 and 350 lbs.", "error", 3000);
            }
            if (!hikeLengthValid) {
                notification("Length of Hike must be between 1 and 10 days.", "error", 3000);
            }
        
            $("#before").hide(); // hide before message
            $("#error").show(); // Show error message
            return; // Exit function if there's an error
        }

        // If everything is valid, hide the error message
        $("#error").hide();

        //code below runs when there are no errors in the input

        //disable the submit button until enterInfo() completes
        var submitButton = $(this).find('input[type="submit"]');
        submitButton.prop("disabled", true).val("Generating..."); //submit button should be disabled until all recommendations are generated

        //indicate responses are generating
        $(".tabcontent").html("<p>Recommendations are being generated based on your responses...</p>");

        //hide download button
        $(".export-button").hide();

        // Simulate a click on the "Recommendations" button in the sidebar
        // Show the "Recommendations" tab content and hide others
        $("#recommendationsContent").css("display", "block");
        $("#configContent").css("display", "none");
        $("#summaryContent").css("display", "none");

        //highlight the recomendations tab
        $("#configTitle").removeClass("selected");
        $("#recommendationsTitle").addClass("selected");
        $("#summaryTitle").removeClass("selected");

        //instructions for summary
        $("#before").hide(); //instructions before summary generaiton
        $("#during").show(); //instructions during summary generation

        // Call the enterInfo function
        enterInfo();

        //once enterInfo completes, re-enable the submit button and show the download button

        submitButton.prop("disabled", false).val("Submit"); //renable the submit button after all recommendations are generated
        //show download button
        $(".export-button").show();

        //hide instructions that show during the summary generation
        $("#during").hide();

        //show the result of the summary generation
        $("#complete").show();

    });

    let conversation = [
        { 'role': 'system', 'content': 'You are a helpful assistant providing information about hiking in the Sierra Nevadas.' },
    ];

    const error = "error"
    //given a user's age, calculate the maximum weight of their pack
    function maxPackWeight(age, weight) {
        var basicRatio;
        var packWeight = document.getElementById("packweight").value; //basic ratio; from the packweight form on frontend
        if (packWeight === "ultralight") {
            // Code to execute if "Ultralight" is selected
            console.log("Ultralight is selected");
            basicRatio = ultralight;
        } else if (packWeight === "light") {
            // Code to execute if "Light" is selected
            console.log("Light is selected");
            basicRatio = light;
        } else if (packWeight === "standard") {
            // Code to execute if "Standard" is selected
            console.log("Standard is selected");
            basicRatio = standard;
        } else if (packWeight === "robust") {
            // Code to execute if "Robust" is selected
            console.log("Robust is selected");
            basicRatio = robust;
        }
        console.log("weight ratio: ", basicRatio);
        //more specific ratio per age; peak strength at 20-30 years old
        var multiplier;
        if (age < 10 || age > 80) {
            return 0.6;
        }
        else if (10 <= age && age < 20) {
            multiplier = 0.9;
        }
        else if (20 <= age && age < 30) {
            multiplier = 1;
        }
        else if (30 <= age && age < 40) {
            multiplier = 0.9;
        }
        else if (40 <= age && age < 50) {
            multiplier = 0.85;
        }
        else if (50 <= age && age < 60) {
            multiplier = 0.8;
        }
        else if (60 <= age && age < 70) {
            multiplier = 0.75;
        }
        else if (70 <= age && age <= 80) {
            multiplier = 0.7;
        }

        var maxWeight = weight * basicRatio * multiplier;
        return maxWeight;
    }

    function notification(message, type, length) {
        new Noty({
            text: message,
            type: type,
            timeout: length // Display duration in milliseconds
        }).show();
    }

    //format weight to have 2 decimal spots after
    function formatWeight(weight) {
        return weight.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    //format price to have 2 decimal spots after
    function formatPrice(price) {
        return price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    async function getTotalWeight() {
        //go through all the lists
        var previousLists = [clothingJson, cookingJson, sleepingJson, foodJson, miscJson];

        // Print the result
        console.log(previousLists);

        //store the total weight of the pack
        var totalWeight = 0;
        var totalPrice = 0;

        //iterate through lists
        previousLists.forEach(item => {
            // var itemWeight = extractWeightInPounds(item.totalWeight);
            // var itemPrice = extractPriceInDollars(item.totalPrice);

            //catch an infrequent error that occurs here
            try {
                var itemWeight = item.totalWeight;
                var itemPrice = item.totalPrice;
            } catch (error) {
                showError("Error in generating total weight or price. Please reload the page and try again. ");
                throw new Error("Error in generating total weight or price. Please reload the page and try again.");
            }

            console.log('Total Weight:', itemWeight);
            console.log('Total Price:', itemPrice);

            totalWeight += itemWeight;
            totalPrice += itemPrice;
        });
        console.log("Your pack weighs", totalWeight, "pounds");
        console.log("Your pack costs", totalPrice, "dollars");

        globalTotalWeight = totalWeight;
        globalTotalPrice = totalPrice;

        //generate hiker summary table
        generateHikerSummaryTable();

        //generate table with total weight and price
        generateTotalTable(formatWeight(totalWeight), formatPrice(totalPrice));

        //generate summary table (id is table-container, defined in the function)
        generateSummaryTable(previousLists);
    }

    // Function to generate the Misc list
    async function generateMiscList(miscCategory, conversation, hikeLength) {
        // Access the properties of the Misc item object
        const itemName = Object.keys(miscCategory)[0];
        const weight = miscCategory[itemName];

        console.log(`Item: ${itemName}`);
        console.log(`Weight: ${weight}`);

        // Now you have the "Misc" object, and you can process it further if needed.
        var userQuestion = "List additional items for a " + hikeLength + "-day backpacking trip, aiming for weight near " + weight + " lbs (min. " + 0.9 * weight + " lbs). Exclude clothing, cooking, sleeping, and food from previous lists.";

        userQuestion += " Output should be in this JSON format: ";
        userQuestion += "{\"items\":[{\"item\":\"\",\"weight\":0,\"price\":0},{\"item\":\"\",\"weight\":0,\"price\":0},...],\"totalWeight\":0,\"totalPrice\":0}"
        userQuestion += "Weight MUST be in pounds and price MUST be in $USD.";

        console.log(userQuestion);

        //wait for OpenAI stuff to complete before next function can run
        var categoryJson = await fetchOpenAI(userQuestion); // Assuming you define miscJson
        var result = categoryJson;
        return result; // Return the result obtained from fetchOpenAI
    }

    // Function to check if a value is less than a threshold
    function isLessThan(value, threshold) {
        //return parseFloat(value) < threshold;
        return Number(value) < Number(threshold);
    }

    function extractWeight(data) {
        return data.totalWeight;
    }

    async function checkCategoryWeights(categoriesToGenerate, hikeLength) {
        var clothingWeight = extractWeight(clothingJson);
        var cookingWeight = extractWeight(cookingJson);
        var sleepingWeight = extractWeight(sleepingJson);
        var foodWeight = extractWeight(foodJson);

        console.log(categoriesToGenerate);

        // Compare and check the fields
        const updatePromises = categoriesToGenerate.map(async obj => {
            const key = String(Object.keys(obj)[0]);
            console.log(key);
            const value = obj[key];
            console.log(value);

            if (key === 'Food') {
                if (foodWeight < hikeLength) {
                    console.log(`Food (${foodWeight}) is less than ${hikeLength}.`);
                    categoryPrompt = "The food list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    var categoryJson = await fetchOpenAI(categoryPrompt);
                    foodJson = categoryJson;
                    console.log(categoryPrompt);
                }
            } else if (key === "Clothing") {
                console.log("this is clothing");
                if (isLessThan(clothingWeight, 0.8 * value)) {
                    console.log(`Clothing (${foodWeight}) is less than 0.8 times ${value}.`);
                    categoryPrompt = "The clothing list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    var categoryJson = await fetchOpenAI(categoryPrompt);
                    clothingJson = categoryJson;
                    console.log(categoryPrompt);
                }
            } else if (key === "Sleeping") {
                console.log("this is sleeping");
                if (isLessThan(sleepingWeight, 0.8 * value)) {
                    console.log(`Sleeping (${sleepingWeight}) is less than 0.8 times ${value}.`);
                    categoryPrompt = "The sleeping list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    var categoryJson = await fetchOpenAI(categoryPrompt);
                    sleepingJson = categoryJson;
                    console.log(categoryPrompt);
                }
            } else {
                console.log("this item is cooking");
                if (isLessThan(cookingWeight, 0.8 * value)) {
                    console.log(`Cooking (${cookingWeight}) is less than 0.8 times ${value}.`);
                    categoryPrompt = "The cooking equipment list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    var categoryJson = await fetchOpenAI(categoryPrompt);
                    cookingJson = categoryJson
                    console.log(categoryPrompt);
                }
            }
        });

        // Return a Promise that resolves when all the category weights have been updated
        return Promise.all(updatePromises);
    }

    async function checkMiscWeight(miscCategory, hikeLength) {
        var miscWeight = extractWeight(miscJson);

        console.log(miscCategory);

        const miscKey = Object.keys(miscCategory)[0];
        const miscValue = miscCategory[miscKey];
        if (isLessThan(miscWeight, 0.8 * miscValue)) {
            console.log(`Misc (${miscWeight}) is less than 0.8 times ${miscValue}.`);
            // Now you have the "Misc" object, and you can process it further if needed.
            var userQuestion = "The misc list previously generated isn't heavy enough. ";
            userQuestion += generateCategoryPrompt(miscKey, hikeLength, miscValue);
            console.log(userQuestion);

            //wait for OpenAI stuff to complete before next function can run
            var categoryJson = await fetchOpenAI(userQuestion);
            miscJson = categoryJson;
        }
        // Return a Promise that resolves when the "Misc" category weight has been updated
        return Promise.resolve();
    }

    //function to generate the category prompt
    function generateCategoryPrompt(itemName, hikeLength, weight) {
        //season
        const season = document.getElementById("season").value;
        //elevations
        var avg = document.getElementById("avgSlider").value;
        var max = document.getElementById("maxSlider").value;

        let categoryPrompt = "List the " + itemName + " items and their weights for a " + hikeLength + "-day backpacking trip. Aim for a total weight near " + weight + " pounds, minimum " + 0.9 * weight + " pounds."
        if (itemName === "Food") {
            categoryPrompt += " Targeting weight close to " + weight + " pounds, allowing " + (weight / hikeLength).toFixed(2) + " pounds of food daily.";
            const diet = document.getElementById('dietary-preference').value;
            if (diet === "vegetarian" || diet === "vegan") {
                categoryPrompt += " Food list must follow a " + diet + " diet.";
            }

            categoryPrompt += " Remove refrigeration-dependent items and streamline redundant foods.";

            // Generate as JSON

            // Main JSON format prompt
            categoryPrompt += ` Output should be in this JSON format: `;
            categoryPrompt += `"{ items":[{"day":1,"Breakfast":{"Item":"","Weight":0,"Price":0,"Calories":0},"Lunch":{"Item":"","Weight":0,"Price":0,"Calories":0},"Snack":{"Item":"","Weight":0,"Price":0,"Calories":0},"Dinner":{"Item":"","Weight":0,"Price":0,"Calories":0}},{"day":2,"Breakfast":{"Item":"","Weight":0,"Price":0,"Calories":0},"Lunch":{"Item":"","Weight":0,"Price":0,"Calories":0},"Snack":{"Item":"","Weight":0,"Price":0,"Calories":0},"Dinner":{"Item":"","Weight":0,"Price":0,"Calories":0}}],"totalWeight":0,"totalPrice":0,"totalCalories":0 }`;

            // Instructions for units
            categoryPrompt += "Weight MUST be in pounds and price MUST be in $USD.";
            categoryPrompt += " Generate food for " + hikeLength + " days";
        } else {
            //lists besides food
            categoryPrompt += "Elevation: avg " + avg + " ft, max " + max + " ft in " + season + ".";

            //specific rules for the other prompts
            if (itemName === "Clothing") {
                categoryPrompt += "Provide clothing items suitable for average " + avg + " ft and max " + max + " ft elevation in " + season + ". Include 3 shirts, underwear, and socks, all same type. Exclude gender-specific items like tank tops and sports bras."
            }
            else if (itemName === "Cooking Equipment") {
                categoryPrompt += "List cooking items, except pans and spatulas, for dehydrated meals using a camping stove. Recommend a specific burner/stove. Include a collapsible pot, like Jet Boil kit, with consistent details. Avoid vague items like 'camping stove with piezoelectric ignition'."
            }
            else if (itemName === "Sleeping") {
                const tentCapacity = document.getElementById("tentCapacity").value;
                categoryPrompt += "Specify a season-suited sleeping bag temperature rating for Sierra Nevada elevations in " + season + ". Include one sleeping bag, one sleeping pad, and a " + Number(Number(tentCapacity) + 1) + "-person tent. Exclude eye masks and earplugs."
            }
        }

        if (itemName != "Food") {
            categoryPrompt += " Output should be in JSON in this format: "
            categoryPrompt += "{\"items\":[{\"item\":\"\",\"weight\":0,\"price\":0},{\"item\":\"\",\"weight\":0,\"price\":0},...],\"totalWeight\":0,\"totalPrice\":0}"
            // Instructions for units
            categoryPrompt += "Weight MUST be in pounds and price MUST be in $USD.";
            categoryPrompt += " All items need to be in the JSON object. totalWeight and totalPrice is required."
        }

        categoryPrompt += " String must start with { and end with } ";
        console.log(categoryPrompt);
        return categoryPrompt;
    }

    document.querySelector('.loader').style.display = 'none';
    function enterInfo() {
        reset(); //reset progress
        //reset conversation when entering info again
        conversation = [
            { 'role': 'system', 'content': 'You are a helpful assistant providing information about hiking in the Sierra Nevadas.' },
        ];

        const age = document.getElementById("age").value;
        const weight = document.getElementById("weight").value;
        const hikeLength = document.getElementById("hikeLength").value;

        const season = document.getElementById("season").value;

        //elevations
        var avg = document.getElementById("avgSlider").value;
        var max = document.getElementById("maxSlider").value;

        const tentCapacity = document.getElementById("tentCapacity").value;

        const maxWeight = maxPackWeight(age, weight);

        //all good. tell user
        notification("Generating backpacking and food lists...", "info", 3000);

        //assume a person eats 1.5 pounds of food per day
        const foodPerDay = 1.5;
        const totalFood = foodPerDay * hikeLength;

        //userQuestion = "Make a " + hikeLength + "-day backpacking list with a total weight not exceeding " + maxWeight + " pounds. Provide a weight distribution for the backpack into 5 major categories: clothing, cooking, sleeping, food, and misc. Please provide the weight of each category."
        //userQuestion = "Provide a weight distribution for a " + hikeLength + "-day backpacking list with a total weight as close to, but not exceeding " + maxWeight + " pounds. Provide a weight distribution for the backpack into 5 major categories: clothing, cooking equipment, sleeping, food, and misc. Please provide the weight of each category."
        //userQuestion = "Provide a weight breakdown for a " + hikeLength + "-day backpacking trip. Aim for a total weight just under " + maxWeight + " pounds. Detail the weights of these 5 categories: clothing, cooking equipment, sleeping gear, food, and miscellaneous items.";
        userQuestion = "Provide a weight distribution for a " + hikeLength + "-day backpacking list with a total weight as close to, but not exceeding " + maxWeight + " pounds. The distribution MUST be in the following format: Clothing: xx pounds\n Cooking Equipment: xx pounds\n Sleeping: xx pounds\n Food: xx pounds\n Misc: xx pounds. DO NOT include any items in any of the categories in this list."

        console.log("hello??");
        console.log(maxWeight);
        //get the text
        addQuestion(userQuestion);
        const prompt = userQuestion + conversation.map(message => `${message.role}: ${message.content}`).join('\n');

        /*var text = getCategoryWeights(prompt);
        console.log(text);*/

        (async () => {
            // Array to store the category prompts
            const promptList = [];
            var text = await getCategoryWeights(prompt);
            console.log("weights: ", text);

            // Filter out the "Misc" category from the text array and keep it in a variable
            const miscCategory = text.find(item => Object.keys(item)[0] === "Misc");
            const categoriesToGenerate = text.filter(item => Object.keys(item)[0] !== "Misc");

            // Use map to create an array of promises for category generation
            const categoryPromises = categoriesToGenerate.map(async item => {
                const itemName = Object.keys(item)[0];
                const weight = item[itemName];

                const categoryPrompt = generateCategoryPrompt(itemName, hikeLength, weight);

                let categoryJson; // Initialize the JSON object for the category

                if (itemName === "Clothing") {
                    report("Generating Clothing list...");
                    categoryJson = await fetchOpenAI(categoryPrompt);
                    clothingJson = categoryJson
                } else if (itemName === "Cooking Equipment") {
                    report("Generating Cooking Equipment list...")
                    categoryJson = await fetchOpenAI(categoryPrompt);
                    cookingJson = categoryJson
                } else if (itemName === "Sleeping") {
                    report("Generating Sleeping items...");
                    categoryJson = await fetchOpenAI(categoryPrompt);
                    sleepingJson = categoryJson
                } else if (itemName === "Food") {
                    report("Generating Food list...");
                    categoryJson = await fetchOpenAI(categoryPrompt);
                    foodJson = categoryJson;
                }

                promptList.push(categoryJson); // Store the result in the prompt list
                console.log(categoryPrompt);
            });

            // Wait for all the category prompts to be processed
            await Promise.all(categoryPromises);

            console.log(promptList);

            //message history. "system" and "user" texts (the first 2) are not part of the packing lists, but part of the context.
            //next is the weights
            //the final 4 prompts are from the food lists. use that as context for ChatGPT of what items NOT to include for the other items
            console.log(conversation);

            // Generate the Misc list separately after the first four lists are generated
            report("Generating list of other items...")
            miscJson = await generateMiscList(miscCategory, conversation, hikeLength);

            //console log all the lists for check
            console.log("clothing list\n", clothingJson);
            console.log("cooking list\n", cookingJson);
            console.log("sleeping list\n", sleepingJson);
            console.log("food list\n", foodJson);
            console.log("misc list\n", miscJson);

            console.log("clothing is a ", typeof clothingJson);
            console.log("cooking is a ", typeof cookingJson);
            console.log("sleeping is a ", typeof sleepingJson);
            console.log("food is a ", typeof foodJson);
            console.log("misc is a ", typeof miscJson);


            // Call the functions and wait for all the category weights to be updated
            await Promise.all([
                //check the weight of all categories before misc
                checkCategoryWeights(categoriesToGenerate, hikeLength),
                //check misc weight
                checkMiscWeight(miscCategory, hikeLength)
            ]);

            report("Measuring weights...")
            await getTotalWeight();
            increment(10);

            //after all the data is collected, display the data on tables
            //parameters: json, table id, div id the table will go in
            generateTable(clothingJson, "clothingTable", "clothing");
            generateTable(cookingJson, "cookingTable", "cookingequipment");
            generateTable(sleepingJson, "sleepingTable", "sleeping");
            generateTable(miscJson, "miscTable", "misc");
            increment(10);

            //generating the food table is a bit different because the data has different format
            generateMealPlanTable(foodJson, "foodTable", "food");

            //generating the food table is a bit different because the data has different format
            generateCalorieTable(foodJson, "calorieTable", "calorie-container");

            increment(10);

            //set progress to 100
            setProgressTo100();

        })();
    }

    function addQuestion(userQuestion) {
        // Create a new paragraph element for the assistant's response
        const responseElement = document.createElement('p');
        responseElement.innerText = `User: ${userQuestion}`;

        // Add user question to the conversation
        conversation.push({ 'role': 'user', 'content': userQuestion });
    }

    async function getCategoryWeights(prompt) {
        const body = JSON.stringify({
            'prompt': prompt,
            'max_tokens': 400,
            'temperature': 0.7,
            'top_p': 1
        });

        const response = await fetch(url, {
            method: "POST",
            headers: {
                //'Authorization': 'Bearer ' + customFormAjax.api_key,
                "Content-Type": "application/json"
            },
            body: body
        });

        if (response.status === 200) {
            const json = await response.json();
            console.log(json);

            // Get the assistant's response
            const assistantResponse = json.choices[0].text;

            // Add the assistant's response to the conversation
            conversation.push({ 'role': 'assistant', 'content': assistantResponse });

            //regex stuff
            //get the categories and their weights
            const regex = /(.+):\s(\d+(?:\.\d+)?)/g; //matches to a "item: weight" format
            let match;
            let categoriesList = [];
            while ((match = regex.exec(assistantResponse)) !== null) {
                const category = match[1];
                const weight = parseFloat(match[2]);
                if (category.toLowerCase() !== "total") {
                    console.log(`Category: ${category}`);
                    console.log(`Weight: ${weight}`);
                    let categoryObject = {}
                    categoryObject[category] = weight;
                    categoriesList.push(categoryObject);
                }
            }
            console.log("done")
            console.log(categoriesList);

            /*if (categoriesList.length == 0) {
                getCategoryWeights(prompt); //try again if categories not right
            }*/
            console.log("response: ", assistantResponse);
            increment(10); //increment

            return categoriesList;

        } else {
            // notification("Error: " + response.status, "error", 3000);
            // console.log("Error: " + response.status);
            // //indicate failure
            // notification("Error in generating item lists. Please reload the page and try again. ", "error", 10000);
            // throw new Error("Error in generating item lists. Please reload the page and try again.");
            showErrorNotification(response);
        }
    }

    //extract json from text
    function extractJsonFromString(s) {
        const startIndex = s.indexOf('{');
        const endIndex = s.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
            return s.substring(startIndex, endIndex + 1);
        } else {
            return null; // No valid JSON object found in the string
        }
    }

    // Example usage:
    const inputString = "This is some text {\"foo\": 123, \"bar\": \"hello\"} and more text.";
    const jsonString = extractJsonFromString(inputString);

    if (jsonString !== null) {
        try {
            const data = JSON.parse(jsonString);
            console.log(data);
        } catch (error) {
            console.error("Invalid JSON string:", jsonString);
        }
    } else {
        console.error("No valid JSON object found in the input string.");
    }


    //default of 400 tokens unless otherwise specified
    async function fetchOpenAI(prompt) {
        var maxTokens = 1200; //default tokens for prompts
        var numDays = document.getElementById('hikeLength').value;
        if (prompt.toLowerCase().includes("food")) {
            // The word "food" (case-insensitive) is present in the string.
            // You can set the "tokens" variable to some value here.
            maxTokens = 600 * Math.ceil(numDays / 3);
            console.log("this is a food list. number of tokens increased to ", maxTokens);
        }

        const body = JSON.stringify({
            'prompt': prompt,
            'max_tokens': maxTokens,
            'temperature': 0.7,
            'top_p': 1
        });

        const response = await fetch(url, {
            method: "POST",
            headers: {
                //'Authorization': 'Bearer ' + customFormAjax.api_key,
                "Content-Type": "application/json"
            },
            body: body
        });

        if (response.status === 200) {
            const json = await response.json();
            console.log(json);

            // Get the assistant's response
            const assistantResponse = json.choices[0].text;

            // Add the assistant's response to the conversation
            conversation.push({ 'role': 'assistant', 'content': assistantResponse });

            //document.getElementById(container).innerText = assistantResponse;
            container = assistantResponse; //directly assign to the json object
            console.log("Resulting JSON object\n", assistantResponse);

            //try to parse the data. if that fails, give an alert
            try {
                const parsedData = JSON.parse(extractJsonFromString(assistantResponse));
                console.log(parsedData); // Successfully parsed JSON, so print to console
                increment(10); //increment progress
                return parsedData;
            } catch (error) {
                //indicate failure
                notification("Error in generating item json. Please reload the page and try again. ", "error", 10000);
                showError("Error in generating item json. Please reload the page and try again. ");
                throw new Error("Error in generating item json. Please reload the page and try again.");
            }
            //return JSON.parse(extractJsonFromString(assistantResponse));
        } else {
            showErrorNotification(response);
        }
    }

    function showErrorNotification(response) {
        notification("Error: " + response.status, "error", 3000);
        console.log("Error: " + response.status);
        if (response.status === 400) {
            //error in request
            showError("Error" + response.status + ": Malformed API Request. Please reload the page and try again.");
        }
        else if (response.status === 401 || response.status === 403) {
            //issue with authentication
            showError("Error" + response.status + ": Issue with Authentication to API. Please contact site administrator.");
        }
        else if (response.status === 429) {
            //too many requests
            showError("Error" + response.status + ": API Quota Exceeded. Please contact site administrator.");

        }
        else {
            //something not covered
            showError("An error occured. Please reload the page and try again.");
        }
    }

    //function for relevant help text
    function showHelp(field) {
        // Implement your logic to show the help information for each field
        // You can use JavaScript alert or custom tooltips/popovers to display the help content
        // Modify the code below to fit your needs
        var helpText = "";

        switch (field) {
            case "age":
                helpText = "Enter your age in years.";
                break;
            case "weight":
                helpText = "Enter your weight in kilograms.";
                break;
            case "hikeLength":
                helpText = "Enter the length of the hike in days.";
                break;
            case "season":
                helpText = "Select your preferred season for hiking.";
                break;
            case "avg":
                helpText = "Use the slider to select the AVERAGE elevation of your hike.";
                break;
            case "max":
                helpText = "Use the slider to select the MAXIMUM elevation of your hike.";
                break;
            case "tentCapacity":
                helpText = "Select how many people, including you, will be in your tent.";
                break;
            case "diet":
                helpText = "Specify diet preferences/restrictions for your food list (flexible, vegetarian, or vegan).";
                break;
            // Add more cases for other fields if needed
        }

        alert(helpText);
    }

    // Attach event handlers using event delegation
    $(document).on('click', '.button', function () {
        var field = $(this).data('field');
        showHelp(field);
    });

});