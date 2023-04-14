const CHAT = "CHAT";
const NEW_RESPONSE = "NEW_RESPONSE";
const CHAT_REGEX = /chat.openai.com\/c(hat)?\/[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+(\/)?$/;
const CONVERSATION = "https://chat.openai.com/backend-api/conversation";
const POST = "POST";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        if (tab.url && CHAT_REGEX.test(tab.url)) {
            const chatId = tab.url.split("/").pop();
            chrome.tabs.sendMessage(tabId, {
                type: CHAT,
                chatId
            });
        }
    }
});

chrome.webRequest.onCompleted.addListener((request) => {
    if (request.url.includes(CONVERSATION) && request.method === POST) {
        chrome.tabs.sendMessage(request.tabId, {
            type: NEW_RESPONSE
        });
    }
}, { urls: ["<all_urls>"] }, []);