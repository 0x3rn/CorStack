// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.className = `toast show ${type}`;
    
    // Hide after 4 seconds
    setTimeout(() => {
        toast.className = 'toast';
    }, 4000);
}

let currentCurrency = localStorage.getItem('agencyCurrency');

const pricingData = {
    usd: { symbol: '$', basic: 999, growth: 2499 },
    ngn: { symbol: '₦', basic: 950000, growth: 1500000 }
};

async function detectLocationAndUpdatePricing() {
    if (currentCurrency) {
        updatePricingDisplay();
        return; 
    }

    try {
        const response = await fetch('https://ipapi.co/json/');
        
        if (!response.ok) throw new Error("Rate limited"); 
        
        const data = await response.json();
        
        if (data.country === 'NG') {
            currentCurrency = 'ngn';
        } else {
            currentCurrency = 'usd';
        }
        
        localStorage.setItem('agencyCurrency', currentCurrency);
        updatePricingDisplay();
        
    } catch (error) {
        console.error("Location detection failed. Defaulting to USD.");
        currentCurrency = 'usd';
        updatePricingDisplay();
    }
}

function updatePricingDisplay() {
    const p = pricingData[currentCurrency];
    const basicEl = document.getElementById('price-basic');
    const growthEl = document.getElementById('price-growth');
    
    if(basicEl) basicEl.innerHTML = `${p.symbol}${p.basic.toLocaleString()} <span>/one-time</span>`;
    if(growthEl) growthEl.innerHTML = `${p.symbol}${p.growth.toLocaleString()} <span>/one-time</span>`;
}

document.addEventListener('DOMContentLoaded', detectLocationAndUpdatePricing);

// ==========================================
// 2. HANDLE PAYSTACK PAYMENTS (CUSTOM MODAL)
// ==========================================
let selectedTier = '';
const checkoutModal = document.getElementById('checkout-modal');
const checkoutEmailInput = document.getElementById('checkout-email');
const confirmCheckoutBtn = document.getElementById('confirm-checkout');
const cancelCheckoutBtn = document.getElementById('cancel-checkout');


function handleCheckout(tier) {
    selectedTier = tier;
    checkoutModal.classList.add('active');
    checkoutEmailInput.value = ''; // Clear previous input
    checkoutEmailInput.focus();
}

if (cancelCheckoutBtn) {
    cancelCheckoutBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
    });
}

if (confirmCheckoutBtn) {
    confirmCheckoutBtn.addEventListener('click', async () => {
        const userEmail = checkoutEmailInput.value.trim();
        
        if (!userEmail || !userEmail.includes('@')) {
            showToast("Please enter a valid email address.", "error");
            return;
        }

        confirmCheckoutBtn.innerText = "Processing...";
        confirmCheckoutBtn.style.pointerEvents = "none";

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    tier: selectedTier, 
                    currency: currentCurrency || 'usd',
                    email: userEmail 
                })
            });
            
            const session = await response.json();
            
            if(session.url) {
                window.location.href = session.url;
            } else {
                showToast("Payment gateway unavailable right now.", "error");
                resetModalBtn();
            }
        } catch (error) {
            console.error("Payment failed to initiate:", error);
            showToast("Payment system currently unavailable.", "error");
            resetModalBtn();
        }
    });
}

function resetModalBtn() {
    confirmCheckoutBtn.innerText = "Proceed";
    confirmCheckoutBtn.style.pointerEvents = "auto";
    checkoutModal.classList.remove('active');
}

const contactForm = document.getElementById('contact-form');

if(contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const btn = document.getElementById('submit-btn');
        btn.innerText = "Sending...";

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            if(result.success) {
                window.location.href = 'success.html';
            } else {
                showToast("Something went wrong. Please check your connection.", "error");
                btn.innerText = "Send Message";
            }
        } catch (error) {
            showToast("Error connecting to server.", "error");
            btn.innerText = "Send Message";
        }
    });
}