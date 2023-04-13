const CHAT = "CHAT";
const CHAT_REGEX = /chat.openai.com\/c(hat)?\/[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+$/;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        console.log("Tab loaded: ", tab.url);
        if (tab.url && CHAT_REGEX.test(tab.url)) {
            const chatId = tab.url.split("/").pop();
            console.log(chatId);
            chrome.tabs.sendMessage(tabId, {
                type: CHAT,
                chatId
            });
        }
    }
});