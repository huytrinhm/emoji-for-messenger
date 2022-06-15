chrome.runtime.onMessage.addListener(function (
  message,
  sender,
  sendResponse
) {
  if (message.action == "getHostname")
    sendResponse({ hostname: document.location.hostname });
  else sendResponse({});
});
