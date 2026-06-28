import type { CartLine } from '../hooks/useShopifyCart';

const DISCOUNT_MAP: Record<string, {
  compareAt1: number;
  compareAt2: number;
  compareAt3: number;
  price2: number;
  price3: number;
}> = {
  '54239315001690': { compareAt1: 50,  compareAt2: 100, compareAt3: 150, price2: 49, price3: 69 },
  '54239321424218': { compareAt1: 50,  compareAt2: 100, compareAt3: 150, price2: 49, price3: 69 },
  '53786629243226': { compareAt1: 60,  compareAt2: 120, compareAt3: 180, price2: 49, price3: 69 },
  '52794674315610': { compareAt1: 60,  compareAt2: 120, compareAt3: 180, price2: 49, price3: 69 },
  '52124278686042': { compareAt1: 60,  compareAt2: 120, compareAt3: 180, price2: 45, price3: 65 },
  '52202158948698': { compareAt1: 60,  compareAt2: 120, compareAt3: 180, price2: 45, price3: 65 },
  '52352010617178': { compareAt1: 60,  compareAt2: 120, compareAt3: 180, price2: 45, price3: 65 },
  '49620044644698': { compareAt1: 60,  compareAt2: 120, compareAt3: 180, price2: 45, price3: 65 },
};

function getDiscountHint(variantId: string, quantity: number): { text: string; color: string } | null {
  const numericId = variantId.replace('gid://shopify/ProductVariant/', '');
  const d = DISCOUNT_MAP[numericId];
  if (!d) return null;
  const saving2 = d.compareAt2 - d.price2;
  const saving3 = d.compareAt3 - d.price3;
  if (quantity >= 3) {
    return {
      text: `✓ Εξοικονομείτε €${saving3} — Μέγιστη έκπτωση!`,
      color: '#3E7C4A',
    };
  }
  if (quantity === 2) {
    return {
      text: `✓ Εξοικονομείτε €${saving2} — Προσθέστε 1 ακόμα για €${saving3} έκπτωση`,
      color: '#3E7C4A',
    };
  }
  if (quantity === 1) {
    return {
      text: `Προσθέστε 1 ακόμα και εξοικονομήστε €${saving2}`,
      color: '#C8A96E',
    };
  }
  return null;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartLines: CartLine[];
  cartTotal: string;
  isLoading: boolean;
  onUpdateQuantity: (lineId: string, qty: number) => void;
  onRemoveLine: (lineId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartLines,
  cartTotal,
  isLoading,
  onUpdateQuantity,
  onRemoveLine,
  onCheckout,
}: CartDrawerProps) {
  function removeAccents(str: string): string {
    return str
      .replace(/ά/g, 'α').replace(/Ά/g, 'Α')
      .replace(/έ/g, 'ε').replace(/Έ/g, 'Ε')
      .replace(/ή/g, 'η').replace(/Ή/g, 'Η')
      .replace(/ί/g, 'ι').replace(/Ί/g, 'Ι')
      .replace(/ό/g, 'ο').replace(/Ό/g, 'Ο')
      .replace(/ύ/g, 'υ').replace(/Ύ/g, 'Υ')
      .replace(/ώ/g, 'ω').replace(/Ώ/g, 'Ω')
      .replace(/ϊ/g, 'ι').replace(/Ϊ/g, 'Ι')
      .replace(/ΐ/g, 'ι')
      .replace(/ϋ/g, 'υ').replace(/Ϋ/g, 'Υ')
      .replace(/ΰ/g, 'υ');
  }

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 300,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s',
        }}
      />

      {/* DRAWER */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#FAF8F5',
          zIndex: 301,
          maxHeight: '80dvh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.35s ease',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 16px 12px',
          borderBottom: '1px solid #E8E3DC',
        }}>
          <h2 style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#2C1F14',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: 0,
          }}>
            ΤΟ ΚΑΛΑΘΙ ΣΑΣ
          </h2>
          <button
            onClick={onClose}
            style={{
              fontSize: 20,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#2C1F14',
              padding: '4px 8px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8B7355' }}>
              <p style={{ fontSize: 14 }}>Φόρτωση...</p>
            </div>
          ) : cartLines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8B7355' }}>
              <p style={{ fontSize: 15 }}>Το καλάθι σας είναι άδειο</p>
            </div>
          ) : (
            cartLines.map((line) => (
              <div
                key={line.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '14px 0',
                  borderBottom: '1px solid #F0EDE8',
                  alignItems: 'center',
                }}
              >
                {line.imageUrl ? (
                  <img
                    src={line.imageUrl}
                    alt={line.productName}
                    style={{ width: 64, height: 64, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 64, height: 64, background: '#F0EDE8', flexShrink: 0 }} />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#2C1F14',
                    margin: '0 0 4px',
                    textTransform: 'uppercase',
                  }}>
                    {removeAccents(line.productName).toUpperCase()}
                  </p>
                  <p style={{ fontSize: 12, color: '#8B7355', margin: '0 0 8px' }}>
                    €{Math.round(parseFloat(line.linePrice))}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => onUpdateQuantity(line.id, line.quantity - 1)}
                      style={{
                        width: 28, height: 28, border: '1px solid #DDD8D0',
                        background: 'white', cursor: 'pointer', fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(line.id, line.quantity + 1)}
                      style={{
                        width: 28, height: 28, border: '1px solid #DDD8D0',
                        background: 'white', cursor: 'pointer', fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemoveLine(line.id)}
                      style={{
                        marginLeft: 8, background: 'none', border: 'none',
                        cursor: 'pointer', color: '#8B7355', fontSize: 16,
                        padding: '4px',
                      }}
                    >
                      🗑
                    </button>
                  </div>
                  {(() => {
                    const hint = getDiscountHint(line.variantId, line.quantity);
                    return hint ? (
                      <p style={{
                        fontSize: 11,
                        color: hint.color,
                        margin: '6px 0 0',
                        fontStyle: 'italic',
                        letterSpacing: '0.02em',
                      }}>
                        {hint.text}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid #E8E3DC',
          background: '#FAF8F5',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 14, color: '#2C1F14' }}>Σύνολο</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#2C1F14' }}>€{cartTotal}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={cartLines.length === 0 || isLoading}
            style={{
              width: '100%',
              height: 52,
              background: '#2C1F14',
              color: 'white',
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              opacity: cartLines.length === 0 || isLoading ? 0.5 : 1,
            }}
          >
            ΠΡΟΧΩΡΗΣΤΕ ΣΤΟ CHECKOUT →
          </button>
        </div>
      </div>
    </>
  );
}