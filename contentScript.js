const CHAT = "CHAT";
const NEW_RESPONSE = "NEW_RESPONSE";
const UL = "UL";
const INPUT = "textarea";
const CODE = "Copy code";
const BULLET = "•";
let POINT = "";

const CHECK_AFTER = 100;
const WAIT_FOR_INPUT = 3000;
const UP = 38;
const DOWN = 40;
const ENTER = 13;

const CG_CLASS = "div.rounded-sm";
const P_CLASS = "img.rounded-sm";

const OG_COLOR = "rgb(16, 163, 127)";
const COPY_BUTTON = "rgb(239, 92, 128)";
const BORDER = "3px solid red";
const BORDER_RADIUS = "0.5rem";

(() => {

    let currentChat = "";

    let input = undefined;
    let submitButton = undefined;

    let allPromptImages = [];
    let allPromptTexts = [];
    let promptsIndex = 0;
    let markedIndex = 0;
    let totalPromptsCount = 0;
    let modifiedText = "";

    chrome.runtime.onMessage.addListener((obj) => {
        const { type, chatId } = obj;
        if (type === CHAT) {
            currentChat = chatId;
            newChatLoaded();
        } else if (type === NEW_RESPONSE) {
            waitForChats(true).then((results) => {
                allPromptImages = results;
                totalPromptsCount++;
                promptsIndex = totalPromptsCount;
                unmarkPrompt(markedIndex);
                addPromptReuseButton(totalPromptsCount - 1);
            });
            waitForChats(false).then((allResponses) => {
                addCopyButton(allResponses[allResponses.length - 1]);
            });
            window.scrollTo(0, document.body.scrollHeight);
        }
    });

    const waitForChats = (loadPrompts) => {
        return new Promise((resolve) => {
            const check = () => {
                const results = document.querySelectorAll(loadPrompts ? P_CLASS : CG_CLASS);
                if (results.length > 0) {
                    resolve(results);
                } else {
                    setTimeout(check, CHECK_AFTER);
                }
            };
            check();
        });
    };


    const addCopyButton = (response) => {
        let child = response.firstChild;
        let grandChild = child.firstChild;

        // copy-text
        response.addEventListener("click", () => {
            let contents = response.parentNode.parentNode.childNodes[1].firstChild.firstChild.firstChild.childNodes;
            let copyText = "";

            // copy each section
            contents.forEach(section => {
                if (section instanceof HTMLParagraphElement) {
                    copyText += section.textContent + "\n";
                } else if (section.textContent.includes(CODE)) {
                    copyText += section.textContent.split(CODE)[1] + "\n";
                } else if (section.childElementCount > 0) {
                    for (let i = 0; i < section.childElementCount; i++) {
                        let subsec = section.childNodes[i];
                        let contribution = `${(section.tagName === UL ? BULLET : (i + 1) + ".")}\t${subsec.textContent} \n`;
                        copyText += contribution;
                    }
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

    const markPrompt = (index) => {
        if (index < totalPromptsCount) {
            markedIndex = index;
            let promptImage = allPromptImages[index].parentNode.parentNode;
            promptImage.style.border = BORDER;
            promptImage.style.borderRadius = BORDER_RADIUS;
        }
    };

    const unmarkPrompt = (index) => {
        if (index < totalPromptsCount) {
            let promptImage = allPromptImages[index].parentNode.parentNode;
            promptImage.style.border = "none";
            promptImage.style.borderRadius = "0";
        }
    };

    // reuse-prompt
    const addPromptReuseButton = (index) => {
        let promptImage = allPromptImages[index].parentNode.parentNode;
        let temp = promptImage.parentNode.parentNode.childNodes[1].firstChild;
        allPromptTexts.unshift(temp);

        promptImage.addEventListener("click", () => {
            promptsIndex = index;
            input.value = temp.textContent;
            input.style.height = input.scrollHeight + "px";
            input.focus();
        });

        // hover-effects
        promptImage.addEventListener("mouseover", () => {
            markPrompt(index);
        });
        promptImage.addEventListener("mouseout", () => {
            unmarkPrompt(index);
        });
    };

    const setInputEventListener = () => {
        setTimeout(() => {
            input = document.querySelector(INPUT);
            submitButton = input.parentNode.childNodes[1];

            input.addEventListener("keydown", (e) => {
                if (e.altKey) {
                    e.preventDefault();
                    if (e.keyCode === UP) {
                        unmarkPrompt(markedIndex);
                        promptsIndex = Math.max(promptsIndex - 1, 0);
                        input.value = allPromptTexts[promptsIndex].textContent;
                    } else if (e.keyCode === DOWN) {
                        unmarkPrompt(markedIndex);
                        promptsIndex = Math.min(promptsIndex + 1, totalPromptsCount);
                        if (promptsIndex === totalPromptsCount) {
                            input.value = modifiedText;
                        } else {
                            input.value = allPromptTexts[promptsIndex].textContent;
                        }
                    }
                }
                if (e.keyCode === ENTER && input.value.length > 0) {
                    e.preventDefault();
                    submitButton.click();
                }
                if (promptsIndex !== totalPromptsCount) {
                    markPrompt(promptsIndex, 2);
                    allPromptTexts[promptsIndex].scrollIntoView({ behavior: "smooth", block: "center" });
                } else {
                    modifiedText = input.value;
                }
                input.style.height = input.scrollHeight + "px";
            });
        }, WAIT_FOR_INPUT);
    };

    const newChatLoaded = () => {

        // setup prompt-navigation
        setInputEventListener();

        // set-up response copy
        waitForChats(false).then((allResponses) => {
            for (let i = allResponses.length - 1; i >= 0; i--) {
                addCopyButton(allResponses[i]);
            }
        });

        // set-up prompt reuse
        waitForChats(true).then((results) => {
            allPromptImages = results;
            totalPromptsCount = allPromptImages.length;
            promptsIndex = totalPromptsCount;
            for (let i = totalPromptsCount - 1; i >= 0; i--) {
                addPromptReuseButton(i);
            }
        });

        document.addEventListener("keypress", (e) => {
            if (e.key === '/') {
                if (document.activeElement !== input) {
                    e.preventDefault();
                    input.focus();
                }
            }
        });

    };

})();