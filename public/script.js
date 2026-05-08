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

async function handleCheckout(tier) {
    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tier: tier, currency: currentCurrency || 'usd' })
        });
        
        const session = await response.json();
        
        if(session.url) {
            window.location.href = session.url;
        }
    } catch (error) {
        console.error("Payment failed to initiate:", error);
        alert("Payment system currently unavailable.");
    }
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
                alert("Something went wrong. Please try again.");
                btn.innerText = "Send Message";
            }
        } catch (error) {
            alert("Error connecting to server.");
            btn.innerText = "Send Message";
        } 
    });
}