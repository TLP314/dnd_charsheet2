document.addEventListener('DOMContentLoaded', () => {
    // --- Existing Selectors ---
    const form = document.getElementById('character-sheet');
    const levelInput = document.getElementById('level');
    const proficiencyBonusDisplay = document.getElementById('proficiency-bonus');
    const abilityScoreInputs = document.querySelectorAll('.ability-score');
    const profToggles = document.querySelectorAll('.prof-toggle');
    const spellcastingAbilitySelect = document.getElementById('spellcasting-ability');
    const hpCurrentInput = document.getElementById('hp-current');
    const hpTempInput = document.getElementById('hp-temp');
    const hpTotalDisplay = document.getElementById('hp-total-display');
    const spellListContent = document.getElementById('spell-list-content');
    const addSpellButton = document.getElementById('add-spell-button');
    const weaponsListContent = document.getElementById('weapons-list-content');
    const addWeaponButton = document.getElementById('add-weapon-button');
    const spellSlotsGrid = document.querySelector('.spell-slots-grid-5x2');

    // --- NEW Item List Selectors ---
    const itemsListContent = document.getElementById('items-list-content');
    const addItemButton = document.getElementById('add-item-button');

    // --- Constants and Counters ---
    const slotMaxValues = { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 };
    let spellIndexCounter = spellListContent?.querySelectorAll('.spell-row').length || 0;
    let weaponIndexCounter = weaponsListContent?.querySelectorAll('.attack-row').length || 0;
    let itemIndexCounter = itemsListContent?.querySelectorAll('.item-row').length || 0; // Initialize item counter

    // --- Helper Functions (Unchanged) ---
    function calculateModifier(score) { const numericScore = parseInt(score, 10); return Math.floor(((isNaN(numericScore) ? 10 : numericScore) - 10) / 2); }
    function formatModifier(modifier) { return modifier >= 0 ? `+${modifier}` : `${modifier}`; }
    function calculateProficiencyBonus(level) { const lvl = parseInt(level, 10); if (isNaN(lvl) || lvl < 1) return 2; return Math.ceil(lvl / 4) + 1; }

    // --- Update Functions (Unchanged, except updateTotalHpDisplay already added) ---
    function updateProficiencyBonus() { const level = levelInput.value; const pb = calculateProficiencyBonus(level); proficiencyBonusDisplay.textContent = formatModifier(pb); return pb; }
    function updateAbilityScoresAndModifiers() { const modifiers = {}; document.querySelectorAll('.ability-box').forEach(box => { const ability = box.id.split('-')[0]; const scoreInput = box.querySelector('.ability-score'); const modDisplay = box.querySelector('.ability-mod'); if (scoreInput && modDisplay) { const score = scoreInput.value; const modifier = calculateModifier(score); modDisplay.textContent = formatModifier(modifier); modifiers[ability] = modifier; } }); return modifiers; }
    function updateSavingThrows(modifiers, pb) { document.querySelectorAll('.saving-throw').forEach(saveDiv => { const checkbox = saveDiv.querySelector('.save-prof'); const valueDisplay = saveDiv.querySelector('.save-value'); const abilityBox = saveDiv.closest('.ability-box'); if (!abilityBox) return; const ability = abilityBox.id.split('-')[0]; if (checkbox && valueDisplay && modifiers.hasOwnProperty(ability)) { const baseModifier = modifiers[ability]; const totalSave = baseModifier + (checkbox.checked ? pb : 0); valueDisplay.textContent = formatModifier(totalSave); } }); }
    function updateSkills(modifiers, pb) { document.querySelectorAll('.skill').forEach(skillDiv => { const checkbox = skillDiv.querySelector('.skill-prof'); const valueDisplay = skillDiv.querySelector('.skill-value'); const ability = checkbox?.dataset.ability; if (checkbox && valueDisplay && ability && modifiers.hasOwnProperty(ability)) { const baseModifier = modifiers[ability]; const totalSkill = baseModifier + (checkbox.checked ? pb : 0); valueDisplay.textContent = formatModifier(totalSkill); if (checkbox.id === 'perception-prof') { updatePassivePerception(modifiers, pb); } } }); }
    function updatePassivePerception(modifiers, pb) { const perceptionProfCheckbox = document.getElementById('perception-prof'); const wisModifier = modifiers['wis'] || 0; const perceptionBonus = wisModifier + (perceptionProfCheckbox?.checked ? pb : 0); const passivePerception = 10 + perceptionBonus; const ppDisplay = document.getElementById('passive-perception'); if (ppDisplay) ppDisplay.textContent = passivePerception; }
    function updateInitiative(modifiers) { const dexModifier = modifiers['dex'] || 0; const totalInitiative = dexModifier; const initDisplay = document.getElementById('initiative'); if (initDisplay) initDisplay.textContent = formatModifier(totalInitiative); }
    function updateSpellcastingStats(modifiers, pb) { const selectedAbility = spellcastingAbilitySelect.value; const modDisplay = document.getElementById('spellcasting-mod'); const dcDisplay = document.getElementById('spell-save-dc'); const attackDisplay = document.getElementById('spell-attack-bonus'); if (!modDisplay || !dcDisplay || !attackDisplay) return; if (selectedAbility === 'none' || !modifiers.hasOwnProperty(selectedAbility)) { modDisplay.textContent = 'N/A'; dcDisplay.textContent = 'N/A'; attackDisplay.textContent = 'N/A'; return; } const spellMod = modifiers[selectedAbility]; const spellSaveDC = 8 + pb + spellMod; const spellAttackBonus = pb + spellMod; modDisplay.textContent = formatModifier(spellMod); dcDisplay.textContent = spellSaveDC; attackDisplay.textContent = formatModifier(spellAttackBonus); }
    function updateTotalHpDisplay() { const current = parseInt(hpCurrentInput.value, 10) || 0; const temp = parseInt(hpTempInput.value, 10) || 0; if (hpTotalDisplay) { hpTotalDisplay.textContent = current + temp; } }

    // --- Master Update Function (Unchanged) ---
    function updateAllCalculatedFields() { const pb = updateProficiencyBonus(); const modifiers = updateAbilityScoresAndModifiers(); updateSavingThrows(modifiers, pb); updateSkills(modifiers, pb); updateInitiative(modifiers); updateSpellcastingStats(modifiers, pb); updateTotalHpDisplay(); }

    // --- Dynamic List Management ---

    // Spells (Unchanged)
    function createSpellRow(index, spellData = {}) { const row = document.createElement('div'); row.classList.add('spell-row'); row.dataset.spellIndex = index; row.innerHTML = `<input type="text" class="spell-input spell-level" name="spell_level_${index}" value="${spellData.level || ''}"> <input type="text" class="spell-input spell-name" name="spell_name_${index}" placeholder="Spell Name" value="${spellData.name || ''}"> <input type="text" class="spell-input spell-time" name="spell_time_${index}" value="${spellData.time || ''}"> <input type="text" class="spell-input spell-range" name="spell_range_${index}" value="${spellData.range || ''}"> <div class="spell-components"> <input type="checkbox" id="spell_comp_v_${index}" name="spell_comp_v_${index}" ${spellData.compV ? 'checked' : ''}><label for="spell_comp_v_${index}">V</label> <input type="checkbox" id="spell_comp_s_${index}" name="spell_comp_s_${index}" ${spellData.compS ? 'checked' : ''}><label for="spell_comp_s_${index}">S</label> <input type="checkbox" id="spell_comp_m_${index}" name="spell_comp_m_${index}" ${spellData.compM ? 'checked' : ''}><label for="spell_comp_m_${index}">M</label> </div> <input type="text" class="spell-input spell-notes notes-input" name="spell_notes_${index}" value="${spellData.notes || ''}"> <button type="button" class="action-button remove-button remove-spell-row-button">-</button>`; return row; }
    function addSpellRowHandler() { const newRow = createSpellRow(spellIndexCounter); spellListContent.appendChild(newRow); spellIndexCounter++; }
    function removeSpellRow(event) { event.target.closest('.spell-row')?.remove(); }

    // Weapons/Cantrips (Unchanged)
    function createWeaponRow(index, weaponData = {}) { const row = document.createElement('div'); row.classList.add('attack-row'); row.dataset.weaponIndex = index; row.innerHTML = `<input type="text" class="weapon-input" name="attack_name_${index}" value="${weaponData.name || ''}"> <input type="text" class="weapon-input" name="attack_bonus_${index}" value="${weaponData.bonus || ''}"> <input type="text" class="weapon-input" name="attack_damage_${index}" value="${weaponData.damage || ''}"> <input type="text" class="weapon-input notes-input" name="attack_notes_${index}" value="${weaponData.notes || ''}"> <button type="button" class="action-button remove-button remove-weapon-row-button">-</button>`; return row; }
    function addWeaponRowHandler() { const newRow = createWeaponRow(weaponIndexCounter); weaponsListContent.appendChild(newRow); weaponIndexCounter++; }
    function removeWeaponRow(event) { event.target.closest('.attack-row')?.remove(); }

    // NEW Item List Functions
    function createItemRow(index, itemData = {}) {
        const row = document.createElement('div');
        row.classList.add('item-row');
        row.dataset.itemIndex = index;
        row.innerHTML = `
            <input type="text" class="item-input item-name" name="item_name_${index}" placeholder="Item Name" value="${itemData.name || ''}">
            <input type="number" class="item-input item-count" name="item_count_${index}" value="${itemData.count !== undefined ? itemData.count : 1}" min="0">
            <input type="text" class="item-input item-notes notes-input" name="item_notes_${index}" placeholder="Item Notes (weight, details...)" value="${itemData.notes || ''}">
            <button type="button" class="action-button remove-button remove-item-row-button">-</button>
        `;
        return row;
    }
    function addItemRowHandler() {
        const newRow = createItemRow(itemIndexCounter);
        itemsListContent.appendChild(newRow);
        itemIndexCounter++;
    }
    function removeItemRow(event) {
        event.target.closest('.item-row')?.remove();
    }


    // --- Spell Slot Management (Unchanged) ---
    function generateSpellSlots(level, total) { const visualContainer = document.getElementById(`slot-visual-${level}`); if (!visualContainer) { console.error(`Could not find visual container for level ${level}`); return; } visualContainer.innerHTML = ''; const numTotal = parseInt(total, 10); if (isNaN(numTotal) || numTotal <= 0) return; const maxAllowed = slotMaxValues[level] !== undefined ? slotMaxValues[level] : 0; const countToGenerate = Math.min(numTotal, maxAllowed); for (let i = 1; i <= countToGenerate; i++) { const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = `slot_lvl${level}_used_${i}`; checkbox.name = `slot_lvl${level}_used_${i}`; checkbox.dataset.level = level; checkbox.dataset.index = i; visualContainer.appendChild(checkbox); } }
    function spellSlotTotalChangeHandler(event) { const inputElement = event.target; const level = inputElement.closest('.spell-slot-level').dataset.level; let total = parseInt(inputElement.value, 10); const maxAllowed = slotMaxValues[level] !== undefined ? slotMaxValues[level] : 0; if (isNaN(total) || total < 0) { total = 0; } else if (total > maxAllowed) { total = maxAllowed; } inputElement.value = total; generateSpellSlots(level, total); }

    // --- Event Listeners ---

    // Core Calculations
    levelInput.addEventListener('input', updateAllCalculatedFields);
    abilityScoreInputs.forEach(input => input.addEventListener('input', updateAllCalculatedFields));
    profToggles.forEach(toggle => toggle.addEventListener('change', updateAllCalculatedFields));
    spellcastingAbilitySelect.addEventListener('change', updateAllCalculatedFields);
    hpCurrentInput.addEventListener('input', updateTotalHpDisplay);
    hpTempInput.addEventListener('input', updateTotalHpDisplay);

    // Dynamic List Buttons & Delegation
    if (addSpellButton) addSpellButton.addEventListener('click', addSpellRowHandler);
    if (addWeaponButton) addWeaponButton.addEventListener('click', addWeaponRowHandler);
    if (addItemButton) addItemButton.addEventListener('click', addItemRowHandler); // Listener for new button

    // Use event delegation for remove buttons
    if (spellListContent) spellListContent.addEventListener('click', function(event) { if (event.target.classList.contains('remove-spell-row-button')) removeSpellRow(event); });
    if (weaponsListContent) weaponsListContent.addEventListener('click', function(event) { if (event.target.classList.contains('remove-weapon-row-button')) removeWeaponRow(event); });
    if (itemsListContent) itemsListContent.addEventListener('click', function(event) { if (event.target.classList.contains('remove-item-row-button')) removeItemRow(event); }); // Listener for new list


    // Spell Slot Input Fields
    if (spellSlotsGrid) {
        spellSlotsGrid.querySelectorAll('.slot-total-input').forEach(input => {
            input.addEventListener('input', spellSlotTotalChangeHandler);
            const level = input.closest('.spell-slot-level').dataset.level;
            generateSpellSlots(level, input.value); // Initial generation
        });
    }

    // --- Save/Load Functionality ---

    const saveButton = document.getElementById('save-button');
    const loadFileLabel = document.querySelector('.load-button-label');
    const loadFileInput = document.getElementById('load-file');

    saveButton.addEventListener('click', () => {
        const characterData = {};
        const inputs = form.querySelectorAll('input:not([type=file]), textarea, select');
        // Basic data
        inputs.forEach(input => {
            if (input.closest('#spell-list-content') || input.closest('#weapons-list-content') || input.closest('#items-list-content') || input.closest('.slot-visual') || input.classList.contains('slot-total-input') || input.id === 'hp-total-display') return; // Skip dynamic lists, slots, total hp
            const key = input.name || input.id;
            if (!key) return;
            if (input.type === 'checkbox') characterData[key] = input.checked;
            else characterData[key] = input.value;
        });
        // Spell Slots
        characterData.spellSlots = {};
        spellSlotsGrid?.querySelectorAll('.spell-slot-level').forEach(slotLevelDiv => { const level = slotLevelDiv.dataset.level; const totalInput = slotLevelDiv.querySelector('.slot-total-input'); const usedCheckboxes = slotLevelDiv.querySelectorAll('.slot-visual input[type=checkbox]:checked'); if (totalInput) { characterData.spellSlots[`level${level}`] = { total: totalInput.value || '0', used: Array.from(usedCheckboxes).map(cb => cb.dataset.index) }; } });
        // Spells
        characterData.spells = [];
        spellListContent?.querySelectorAll('.spell-row').forEach((row, i) => { characterData.spells.push({ index: i, level: row.querySelector('.spell-level')?.value || '', name: row.querySelector('.spell-name')?.value || '', time: row.querySelector('.spell-time')?.value || '', range: row.querySelector('.spell-range')?.value || '', compV: row.querySelector('input[name^="spell_comp_v"]')?.checked || false, compS: row.querySelector('input[name^="spell_comp_s"]')?.checked || false, compM: row.querySelector('input[name^="spell_comp_m"]')?.checked || false, notes: row.querySelector('.spell-notes')?.value || '' }); });
        // Weapons
        characterData.weapons = [];
        weaponsListContent?.querySelectorAll('.attack-row').forEach((row, i) => { characterData.weapons.push({ index: i, name: row.querySelector('input[name^="attack_name"]')?.value || '', bonus: row.querySelector('input[name^="attack_bonus"]')?.value || '', damage: row.querySelector('input[name^="attack_damage"]')?.value || '', notes: row.querySelector('input[name^="attack_notes"]')?.value || '' }); });
        // Items (NEW)
        characterData.items = [];
        itemsListContent?.querySelectorAll('.item-row').forEach((row, i) => { characterData.items.push({ index: i, name: row.querySelector('.item-name')?.value || '', count: row.querySelector('.item-count')?.value || 0, notes: row.querySelector('.item-notes')?.value || '' }); });

        // Save JSON
        const jsonData = JSON.stringify(characterData, null, 2); const blob = new Blob([jsonData], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); const charName = document.getElementById('charname').value || 'character'; const fileName = `${charName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_dnd_sheet.json`; a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    });

    if (loadFileLabel) loadFileLabel.addEventListener('click', () => loadFileInput.click());

    loadFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const characterData = JSON.parse(e.target.result);
                const inputs = form.querySelectorAll('input:not([type=file]), textarea, select');
                // Load basic data
                inputs.forEach(input => {
                    if (input.closest('#spell-list-content') || input.closest('#weapons-list-content') || input.closest('#items-list-content') || input.closest('.slot-visual') || input.classList.contains('slot-total-input') || input.id === 'hp-total-display') return;
                    const key = input.name || input.id;
                    if (characterData.hasOwnProperty(key)) { if (input.type === 'checkbox') input.checked = characterData[key]; else input.value = characterData[key]; }
                });
                // Load Spells
                if (spellListContent) { spellListContent.innerHTML = ''; spellIndexCounter = 0; if (characterData.spells && Array.isArray(characterData.spells)) { characterData.spells.forEach(spellData => { const newRow = createSpellRow(spellIndexCounter, spellData); spellListContent.appendChild(newRow); spellIndexCounter++; }); } }
                // Load Weapons
                if (weaponsListContent) { weaponsListContent.innerHTML = ''; weaponIndexCounter = 0; if (characterData.weapons && Array.isArray(characterData.weapons)) { characterData.weapons.forEach(weaponData => { const newRow = createWeaponRow(weaponIndexCounter, weaponData); weaponsListContent.appendChild(newRow); weaponIndexCounter++; }); } else { if (weaponsListContent.children.length === 0) addWeaponRowHandler(); } }
                // Load Items (NEW)
                if (itemsListContent) { itemsListContent.innerHTML = ''; itemIndexCounter = 0; if (characterData.items && Array.isArray(characterData.items)) { characterData.items.forEach(itemData => { const newRow = createItemRow(itemIndexCounter, itemData); itemsListContent.appendChild(newRow); itemIndexCounter++; }); } else { if (itemsListContent.children.length === 0) addItemRowHandler(); } } // Add default if empty
                // Load Spell Slots
                if (characterData.spellSlots && spellSlotsGrid) {
                    for (let level = 1; level <= 9; level++) {
                        const slotData = characterData.spellSlots[`level${level}`];
                        const totalInput = document.getElementById(`slots-total-${level}`);
                        if (slotData && totalInput) {
                            const maxAllowed = slotMaxValues[level] !== undefined ? slotMaxValues[level] : 0; let loadedTotal = parseInt(slotData.total, 10) || 0; loadedTotal = Math.min(loadedTotal, maxAllowed); totalInput.value = loadedTotal;
                            generateSpellSlots(level, loadedTotal); // Regenerate checkboxes
                            if (slotData.used && Array.isArray(slotData.used)) { slotData.used.forEach(usedIndex => { const checkbox = document.getElementById(`slot_lvl${level}_used_${usedIndex}`); if (checkbox) checkbox.checked = true; }); }
                        } else if (totalInput) { totalInput.value = '0'; generateSpellSlots(level, '0'); }
                    }
                }
                updateAllCalculatedFields(); // Recalculate everything
                alert('Character data loaded successfully!');
            } catch (error) { console.error("Error loading or parsing file:", error); alert('Error loading character data.'); }
            finally { loadFileInput.value = ''; }
        };
        reader.onerror = () => { alert('Error reading file.'); loadFileInput.value = ''; };
        reader.readAsText(file);
    });

     // --- Print Functionality ---
    const printButton = document.getElementById('print-button');
    if (printButton) printButton.addEventListener('click', () => window.print());

    // --- Initial Setup ---
    // Ensure default rows exist if containers are present
    if (spellListContent && spellListContent.children.length === 0) addSpellRowHandler();
    if (weaponsListContent && weaponsListContent.children.length === 0) addWeaponRowHandler();
    if (itemsListContent && itemsListContent.children.length === 0) addItemRowHandler();
    updateAllCalculatedFields(); // Initial Calculation

}); // End DOMContentLoaded