# Cover Image Customization
Sometimes, adjusting the positioning of the cover image on a given page is desired. This is achieved by adjusting its vertical positioning. This effect can be achieved custom code in Elementor's custom code menu. This tutorial will outline the procedure of generating a new code for a given page or set of pages as well as the specific code for each and what variable to modify.

## Adding a New Elementor Custom Code
Go to Elementor -> Custom Code to access the custom code menu. From there, you can select "Add New Code"

First, you can provide the display conditions. To do this, go to the right side of the screen

<img src = "1. Modify Display Conditions.png">

You will arrive at this menu. Select "Add Condition" to add where the code should execute.
<img src = "2. Add Condition.png">

<table>
<tr>
<th>Menu</th>
<th>Dropdown</th>
</tr>
<tr>
<td><img src = "3. Modify the Inclusion Criteria.png"></td>
<td><img src = "4. Display Dropdown 1.png"></td>
</tr>
</table>

Now you've set it to display on one or more pages. Now you can set which ones to use.

<table>
<tr>
<th>Menu</th>
<th>Dropdown</th>
<th>Choose Page</th>
</tr>
<tr>
<td><img src = "5. Which Pages.png"></td>
<td><img src = "6. Display Dropdown 2.png"></td>
<td><img src = "7. Choose Page.png"></td>
</tr>
</table>

## Custom Code
Here is the general syntax for the code that should be inserted:
```
<script>
	function coverImage(){
		//get elements by class name
		//https://www.w3schools.com/jsref/met_document_getelementsbyclassname.asp
			var imageHeaders = document.getElementsByClassName('single-featured-image-header');
			if(window.outerWidth > 767){ //do this for stuff larger than phones
				//CSS !important in Javascript
				//https://stackoverflow.com/questions/38454240/using-css-important-with-javascript
				var image = document.getElementsByClassName('wp-post-image')[0];
				var newHeight = -1*image.height*0.39; //set height related to current cover image height. this pegs the top, allowing the bottom to expand/contract
				imageHeaders[0].style.setProperty('top', newHeight + 'px', 'important');
			}
		
		
	}
	
	window.addEventListener('load', coverImage);
	window.addEventListener('resize', coverImage);
	
</script>
```

Here's what the code does:
1. Gets the image and the div housing it via their class names
2. Gets the height of the image and sets the top position of the image within the div to be some ratio of the image height.

This pegs the image to the top, enabling the top to be the same while the bottom changes, with parts being revealed or hidden depending on the width of the page.

To change the image position, change the coefficient being multiplied to newHeight. In this case, it's `0.39`. The top offset is a negative number, so making the coefficient bigger would make the image be offset further upwards.