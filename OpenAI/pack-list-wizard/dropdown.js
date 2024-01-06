const hamburger = document.getElementById("hamburger");
const sidebar = document.querySelector(".sidebar");

hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

const sidebarTitles = document.querySelectorAll(".sidebar-title");
const configContent = document.getElementById("configContent");
const recommendationsContent = document.getElementById("recommendationsContent");
const summaryContent = document.getElementById("summaryContent");
const aboutContent = document.getElementById("aboutContent");


//open the horizontal sidebar tabs
sidebarTitles.forEach((title) => {
  title.addEventListener("click", () => {
    configContent.style.display = "none";
    recommendationsContent.style.display = "none";
    summaryContent.style.display = "none";
    aboutContent.style.display = "none"; // Hide the About content initially

    if (title.id === "configTitle") {
      configContent.style.display = "block";
    } else if (title.id === "recommendationsTitle") {
      recommendationsContent.style.display = "block";
    } else if (title.id === "summaryTitle") {
      summaryContent.style.display = "block";
    } else if (title.id === "aboutTitle") {
      aboutContent.style.display = "block"; // Show the About content if About tab is clicked
    }

    // Close the sidebar on mobile
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("active");
    }
  });
});

// Open "Configuration" by default
configContent.style.display = "block";

// Open the default tab when the page loads
document.addEventListener("DOMContentLoaded", function() {
  openTab("clothing");
});

//open the tabs within the pack list tab
function openTab(tabName) {
  var i, tabcontent, tabs;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  
  tabs = document.getElementsByClassName("tab");
  for (i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }
  
  document.getElementById(tabName).style.display = "block";
  document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add("active");
}

