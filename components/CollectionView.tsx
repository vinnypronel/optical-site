'use client';

import { useState } from 'react';
import styles from '../app/page.module.css';

type Frame = {
  id: string;
  name: string;
  colorName: string;
  price: number;
  description: string;
  swatches: { name: string; hex: string; class: string }[];
};

const FRAMES: Frame[] = [
  {
    id: 'madison',
    name: 'The Madison',
    colorName: 'Classic Tortoise',
    price: 345,
    description: 'An intellectual, keyhole-bridge silhouette sculpted from custom Italian acetate in rich amber and dark espresso hues.',
    swatches: [
      { name: 'Classic Tortoise', hex: '#633d1c', class: 'swatchTortoise' },
      { name: 'Matte Black', hex: '#161618', class: 'swatchBlack' },
      { name: 'Champagne Gold', hex: '#d4af37', class: 'swatchGold' },
    ],
  },
  {
    id: 'hudson',
    name: 'The Hudson',
    colorName: 'Matte Black Acetate',
    price: 360,
    description: 'A commanding, modern rectangular frame finished with hand-milled bevels and signature double-rivet hardware.',
    swatches: [
      { name: 'Matte Black', hex: '#161618', class: 'swatchBlack' },
      { name: 'Classic Tortoise', hex: '#633d1c', class: 'swatchTortoise' },
      { name: 'Clear Crystal', hex: '#e2e8f0', class: 'swatchClear' },
    ],
  },
  {
    id: 'mercer',
    name: 'The Mercer',
    colorName: 'Clear Crystal',
    price: 330,
    description: 'Minimalist transparency at its finest. Made of high-density acetate that catches the light without weighting your features.',
    swatches: [
      { name: 'Clear Crystal', hex: '#e2e8f0', class: 'swatchClear' },
      { name: 'Matte Black', hex: '#161618', class: 'swatchBlack' },
      { name: 'Classic Tortoise', hex: '#633d1c', class: 'swatchTortoise' },
    ],
  },
  {
    id: 'lafayette',
    name: 'The Lafayette',
    colorName: 'Champagne Gold',
    price: 395,
    description: 'An ultra-lightweight titanium frame featuring double-bar aviator geometry, filigreed details, and 18k gold-plated accents.',
    swatches: [
      { name: 'Champagne Gold', hex: '#d4af37', class: 'swatchGold' },
      { name: 'Matte Black', hex: '#161618', class: 'swatchBlack' },
    ],
  },
];

type CartItem = {
  id: string;
  frame: Frame;
  color: string;
  lensType: string;
  lensUpgrade: string;
  price: number;
};

