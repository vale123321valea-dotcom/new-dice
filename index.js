jQuery(async () => {
    // 1. 创建屏幕中间的动画 UI
    const diceContainer = document.createElement('div');
    diceContainer.id = 'dice-canvas-container';
    document.body.appendChild(diceContainer);

    // 2. 创建可拖动的悬浮骰子按钮
    const diceBtn = document.createElement('div');
    diceBtn.id = 'st-floating-dice-btn';
    diceBtn.innerHTML = '🎲';
    document.body.appendChild(diceBtn);

    // --- 拖拽与点击逻辑 ---
    let isDragging = false;
    let startX, startY;
    let hasMoved = false;

    // 监听鼠标/触摸按下
    diceBtn.addEventListener('pointerdown', (e) => {
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        
        // 记录鼠标点在按钮上的相对位置
        const rect = diceBtn.getBoundingClientRect();
        diceBtn.dataset.offsetX = e.clientX - rect.left;
        diceBtn.dataset.offsetY = e.clientY - rect.top;
        
        diceBtn.style.cursor = 'grabbing';
        diceBtn.setPointerCapture(e.pointerId);
    });

    // 监听鼠标/触摸移动
    diceBtn.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        
        // 移动超过5像素才算拖拽，防止手抖误触
        if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
            hasMoved = true;
        }

        if (hasMoved) {
            // 实时更新按钮位置
            diceBtn.style.left = (e.clientX - parseFloat(diceBtn.dataset.offsetX)) + 'px';
            diceBtn.style.top = (e.clientY - parseFloat(diceBtn.dataset.offsetY)) + 'px';
            // 清除初始的居中 margin
            diceBtn.style.marginLeft = '0';
            diceBtn.style.marginTop = '0';
        }
    });

    // 监听鼠标/触摸松开
    diceBtn.addEventListener('pointerup', (e) => {
        isDragging = false;
        diceBtn.style.cursor = 'grab';
        diceBtn.releasePointerCapture(e.pointerId);

        // 如果没有明显移动，说明是点击事件，执行掷骰子
        if (!hasMoved) {
            rollDice();
        }
    });

    // --- 核心掷骰子与动画逻辑 ---
    function rollDice() {
        const formula = '1d100';
        diceContainer.style.display = 'block';
        diceContainer.innerHTML = `<div class="dice-rolling-text">🎲 命运判定中: ${formula}...</div>`;

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
                
                // document.getElementById('send_but').click(); // 需要自动发送就把这行最前面的双斜杠删掉
            }
        }, 2000);
    }
});
