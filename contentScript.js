const CHAT = "CHAT";
const CG_CLASS = "relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center";
const CODE = "Copy code";

(() => {
    
    let currentChat = "";
    
    chrome.runtime.onMessage.addListener((obj) => {
        const { type, chatId } = obj;
        if (type === CHAT) {
            currentChat = chatId;
            newChatLoaded();
        }
    });

    const waitForChats = () => {
        return new Promise((resolve) => {
            const check = () => {
                const allResponses = document.getElementsByClassName(CG_CLASS);
                if (allResponses.length > 0) {
                    resolve(allResponses);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    };

    const newChatLoaded = () => {
        waitForChats().then((allResponses) => {
            let response = allResponses[allResponses.length - 1];
            response.addEventListener("click", (e) => {
                let contents = e.target.parentNode.parentNode.parentNode.childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes;
                let copyText = "";
                contents.forEach(section => {
                    if(section instanceof HTMLParagraphElement){
                        copyText += section.textContent + "\n";
                    } else if (section.textContent.includes(CODE)){
                        copyText += section.textContent.split(CODE)[1] + "\n";
                    }
                });
                navigator.clipboard.writeText(copyText)
                .then(() => {console.log("text copied!");})
                .catch((err) => {console.log("failed to copy", err)});
            });
        });
    };

})();


