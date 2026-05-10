
// TOAST NOTIFICATION SYSTEM

function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 4000);
}


// 1. DYNAMIC GEOLOCATION PRICING

let currentCurrency = localStorage.getItem('agencyCurrency');

// BUG FIX: The basic/growth values here MUST be the display values, not the backend Kobo/Cents
// Using 29900 here made the HTML display "$29,900". Changed to 299.
const pricingData = {
    usd: { symbol: '$', basic: 299, growth: 599 },
    ngn: { symbol: '₦', basic: 350000, growth: 600000 }
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


// 2. HANDLE PAYSTACK PAYMENTS (CUSTOM MODAL)

let selectedTier = '';
const checkoutModal = document.getElementById('checkout-modal');
const checkoutEmailInput = document.getElementById('checkout-email');
const confirmCheckoutBtn = document.getElementById('confirm-checkout');
const cancelCheckoutBtn = document.getElementById('cancel-checkout');
const checkoutForm = document.getElementById('checkout-form');

function handleCheckout(tier) {
    selectedTier = tier;
    checkoutModal.classList.add('active');
    checkoutEmailInput.value = ''; 
    checkoutEmailInput.focus();
}

if (cancelCheckoutBtn) {
    cancelCheckoutBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
    });
}

// BUG FIX: Listen to the FORM submit, not the button click. This stops the ghost-click bug on mobile
// Listen to the FORM submit, not the button click.
if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
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
            
            const result = await response.json();
            
            // If the response is successful and has a URL, redirect to Paystack
            if(response.ok && result.url) {
                window.location.href = result.url;
            } else {
                // Display the EXACT error sent from Paystack (e.g., "Invalid email") 
                // OR display the fallback server-down message.
                showToast(result.error || "Payment gateway is currently down.", "error");
                resetModalBtn();
            }
        } catch (error) {
            // This runs if the user's internet disconnects or Node server crashes completely
            console.error("Checkout Request Failed:", error);
            showToast("Connection failed. Please check your internet and try again.", "error");
            resetModalBtn();
        }
    });
}

function resetModalBtn() {
    confirmCheckoutBtn.innerText = "Proceed";
    confirmCheckoutBtn.style.pointerEvents = "auto";
    checkoutModal.classList.remove('active');
}


// 3. HANDLE CONTACT FORM

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


// 4. FIX "STUCK ON PROCESSING" BACK-BUTTON BUG

window.addEventListener('pageshow', (event) => {
    const confirmBtn = document.getElementById('confirm-checkout');
    if(confirmBtn) {
        confirmBtn.innerText = "Proceed";
        confirmBtn.style.pointerEvents = "auto";
    }
    
    const modal = document.getElementById('checkout-modal');
    if(modal) {
        modal.classList.remove('active');
    }

    if (event.persisted) {
        window.location.reload();
    }
});


// 5. BARBA.JS SMOOTH PAGE TRANSITIONS

function initPageLogic() {
    detectLocationAndUpdatePricing(); 
    
    // CUSTOM PREMIUM SMOOTH SCROLL FOR ANCHOR LINKS
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if(target) {
                // 1. Calculate where to scroll (subtracting 80px so the sticky navbar doesn't cover the title)
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const startPosition = window.pageYOffset;
                const distance = elementPosition - headerOffset;
                
                // 2. Set the speed (1000 = 1 full second. Change to 1200 for even slower)
                const duration = 1000; 
                let startTime = null;

                // 3. The Custom "Cinematic" Easing Math
                function animation(currentTime) {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    
                    let t = timeElapsed / duration;
                    if (t > 1) t = 1;
                    
                    // 'easeInOutCubic' Easing - Starts slow, fast in the middle, glides to a stop
                    let ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                    
                    window.scrollTo(0, startPosition + (distance * ease));
                    
                    if (timeElapsed < duration) {
                        requestAnimationFrame(animation);
                    }
                }
                requestAnimationFrame(animation);
            }
        });
    });
}


// 6. LENIS MOMENTUM SCROLL & GSAP REVEALS

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis Momentum Scroll
const lenis = new Lenis({
    duration: 1.2, 
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// Animate elements floating up as you scroll
const elementsToAnimate = document.querySelectorAll('.feature-card, .pricing-card, .portfolio-card, .step-item, .section-title');
elementsToAnimate.forEach((el) => {
    gsap.fromTo(el, 
        { opacity: 0, y: 40 }, 
        {
            opacity: 1, 
            y: 0, 
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%", 
                toggleActions: "play none none none" 
            }
        }
    );
});

// Custom Smooth Scroll for Anchor Links (Powered by Lenis)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        // Lenis smooth scrolls and accounts for navbar offset!
        lenis.scrollTo(targetId, { offset: -80, duration: 1.5 });
    });
});

// Fix: If a user clicks a link from services.html back to index.html#pricing, offset the scroll properly
window.addEventListener('load', () => {
    if (window.location.hash) {
        setTimeout(() => {
            lenis.scrollTo(window.location.hash, { offset: -80, immediate: true });
        }, 100);
    }
});