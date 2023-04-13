const CHAT = "CHAT";
const CG_CLASS = "relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center";

(() => {
    
    let currentChat = "";
    
    chrome.runtime.onMessage.addListener((obj) => {
        const { type, chatId } = obj;
        if (type === CHAT) {
            currentChat = chatId;
            newChatLoaded();
        }
    });

    const newChatLoaded = () => {
        console.log("newChatLoaded@", currentChat);
    };

})();



