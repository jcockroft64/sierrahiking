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
    
    function enterInfo(){
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
        //get the text
        addQuestion(userQuestion);
        const prompt = userQuestion + conversation.map(message => `${message.role}: ${message.content}`).join('\n');
        //fetchOpenAI(prompt, "backpack");
    
        /*var text = getCategoryWeights(prompt);
        console.log(text);*/
    
        (async () => {
            var text = await getCategoryWeights(prompt);
            console.log("weights: ", text);
            // Access the properties of each item object
            text.forEach(item => {
                const itemName = Object.keys(item)[0];
    
                //for the container id
                const itemName2 = Object.keys(item)[0].toLowerCase();
                const noSpaces = itemName2.replace(/\s/g, '');
    
                const weight = item[itemName];
                
                console.log(`Item: ${itemName}`);
                console.log(`Weight: ${weight}`);
                var divName = noSpaces + "-weight";
    
                //show the generated weight to the user
                //document.getElementById(divName).innerText = String(weight) + " pounds";
    
                //prompt for category and weight
                categoryPrompt = "Provide a list of " + itemName + " for a " + hikeLength + "-day backpacking trip with a total weight as close to, but not exceeding " + weight + " pounds. Also provide the weight of each item."
                
                //for food, break it down by day
                if(item=="Food"){
                    categoryPrompt += " Must be as close to " + weight + " pounds as possible";
                    categoryPrompt += " Break down the list by day.";
                }
                
                categoryPrompt+= " Also provide the total weight of all the items in this list."
                fetchOpenAI(categoryPrompt, noSpaces);
                console.log(categoryPrompt);
    
    
            });
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
    
    function fetchOpenAI(prompt, container){
        // Make POST request to the ChatGPT API endpoint
        // API request payload
        var data = {
            'prompt': prompt,
            'max_tokens': 600,
            'temperature': 0.7,
            'top_p': 1
        };
        $.ajax({
            type: 'POST',
            url: 'https://api.openai.com/v1/engines/text-davinci-003/completions',
            headers: {
                'Authorization': 'Bearer ' + customFormAjax.api_key,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data),
            success: function(response) {
                // Handle the API response
                var assistantResponse = response.choices[0].text.trim();

                // Add the assistant's response to the conversation
                conversation.push({ 'role': 'assistant', 'content': assistantResponse });

                //display response
                document.getElementById(container).innerText = assistantResponse;

                //notify success
                var newMessage = capitalizeFirstLetter(container) + " list generated successfully!"
                notification(newMessage, "success", 3000);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Error: ' + textStatus, errorThrown);
                notification("Error: " + textStatus + " " + errorThrown, "error", 3000);
                //notify error
            }
        });
    }
    async function fetchOpenAI2(prompt, container) {
        const body = JSON.stringify({
            'prompt': prompt,
            'max_tokens': 400,
            'temperature': 0.7,
            'top_p': 1
        });
    
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": bearer,
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
    
            // Create a new paragraph element for the assistant's response
            const responseElement = document.createElement('p');
            responseElement.innerText = `Assistant: ${assistantResponse}`;
    
            // Append the response element to the response container
            const responseContainer = document.getElementById(container);
            responseContainer.appendChild(responseElement);
        } else {
            console.log("Error: " + response.status);
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
            // Add more cases for other fields if needed
        }
    
        alert(helpText);
    }
    
});
