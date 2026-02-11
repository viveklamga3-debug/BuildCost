import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { 
  ConstructionType, 
  CityType, 
  CalculationResult, 
  ConstructionRates, 
  CityMultipliers 
} from './types';
import { formatCurrency } from './utils/formatters';
import { Analytics } from '@vercel/analytics/react';

type View = 'calculator' | 'privacy' | 'terms' | 'disclaimer' | 'about' | 'contact';

const AdSensePlaceholder: React.FC<{ slot?: string }> = ({ slot }) => (
  <div className="ad-placeholder no-print">
    <ins className="adsbygoogle"
         style={{ display: 'block' }}
         data-ad-client="ca-pub-0000000000000000"
         data-ad-slot={slot || "0000000000"}
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <span>Advertisement - {slot || 'General Slot'}</span>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<View>('calculator');
  const [area, setArea] = useState<number | string>(1200);
  const [type, setType] = useState<ConstructionType>(ConstructionType.STANDARD);
  const [city, setCity] = useState<CityType>(CityType.TIER_2);
  const [materialAdjustmentPercent, setMaterialAdjustmentPercent] = useState<number>(5);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateEstimate = useCallback(() => {
    const numericArea = typeof area === 'string' ? parseFloat(area) || 0 : area;
    
    if (numericArea <= 0) {
      setResult(null);
      return;
    }

    const baseRate = ConstructionRates[type];
    const baseCost = numericArea * baseRate;
    const cityMultiplier = CityMultipliers[city];
    const cityAdjustedCost = baseCost * cityMultiplier;
    
    const materialAdjustment = cityAdjustedCost * (materialAdjustmentPercent / 100);
    const subtotal = cityAdjustedCost + materialAdjustment;
    const contingency = subtotal * 0.05;
    const finalTotal = subtotal + contingency;
    const costPerSqFt = finalTotal / numericArea;

    setResult({
      baseCost,
      cityAdjustedCost,
      materialAdjustment,
      subtotal,
      contingency,
      finalTotal,
      costPerSqFt,
    });
  }, [area, type, city, materialAdjustmentPercent]);

  useEffect(() => {
    if (view === 'calculator') calculateEstimate();
    window.scrollTo(0, 0);
  }, [view, calculateEstimate]);

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') setArea('');
    else {
      const num = parseFloat(val);
      if (!isNaN(num)) setArea(num);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `BuildCost 2026 Estimate:\nTotal Area: ${area} sq ft\nEstimated Total: ${formatCurrency(result.finalTotal)}\nCheck yours at: ${window.location.href}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'BuildCost Estimate', text, url: window.location.href });
      } catch (err) { console.log('Share failed', err); }
    } else {
      alert("Sharing is not supported on this browser. You can copy the estimate manually.");
    }
  };

  const renderCalculator = () => (
    <>
      <main className="card">
        <section className="form-grid no-print">
          <div className="input-group">
            <label htmlFor="area">Total Area (sq ft)</label>
            <input
              id="area"
              type="number"
              value={area}
              onChange={handleAreaChange}
              placeholder="e.g. 1200"
              min="0"
            />
          </div>

          <div className="input-group">
            <label htmlFor="type">Construction Quality</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as ConstructionType)}
            >
              <option value={ConstructionType.BASIC}>Basic (₹1,500/sq ft)</option>
              <option value={ConstructionType.STANDARD}>Standard (₹2,000/sq ft)</option>
              <option value={ConstructionType.PREMIUM}>Premium (₹2,800/sq ft)</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="city">City Tier Location</label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value as CityType)}
            >
              <option value={CityType.TIER_1}>Tier 1 (Metro/Premium)</option>
              <option value={CityType.TIER_2}>Tier 2 (Developing City)</option>
              <option value={CityType.TIER_3}>Tier 3 (Town/Rural)</option>
            </select>
          </div>

          <div className="input-group slider-container">
            <label htmlFor="material">Material Finish: +{materialAdjustmentPercent}%</label>
            <input
              id="material"
              type="range"
              min="0"
              max="20"
              value={materialAdjustmentPercent}
              onChange={(e) => setMaterialAdjustmentPercent(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: '#64748b' }}>
              <span>Economy</span>
              <span>Ultra Luxury</span>
            </div>
          </div>
        </section>

        <button className="calc-btn no-print" onClick={calculateEstimate}>
          Calculate Estimate
        </button>

        {result && (
          <section className="results-section">
            <div className="results-header">
              <h2>Estimated Budget (2026 Index)</h2>
              <div className="action-buttons no-print">
                <button onClick={() => window.print()} title="Print Quote">⎙ Print</button>
                <button onClick={handleShare} title="Share Estimate">🔗 Share</button>
              </div>
            </div>

            <div className="results-grid">
              <div className="result-item">
                <div className="result-item-label">Cost per sq ft</div>
                <div className="result-item-value">{formatCurrency(result.costPerSqFt)}</div>
              </div>
              <div className="result-item">
                <div className="result-item-label">Base Construction Cost</div>
                <div className="result-item-value">{formatCurrency(result.baseCost)}</div>
              </div>
              <div className="result-item">
                <div className="result-item-label">Material Adjustment Cost</div>
                <div className="result-item-value">{formatCurrency(result.materialAdjustment)}</div>
              </div>
              <div className="result-item">
                <div className="result-item-label">5% Contingency</div>
                <div className="result-item-value">{formatCurrency(result.contingency)}</div>
              </div>
            </div>

            <div className="final-total-box">
              <div className="final-total-label">Final Estimated Total</div>
              <div className="final-total-value">{formatCurrency(result.finalTotal)}</div>
              <p className="area-recap">for {area} sq. ft. build area</p>
            </div>
          </section>
        )}
      </main>

      <AdSensePlaceholder slot="middle-feed" />

      <article className="seo-content no-print">
        <h2>Navigating Home Construction in India (2026)</h2>
        <p>
          Building a house is one of the most significant financial commitments a family makes. As we enter 2026, the construction landscape in India continues to evolve with smarter building materials and fluctuating labor costs. 
        </p>
        <div className="info-cards">
          <div className="info-card">
            <h3>📈 Market Pulse</h3>
            <p>Cement and Steel prices are projected to rise by 4-6% annually. Planning now ensures you lock in better procurement rates.</p>
          </div>
          <div className="info-card">
            <h3>🏗️ Build Smart</h3>
            <p>Using fly-ash bricks and water-saving plumbing can reduce your subtotal by up to 8% while being eco-friendly.</p>
          </div>
        </div>
      </article>
    </>
  );

  const renderLegal = (title: string, content: React.ReactNode) => (
    <div className="card legal-page-content">
      <button className="back-btn" onClick={() => setView('calculator')}>← Back to Calculator</button>
      <h2>{title}</h2>
      <div className="legal-body">{content}</div>
    </div>
  );

  const pages = {
    privacy: renderLegal('Privacy Policy', (
      <>
        <p>Your privacy is important to us. This policy describes how BuildCost collects and uses information.</p>
        <h3>Data Collection</h3>
        <p>We do not store your construction inputs on our servers. All calculations are performed locally in your browser. We use standard log files for analytical purposes.</p>
        <h3>Advertising</h3>
        <p>This site uses Google AdSense. Google uses cookies to serve ads based on your prior visits to this or other websites.</p>
      </>
    )),
    terms: renderLegal('Terms of Service', (
      <>
        <p>By using BuildCost, you agree to these terms.</p>
        <h3>Usage</h3>
        <p>This calculator is for estimation purposes only. Construction costs are highly localized and subject to specific site conditions.</p>
        <h3>Disclaimer</h3>
        <p>BuildCost is not liable for any financial decisions made based on these estimates. Always consult a professional architect or contractor.</p>
      </>
    )),
    disclaimer: renderLegal('Disclaimer', (
      <>
        <p>The information provided by BuildCost is for general guidance only. Prices for steel, sand, aggregate, and labor can change daily.</p>
        <p>We do not guarantee the accuracy of these projections. Users should verify local market rates before commencing any construction activity.</p>
      </>
    )),
    about: renderLegal('About Us', (
      <>
        <p>BuildCost is an independent construction forecasting tool designed for the Indian market. Our goal is to empower homeowners with data-driven budget insights.</p>
        <p>Our team consists of civil engineering enthusiasts who monitor market trends across Delhi, Mumbai, Bangalore, and rural India to provide the most accurate multipliers possible.</p>
      </>
    )),
    contact: renderLegal('Contact Us', (
      <>
        <p>For support, feedback, or business inquiries, please contact us:</p>
        <p><strong>Email:</strong> hello@buildcost.example.com</p>
        <p><strong>Location:</strong> Digital-First Platform, India</p>
      </>
    )),
  };

  return (
    <div className="container">
      <header className="header no-print" onClick={() => setView('calculator')} style={{ cursor: 'pointer' }}>
        <h1>BuildCost</h1>
        <p>2026 Construction Cost Estimator for India</p>
      </header>

      {view === 'calculator' ? renderCalculator() : pages[view as keyof typeof pages]}

      <footer className="footer-nav no-print">
        <div className="footer-links">
          <button onClick={() => setView('about')}>About Us</button>
          <button onClick={() => setView('contact')}>Contact Us</button>
          <button onClick={() => setView('privacy')}>Privacy Policy</button>
          <button onClick={() => setView('terms')}>Terms of Service</button>
          <button onClick={() => setView('disclaimer')}>Disclaimer</button>
        </div>
        <p className="copyright">
          © 2026 BuildCost India – Precision Estimating.
        </p>
      </footer>
      <Analytics />
    </div>
  );
};

export default App;