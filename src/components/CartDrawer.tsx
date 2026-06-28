import type { CartLine } from '../hooks/useShopifyCart';

const DISCOUNT_MAP: Record<string, { qty2: number; qty3: number }> = {
  '54239315001690': { qty2: 9,  qty3: 18 },
  '54239321424218': { qty2: 9,  qty3: 18 },
  '53786629243226': { qty2: 9,  qty3: 18 },
  '52794674315610': { qty2: 9,  qty3: 18 },
  '52124278686042': { qty2: 5,  qty3: 10 },
  '52202158948698': { qty2: 5,  qty3: 10 },
  '52352010617178': { qty2: 5,  qty3: 10 },
  '49620044644698': { qty2: 5,  qty3: 10 },
};

function getDiscountHint(variantId: string, quantity: number): { text: string; color: string } | null {
  const numericId = variantId.replace('gid://shopify/ProductVariant/', '');
  const discount = DISCOUNT_MAP[numericId];
  if (!discount) return null;
  if (quantity >= 3) {
    return {
      text: `✓ Εξοικονομείτε €${discount.qty3} — Μέγιστη έκπτωση!`,
      color: '#3E7C4A',
    };
  }
  if (quantity === 2) {
    return {
      text: `✓ Εξοικονομείτε €${discount.qty2} — Προσθέστε 1 ακόμα για €${discount.qty3} έκπτωση`,
      color: '#3E7C4A',
    };
  }
  if (quantity === 1) {
    return {
      text: `Προσθέστε 1 ακόμα και εξοικονομήστε €${discount.qty2}`,
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
                    {line.productName}
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
