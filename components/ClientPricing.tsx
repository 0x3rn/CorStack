"use client";

import { useState } from 'react';
import { PricingTier } from '../lib/types';
import { useCurrency } from '../hooks/useCurrency';
import ProjectModal from './ProjectModal';
import { Check } from 'lucide-react';

interface ClientPricingProps {
  pricingTiers: PricingTier[];
}

export default function ClientPricing({ pricingTiers }: ClientPricingProps) {
  const { currency, symbol, isCurrencyLoaded } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');

  const handleBuyClick = (tier: string, priceText: string) => {
    const formattedPrice = priceText.split('-')[0].trim().replace(/^[\$₦]/, '');
    setSelectedTier(`${tier} (Starting from ${symbol}${formattedPrice})`);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="pricing-grid">
        {pricingTiers && pricingTiers.length > 0 ? (
          pricingTiers.map(tier => (
            <article key={tier.id} className={`pricing-card ${tier.isPopular ? 'popular-tier' : ''}`}>
              {tier.isPopular && <span className="badge">Most Popular</span>}
              <h3 className="pricing-name">{tier.name}</h3>
              <p className="pricing-desc">{tier.desc}</p>
              <h4 id={`price-${tier.id}`} className="pricing-price">
                <span className="block text-[0.85rem] font-extrabold tracking-[0.15em] uppercase mb-1 text-accent-primary">Starting from</span>
                {symbol}{(currency === 'usd' ? tier.priceUsd : tier.priceNgn).split('-')[0].trim().replace(/^[\$₦]/, '')}
              </h4>
              <ul className="pricing-features">
                {tier.features.map((feature, idx) => (
                  <li key={idx}>
                    <Check className="w-4 h-4 shrink-0 text-accent-primary" strokeWidth={3} /> 
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <button onClick={() => handleBuyClick(tier.name, currency === 'usd' ? tier.priceUsd : tier.priceNgn)} className={`btn block-btn ${tier.isPopular ? 'btn-primary inverse-btn' : 'btn-dark'}`}>
                  Start Project
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            Pricing tiers will appear here once added in the admin dashboard.
          </div>
        )}
      </div>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tier={selectedTier} 
        currency={currency} 
      />
    </>
  );
}
