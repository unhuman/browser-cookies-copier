// Add a listener for when the Save and Copy button is clicked
document.getElementById("saveAndCopyButton").addEventListener("click", function () {
  // Send a message to the background script to store the cookie name and value in local storage
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tabUrl = tabs[0].url;
    var domain = extractDomain(tabUrl);
    getCookiesValue(domain, function (cookiesValue) {
      if (cookiesValue) {
         document.getElementById("cookiesValue").value = cookiesValue;
         // Copy the cookie value to the clipboard
         copyToClipboard(cookiesValue);
         document.getElementById("status").textContent = 'Copied!';
      } else {
        document.getElementById("cookiesValue").value = '';
        document.getElementById("status").textContent = 'Cookie Not Found!';

        // The cookie was not found
        console.log("Cookies not found");
      }
    });
  });
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

function getCookiesValue(domain, callback) {
  chrome.cookies.getAll({ 'domain': domain }, function (cookies) {
    if (cookies) {
      console.log("Raw " + cookies);
      let values = cookies.map((cookie) => cookie.name + "=" + cookie.value).join('; ');  
      console.log("joined: " + values);
      callback(values);
    } else {
      var parentDomain = getParentDomain(domain);
      if (parentDomain) {
        getCookieValue(parentDomain, callback);
      } else {
        callback(null);
      }
    }
  });
}

function getParentDomain(domain) {
  var domainParts = domain.split(".");
  if (domainParts.length > 2) {
    domainParts.shift();
    return domainParts.join(".");
  }
  return null;
}

function copyToClipboard(text) {
  const input = document.createElement("textarea");
  document.body.appendChild(input);
  input.value = text;
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}
