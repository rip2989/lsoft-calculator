// Get all DOM elements
const drivesDisplay = document.getElementById('drivesDisplay');
const costDisplay = document.getElementById('costDisplay');
const drivesIconBar = document.getElementById('drivesIconBar');
const costIconBar = document.getElementById('costIconBar');
const drivesBarWrapper = document.getElementById('drivesBarWrapper');
const costBarWrapper = document.getElementById('costBarWrapper');
const outsourcingCost = document.getElementById('outsourcingCost');
const lsoftCost = document.getElementById('lsoftCost');
const breakEven = document.getElementById('breakEven');
const year1Savings = document.getElementById('year1Savings');
const year2Savings = document.getElementById('year2Savings');
const year3Savings = document.getElementById('year3Savings');
const year1Bar = document.querySelector('[data-year="1"]');
const year2Bar = document.querySelector('[data-year="2"]');
const year3Bar = document.querySelector('[data-year="3"]');

// Constants for calculations
const LSOFT_BASE_COST = 4995;
const MIN_DRIVES = 50;
const MAX_DRIVES = 2000;
const MIN_COST = 5;
const MAX_COST = 75;

// Current values
let currentDrives = 750;
let currentCost = 20;

// Function to format numbers with commas
function formatNumber(num) {
    return Math.round(num).toLocaleString('en-US');
}

// Function to format numbers with K for thousands (for Section 3)
function formatNumberWithK(num) {
    const rounded = Math.round(num);
    if (rounded >= 1000) {
        // Convert to K format
        const thousands = rounded / 1000;
        // If it's a whole number of thousands, don't show decimal
        if (thousands % 1 === 0) {
            return thousands + 'K';
        }
        // Otherwise show one decimal place
        return thousands.toFixed(1) + 'K';
    }
    return rounded.toLocaleString('en-US');
}

// Helper function to calculate how many icons fit in the container
function getIconCapacity(container) {
    const ICON_WIDTH = 54; // Base icon width from CSS
    const GAP = 5; // Base gap from CSS

    const availableWidth = container.clientWidth;
    return Math.max(1, Math.floor(availableWidth / (ICON_WIDTH + GAP)));
}

// Function to create icon arrays with smooth animations
function createIconArray(container, count, type) {
    const maxValue = type === 'drive' ? MAX_DRIVES : MAX_COST;
    const maxIcons = getIconCapacity(container);

    const activeIcons = Math.min(
        Math.ceil((count / maxValue) * maxIcons),
        maxIcons
    );

    const existingIcons = container.children.length;

    // ADD ICONS
    if (existingIcons < maxIcons) {
        for (let i = existingIcons; i < maxIcons; i++) {
            const icon = document.createElement('div');
            icon.className = type === 'drive' ? 'drive-icon icon-enter' : 'money-icon icon-enter';

            container.appendChild(icon);

            requestAnimationFrame(() => {
                icon.classList.remove('icon-enter');
            });
        }
    }

    // REMOVE ICONS
    if (existingIcons > maxIcons) {
        for (let i = existingIcons - 1; i >= maxIcons; i--) {
            const icon = container.children[i];
            icon.classList.add('icon-exit');

            setTimeout(() => {
                icon.remove();
            }, 250);
        }
    }

    // UPDATE ACTIVE STATE
    [...container.children].forEach((icon, index) => {
        icon.classList.toggle('active', index < activeIcons);
    });
}

// Function to animate number changes
function animateNumber(element, targetValue, duration = 800, useKFormat = false) {
    const startValue = parseFloat(element.textContent.replace(/,/g, '').replace('K', '000')) || 0;
    const difference = targetValue - startValue;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out curve
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (difference * easeProgress);

        element.textContent = useKFormat ? formatNumberWithK(currentValue) : formatNumber(currentValue);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = useKFormat ? formatNumberWithK(targetValue) : formatNumber(targetValue);
        }
    }

    requestAnimationFrame(update);
}