export default function CollectionView() {
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  
  // Customizer selection state
  const [customColor, setCustomColor] = useState('');
  const [customLensType, setCustomLensType] = useState('Single Vision');
  const [customLensUpgrade, setCustomLensUpgrade] = useState('Standard AR');
  
  // Shopping Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCustomizer = (frame: Frame) => {
    setSelectedFrame(frame);
    setCustomColor(frame.swatches[0].name);
    setCustomLensType('Single Vision');
    setCustomLensUpgrade('Standard AR');
  };

  const handleAddToCart = () => {
    if (!selectedFrame) return;
    
    // Lens upgrades pricing
    let finalPrice = selectedFrame.price;
    if (customLensType === 'Progressive') finalPrice += 150;
    if (customLensUpgrade === 'Diamond Tough AR') finalPrice += 90;
    if (customLensUpgrade === 'Blue-Block AR') finalPrice += 50;

    const newItem: CartItem = {
      id: `${selectedFrame.id}-${Date.now()}`,
      frame: selectedFrame,
      color: customColor,
      lensType: customLensType,
      lensUpgrade: customLensUpgrade,
      price: finalPrice,
    };

    setCart([...cart, newItem]);
    setSelectedFrame(null); // Close drawer
    setIsCartOpen(true); // Open cart sidebar
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  return (
    <div className={styles.shopContainer}>
      <div className={styles.shopHeader}>
        <span className={styles.eyebrowSmall}>Collection 04</span>
        <h1 className={styles.shopTitle}>Modern Artifacts</h1>
        <p className={styles.shopSubtitle}>
          Sculpted surfaces, engineered hardware, and meticulous alignment. Available for immediate dispatch or custom lens fitting.
        </p>
      </div>

      {/* Grid Showcase */}
      <div className={styles.shopGrid}>
        {FRAMES.map((frame) => (
          <div key={frame.id} className={styles.productCard}>
            {/* Color count + image */}
            <div className={styles.productImageArea} onClick={() => openCustomizer(frame)}>
              <span className={styles.productColorCount}>{frame.swatches.length} Colors</span>
              <div className={styles.productImagePlaceholder}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="12" cy="12" r="3.5" />
                  <path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
                </svg>
                <span>Photo Coming Soon</span>
              </div>
            </div>

            <div className={styles.productMeta}>
              <div className={styles.productTitleRow}>
                <h3 className={styles.productName}>{frame.name}</h3>
                <span className={styles.productPrice}>$ {frame.price}.00</span>
              </div>

              <div className={styles.swatchRow}>
                {frame.swatches.map((swatch) => (
                  <span
                    key={swatch.name}
                    title={swatch.name}
                    className={`${styles.swatchCircle} ${styles[swatch.class]}`}
                    style={{ backgroundColor: swatch.hex }}
                  />
                ))}
              </div>

              <button className={styles.addToCartBtn} onClick={() => openCustomizer(frame)}>
                Select Frame
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-out Customization Drawer */}
      {selectedFrame && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedFrame(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeDrawerBtn} onClick={() => setSelectedFrame(null)}>
              ✕
            </button>
            <div className={styles.drawerHeader}>
              <span className={styles.eyebrowSmall}>Configure Frame</span>
              <h2 className={styles.drawerTitle}>{selectedFrame.name}</h2>
              <span className={styles.drawerBasePrice}>Base Frame: ${selectedFrame.price}</span>
            </div>

            {/* Config Fields */}
            <div className={styles.drawerScrollable}>
              <div className={styles.configSection}>
                <h4 className={styles.configLabel}>1. Frame Finish</h4>
                <div className={styles.colorConfigGrid}>
                  {selectedFrame.swatches.map((swatch) => (
                    <button
                      key={swatch.name}
                      type="button"
                      className={`${styles.colorConfigBtn} ${customColor === swatch.name ? styles.colorConfigBtnActive : ''}`}
                      onClick={() => setCustomColor(swatch.name)}
                    >
                      <span className={styles.colorDot} style={{ backgroundColor: swatch.hex }} />
                      <span>{swatch.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.configSection}>
                <h4 className={styles.configLabel}>2. Prescription Type</h4>
                <div className={styles.optionConfigGrid}>
                  {[
                    { label: 'Single Vision', sub: 'For distance or reading (+ $0)', value: 'Single Vision' },
                    { label: 'Progressive', sub: 'Premium multi-focal lens (+ $150)', value: 'Progressive' },
                    { label: 'Non-Prescription', sub: 'Plano, fashion focus (+ $0)', value: 'Non-Prescription' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.optionConfigBtn} ${customLensType === opt.value ? styles.optionConfigBtnActive : ''}`}
                      onClick={() => setCustomLensType(opt.value)}
                    >
                      <strong>{opt.label}</strong>
                      <span>{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.configSection}>
                <h4 className={styles.configLabel}>3. Lens Technology</h4>
                <div className={styles.optionConfigGrid}>
                  {[
                    { label: 'Standard AR Coating', sub: 'UV Protection & Basic Glare Filter (+ $0)', value: 'Standard AR' },
                    { label: 'Diamond Tough AR', sub: 'Hydrophobic & Hardened Anti-Scratch (+ $90)', value: 'Diamond Tough AR' },
                    { label: 'Smart Blue-Block', sub: 'Filters Digital Fatigue & Night Driving Glare (+ $50)', value: 'Blue-Block AR' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.optionConfigBtn} ${customLensUpgrade === opt.value ? styles.optionConfigBtnActive : ''}`}
                      onClick={() => setCustomLensUpgrade(opt.value)}
                    >
                      <strong>{opt.label}</strong>
                      <span>{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Customizer footer */}
            <div className={styles.drawerFooter}>
              <div className={styles.drawerTotalRow}>
                <span>Subtotal:</span>
                <span className={styles.drawerTotalPrice}>
                  ${
                    selectedFrame.price + 
                    (customLensType === 'Progressive' ? 150 : 0) + 
                    (customLensUpgrade === 'Diamond Tough AR' ? 90 : 0) + 
                    (customLensUpgrade === 'Blue-Block AR' ? 50 : 0)
                  }
                </span>
              </div>
              <button className={styles.drawerAddBtn} onClick={handleAddToCart}>
                Configure & Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      {isCartOpen && (
        <div className={styles.cartOverlay} onClick={() => setIsCartOpen(false)}>
          <div className={styles.cartContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cartHeader}>
              <h3>Your Selection ({cart.length})</h3>
              <button className={styles.closeCartBtn} onClick={() => setIsCartOpen(false)}>
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className={styles.emptyCart}>
                <p>Your shopping bag is currently empty.</p>
                <button className={styles.reserveBtn} onClick={() => setIsCartOpen(false)}>
                  Continue Browsing
                </button>
              </div>
            ) : (
              <>
                <div className={styles.cartItemsScroll}>
                  {cart.map((item) => (
                    <div key={item.id} className={styles.cartItem}>
                      <div className={styles.cartItemMeta}>
                        <strong>{item.frame.name}</strong>
                        <span>Color: {item.color}</span>
                        <span>Lens: {item.lensType}</span>
                        <span>Coating: {item.lensUpgrade}</span>
                      </div>
                      <div className={styles.cartItemPriceBlock}>
                        <strong>${item.price}</strong>
                        <button className={styles.cartItemRemove} onClick={() => removeFromCart(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.cartFooter}>
                  <div className={styles.cartTotalRow}>
                    <span>Total:</span>
                    <strong>${cartTotal}</strong>
                  </div>
                  <button 
                    className={styles.checkoutBtn} 
                    onClick={() => {
                      alert('Checkout process initiated! In a production build, this routes to stripe/shopify checkout API.');
                      setCart([]);
                      setIsCartOpen(false);
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
