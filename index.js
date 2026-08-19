jQuery(async () => {
    // 1. Create the animation UI container
    const diceContainer = document.createElement('div');
    diceContainer.id = 'dice-canvas-container';
    document.body.appendChild(diceContainer);

    // 2. Create the floating dice button
    const diceBtn = document.createElement('div');
    diceBtn.id = 'st-floating-dice-btn';
    diceBtn.innerHTML = '🎲';
    document.body.appendChild(diceBtn);

    // --- Drag and Drop Logic ---
    let isDragging = false;
    let startX, startY;
    let hasMoved = false;

    // Listen for mouse/touch press
    diceBtn.addEventListener('pointerdown', (e) => {
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        
        // Record the relative position of the pointer on the button
        const rect = diceBtn.getBoundingClientRect();
        diceBtn.dataset.offsetX = e.clientX - rect.left;
        diceBtn.dataset.offsetY = e.clientY - rect.top;
        
        diceBtn.style.cursor = 'grabbing';
        diceBtn.setPointerCapture(e.pointerId);
    });

    // Listen for mouse/touch movement
    diceBtn.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        
        // Consider it a drag only if moved more than 5 pixels (prevents accidental clicks)
        if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
            hasMoved = true;
        }

        if (hasMoved) {
            // Update button position in real-time
            diceBtn.style.left = (e.clientX - parseFloat(diceBtn.dataset.offsetX)) + 'px';
            diceBtn.style.top = (e.clientY - parseFloat(diceBtn.dataset.offsetY)) + 'px';
            // Clear initial centering margins once moved
            diceBtn.style.marginLeft = '0';
            diceBtn.style.marginTop = '0';
        }
    });

    // Listen for mouse/touch release
    diceBtn.addEventListener('pointerup', (e) => {
        isDragging = false;
        diceBtn.style.cursor = 'grab';
        diceBtn.releasePointerCapture(e.pointerId);

        // If it wasn't dragged, treat it as a click and roll the dice
        if (!hasMoved) {
            rollDice();
        }
    });

    // --- Core Dice Rolling & Animation Logic ---
    function rollDice() {
        const formula = '1d100';
        
        // Show the glowing red animation
        diceContainer.style.display = 'block';
        diceContainer.innerHTML = `<div class="dice-rolling-text">🎲 Rolling: ${formula}...</div>`;

        // Temporarily disable the button to prevent spamming
        diceBtn.style.pointerEvents = 'none';
        diceBtn.style.opacity = '0.5';

        // Wait 2 seconds for the animation to finish
        setTimeout(() => {
            // Generate a random number between 1 and 100
            const result = Math.floor(Math.random() * 100) + 1;
            
            // Hide the animation and restore the button
            diceContainer.style.display = 'none';
            diceBtn.style.pointerEvents = 'auto';
            diceBtn.style.opacity = '1';

            // Fetch the SillyTavern chat input text area
            const textarea = document.getElementById('send_textarea');
            if (textarea) {
                // Construct the system message
                const chatMessage = `(System: Player rolled ${formula}, result: ${result})`;
                
                // Append the result to whatever text is already in the input box
                const originalText = textarea.value;
                textarea.value = originalText + (originalText ? '\n' : '') + chatMessage;
                
                // Dispatch input event so SillyTavern registers the text change
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Uncomment the line below if you want it to send automatically after rolling
                // document.getElementById('send_but').click(); 
            }
        }, 2000);
    }
});