// Function to update bar chart heights
function updateBarChart(year1Value, year2Value, year3Value) {
    const maxValue = Math.max(year1Value, year2Value, year3Value);
    const MAX_BAR_HEIGHT = 300; // Maximum height in pixels
    const MIN_BAR_HEIGHT = 60; // Minimum height to keep bars visible

    if (maxValue > 0) {
        // Calculate proportional heights
        const year1Height = Math.max(MIN_BAR_HEIGHT, (year1Value / maxValue) * MAX_BAR_HEIGHT);
        const year2Height = Math.max(MIN_BAR_HEIGHT, (year2Value / maxValue) * MAX_BAR_HEIGHT);
        const year3Height = Math.max(MIN_BAR_HEIGHT, (year3Value / maxValue) * MAX_BAR_HEIGHT);

        year1Bar.style.height = `${year1Height}px`;
        year2Bar.style.height = `${year2Height}px`;
        year3Bar.style.height = `${year3Height}px`;
    }
}

// Function to calculate and update all values
function calculateAndUpdate() {
    // Update display values
    drivesDisplay.textContent = formatNumber(currentDrives);
    costDisplay.textContent = formatNumber(currentCost);

    // Update icon arrays (auto-calculates based on container width)
    createIconArray(drivesIconBar, currentDrives, 'drive');
    createIconArray(costIconBar, currentCost, 'money');

    // Calculate outsourcing cost (annual cost based on drives and cost per drive)
    const annualOutsourcingCost = currentDrives * currentCost;

    // LSoft cost remains constant
    const lsoftCostValue = LSOFT_BASE_COST;

    // Calculate break-even in months
    const monthlyOutsourcingCost = annualOutsourcingCost / 12;
    const breakEvenMonths = lsoftCostValue / monthlyOutsourcingCost;

    // Calculate savings over 3 years
    const year1SaveValue = Math.max(0, annualOutsourcingCost - lsoftCostValue);
    const year2SaveValue = Math.max(0, (annualOutsourcingCost * 2) - lsoftCostValue);
    const year3SaveValue = Math.max(0, (annualOutsourcingCost * 3) - lsoftCostValue);

    // Animate all the calculated values (use K format for Section 3)
    animateNumber(outsourcingCost, annualOutsourcingCost, 800, true);
    animateNumber(lsoftCost, lsoftCostValue, 800, true);

    // Format break-even with one decimal place
    const breakEvenFormatted = breakEvenMonths.toFixed(1);
    breakEven.textContent = breakEvenFormatted;

    // Animate savings projections (use K format)
    animateNumber(year1Savings, year1SaveValue, 800, true);
    animateNumber(year2Savings, year2SaveValue, 800, true);
    animateNumber(year3Savings, year3SaveValue, 800, true);

    // Update bar chart
    updateBarChart(year1SaveValue, year2SaveValue, year3SaveValue);
}

// Draggable functionality for the container
function setupDraggable(container, type) {
    let isDragging = false;

    const handleMove = (clientX) => {
        // Get the icon bar element (child of container)
        const iconBar = container.querySelector('.icon-bar');
        const rect = iconBar.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));

        if (type === 'drives') {
            currentDrives = Math.round(MIN_DRIVES + percentage * (MAX_DRIVES - MIN_DRIVES));
            currentDrives = Math.round(currentDrives / 50) * 50; // Round to nearest 50
        } else {
            currentCost = Math.round(MIN_COST + percentage * (MAX_COST - MIN_COST));
            currentCost = Math.round(currentCost / 5) * 5; // Round to nearest 5
        }

        calculateAndUpdate();
    };

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        handleMove(e.clientX);
    });

    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        handleMove(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            handleMove(e.clientX);
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            handleMove(e.touches[0].clientX);
        }
    }, { passive: true });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Click to set value
    container.addEventListener('click', (e) => {
        handleMove(e.clientX);
    });
}

// Get the container elements (parent of the bar wrapper)
const drivesContainer = drivesBarWrapper;
const costContainer = costBarWrapper;

// Initialize draggable containers
setupDraggable(drivesContainer, 'drives');
setupDraggable(costContainer, 'cost');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    calculateAndUpdate();
});

// Update icon count on window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        calculateAndUpdate();
    }, 100);
});
