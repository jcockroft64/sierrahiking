jQuery(document).ready(function($) {
    // Run JavaScript function on form submit
    $('#infoForm').submit(function(e) {
        e.preventDefault();

        // Call the enterInfo function
        enterInfo();
    });

    let conversation = [
        { 'role': 'system', 'content': 'You are a helpful assistant providing information about hiking in the Sierra Nevadas.' },
        /*{"role": "system", "content": "During the spring season in the Sierras, you can expect a significant runoff due to melting snow. This can result in swollen streams and rivers, causing them to flow more rapidly and making water crossings challenging or dangerous. It's important to exercise caution and evaluate the conditions before attempting any crossings."},
        {"role": "system", "content": "Additionally, the springtime in the Sierras can bring an increase in mosquito activity. It's advisable to bring mosquito repellent to protect yourself from these insects."},
        {"role": "system", "content": "Snow can still be present during the spring, especially at higher elevations. This can make navigation more difficult, particularly if trails are covered or obscured by snow. It's important to have proper navigation tools and skills, as well as the appropriate equipment like snowshoes or crampons if venturing into snowy areas."},
        {"role": "system", "content": "Moving on to the fall season, water scarcity can be a concern. As the summer progresses, some smaller streams and creeks may start to dry up, reducing the availability of water sources along the trails. It's crucial to plan ahead and ensure you have sufficient water or the means to purify available water."},
        {"role": "system", "content": "Interestingly, even though water can be scarce, the fall season in the Sierras is also known for the potential supply of snow. As temperatures drop, snowfall can begin again at higher elevations, potentially creating hazardous conditions. It's essential to stay informed about weather forecasts and trail conditions if hiking during this time."},
        {"role": "system", "content": "In the fall, there can be a surprise drop in temperatures, especially during the night. It's important to pack appropriate layers and gear to stay warm and comfortable. Despite the temperature fluctuations, the weather in the fall season tends to be more predictable compared to the spring, allowing for better planning."}
        */
    ];
    
    const url = "https://api.openai.com/v1/engines/text-davinci-003/completions";
    
    const error = "error"
    //given a user's age, calculate the maximum weight of their pack
    function maxPackWeight(age, weight){
        var basicRatio = 0.19; //basic ratio; backpack weight is 19% of person's weight
        //more specific ratio per age; peak strength at 20-30 years old
        var multiplier;
        if(age<10 || age >80){
            return error;
        }
        else if (10 <= age && age < 20){
            multiplier = 0.9;
        }
        else if (20 <= age && age < 30){
            multiplier = 1;
        }
        else if (30 <= age && age < 40){
            multiplier = 0.9;
        }
        else if (40 <= age && age < 50){
            multiplier = 0.85;
        }
        else if (50 <= age && age < 60){
            multiplier = 0.8;
        }
        else if (60 <= age && age < 70){
            multiplier = 0.75;
        }
        else if (70 <= age && age <= 80){
            multiplier = 0.7;
        }
    
        var maxWeight = weight*basicRatio*multiplier;
        return maxWeight;
    }

    function capitalizeFirstLetter(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    function notification(message, type, length){
        new Noty({
            text: message,
            type: type,
            timeout: length // Display duration in milliseconds
        }).show();
    }

    //get weight in pounds from total weight of list
    function extractWeightInPounds(text) {
        const regex = /\b(\d+(\.\d+)?|\.\d+)\s*(lb|lbs|pound|pounds)\b/i;
        const match = text.match(regex);
        if (match) {
            const weight = parseFloat(match[1]);
            return weight;
        }
        return null;
    }

    async function getTotalWeight(){

        var clothing = extractWeight("clothing");
        var cookingequipment = extractWeight("cookingequipment");
        var sleeping = extractWeight("sleeping");
        var food = extractWeight("food");
        var misc = extractWeight("misc");

        console.log("the weights: ", clothing, cookingequipment, sleeping, food, misc);
        var totalWeight = clothing + cookingequipment + sleeping + food + misc;

        console.log("Your pack weighs", totalWeight, "pounds");
        //print that on page
        var headerElement = document.getElementById("totalInsert");
        headerElement.innerHTML = "";
        headerElement.innerHTML += totalWeight;
        headerElement.innerHTML += " pounds";
        
    }

    // Function to generate the Misc list
    async function generateMiscList(miscCategory, conversation, hikeLength) {
        // Access the properties of the Misc item object
        const itemName = Object.keys(miscCategory)[0];
        const weight = miscCategory[itemName];

        console.log(`Item: ${itemName}`);
        console.log(`Weight: ${weight}`);

        // Now you have the "Misc" object, and you can process it further if needed.
        var userQuestion = "Provide a list of other items for a " + hikeLength + "-day backpacking trip with a total weight as close to, but not exceeding " + weight + " pounds, but at least" + 0.9*weight + " pounds. Also provide the weight of each item. Also provide the total weight of all the items in this list."
        
        userQuestion+=" This list should only include items not in the clothing, cooking, sleeping, or food lists previously generated";
        //userQuestion += "\n\nThis list should only include items not included in the following previous lists:\n" + previousListsContext;

        console.log(userQuestion);

        //wait for OpenAI stuff to complete before next function can run
        await fetchOpenAI(userQuestion, "misc")
    }

    //function to generate the category prompt
    function generateCategoryPrompt(itemName, hikeLength, weight) {
        let categoryPrompt = "Provide a list of " + itemName + " for a " + hikeLength + "-day backpacking trip with a total weight as close to, but not exceeding " + weight + " pounds, but at least " + 0.9 * weight + " pounds. Also provide the weight of each item.";
    
        if (itemName === "Food") {
            categoryPrompt += " Must be as close to " + weight + " pounds as possible.";
            categoryPrompt += " There must be between 1 and " + (weight / hikeLength).toFixed(2) + " pounds of food per day. No less.";
    
            const diet = document.getElementById('dietary-preference').value;
            if (diet === "vegetarian" || diet === "vegan") {
                categoryPrompt += " Food list must follow a " + diet + " diet.";
            }
    
            categoryPrompt += " Break down the list by day and provide the total weight of food for each given day.";
            categoryPrompt += " Also provide the total weight of each of the day's food.";
            const tokens = 400 * Math.ceil(hikeLength / 3);
            //3 days = 400*1, 6 = 400*2, etc
        } else {
            categoryPrompt += " Also provide the total weight of all the items in this list.";
        }
    
        return categoryPrompt;
    }

    // Function to check if a value is less than a threshold
    function isLessThan(value, threshold) {
        //return parseFloat(value) < threshold;
        return Number(value) < Number(threshold);
    }
    
    function extractWeight(id){
        var clothing = document.getElementById(id).innerText.toLowerCase();
        var clothingText = clothing.slice(clothing.lastIndexOf('total weight'));
        console.log(clothingText);
        var clothingWeight = extractWeightInPounds(clothingText);
        console.log(clothingWeight);
        return clothingWeight;
    }

    /*async function checkCategoryWeights(categoriesToGenerate, hikeLength){

        var clothingWeight = extractWeight("clothing");
        var cookingWeight = extractWeight("cookingequipment");
        var sleepingWeight = extractWeight("sleeping");
        var foodWeight = extractWeight("food");

        console.log(categoriesToGenerate);

        // Compare and check the fields
        categoriesToGenerate.forEach(obj => {
            const key = String(Object.keys(obj)[0]);
            console.log(key);
            const value = obj[key];
            console.log(value);
            var tokens = 400;
            
            if (key === 'Food') {
                if (foodWeight<hikeLength) {
                    console.log(`Food (${foodWeight}) is less than ${hikeLength}.`);
                    categoryPrompt = "The food list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    notification("Insufficient weight for food list. Regenerating list...", error, 5000);
                    fetchOpenAI(categoryPrompt, "food", tokens);
                    console.log(categoryPrompt);
                }
            }
            else if (key === "Clothing"){
                console.log("this is clothing");
                if (isLessThan(clothingWeight, 0.8*value)) {
                    console.log(`Clothing (${foodWeight}) is less than 0.8 times ${value}.`);
                    categoryPrompt = "The clothing list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    notification("Insufficient weight for clothing list. Regenerating list...", error, 5000);
                    fetchOpenAI(categoryPrompt, "clothing", tokens);
                    console.log(categoryPrompt);
                }
            }

            else if (key === "Sleeping"){
                console.log("this is sleeping");
                if (isLessThan(sleepingWeight, 0.8*value)) {
                    console.log(`Sleeping (${sleepingWeight}) is less than 0.8 times ${value}.`);
                    categoryPrompt = "The sleeping list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    notification("Insufficient weight for sleeping list. Regenerating list...", error, 5000);
                    fetchOpenAI(categoryPrompt, "sleeping", tokens);
                    console.log(categoryPrompt);
                    
                }
            }

            else{
                console.log("this item is cooking");
                if (isLessThan(cookingWeight, 0.8*value)) {
                    console.log(`Cooking (${cookingWeight}) is less than 0.8 times ${value}.`);
                    categoryPrompt = "The cooking equipment list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    notification("Insufficient weight for cooking list. Regenerating list...", error, 5000);
                    fetchOpenAI(categoryPrompt, "cookingequipment", tokens);
                    console.log(categoryPrompt);
                }
            }
        });
    }*/

    async function checkCategoryWeights(categoriesToGenerate, hikeLength) {
        var clothingWeight = extractWeight("clothing");
        var cookingWeight = extractWeight("cookingequipment");
        var sleepingWeight = extractWeight("sleeping");
        var foodWeight = extractWeight("food");
    
        console.log(categoriesToGenerate);
    
        // Compare and check the fields
        const updatePromises = categoriesToGenerate.map(async obj => {
            const key = String(Object.keys(obj)[0]);
            console.log(key);
            const value = obj[key];
            console.log(value);
            var tokens = 400;
    
            if (key === 'Food') {
                if (foodWeight < hikeLength) {
                    console.log(`Food (${foodWeight}) is less than ${hikeLength}.`);
                    categoryPrompt = "The food list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    notification("Insufficient weight for food list. Regenerating list...", error, 5000);
                    await fetchOpenAI(categoryPrompt, "food", tokens);
                    console.log(categoryPrompt);
                }
            } else if (key === "Clothing") {
                console.log("this is clothing");
                if (isLessThan(clothingWeight, 0.8 * value)) {
                    console.log(`Clothing (${foodWeight}) is less than 0.8 times ${value}.`);
                    categoryPrompt = "The clothing list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    notification("Insufficient weight for clothing list. Regenerating list...", error, 5000);
                    await fetchOpenAI(categoryPrompt, "clothing", tokens);
                    console.log(categoryPrompt);
                }
            } else if (key === "Sleeping") {
                console.log("this is sleeping");
                if (isLessThan(sleepingWeight, 0.8 * value)) {
                    console.log(`Sleeping (${sleepingWeight}) is less than 0.8 times ${value}.`);
                    categoryPrompt = "The sleeping list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    notification("Insufficient weight for sleeping list. Regenerating list...", error, 5000);
                    await fetchOpenAI(categoryPrompt, "sleeping", tokens);
                    console.log(categoryPrompt);
                }
            } else {
                console.log("this item is cooking");
                if (isLessThan(cookingWeight, 0.8 * value)) {
                    console.log(`Cooking (${cookingWeight}) is less than 0.8 times ${value}.`);
                    categoryPrompt = "The cooking equipment list previously generated isn't heavy enough. ";
                    categoryPrompt += generateCategoryPrompt(key, hikeLength, value);
                    notification("Insufficient weight for cooking list. Regenerating list...", error, 5000);
                    await fetchOpenAI(categoryPrompt, "cookingequipment", tokens);
                    console.log(categoryPrompt);
                }
            }
        });
    
        // Return a Promise that resolves when all the category weights have been updated
        return Promise.all(updatePromises);
    }    

    async function checkMiscWeight(miscCategory, hikeLength){
        var miscWeight = extractWeight("misc");
        
        console.log(miscCategory);

        const miscKey = Object.keys(miscCategory)[0];
        const miscValue = miscCategory[miscKey];
        if (isLessThan(miscWeight, 0.8*miscValue)) {
            console.log(`Misc (${miscWeight}) is less than 0.8 times ${miscValue}.`);
            // Now you have the "Misc" object, and you can process it further if needed.
            var userQuestion = "The misc list previously generated isn't heavy enough. ";
            userQuestion += "Provide a list of other items for a " + hikeLength + "-day backpacking trip with a total weight as close to, but not exceeding " + miscValue + " pounds, but at least" + 0.9*weight + " pounds. Also provide the weight of each item. Also provide the total weight of all the items in this list."
            
            userQuestion+=" This list should only include items not in the clothing, cooking, sleeping, or food lists previously generated";
            //userQuestion += "\n\nThis list should only include items not included in the following previous lists:\n" + previousListsContext;

            console.log(userQuestion);

            notification("Insufficient weight for misc list. Regenerating list...", error, 5000);

            //wait for OpenAI stuff to complete before next function can run
            await fetchOpenAI(userQuestion, "misc")
        }
        // Return a Promise that resolves when the "Misc" category weight has been updated
        return Promise.resolve();
    }
    
    async function enterInfo(){
        const age = document.getElementById("age").value;
        const weight = document.getElementById("weight").value;
        const hikeLength = document.getElementById("hikeLength").value;
    
        const season = document.getElementById("season").value;
    
        //elevations
        var avg = document.getElementById("avgSlider").value;
        var max =  document.getElementById("maxSlider").value;
    
        const tentCapacity = document.getElementById("tentCapacity").value;
    
        const maxWeight = maxPackWeight(age, weight);
    
        if(maxWeight == error){
            //warn user that people under 10 or over 80 not recommended
            notification("Sorry; we can't produce a backpacking and food list for you. It isn't recommended for people under 10 or over 80 to go backpacking in the Sierra Nevadas.", "error", 5000);
            return;
        }
        //all good. tell user
        notification("Generating backpacking and food lists...", "info", 3000);
    
        //assume a person eats 1.5 pounds of food per day
        const foodPerDay = 1.5;
        const totalFood = foodPerDay*hikeLength;
    
        //userQuestion = "Make a " + hikeLength + "-day backpacking list with a total weight not exceeding " + maxWeight + " pounds. Provide a weight distribution for the backpack into 5 major categories: clothing, cooking, sleeping, food, and misc. Please provide the weight of each category."
        userQuestion = "Provide a weight distribution for a " + hikeLength + "-day backpacking list with a total weight as close to, but not exceeding " + maxWeight + " pounds. Provide a weight distribution for the backpack into 5 major categories: clothing, cooking equipment, sleeping, food, and misc. Please provide the weight of each category."
    
        console.log("hello??");
        console.log(maxWeight);
        //get the text
        addQuestion(userQuestion);
        const prompt = userQuestion + conversation.map(message => `${message.role}: ${message.content}`).join('\n');
        //fetchOpenAI(prompt, "backpack");
    
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
    
            // Access the properties of each item object
            categoriesToGenerate.forEach(item => {
                let tokens = 400; //400 tokens by default; increased for food
                const itemName = Object.keys(item)[0];
    
                //for the container id
                const itemName2 = Object.keys(item)[0].toLowerCase();
                const noSpaces = itemName2.replace(/\s/g, '');
    
                const weight = item[itemName];
                
                console.log(`Item: ${itemName}`);
                console.log(`Weight: ${weight}`);
                var divName = noSpaces + "-weight";
    
                categoryPrompt = generateCategoryPrompt(itemName, hikeLength, weight);

                //fetchOpenAI(categoryPrompt, noSpaces);
                promptList.push(fetchOpenAI(categoryPrompt, noSpaces, tokens));
                console.log(categoryPrompt);
            });
    
            // Wait for all the category prompts to be processed
            await Promise.all(promptList);
    
            console.log(promptList);
    
            //message history. "system" and "user" texts (the first 2) are not part of the packing lists, but part of the context.
            //next is the weights
            //the final 4 prompts are from the food lists. use that as context for ChatGPT of what items NOT to include for the other items
            console.log(conversation);
    
            // Generate the Misc list separately after the first four lists are generated
            await generateMiscList(miscCategory, conversation, hikeLength);

             // Call the functions and wait for all the category weights to be updated
            await Promise.all([
                //check the weight of all categories before misc
                checkCategoryWeights(categoriesToGenerate, hikeLength),
                //check misc weight
                checkMiscWeight(miscCategory, hikeLength)
            ]);

            //get total weight
            await getTotalWeight();
            
        })();
        
        
        /*console.log("stuff will occur below");
        //get the categories and their weights
        const regex = /(.+):\s(\d+\.\d+)\spounds/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const category = match[1];
            const weight = parseFloat(match[2]);
            if (category.toLowerCase() !== "total") {
                console.log(`Category: ${category}`);
                console.log(`Weight: ${weight}`);
            }
        }*/
    }
    
    function addQuestion(userQuestion){
        // Create a new paragraph element for the assistant's response
        const responseElement = document.createElement('p');
        responseElement.innerText = `User: ${userQuestion}`;
    
        // Append the response element to the response container
        //const responseContainer = document.getElementById('responseContainer');
        //responseContainer.appendChild(responseElement);
    
        // Add user question to the conversation
        conversation.push({ 'role': 'user', 'content': userQuestion });
    }
    
    async function getCategoryWeights(prompt){
        const body = JSON.stringify({
            'prompt': prompt,
            'max_tokens': 400,
            'temperature': 0.7,
            'top_p': 1
        });
    
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + customFormAjax.api_key,
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
    
            var newMessage = "Category weights generated successfully!"
            notification(newMessage, "success", 3000);
            console.log("response: ", assistantResponse);
    
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
    
            return categoriesList;
    
        } else {
            notification("Error: " + response.status, "error", 3000);
            console.log("Error: " + response.status);
        }
    }

    function fetchOpenAI(prompt, container) {
        // Create a Deferred object
        const deferred = $.Deferred();
      
        $.ajax({
          type: 'POST',
          url: 'https://api.openai.com/v1/engines/text-davinci-003/completions',
          headers: {
            'Authorization': 'Bearer ' + customFormAjax.api_key,
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({
            'prompt': prompt,
            'max_tokens': 600,
            'temperature': 0.7,
            'top_p': 1
          }),
          success: function(response) {
            const assistantResponse = response.choices[0].text.trim();
      
            conversation.push({ 'role': 'assistant', 'content': assistantResponse });
            document.getElementById(container).innerText = assistantResponse;
      
            var newMessage = capitalizeFirstLetter(container) + " list generated successfully!"
            notification(newMessage, "success", 3000);
      
            // Resolve the Deferred object to signal successful completion
            deferred.resolve();
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log('Error: ' + textStatus, errorThrown);
            notification("Error: " + textStatus + " " + errorThrown, "error", 3000);
      
            // Reject the Deferred object to signal an error
            deferred.reject(errorThrown);
          }
        });
      
        // Return the Deferred object
        return deferred;
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
            // Add more cases for other fields if needed
        }
    
        alert(helpText);
    }

    // Attach event handlers using event delegation
    $(document).on('click', '.button', function() {
        var field = $(this).data('field');
        showHelp(field);
    });
    
});
