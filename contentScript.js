const CHAT = "CHAT";
const NEW_RESPONSE = "NEW_RESPONSE";
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
        } else if (type === NEW_RESPONSE) {
            waitForChats().then((allResponses) => {
                addCopyButton(allResponses[allResponses.length - 1]);
            });
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

    const addCopyButton  = (response) => {
        let child = response.firstChild;
        let grandChild = child.firstChild;

        // copy-text
        response.addEventListener("click", () => {
            let contents = response.parentNode.parentNode.childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes;
            let copyText = "";

            // copy each section
            contents.forEach(section => {
                if (section instanceof HTMLParagraphElement) {
                    copyText += section.textContent + "\n";
                } else if (section.childElementCount > 0) {
                    section.childNodes.forEach(subsec => {
                        copyText += subsec.textContent + "\n";
                    });
                } else if (section.textContent.includes(CODE)) {
                    copyText += section.textContent.split(CODE)[1] + "\n";
                }
            });
            navigator.clipboard.writeText(copyText)
                .then(() => { console.log("text copied!"); })
                .catch((err) => { console.log("failed to copy", err) });

            // copied-blink
            grandChild.setAttribute("fill", "black");
            setTimeout(() => {
                grandChild.setAttribute("fill", "currentColor");
            }, 100);
        });

        // hover-effects
        response.addEventListener("mouseover", () => {
            response.style.backgroundColor = COPY_BUTTON;
            child.style.backgroundColor = COPY_BUTTON;
        });
        child.addEventListener("mouseover", () => {
            child.style.backgroundColor = COPY_BUTTON;
            response.style.backgroundColor = COPY_BUTTON;
        });
        response.addEventListener("mouseout", () => {
            response.style.backgroundColor = OG_COLOR;
            child.style.backgroundColor = OG_COLOR;
        });
    };

    const newChatLoaded = () => {
        waitForChats().then((allResponses) => {
            for (let i = allResponses.length - 1; i >= 0; i--) {
                addCopyButton(allResponses[i]);
            }
        });
    };

})();