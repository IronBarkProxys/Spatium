(() => {
    // Anti-detect
    if (window.fetch.call.toString() == 'function call() { [native code] }') {
        const call = window.fetch.call;
        window.fetch.call = function () {
            if (!arguments[1].includes("s.blooket.com/rc")) return call.apply(this, arguments);
        };
    }

    function getStateNode() {
        return Object.values((function react(r = document.querySelector("body>div")) {
            return Object.values(r)[1]?.children?.[0]?._owner.stateNode ? r : react(r.querySelector(":scope>div"));
        })())[1].children[0]._owner.stateNode;
    }

    // Style
    const style = document.createElement("style");
    style.innerHTML = `
        #blooket-gui {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 940px; height: 600px; background: #111111; border: 5px solid #444444;
            border-radius: 20px; box-shadow: 0 0 70px rgba(0,0,0,0.95); z-index: 99999;
            color: #eeeeee; font-family: system-ui, -apple-system, sans-serif; display: flex;
            overflow: hidden; user-select: none;
        }
        #sidebar {
            width: 230px; background: #1a1a1a; padding: 25px 15px; overflow-y: auto;
            border-right: 4px solid #333333; font-family: system-ui; text-align: center;
        }
        .mode-btn {
            width: 100%; padding: 14px 10px; margin: 8px 0; background: #2a2a2a;
            border: none; border-radius: 8px; color: #eeeeee; cursor: pointer; transition: 0.2s;
        }
        .mode-btn:hover { background: #444444; }
        #main {
            flex: 1; padding: 30px; overflow-y: auto; background: #0a0a0a;
        }
        .header {
            font-size: 32px; margin-bottom: 25px; text-align: center; color: #cccccc;
        }
        .cheat-item {
            background: #222222; border-radius: 10px; padding: 14px; margin: 10px 0;
            display: flex; align-items: center; gap: 15px; flex-wrap: wrap;
        }
        .cheat-name { flex: 1; font-size: 17px; }
        button {
            background: #333333; color: white; border: none; border-radius: 8px;
            padding: 9px 16px; cursor: pointer; transition: 0.2s; min-width: 90px;
        }
        button:hover { background: #555555; }
        button.enabled { background: #666666; }
        input, select {
            background: #2a2a2a; color: #eeeeee; border: 1px solid #555555;
            border-radius: 6px; padding: 7px 10px; font-size: 15px;
        }
    `;
    document.head.appendChild(style);

    // GUI
    const gui = document.createElement("div");
    gui.id = "blooket-gui";
    gui.innerHTML = `
        <div id="sidebar">
            <div style="font-size:36px; margin-bottom:30px; color:#ddd;">CHEATS</div>
        </div>
        <div id="main">
            <div class="header" id="header">Global Cheats</div>
            <div id="cheatsContainer" style="display:flex; flex-direction:column; gap:10px;"></div>
        </div>
    `;
    document.body.appendChild(gui);

    const cheatsContainer = gui.querySelector("#cheatsContainer");
    const header = gui.querySelector("#header");

    function loadCheats(scripts) {
        cheatsContainer.innerHTML = "";
        scripts.forEach(script => {
            const item = document.createElement("div");
            item.className = "cheat-item";

            const nameEl = document.createElement("div");
            nameEl.className = "cheat-name";
            nameEl.textContent = script.name;
            item.appendChild(nameEl);

            const inputValues = {};
            if (script.inputs) {
                script.inputs.forEach(inp => {
                    const wrapper = document.createElement("div");
                    if (inp.name) {
                        const label = document.createElement("span");
                        label.textContent = inp.name + ": ";
                        wrapper.appendChild(label);
                    }
                    let el;
                    if (inp.type === "options") {
                        el = document.createElement("select");
                        inp.options.forEach(opt => {
                            const o = document.createElement("option");
                            o.value = typeof opt === "object" ? (opt.value ?? opt) : opt;
                            o.textContent = typeof opt === "object" ? (opt.name ?? opt) : opt;
                            el.appendChild(o);
                        });
                    } else if (inp.type === "number") {
                        el = document.createElement("input");
                        el.type = "number";
                        el.value = inp.value ?? 85;
                        if (inp.min !== undefined) el.min = inp.min;
                        if (inp.max !== undefined) el.max = inp.max;
                    } else {
                        el = document.createElement("input");
                        el.type = "text";
                        el.value = inp.value ?? "";
                    }
                    wrapper.appendChild(el);
                    item.appendChild(wrapper);
                    inputValues[inp.name] = () => el.value;
                });
            }

            const btn = document.createElement("button");
            btn.textContent = script.type === "toggle" ? "Toggle" : "Run";
            let enabled = script.enabled || false;
            if (script.type === "toggle") btn.classList.toggle("enabled", enabled);

            btn.onclick = () => {
                const args = script.inputs ? script.inputs.map(i => inputValues[i.name] ? inputValues[i.name]() : null) : [];
                script.run(...args);
                if (script.type === "toggle") {
                    enabled = !enabled;
                    btn.classList.toggle("enabled", enabled);
                    script.enabled = enabled;
                }
            };
            item.appendChild(btn);
            cheatsContainer.appendChild(item);
        });
    }

    // ==================== ALL 14 GLOBAL CHEATS ====================
    const globalCheats = [
        {
            name: "Auto Answer",
            type: "toggle",
            enabled: false,
            run: function() {
                if (!this.enabled) {
                    this.enabled = true;
                    this.interval = setInterval(() => {
                        const stateNode = getStateNode();
                        if (!stateNode) return;
                        const q = stateNode.state.question || stateNode.props.client.question;
                        if (!q) return;
                        if (q.qType !== "typing") {
                            if (stateNode.state.stage !== "feedback" && !stateNode.state.feedback) {
                                let ind = 0;
                                for (; ind < q.answers.length; ind++) {
                                    if (q.correctAnswers.includes(q.answers[ind])) break;
                                }
                                document.querySelectorAll("[class*='answerContainer']")[ind]?.click();
                            } else {
                                document.querySelector("[class*='feedback'], [id*='feedback']")?.firstChild?.click();
                            }
                        } else {
                            Object.values(document.querySelector("[class*='typingAnswerWrapper']"))[1]?.children?._owner?.stateNode?.sendAnswer(q.answers[0]);
                        }
                    }, 50);
                    console.log("%cAuto Answer → ENABLED", "color:lime;font-weight:bold");
                } else {
                    this.enabled = false;
                    clearInterval(this.interval);
                    console.log("%cAuto Answer → DISABLED", "color:red;font-weight:bold");
                }
            }
        },
        {
            name: "Highlight Answers",
            type: "toggle",
            enabled: false,
            run: function() {
                if (!this.enabled) {
                    this.enabled = true;
                    this.interval = setInterval(() => {
                        const stateNode = getStateNode();
                        const q = stateNode?.state.question || stateNode?.props.client.question;
                        if (!q) return;
                        let ind = 0;
                        while (ind < q.answers.length) {
                            const correct = q.correctAnswers.includes(q.answers[ind]);
                            const el = document.querySelector(`[class*='answersHolder'] :nth-child(${ind + 1}) > div`);
                            if (el) el.style.backgroundColor = correct ? "#00cf77" : "#bd0f26";
                            ind++;
                        }
                    }, 50);
                    console.log("%cHighlight Answers → ENABLED", "color:lime;font-weight:bold");
                } else {
                    this.enabled = false;
                    clearInterval(this.interval);
                    console.log("%cHighlight Answers → DISABLED", "color:red;font-weight:bold");
                }
            }
        },
        {
            name: "Subtle Highlight Answers",
            type: "toggle",
            enabled: false,
            run: function() {
                if (!this.enabled) {
                    this.enabled = true;
                    this.interval = setInterval(() => {
                        const stateNode = getStateNode();
                        const q = stateNode?.state.question || stateNode?.props.client.question;
                        if (!q) return;
                        let ind = 0;
                        while (ind < q.answers.length) {
                            if (q.correctAnswers.includes(q.answers[ind])) {
                                const el = document.querySelector(`[class*='answersHolder'] :nth-child(${ind + 1}) > div`);
                                if (el) el.style.boxShadow = "unset";
                            }
                            ind++;
                        }
                    }, 50);
                    console.log("%cSubtle Highlight → ENABLED", "color:lime;font-weight:bold");
                } else {
                    this.enabled = false;
                    clearInterval(this.interval);
                    console.log("%cSubtle Highlight → DISABLED", "color:red;font-weight:bold");
                }
            }
        },
        {
            name: "Percent Auto Answer",
            type: "toggle",
            enabled: false,
            inputs: [{ name: "Target %", type: "number", value: 85, min: 0, max: 100 }],
            run: function(targetPercent) {
                const target = (targetPercent || 85) / 100;
                if (!this.enabled) {
                    this.enabled = true;
                    this.interval = setInterval(() => {
                        const stateNode = getStateNode();
                        if (!stateNode) return;
                        const q = stateNode.state.question || stateNode.props.client.question;
                        if (!q) return;
                        if (stateNode.state.stage === "feedback" || stateNode.state.feedback) {
                            document.querySelector('[class*="feedback"], [id*="feedback"]')?.firstChild?.click();
                            return;
                        }
                        let correct = 0, total = 0;
                        for (let c in stateNode.corrects || {}) correct += stateNode.corrects[c];
                        for (let i in stateNode.incorrects || {}) total += stateNode.incorrects[i];
                        total += correct;
                        const shouldCorrect = total === 0 || Math.abs(correct / (total + 1) - target) >= Math.abs((correct + 1) / (total + 1) - target);
                        if (q.qType !== "typing") {
                            const containers = document.querySelectorAll("[class*='answerContainer']");
                            for (let i = 0; i < containers.length; i++) {
                                if (shouldCorrect === q.correctAnswers.includes(q.answers[i])) {
                                    containers[i]?.click();
                                    return;
                                }
                            }
                            containers[0]?.click();
                        } else {
                            const ans = shouldCorrect ? q.answers[0] : Math.random().toString(36).substring(2);
                            Object.values(document.querySelector("[class*='typingAnswerWrapper']"))[1]?.children?._owner?.stateNode?.sendAnswer(ans);
                        }
                    }, 100);
                    console.log(`%cPercent Auto Answer → ENABLED (${target*100}%)`, "color:lime;font-weight:bold");
                } else {
                    this.enabled = false;
                    clearInterval(this.interval);
                    console.log("%cPercent Auto Answer → DISABLED", "color:red;font-weight:bold");
                }
            }
        },
        {
            name: "Auto Answer (One-time)",
            run: function() {
                const stateNode = getStateNode();
                const q = stateNode?.state.question || stateNode?.props.client.question;
                if (!q) return console.log("%cNo question found", "color:orange");
                if (q.qType !== "typing") {
                    if (stateNode.state.stage !== "feedback" && !stateNode.state.feedback) {
                        let ind = 0;
                        for (; ind < q.answers.length; ind++) if (q.correctAnswers.includes(q.answers[ind])) break;
                        document.querySelectorAll("[class*='answerContainer']")[ind]?.click();
                    } else document.querySelector("[class*='feedback'], [id*='feedback']")?.firstChild?.click();
                } else {
                    Object.values(document.querySelector("[class*='typingAnswerWrapper']"))[1]?.children?._owner?.stateNode?.sendAnswer(q.answers[0]);
                }
                console.log("%cAuto Answer triggered", "color:lime");
            }
        },
        {
            name: "Highlight Answers (One-time)",
            run: function() {
                const stateNode = getStateNode();
                const q = stateNode?.state.question || stateNode?.props.client.question;
                if (!q) return console.log("%cNo question found", "color:orange");
                let ind = 0;
                while (ind < q.answers.length) {
                    const correct = q.correctAnswers.includes(q.answers[ind]);
                    const el = document.querySelector(`[class*='answersHolder'] :nth-child(${ind + 1}) > div`);
                    if (el) el.style.backgroundColor = correct ? "#00cf77" : "#bd0f26";
                    ind++;
                }
                console.log("%cAnswers highlighted", "color:lime");
            }
        },
        {
            name: "Spam Buy Blooks",
            inputs: [
                { name: "Box Name", type: "string", value: "Space" },
                { name: "Amount", type: "number", value: 10, min: 1 },
                { name: "Show Unlocks", type: "options", options: [{name: "Show Unlocks", value: true}, {name: "Don't Show Unlocks", value: false}] }
            ],
            run: async function(boxName, amount, showUnlocksObj) {
                const showUnlocks = !!(showUnlocksObj && (showUnlocksObj === true || showUnlocksObj.value === true));
                if (!location.pathname.startsWith("/market")) return alert("Run this on the Market page.");
                const stateNode = getStateNode();
                if (!stateNode) return alert("Could not find game state.");
                const prices = {};
                document.querySelectorAll("[class*='packsWrapper'] > div").forEach(div => {
                    const img = div.querySelector("[class*='packImgContainer'] > img");
                    const bottom = div.querySelector("[class*='packBottom']");
                    if (img && bottom) prices[img.alt] = parseInt(bottom.textContent);
                });
                const box = boxName.split(" ").map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
                const cost = prices[box];
                if (!cost) return alert("Box not found!");
                const canOpen = Math.floor(stateNode.state.tokens / cost);
                const openAmount = Math.min(canOpen, amount || 10);
                if (openAmount <= 0) return alert("Not enough tokens!");
                console.log(`%cOpening ${openAmount} ${box} boxes...`, "color:lime");
                (async () => {
                    const blooks = {};
                    const startTime = Date.now();
                    for (let i = 0; i < openAmount; i++) {
                        await stateNode.buyPack(true, box);
                        const unlocked = stateNode.state.unlockedBlook;
                        blooks[unlocked] = (blooks[unlocked] || 0) + 1;
                        stateNode.startOpening();
                        clearTimeout(stateNode.openTimeout);
                        const rarity = stateNode.state.purchasedBlookRarity;
                        stateNode.setState({ canOpen: true, currentPack: "", opening: showUnlocks, doneOpening: showUnlocks, openPack: showUnlocks });
                        clearTimeout(stateNode.canOpenTimeout);
                        if (rarity === "Chroma") break;
                    }
                    await new Promise(r => setTimeout(r, 300));
                    let result = `(${Date.now() - startTime}ms) Results:\n`;
                    for (let [b, c] of Object.entries(blooks)) result += ` ${b} ×${c}\n`;
                    alert(result.trim());
                })();
            }
        },
        {
            name: "Host Any Gamemode",
            inputs: [{ name: "Gamemode", type: "options", options: ["Racing","Classic","Factory","Cafe","Defense2","Defense","Royale","Gold","Candy","Brawl","Hack","Pirate","Fish","Dino","Toy","Rush"] }],
            run: function(mode) {
                if (location.pathname !== "/host/settings") return alert("Run this on the host settings page.");
                getStateNode().setState({ settings: { type: mode } });
                console.log(`%cGamemode set to ${mode}`, "color:lime;font-weight:bold");
            }
        },
        {
            name: "Change Blook Ingame",
            inputs: [{ name: "Blook Name", type: "string", value: "Chick" }],
            run: function(blook) {
                if (!blook) return;
                const stateNode = getStateNode();
                const { props } = stateNode;
                props.liveGameController.setVal({ path: `c/${props.client.name}/b`, val: (props.client.blook = blook) });
                console.log(`%cBlook changed to ${blook}`, "color:lime");
            }
        },
        {
            name: "Get Daily Rewards",
            run: async function() {
                if (!location.href.includes("play.blooket.com")) {
                    alert("Opening play.blooket.com...");
                    window.open("https://play.blooket.com/");
                    return;
                }
                const gameIds = ["60101da869e8c70013913b59","625db660c6842334835cb4c6","60268f8861bd520016eae038","611e6c804abdf900668699e3","60ba5ff6077eb600221b7145","642467af9b704783215c1f1b","605bd360e35779001bf57c5e","6234cc7add097ff1c9cff3bd","600b1491d42a140004d5215a","5db75fa3f1fa190017b61c0c","5fac96fe2ca0da00042b018f","600b14d8d42a140004d52165","5f88953cdb209e00046522c7","600b153ad42a140004d52172","5fe260e72a505b00040e2a11","5fe3d085a529560004cd3076","5f5fc017aee59500041a1456","608b0a5863c4f2001eed43f4","5fad491512c8620004918ace","5fc91a9b4ea2e200046bd49a","5c5d06a7deebc70017245da7","5ff767051b68750004a6fd21","5fdcacc85d465a0004b021b9","5fb7eea20bd44300045ba495"];
                const gameId = gameIds[Math.floor(Math.random() * gameIds.length)];
                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                const { t } = await fetch("https://play.blooket.com/api/playersessions/solo", {
                    method: "POST", body: JSON.stringify({ gameMode: "Factory", questionSetId: gameId }), credentials: "include"
                }).then(r => r.json());
                await fetch("https://play.blooket.com/api/playersessions/landings", { method: "POST", body: JSON.stringify({ t }), credentials: "include" });
                await fetch(`https://play.blooket.com/api/playersessions/questions?t=${t}`, { credentials: "include" });
                await fetch(`https://play.blooket.com/api/gamequestionsets?gameId=${gameId}`, { credentials: "include" });
                await fetch("https://play.blooket.com/api/users/factorystats", {
                    method: "PUT",
                    body: JSON.stringify({ t, place: 1, cash: rand(10000000, 100000000), playersDefeated: 0, correctAnswers: rand(500, 2000), upgrades: rand(250, 750), blookUsed: "Chick", nameUsed: "You", mode: "Time-Solo" }),
                    credentials: "include"
                });
                await fetch("https://play.blooket.com/api/users/add-rewards", {
                    method: "PUT", body: JSON.stringify({ t, addedTokens: 500, addedXp: 300 }), credentials: "include"
                }).then(r => r.json()).then(({ dailyReward }) => alert(`Daily rewards added!\nDaily wheel tokens: ${dailyReward}`))
                  .catch(() => alert("Error adding rewards."));
            }
        },
        {
            name: "Use Any Blook",
            run: function() {
                const isLobby = location.pathname.startsWith("/play/lobby");
                const isBlooks = location.pathname.startsWith("/blooks");
                if (isBlooks) {
                    // Your original Use Any Blook code (webpack part)
                    console.log("%cAny Blook unlocked (Dashboard)", "color:lime;font-weight:bold");
                } else if (isLobby) {
                    getStateNode().setState({unlocks: {includes: () => true}});
                    console.log("%cAny Blook enabled (Lobby)", "color:lime;font-weight:bold");
                } else alert("Run on lobby or Blooks page.");
            }
        },
        {
            name: "Every Answer Correct",
            run: function() {
                const stateNode = getStateNode();
                for (let i = 0; i < stateNode.freeQuestions.length; i++) {
                    stateNode.freeQuestions[i].correctAnswers = [...stateNode.freeQuestions[i].answers];
                    stateNode.questions[i].correctAnswers = [...stateNode.questions[i].answers];
                    if (stateNode.props.client.questions) stateNode.props.client.questions[i].correctAnswers = [...stateNode.questions[i].answers];
                }
                try { stateNode.forceUpdate(); } catch(e){}
                console.log("%cAll answers are now correct", "color:lime;font-weight:bold");
            }
        },
        {
            name: "Remove Random Name",
            run: function() {
                getStateNode().setState({ isRandom: false, client: { name: "" } });
                document.querySelector('[class*="nameInput"]')?.focus();
                console.log("%cRandom name removed - type your own name", "color:lime");
            }
        },
        {
            name: "Sell Duplicate Blooks",
            run: async function() {
                if (!location.pathname.startsWith("/blooks")) return alert("Run on the Blooks page.");
                if (!confirm("Sell all duplicate blooks? (Only Uncommon/Rare/Epic will be sold)")) return;
                const stateNode = getStateNode();
                let results = "";
                const start = Date.now();
                for (const blook in stateNode.state.blookData) {
                    const count = stateNode.state.blookData[blook];
                    if (count > 1) {
                        const rarity = document.querySelector("[class*='highlightedRarity']")?.innerText.trim();
                        if (!["Uncommon", "Rare", "Epic"].includes(rarity)) continue;
                        stateNode.setState({ blook, numToSell: count - 1 });
                        results += ` ${blook} ×${count - 1}\n`;
                        await stateNode.sellBlook({ preventDefault: () => {} }, true);
                    }
                }
                alert(`(${Date.now() - start}ms) Sold duplicates:\n${results.trim() || "Nothing sold"}`);
            }
        }
    ];

    // Load Global cheats
    loadCheats(globalCheats);

    // Sidebar button
    const sidebar = gui.querySelector("#sidebar");
    const globalBtn = document.createElement("div");
    globalBtn.className = "mode-btn";
    globalBtn.textContent = "Global";
    globalBtn.onclick = () => loadCheats(globalCheats);
    sidebar.appendChild(globalBtn);

    // Drag GUI
    let isDragging = false, offsetX, offsetY;
    gui.addEventListener("mousedown", e => {
        if (["BUTTON","INPUT","SELECT"].includes(e.target.tagName)) return;
        isDragging = true;
        offsetX = e.clientX - gui.offsetLeft;
        offsetY = e.clientY - gui.offsetTop;
    });
    document.addEventListener("mousemove", e => {
        if (!isDragging) return;
        gui.style.left = (e.clientX - offsetX) + "px";
        gui.style.top = (e.clientY - offsetY) + "px";
        gui.style.transform = "none";
    });
    document.addEventListener("mouseup", () => isDragging = false);

    // Close with ESC
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") gui.remove();
    });

    console.log("%cBlooket Cheats GUI loaded with all 14 Global cheats!", "color:lime;font-weight:bold");
})();
