function generateTableHeader(headers) {
    const headerRow = document.createElement("tr");

    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;

        if (headerText === "Weight" || headerText === "Cost" || headerText === "Calories") {
            // Add a newline before the text
            th.appendChild(document.createElement("br"));
        }

        if (headerText === "Weight") {
            // Add "(lbs)" under the "Weight" header
            const lbsText = document.createElement("span");
            lbsText.textContent = '(lbs)';
            lbsText.classList.add("small-text");
            th.appendChild(lbsText);
        } else if (headerText === "Cost") {
            // Add "$" under the "Cost" header
            const dollarSign = document.createElement("span");
            dollarSign.textContent = '$';
            dollarSign.classList.add("small-text");
            th.appendChild(dollarSign);
        } else if (headerText === "Calories") {
            // Add "cal" under the "Calories" header
            const calText = document.createElement("span");
            calText.textContent = '(cal)';
            calText.classList.add("small-text");
            th.appendChild(calText);
        }

        headerRow.appendChild(th);
    });

    return headerRow;
}



function generateTable(data, tableId, divId) {
    const tableContainer = document.getElementById(divId);
    tableContainer.innerHTML = ''; // Clear existing content

    const table = document.createElement("table");
    table.id = tableId; // Set the table id

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headers = ["Item", "Weight", "Cost"];
    const headerRow = generateTableHeader(headers);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    data.items.forEach(item => {
        const row = document.createElement("tr");

        const itemCell = document.createElement("td");
        itemCell.textContent = item.item;
        row.appendChild(itemCell);

        const weightCell = document.createElement("td");
        weightCell.textContent = item.weight.toFixed(1);
        row.appendChild(weightCell);

        const priceCell = document.createElement("td");
        priceCell.textContent = item.price.toFixed(2);
        row.appendChild(priceCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Create the total row at the bottom
    const totalRow = document.createElement("tr");

    const totalLabelCell = document.createElement("td");
    totalLabelCell.textContent = "Total";
    totalLabelCell.setAttribute("colspan", "1"); // Span the first column
    totalRow.appendChild(totalLabelCell);

    const totalWeightCell = document.createElement("td");
    totalWeightCell.textContent = data.totalWeight.toFixed(1);
    totalRow.appendChild(totalWeightCell);

    const totalCostCell = document.createElement("td");
    totalCostCell.textContent = data.totalPrice.toFixed(2);
    totalRow.appendChild(totalCostCell);

    tbody.appendChild(totalRow);

    table.appendChild(tbody);

    tableContainer.appendChild(table);
}

function generateCalorieTable(data, tableId, divId) {
    const calorieContainer = document.getElementById(divId);
    calorieContainer.innerHTML = ''; // Clear existing content

    dayCalories = generateDayCalories(data);
    console.log("day calories object", dayCalories);

    const caloriesTable = document.createElement("table");
    caloriesTable.id = tableId; // Set the table id
    caloriesTable.className = "calories-table"; // Add a class for styling

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headers = ["Day", "Weight", "Cost", "Calories"];
    const headerRow = generateTableHeader(headers);
    thead.appendChild(headerRow);
    caloriesTable.appendChild(thead);

    dayCalories.forEach(day => {
        const row = document.createElement("tr");

        const dayCell = document.createElement("td");
        dayCell.textContent = day.Day;
        row.appendChild(dayCell);

        const weightCell = document.createElement("td");
        weightCell.textContent = day.Weight;
        row.appendChild(weightCell);

        const priceCell = document.createElement("td");
        priceCell.textContent = day.Price;
        row.appendChild(priceCell);

        const caloriesCell = document.createElement("td");
        caloriesCell.textContent = day.Calories;
        row.appendChild(caloriesCell);

        tbody.appendChild(row);
    });

    caloriesTable.appendChild(tbody);
    calorieContainer.appendChild(caloriesTable);
}


function generateDayCalories(data) {
    const dayCalories = [];
    data.items.forEach(day => {
        const dayTotalCalories = Object.values(day)
            .filter(meal => meal !== day.day)
            .reduce((total, meal) => total + parseInt(meal.Calories), 0);

        const dayTotalWeight = Object.values(day)
            .filter(meal => meal !== day.day)
            .reduce((total, meal) => total + parseFloat(meal.Weight), 0)
            .toFixed(2); // Assuming weight is in lbs

        const dayTotalPrice = Object.values(day)
            .filter(meal => meal !== day.day)
            .reduce((total, meal) => total + parseFloat(meal.Price), 0)
            .toFixed(2); // Fixed decimal

        dayCalories.push({
            Day: day.day,
            Weight: dayTotalWeight,
            Price: dayTotalPrice,
            Calories: dayTotalCalories
        });
    });
    return dayCalories;
}


function generateMealPlanTable(data, tableId, divId) {
    const mealPlanContainer = document.getElementById(divId);
    mealPlanContainer.innerHTML = ''; // Clear existing content

    data.items.forEach(day => {
        const dayTable = document.createElement("table");
        dayTable.id = tableId; // Set the table id
        dayTable.className = "day-table"; // Add a class for styling

        const dayHeader = document.createElement("caption");
        dayHeader.textContent = "Day " + day.day;
        dayHeader.style.fontWeight = "bold";
        dayHeader.style.color = "#A58A60";
        dayTable.appendChild(dayHeader);

        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const headers = ["Meal", "Item", "Weight", "Cost", "Calories"];
        const headerRow = generateTableHeader(headers);
        thead.appendChild(headerRow);
        dayTable.appendChild(thead);

        let totalWeight = 0;
        let totalPrice = 0;
        let totalCalories = 0;

        ["Breakfast", "Lunch", "Snack", "Dinner"].forEach(meal => {
            const mealRow = document.createElement("tr");
        
            const mealCell = document.createElement("td");
            mealCell.textContent = meal;
            mealRow.appendChild(mealCell);
        
            const mealData = day[meal];
            ["Item", "Weight", "Price", "Calories"].forEach(prop => {
                const cell = document.createElement("td");
        
                // Apply formatting to weights and prices
                if (prop === "Weight") {
                    cell.textContent = mealData[prop].toFixed(1); // Formats weight to one decimal place
                    totalWeight += mealData[prop];
                } else if (prop === "Price") {
                    cell.textContent = mealData[prop].toFixed(2); // Formats price to two decimal places
                    totalPrice += mealData[prop];
                } else {
                    cell.textContent = mealData[prop];
                }
        
                mealRow.appendChild(cell);
        
                // Accumulate totals for calories
                if (prop === "Calories") {
                    totalCalories += mealData[prop];
                }
            });
        
            tbody.appendChild(mealRow);
        });
        

        dayTable.appendChild(tbody);

        // Add a row for total weight, price, and calories
        const totalRow = document.createElement("tr");

        const blankCell = document.createElement("td");
        blankCell.textContent = "";

        const totalCell = document.createElement("td");
        totalCell.textContent = "Day Total";

        const totalWeightCell = document.createElement("td");
        totalWeightCell.textContent = totalWeight.toFixed(1);

        const totalPriceCell = document.createElement("td");
        totalPriceCell.textContent = totalPrice.toFixed(2);

        const totalCaloriesCell = document.createElement("td");
        totalCaloriesCell.textContent = totalCalories;

        totalRow.appendChild(blankCell);
        totalRow.appendChild(totalCell);
        totalRow.appendChild(totalWeightCell);
        totalRow.appendChild(totalPriceCell);
        totalRow.appendChild(totalCaloriesCell);

        dayTable.appendChild(totalRow);

        mealPlanContainer.appendChild(dayTable);
    });

    const labels = ["Total Weight", "Total Cost", "Total Calories"];
    const values = [
        data.totalWeight.toFixed(1) + " lbs",
        "$" + data.totalPrice.toFixed(2),
        data.totalCalories + " cal"
    ];

    const table = document.createElement("table");
    table.classList.add("auto-width-table"); // Add a class to the table

    for (let i = 0; i < labels.length; i++) {
        const row = document.createElement("tr");

        const labelCell = document.createElement("td");
        labelCell.textContent = labels[i];

        const valueCell = document.createElement("td");
        valueCell.textContent = values[i];

        row.appendChild(labelCell);
        row.appendChild(valueCell);

        table.appendChild(row);
    }

    mealPlanContainer.appendChild(table);


}




function generateSummaryTable(data) {
    var names = ["Clothing", "Cooking", "Sleeping", "Food", "Misc"];
    var container = document.getElementById("table-container");
    container.innerHTML = ""; // Clear existing content

    var table = document.createElement("table");

    // Generate the header row using the generateTableHeader function
    const headers = ["Name", "Weight", "Cost"];
    const tableHeader = generateTableHeader(headers);
    table.appendChild(tableHeader);

    for (var i = 0; i < data.length; i++) {
        var row = document.createElement("tr");

        var nameCell = document.createElement("td");
        nameCell.textContent = names[i];
        row.appendChild(nameCell);

        var weightCell = document.createElement("td");
        weightCell.textContent = data[i].totalWeight.toFixed(1);
        row.appendChild(weightCell);

        var priceCell = document.createElement("td");
        priceCell.textContent = data[i].totalPrice.toFixed(2);
        row.appendChild(priceCell);

        table.appendChild(row);
    }

    container.appendChild(table); // Append the new table
}


function generateTotalTable(totalWeight, totalPrice) {
    //display the totalWeight and totalPrice
    // Get the existing div element by its id
    var totalContainer = document.getElementById("total-container");

    // Clear the existing content of the div
    totalContainer.innerHTML = "";

    // Create a table element
    var table = document.createElement("table");

    // Create the header row
    var headerRow = table.insertRow();

    // Create header cells for weight and price columns
    var weightHeaderCell = headerRow.insertCell(0);
    weightHeaderCell.textContent = "Total Weight";

    var priceHeaderCell = headerRow.insertCell(1);
    priceHeaderCell.textContent = "Total Price";

    // Create a data row
    var dataRow = table.insertRow();

    // Create data cells for weight and price values
    var weightDataCell = dataRow.insertCell(0);
    weightDataCell.textContent = Number(totalWeight).toFixed(1) + " lbs";

    var priceDataCell = dataRow.insertCell(1);
    priceDataCell.textContent = "$" + totalPrice;

    // Append the table to the div
    totalContainer.appendChild(table);
}

function generateHikerSummaryTable(){
    //get the data
    const age = document.getElementById('age').value;
    const weight = document.getElementById('weight').value + " lbs";
    const sex = capitalizeFirstLetter(document.getElementById('sex').value)[0]; //first character, M or F
    const packWeight = capitalizeFirstLetter(document.getElementById('packweight').value);
    const hikeLength = document.getElementById('hikeLength').value;
    const season = capitalizeFirstLetter(document.getElementById('season').value);
    
    //const avgElevation = document.getElementById('avgOutput').textContent + " feet";
    //const maxElevation = document.getElementById('maxOutput').textContent + " feet";

    const avgElevation = (document.getElementById("avgSlider").value / 1000).toFixed(1) + "k";
    const maxElevation = (document.getElementById("maxSlider").value / 1000).toFixed(1) + "k";

    const tentCapacity = document.getElementById('tentCapacity').value;
    const dietaryPreference = capitalizeFirstLetter(document.getElementById('dietary-preference').value);

    // Concatenate all the data into a single string
    const dataString = `
        <span class="label">You:</span> Age: ${age}, Weight: ${weight}, Sex: ${sex}<br>
        <span class="label">Hike:</span> Length: ${hikeLength}, Avg Elev: ${avgElevation}, Max Elev: ${maxElevation}, Season: ${season}<br>
        <span class="label">Personal:</span> Pack: ${packWeight}, Diet: ${dietaryPreference}, Tent Capacity: ${tentCapacity}
    `;

    // Display the data in the HTML
    document.getElementById('hiker-container').innerHTML = dataString;
}