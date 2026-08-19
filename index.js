(function() {
    console.log("🎲 [Dice Roller] 开始执行防弹版注入代码...");

    // 1. 无视酒馆配置，用 JS 强行注入 CSS，确保绝对可见！
    const styleId = 'st-dice-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            #st-floating-dice-btn {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 60px !important;
                height: 60px !important;
                background: rgba(30, 30, 30, 0.9) !important;
                border: 2px solid #8b0000 !important;
                border-radius: 50% !important;
                font-size: 35px !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                cursor: grab !important;
                touch-action: none !important;
                z-index: 2147483647 !important; /* 浏览器允许的最高层级，神仙来了也挡不住 */
                box-shadow: 0 0 15px rgba(139, 0, 0, 0.8) !important;
                user-select: none !important;
                color: white !important;
            }
            #dice-canvas-container {
                display: none;
                position: fixed !important;
                top: 20% !important;
                left: 50% !important;
                transform: translate(-50%, 0) !important;
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

    // 2. 清理可能残留的死掉的骰子
    const oldBtn = document.getElementById('st-floating-dice-btn');
    if (oldBtn) oldBtn.remove();
    const oldContainer = document.getElementById('dice-canvas-container');
    if (oldContainer) oldContainer.remove();

    // 3. 注入实体
    const diceBtn = document.createElement('div');
    diceBtn.id = 'st-floating-dice-btn';
    diceBtn.innerHTML = '🎲';
    document.body.appendChild(diceBtn);

    const diceContainer = document.createElement('div');
    diceContainer.id = 'dice-canvas-container';
    document.body.appendChild(diceContainer);

    // 4. 双轨拖拽逻辑（同时支持电脑鼠标和手机触屏）
    let isDragging = false;
    let startX, startY;
    let initialX, initialY;
    let hasMoved = false;

    const startDrag = (e) => {
        isDragging = true;
        hasMoved = false;
        // 兼容触屏和鼠标
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;
        
        const rect = diceBtn.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        // 拖拽时取消居中 transform，防止鼠标跳跃偏移
        diceBtn.style.transform = 'none';
        diceBtn.style.left = initialX + 'px';
        diceBtn.style.top = initialY + 'px';
    };

    const doDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault(); // 阻止手机滑动屏幕
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        // 滑动大于 5 像素才判定为拖拽
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasMoved = true;
        }
        
        if (hasMoved) {
            diceBtn.style.left = (initialX + dx) + 'px';
            diceBtn.style.top = (initialY + dy) + 'px';
        }
    };

    const endDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        // 如果没移动，就是点击，触发掷骰子
        if (!hasMoved) {
            rollDice();
        }
    };

    // 绑定事件（无死角覆盖）
    diceBtn.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);

    diceBtn.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', doDrag, { passive: false });
    document.addEventListener('touchend', endDrag);

    // 5. 核心判定逻辑
    function rollDice() {
        const formula = '1d100';
        diceContainer.style.display = 'block';
        diceContainer.innerHTML = `🎲 命运判定中: ${formula}...`;

        diceBtn.style.pointerEvents = 'none';
        diceBtn.style.opacity = '0.5';

        setTimeout(() => {
            const result = Math.floor(Math.random() * 100) + 1;
            diceContainer.style.display = 'none';
            diceBtn.style.pointerEvents = 'auto';
            diceBtn.style.opacity = '1';

            const textarea = document.getElementById('send_textarea');
            if (textarea) {
                const chatMessage = `（系统提示：玩家进行了 ${formula} 检定，最终掷出：${result}）`;
                const originalText = textarea.value;
                textarea.value = originalText + (originalText ? '\n' : '') + chatMessage;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, 1500); // 1.5秒动画后输出结果
    }
})();
