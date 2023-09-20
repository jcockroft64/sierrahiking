function generateTable(data, tableId, divId) {
    const tableContainer = document.getElementById(divId);
    tableContainer.innerHTML = ''; // Clear existing content

    const table = document.createElement("table");
    table.id = tableId; // Set the table id

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");
    const headers = ["Item", "Weight", "Price"];
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    data.items.forEach(item => {
        const row = document.createElement("tr");

        const itemCell = document.createElement("td");
        itemCell.textContent = item.item;
        row.appendChild(itemCell);

        const weightCell = document.createElement("td");
        weightCell.textContent = item.weight;
        row.appendChild(weightCell);

        const priceCell = document.createElement("td");
        priceCell.textContent = item.price;
        row.appendChild(priceCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    const totalWeight = document.createElement("p");
    totalWeight.textContent = "Total Weight: " + data.totalWeight;

    const totalPrice = document.createElement("p");
    totalPrice.textContent = "Total Price: " + data.totalPrice;

    tableContainer.appendChild(table);
    tableContainer.appendChild(totalWeight);
    tableContainer.appendChild(totalPrice);
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
        dayTable.appendChild(dayHeader);

        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const headerRow = document.createElement("tr");
        const headers = ["Meal", "Item", "Weight", "Price"];
        headers.forEach(headerText => {
            const th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        dayTable.appendChild(thead);

        ["Breakfast", "Lunch", "Snack", "Dinner"].forEach(meal => {
            const mealRow = document.createElement("tr");

            const mealCell = document.createElement("td");
            mealCell.textContent = meal;
            mealRow.appendChild(mealCell);

            const mealData = day[meal];
            ["Item", "Weight", "Price"].forEach(prop => {
                const cell = document.createElement("td");
                cell.textContent = mealData[prop];
                mealRow.appendChild(cell);
            });

            tbody.appendChild(mealRow);
        });

        dayTable.appendChild(tbody);
        mealPlanContainer.appendChild(dayTable);
    });

    const totalWeight = document.createElement("p");
    totalWeight.textContent = "Total Weight: " + data.totalWeight;

    const totalPrice = document.createElement("p");
    totalPrice.textContent = "Total Price: " + data.totalPrice;

    mealPlanContainer.appendChild(totalWeight);
    mealPlanContainer.appendChild(totalPrice);
}

function generateSummaryTable(data) {
    var names = ["Clothing", "Cooking", "Sleeping", "Food", "Misc"];
    var container = document.getElementById("table-container");
    container.innerHTML = ""; // Clear existing content
    
    var table = document.createElement("table");
    var tableHeader = document.createElement("tr");
    
    var headers = ["Name", "Weight", "Price"];
    for (var i = 0; i < headers.length; i++) {
        var th = document.createElement("th");
        th.textContent = headers[i];
        tableHeader.appendChild(th);
    }
    table.appendChild(tableHeader);

    for (var i = 0; i < data.length; i++) {
        var row = document.createElement("tr");

        var nameCell = document.createElement("td");
        nameCell.textContent = names[i];
        row.appendChild(nameCell);

        var weightCell = document.createElement("td");
        weightCell.textContent = data[i].totalWeight;
        row.appendChild(weightCell);

        var priceCell = document.createElement("td");
        priceCell.textContent = data[i].totalPrice;
        row.appendChild(priceCell);

        table.appendChild(row);
    }

    container.appendChild(table); // Append the new table
}

function generateTotalTable(totalWeight, totalPrice){
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
    weightDataCell.textContent = totalWeight + " lbs";

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