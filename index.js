(function() {
    console.log("🎲 [Dice Roller] 放弃悬浮，启动原生 UI 注入模式...");

    // 1. 只保留动画容器的 CSS，彻底抛弃悬浮按钮的样式
    const styleId = 'st-dice-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            #dice-canvas-container {
                display: none;
                position: fixed !important;
                top: 40% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 2147483647 !important;
                background: rgba(15, 15, 15, 0.95) !important;
                border: 2px solid #8b0000 !important;
                border-radius: 10px !important;
                padding: 20px 40px !important;
                text-align: center !important;
                color: #eeeeee !important;
                font-size: 20px !important;
                font-weight: bold !important;
                box-shadow: 0 0 35px rgba(139, 0, 0, 0.5) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. 清理旧残骸
    const oldContainer = document.getElementById('dice-canvas-container');
    if (oldContainer) oldContainer.remove();

    // 3. 创建纯粹的动画弹窗
    const diceContainer = document.createElement('div');
    diceContainer.id = 'dice-canvas-container';
    document.body.appendChild(diceContainer);

    // 4. 【核心黑科技】：注入酒馆原生菜单
    function injectNativeButton() {
        // 防止重复注入
        if (document.getElementById('native-dice-btn')) return;

        // 方案 A：直接把骰子塞进你截图里的那个展开菜单 (options_list) 的最底下
        const menuList = document.getElementById('options_list');
        if (menuList) {
            const menuItem = document.createElement('div');
            menuItem.id = 'native-dice-btn';
            menuItem.className = 'list-group-item interactable'; // 完美伪装成酒馆原生按钮
            menuItem.style.color = '#ff6b6b';
            menuItem.style.fontWeight = 'bold';
            menuItem.innerHTML = `<span class="fa-solid fa-dice" style="margin-right: 10px;"></span>🎲 投骰子检定`;
            
            menuItem.addEventListener('click', () => {
                rollDice();
                // 点击后顺手帮你把菜单自动关上，深藏功与名
                const optionsBtn = document.getElementById('options_button');
                if (optionsBtn) optionsBtn.click();
            });
            
            menuList.appendChild(menuItem);
            console.log("🎲 成功潜入折叠菜单！");
        }

        // 方案 B：如果菜单还没渲染出来，我们可以在底部工具栏（比如纸飞机或三横线旁边）硬插一个常驻图标
        /*
        const optionsBtn = document.getElementById('options_button');
        if (optionsBtn && !document.getElementById('quick-dice-btn')) {
            const quickBtn = document.createElement('div');
            quickBtn.id = 'quick-dice-btn';
            quickBtn.className = 'interactable';
            quickBtn.style.padding = '10px';
            quickBtn.style.fontSize = '22px';
            quickBtn.innerHTML = '🎲';
            quickBtn.addEventListener('click', rollDice);
            optionsBtn.parentNode.insertBefore(quickBtn, optionsBtn);
        }
        */
    }

    // 因为酒馆的 UI 是动态加载的，我们用定时器每两秒巡逻一次，一旦发现菜单就立刻把咱们的按钮塞进去
    setInterval(injectNativeButton, 2000);

    // 5. 动画与填字逻辑（保持不变）
    function rollDice() {
        const formula = '1d100';
        diceContainer.style.display = 'block';
        diceContainer.innerHTML = `🎲 命运判定中: ${formula}...`;

        setTimeout(() => {
            const result = Math.floor(Math.random() * 100) + 1;
            diceContainer.style.display = 'none';

            const textarea = document.getElementById('send_textarea');
            if (textarea) {
                const chatMessage = `（系统提示：玩家进行了 ${formula} 检定，最终掷出：${result}）`;
                const originalText = textarea.value;
                textarea.value = originalText + (originalText ? '\\n' : '') + chatMessage;
                // 触发酒馆的底层输入事件，让它意识到文字变了
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, 1500);
    }
})();
