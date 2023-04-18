// Add a listener for when the Save and Copy button is clicked
document.getElementById("saveAndCopyButton").addEventListener("click", function () {
  var cookieName = document.getElementById("cookieName").value;
  // Send a message to the background script to store the cookie name and value in local storage
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tabUrl = tabs[0].url;
    var domain = extractDomain(tabUrl);
    getCookieValue(domain, cookieName, function (cookieValue) {
      if (cookieValue) {
        document.getElementById("cookieValue").value = cookieValue;
        chrome.storage.local.get({ [domain]: {} }, function (result) {
          result[domain].cookieName = cookieName;
          chrome.storage.local.set(result, function () {
            console.log(
                "Cookie stored for " +
                domain +
                ": " +
                cookieName +
                "=" +
                cookieValue
            );
            // Copy the cookie value to the clipboard
            copyToClipboard(cookieValue);
            document.getElementById("status").textContent = 'Copied!';
          });
        });
      } else {
        document.getElementById("cookieValue").value = '';
        document.getElementById("status").textContent = 'Cookie Not Found!';

        // The cookie was not found
        console.log("Cookie not found: " + cookieName);
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

// Set the Cookie Name text box value to the last stored cookie name for the current domain
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var tabUrl = tabs[0].url;
  var domain = extractDomain(tabUrl);
  chrome.storage.local.get({ [domain]: {} }, function (result) {
    if (result[domain].cookieName) {
      document.getElementById("cookieName").value = result[domain].cookieName;
       getCookieValue(domain, result[domain].cookieName, function (cookieValue) {
         if (cookieValue) {
          document.getElementById("cookieValue").value = cookieValue;
        }
        });
    }
  });
});


function getCookieValue(domain, cookieName, callback) {
  chrome.cookies.get({ url: "https://" + domain, name: cookieName }, function (cookie) {
    if (cookie) {
      callback(cookie.value);
    } else {
      var parentDomain = getParentDomain(domain);
      if (parentDomain) {
        getCookieValue(parentDomain, cookieName, callback);
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