// Add a listener for when the Save and Copy button is clicked
document.getElementById("saveAndCopyButton").addEventListener("click", function () {
  var cookieName = document.getElementById("cookieName").value;
  // Send a message to the background script to store the cookie name and value in local storage
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tabUrl = tabs[0].url;
    var domain = extractDomain(tabUrl);
    chrome.runtime.sendMessage({
      type: "storeCookie",
      cookieName: cookieName,
      tabDomain: domain,
    });
  });
  // Close the popup window
  window.close();
});

function extractDomain(url) {
  var domain;
  if (url.indexOf("://") > -1) {
    domain = url.split("/")[2];
  } else {
    domain = url.split("/")[0];
  }
  return domain.split(":")[0];
}

// Set the Cookie Name text box value to the last stored cookie name for the current domain
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var tabUrl = tabs[0].url;
  var domain = extractDomain(tabUrl);
  chrome.storage.local.get({ [domain]: {} }, function (result) {
    if (result[domain].cookieName) {
      document.getElementById("cookieName").value = result[domain].cookieName;
    }
  });
});