# Customizing CSS in Wordpress
Use the `!important` tag to override existing CSS for that class to ensure custom CSS rules are reflected in the element. This keyword is neccesary when the CSS rules you make for a specific class/element don't seem to be appearing on the site.

Here are 3 areas of adding custom CSS, ordered in decreasing frequency of usage in site development.

## Elementor
This method is useful for modifying elements from elementor, and has been used quite frequently in the development of the site.

Here's how you can apply custom CSS to your entire site with Elementor Pro
https://elementor.com/help/global-custom-css/

1. From the Elementor Editor, click the hamburger menu in the upper left of the widget panel.
2. Click Site Settings
3. Click Custom CSS tab under the Settings heading
4. Enter the CSS code that you wish to apply globally across your site


## Specific Element
This is useful for modifying the CSS of a specific element, especially one you don't know the CSS class of.
To apply CSS to a custom element, use the tag `selector`, and add the desired CSS rules.

Select the element you want to apply custom CSS to. At the very bottom is an area where you can apply custom CSS to that element.

```
selector{
    //your custom CSS rules
}
```

## Wordpress
This method was useful for removing the site footer, In WordPress’s left-hand menu, select Appearance > Customize
Select Additional CSS. Enter your custom CSS in the provided field.