// Define a global error handler function
function globalErrorHandler(message, source, lineno, colno, error) {
  // Handle the error here
  console.error("An error occurred:", message);

  // Call your custom error-handling function
  showError("An error occurred");

  // Prevent the default browser error handling
  return true;
}

// Attach the global error handler to the window.onerror event
window.onerror = globalErrorHandler;