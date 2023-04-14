const CHAT = "CHAT";
const CG_CLASS = "relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center";
const CODE = "Copy code";
const OG_COLOR = "rgb(16, 163, 127)";
const COPY_BUTTON = "rgb(239, 92, 128)";

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
    
    const waitForElement = (element) => {
        return new Promise((resolve) => {
            const check = () => {
                if (typeof element !== 'undefined') {
                    resolve(element);
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
            let child = response.firstChild;
            // copy-text
            response.addEventListener("click", (e) => {
                waitForElement(e.target.parentNode.parentNode.parentNode.childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes)
                .then((contents) => {
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
                    
                    // copy-blink
                    child.firstChild.setAttribute("fill", "black");
                    setTimeout(() => {
                        child.firstChild.setAttribute("fill", "currentColor");
                    }, 100);

                });
            });
            // hover-effects
            response.addEventListener("mouseover", (e) => {
                response.style.backgroundColor = COPY_BUTTON;
                child.style.backgroundColor = COPY_BUTTON;
            });
            child.addEventListener("mouseover", (e) => {
                child.style.backgroundColor = COPY_BUTTON;
                response.style.backgroundColor = COPY_BUTTON;
            });
            response.addEventListener("mouseout", (e) => {
                response.style.backgroundColor = OG_COLOR;
                child.style.backgroundColor = OG_COLOR;
            });
        });
    };

})();