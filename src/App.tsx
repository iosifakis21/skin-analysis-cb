import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Heart, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 0 | 1 | 2 | 3 | 4 | 5;
type SkinType = 'dry' | 'oily' | 'combination' | 'normal';
type AgeGroup = '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65-74' | '75-80' | '80+';
type TabKey = 'pores' | 'wrinkles' | 'dark_circles' | 'dehydration' | 'dark_spots';


const SUPABASE_URL = 'https://ppngxtywtcmquuwemeqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbmd4dHl3dGNtcXV1d2VtZXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDA2NjUsImV4cCI6MjA5NzI3NjY2NX0.SJH4mz-qEWp7wI3-9C1hdn9q6W3v1U74U2FdUmUaIBA';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockResults = {
  pores: 78,
  wrinkles: 22,
  dark_circles: 65,
  dehydration: 81,
  dark_spots: 30,
  primary_concern: 'dehydration' as TabKey,
};

type ProductEntry = {
  name: string; size: string; price: string; rating: number; reviews: number;
  benefits: string[]; url: string; image: string;
};

const productData: Record<TabKey, ProductEntry> = {
  pores: {
    name: 'AETHER',
    size: '50ml',
    price: '29€',
    rating: 4.8,
    reviews: 1832,
    benefits: [
      'Εξισορροπεί το λιπαρό δέρμα χωρίς να το ξεραίνει',
      'Βελτιώνει ορατά την υφή και ελαχιστοποιεί τους πόρους',
      'Καταπραΰνει και ανανεώνει την κατεστραμμένη επιδερμίδα',
    ],
    url: 'https://constantinebeauty.gr/products/aether-face-cream',
    image: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVC8jzi4JuBuzK2lRNEWasfkOcy4p6g0TMqDV1Z',
  },
  wrinkles: {
    name: 'HYDRANEA',
    size: '50ml',
    price: '45€',
    rating: 4.9,
    reviews: 421,
    benefits: [
      'Βαθιά ενυδάτωση με βλαστοκύτταρα Ιαπωνικής Ορχιδέας',
      'Αντιγηραντική δράση με νιασιναμίδη για ορατή μείωση ρυτίδων',
      'Ορατά αποτελέσματα σε 7 ημέρες',
    ],
    url: 'https://constantinebeauty.gr/products/hydranea-anti-aging-face-cream-with-stem-cells-niacinamide',
    image: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCAAS7KbYqQC0y6sv4a7w29ofDt1LmekcVdrhE',
  },
  dark_circles: {
    name: 'PEPTIVA',
    size: '30ml',
    price: '25€',
    rating: 4.8,
    reviews: 2367,
    benefits: [
      'Λειαίνει το μεσόφρυο & απαλύνει το πόδι της χήνας',
      'Μειώνει σακούλες & μαύρους κύκλους που κουράζουν το βλέμμα',
      'Αποκαθιστά φωτεινό, σφριγηλό & ξεκούραστο βλέμμα',
    ],
    url: 'https://constantinebeauty.gr/products/peptiva-eye-cream',
    image: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVC1qHYI82soUS7c3ADruwWEFRV014KZtp26OmQ',
  },
  dehydration: {
    name: 'BBLISE',
    size: '50ml',
    price: '25€',
    rating: 4.8,
    reviews: 1530,
    benefits: [
      'Προσφέρει φυσική κάλυψη και ομοιόμορφο τόνο στην επιδερμίδα',
      'Ενυδατώνει βαθιά και χαρίζει δροσιά που διαρκεί όλη μέρα',
      'Μειώνει την όψη των ρυτίδων και προσφέρει ορατή σύσφιξη',
    ],
    url: 'https://constantinebeauty.gr/products/bblise-cream-with-adjustable-coverage',
    image: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCn8IOPIcWG1zXHYvFT9eRJtCU7SjkOWKi3qw0',
  },
  dark_spots: {
    name: 'ELISHEVA',
    size: '50ml',
    price: '29€',
    rating: 4.8,
    reviews: 1832,
    benefits: [
      'Βελτιώνει ορατά τον τόνο & μειώνει τις δυσχρωμίες',
      'Επαναφέρει τη φυσική λάμψη σε θαμπό, ανόμοιο δέρμα',
      'Χαρίζει πιο λεία όψη & ομοιόμορφη υφή από τις πρώτες εβδομάδες',
    ],
    url: 'https://constantinebeauty.gr/products/elisheva-face-cream',
    image: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCIaaLfQpIiabJK94o2U0QOXxNtR8HSkZghnBD',
  },
};


const tabLabels: Record<TabKey, string> = {
  pores: 'Πόροι',
  wrinkles: 'Ρυτίδες',
  dark_circles: 'Μαύροι Κύκλοι',
  dehydration: 'Αφυδάτωση',
  dark_spots: 'Κηλίδες',
};

const tabIcons: Record<TabKey, string> = {
  pores: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCNpB3OuPidCU6o7V1EnXaFguyrS3m2xcKqkB8',
  wrinkles: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCHxsqGlQcEvqmzPa6GXu2hACOrbc51Z7fNUJI',
  dehydration: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCGdvcJmC8l4EucIzYUfOje03wZQdWAMgoLPsx',
  dark_spots: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCfkpqZ3oO1XRsFxJ4A2PctbqgBQUEKmSu8fvj',
  dark_circles: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCTDMj4lffyqG7VKRzJHt2CQ1BeLln0hZuFgj9',
};


// ─── Canvas overlay drawing ───────────────────────────────────────────────────

type Landmark = { x: number; y: number; z?: number };

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ width: '100%', height: 4, background: '#DDD8D0', flexShrink: 0 }}>
      <div
        style={{ width: `${pct}%`, height: '100%', background: '#4A3728', transition: 'width 500ms ease-out' }}
      />
    </div>
  );
}

// ─── Screen 0 ─────────────────────────────────────────────────────────────────

const concernItems: { label: string; icon: string }[] = [
  { label: 'Αφυδάτωση',     icon: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCGdvcJmC8l4EucIzYUfOje03wZQdWAMgoLPsx' },
  { label: 'Μαύρους Κύκλους', icon: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCTDMj4lffyqG7VKRzJHt2CQ1BeLln0hZuFgj9' },
  { label: 'Κηλίδες',       icon: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCfkpqZ3oO1XRsFxJ4A2PctbqgBQUEKmSu8fvj' },
  { label: 'Ρυτίδες',       icon: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCHxsqGlQcEvqmzPa6GXu2hACOrbc51Z7fNUJI' },
  { label: 'Πόρους',         icon: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCNpB3OuPidCU6o7V1EnXaFguyrS3m2xcKqkB8' },
];

function Screen0({ onNext }: { onNext: () => void }) {
  const iconStyle: React.CSSProperties = { width: 32, height: 32, objectFit: 'contain', flexShrink: 0 };
  const cellStyle: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', gap: 8, height: 36 };
  const labelStyle: React.CSSProperties = { fontSize: 13, color: '#2C1F14', fontWeight: 400 };

  return (
    <div style={{ background: '#FAF8F5', minHeight: '100dvh' }}>
      <div style={{ paddingTop: 16, paddingBottom: 16 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 16, marginBottom: 8 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: '#2C1F14', textTransform: 'uppercase', letterSpacing: '0.01em', margin: 0, flex: 1, paddingRight: 12 }}>
            ΑΝΑΛΥΣΗ ΤΟΥ ΔΕΡΜΑΤΟΣ ΣΑΣ
          </h1>
          <button style={{ color: '#2C1F14', background: 'none', border: 'none', padding: 0, lineHeight: 1, marginTop: 2, cursor: 'pointer' }}>
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: 13, lineHeight: 1.4, color: '#2C1F14', fontWeight: 400, margin: '0 16px 12px' }}>
          Φωτογραφηθείτε για να ξεκλειδώσετε την εξατομικευμένη σας ρουτίνα περιποίησης + εξειδικευμένες συμβουλές σε λιγότερο από 60 δευτερόλεπτα!
        </p>

        {/* Stepper */}
        <div style={{ paddingLeft: 16, paddingRight: 16, marginBottom: 12, height: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ width: 8, height: 8, flexShrink: 0, borderRadius: '50%', border: '1.5px solid #4A3728', background: 'transparent' }} />
            <div style={{ flex: 1, height: 1.5, background: '#4A3728' }} />
            <div style={{ width: 8, height: 8, flexShrink: 0, borderRadius: '50%', border: '1.5px solid #4A3728', background: 'transparent' }} />
            <div style={{ flex: 1, height: 1.5, background: '#4A3728' }} />
            <div style={{ width: 8, height: 8, flexShrink: 0, borderRadius: '50%', border: '1.5px solid #4A3728', background: 'transparent' }} />
          </div>
          <div style={{ display: 'flex', marginTop: 4 }}>
            <p style={{ flex: 1, fontSize: 10, color: '#2C1F14', lineHeight: 1.4, fontWeight: 400, textAlign: 'left', margin: 0 }}>
              2 Ερωτήσεις<br />Για Εσάς
            </p>
            <p style={{ flex: 1, fontSize: 10, color: '#2C1F14', lineHeight: 1.4, fontWeight: 400, textAlign: 'center', margin: 0 }}>
              Φωτογραφία
            </p>
            <p style={{ flex: 1, fontSize: 10, color: '#2C1F14', lineHeight: 1.4, fontWeight: 400, textAlign: 'right', margin: 0 }}>
              Αποτελέσματα
            </p>
          </div>
        </div>

        {/* Hero image */}
        <div style={{ paddingLeft: 10, paddingRight: 10, marginBottom: 12 }}>
        <div style={{ height: 240, background: '#FAF8F5' }}>
          <img
            src="https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCAfQX5wYqQC0y6sv4a7w29ofDt1LmekcVdrhE"
            alt="Skin Analysis"
            style={{ width: '150%', height: '100%', objectFit: 'contain', objectPosition: 'center center', display: 'block' }}
          />
        </div>
        </div>

        {/* Concerns */}
        <div style={{ paddingLeft: 16, paddingRight: 16 }}>
          <p style={{ fontSize: 13, color: '#2C1F14', fontWeight: 400, lineHeight: 1.5, margin: 0, marginBottom: 8 }}>
            Η τεχνολογία ανάλυσης δέρματος της Constantine Beauty αξιολογεί 5 βασικούς τομείς:
          </p>

          {/* Row 1: items 0,1 */}
          <div style={{ display: 'flex', columnGap: 16, marginBottom: 8 }}>
            <div style={cellStyle}>
              <img src={concernItems[0].icon} alt={concernItems[0].label} style={iconStyle} />
              <span style={labelStyle}>{concernItems[0].label}</span>
            </div>
            <div style={cellStyle}>
              <img src={concernItems[1].icon} alt={concernItems[1].label} style={iconStyle} />
              <span style={labelStyle}>{concernItems[1].label}</span>
            </div>
          </div>

          {/* Row 2: items 2,3 */}
          <div style={{ display: 'flex', columnGap: 16, marginBottom: 8 }}>
            <div style={cellStyle}>
              <img src={concernItems[2].icon} alt={concernItems[2].label} style={iconStyle} />
              <span style={labelStyle}>{concernItems[2].label}</span>
            </div>
            <div style={cellStyle}>
              <img src={concernItems[3].icon} alt={concernItems[3].label} style={iconStyle} />
              <span style={labelStyle}>{concernItems[3].label}</span>
            </div>
          </div>

          {/* Row 3: item 4 centered */}
          <div style={{ display: 'flex' }}>
            <div style={{ ...cellStyle, flex: 'none' }}>
              <img src={concernItems[4].icon} alt={concernItems[4].label} style={iconStyle} />
              <span style={labelStyle}>{concernItems[4].label}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: 10, color: '#8B7355', lineHeight: 1.4, fontWeight: 400, margin: '10px 16px 12px' }}>
          Η χρήση αυτού του εργαλείου διέπεται από τους Όρους Χρήσης του Pro Skin Analysis. Παρόλο που το εργαλείο έχει σχεδιαστεί ώστε να είναι όσο το δυνατόν πιο ακριβές, προορίζεται για γενικές συστάσεις σχετικά με τη ρουτίνα περιποίησης δέρματος, και οι συμβουλές, πληροφορίες ή σχόλια που περιέχει δεν αντικαθιστούν την επαγγελματική συμβουλή και δεν θα πρέπει να εκλαμβάνονται ως ιατρική συμβουλή. Συμβουλευτείτε πάντα έναν ιατρό ή άλλο εξειδικευμένο επαγγελματία υγείας για ιατρικές συμβουλές και για οποιαδήποτε ερώτηση σχετικά με ιατρική πάθηση. Επίσης, σημειώστε ότι τα αποτελέσματα που εμφανίζονται εδώ επηρεάζονται από την ποιότητα της εικόνας που υποβάλλεται, π.χ. τον φωτισμό ή την ποιότητα της κάμερας. Η Constantine Beauty θα χρησιμοποιήσει τα προσωπικά σας δεδομένα για να σας παρέχει τα αποτελέσματά σας και τις συστάσεις προϊόντων. Οι εικόνες δεν αποθηκεύονται και θα διαγράφονται μετά την ανάλυση, εκτός εάν επιλέξετε να αποθηκεύσετε τα αποτελέσματά σας. Για περισσότερες πληροφορίες σχετικά με τον τρόπο που χρησιμοποιούμε τα προσωπικά σας δεδομένα, ανατρέξτε στην Πολιτική Απορρήτου μας.
        </p>

        {/* Button */}
        <button
          onClick={onNext}
          style={{
            width: '100%',
            height: 50,
            background: '#4A3728',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.06em',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 0,
            display: 'block',
          }}
        >
          ΕΝΑΡΞΗ ΤΩΡΑ
        </button>

      </div>
    </div>
  );
}

// ─── Screen 1 ─────────────────────────────────────────────────────────────────

const skinOptions: { id: SkinType; name: string; desc: string; img: string }[] = [
  { id: 'dry', name: 'Ξηρό', desc: 'Το δέρμα σας μπορεί να φαίνεται σφιχτό, θαμπό ή να ξεφλουδίζει', img: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCCV83GV2Q5W7rXeT91R3hajFZ8xsgkq2oCMnD' },
  { id: 'oily', name: 'Λιπαρό', desc: 'Το δέρμα σας μπορεί να φαίνεται γυαλιστερό με διεσταλμένους πόρους', img: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCIkYfKapIiabJK94o2U0QOXxNtR8HSkZghnBD' },
  { id: 'combination', name: 'Μικτό', desc: 'Το δέρμα σας συνδυάζει χαρακτηριστικά ξηρού και λιπαρού', img: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCQOOa7uB1ASa7eChmi8EoyF3TpW2dHMgGVn0u' },
  { id: 'normal', name: 'Κανονικό', desc: 'Το δέρμα σας είναι ισορροπημένο, δεν είναι ούτε ξηρό ούτε λιπαρό', img: 'https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCf8I3OdoO1XRsFxJ4A2PctbqgBQUEKmSu8fvj' },
];

function Screen1({ onBack, onNext }: { onBack: () => void; onNext: (skin: SkinType) => void }) {
  const [selected, setSelected] = useState<SkinType | null>(null);

  return (
    <div style={{
      background: '#FAF8F5',
      height: 'calc(100dvh - 4px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 16px',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Top bar */}
      <div style={{
        height: 44,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={24} strokeWidth={2} color="#2C1F14" />
        </button>
        <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <X size={22} strokeWidth={2} color="#2C1F14" />
        </button>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(16px, 4vw, 18px)',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: '#2C1F14',
        margin: '0 0 2px',
        letterSpacing: '0.01em',
        lineHeight: 1.2,
        flexShrink: 0,
      }}>
        ΣΧΕΤΙΚΑ ΜΕ ΤΟ ΔΕΡΜΑ ΣΑΣ
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 15,
        color: '#2C1F14',
        margin: '6px 0 0',
        lineHeight: 1.5,
        fontWeight: 400,
        flexShrink: 0,
      }}>
        Επιλέξτε τον τύπο δέρματός σας για τα πιο ακριβή αποτελέσματα
      </p>

      {/* Step label */}
      <p style={{
        fontSize: 15,
        color: '#8B7355',
        margin: '8px 0 0',
        fontWeight: 400,
        flexShrink: 0,
      }}>
        Ερώτηση 1 από 2
      </p>

      {/* Question */}
      <p style={{
        fontSize: 15,
        color: '#2C1F14',
        margin: '8px 0 14px',
        fontWeight: 400,
        lineHeight: 1.5,
        flexShrink: 0,
      }}>
        Ποιος από τους παρακάτω περιγράφει καλύτερα τον τύπο δέρματός σας;
      </p>

      {/* Cards container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        overflow: 'hidden',
      }}>
        {skinOptions.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                padding: '14px 16px',
                border: isSelected ? '2px solid #4A3728' : '1px solid #DDD8D0',
                borderRadius: 8,
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                gap: 12,
                boxSizing: 'border-box',
                flex: 1,
              }}
            >
              <img
                src={opt.img}
                alt={opt.name}
                style={{ width: 52, height: 'auto', objectFit: 'contain', flexShrink: 0 }}
              />
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#2C1F14', margin: 0 }}>{opt.name}</p>
                <p style={{ fontSize: 13, color: '#2C1F14', margin: '2px 0 0', lineHeight: 1.4, fontWeight: 400 }}>{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
        style={{
          width: '100%',
          height: 50,
          flexShrink: 0,
          marginTop: 8,
          marginBottom: 8,
          background: selected ? '#4A3728' : '#F0EDE8',
          color: selected ? 'white' : '#8B7355',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.08em',
          border: 'none',
          borderRadius: 0,
          cursor: selected ? 'pointer' : 'not-allowed',
          textTransform: 'uppercase',
        }}
      >
        ΕΠΟΜΕΝΟ
      </button>
    </div>
  );
}

// ─── Screen 2 ─────────────────────────────────────────────────────────────────

const ageGroups: AgeGroup[] = ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75-80', '80+'];

function Screen2({ onBack, onNext }: { onBack: () => void; onNext: (age: AgeGroup) => void }) {
  const [selected, setSelected] = useState<AgeGroup | null>(null);

  return (
    <div style={{
      background: '#FAF8F5',
      height: 'calc(100dvh - 4px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 16px',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Top bar */}
      <div style={{
        height: 44,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={24} strokeWidth={2} color="#2C1F14" />
        </button>
        <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <X size={22} strokeWidth={2} color="#2C1F14" />
        </button>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(16px, 4vw, 18px)',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: '#2C1F14',
        margin: '0 0 4px',
        letterSpacing: '0.01em',
        lineHeight: 1.2,
        flexShrink: 0,
      }}>
        ΣΧΕΤΙΚΑ ΜΕ ΕΣΑΣ
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 15,
        color: '#2C1F14',
        margin: '6px 0 0',
        lineHeight: 1.5,
        fontWeight: 400,
        flexShrink: 0,
      }}>
        Επιλέξτε την ηλικιακή σας ομάδα για την πιο ακριβή ανάλυση δέρματος
      </p>

      {/* Step label */}
      <p style={{
        fontSize: 15,
        color: '#8B7355',
        margin: '8px 0 0',
        fontWeight: 400,
        flexShrink: 0,
      }}>
        Ερώτηση 2 από 2
      </p>

      {/* Question */}
      <p style={{
        fontSize: 15,
        color: '#2C1F14',
        margin: '8px 0 14px',
        fontWeight: 400,
        lineHeight: 1.5,
        flexShrink: 0,
      }}>
        Σε ποια ηλικιακή ομάδα ανήκετε:
      </p>

      {/* Pills */}
      <div style={{
        flexShrink: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        marginBottom: 0,
      }}>
        {ageGroups.map((age) => {
          const isSelected = selected === age;
          return (
            <button
              key={age}
              onClick={() => setSelected(age)}
              style={{
                padding: '10px 0',
                border: `1px solid ${isSelected ? '#4A3728' : '#DDD8D0'}`,
                borderRadius: 24,
                fontSize: 14,
                color: isSelected ? 'white' : '#2C1F14',
                background: isSelected ? '#4A3728' : '#FAF8F5',
                cursor: 'pointer',
                fontWeight: 400,
                textAlign: 'center',
                width: '100%',
                transition: 'all 150ms ease',
              }}
            >
              {age}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Button */}
      <button
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
        style={{
          width: '100%',
          height: 50,
          flexShrink: 0,
          marginBottom: 16,
          background: selected ? '#4A3728' : '#F0EDE8',
          color: selected ? 'white' : '#8B7355',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.08em',
          border: 'none',
          borderRadius: 0,
          cursor: selected ? 'pointer' : 'not-allowed',
          textTransform: 'uppercase',
        }}
      >
        ΤΑ ΑΠΟΤΕΛΕΣΜΑΤΑ ΣΑΣ
      </button>
    </div>
  );
}

// ─── Screen 3 ─────────────────────────────────────────────────────────────────

const checklist = [
  'Αφαιρέστε το μακιγιάζ',
  'Μαλλιά μακριά από το πρόσωπο',
  'Αφαιρέστε τα γυαλιά',
  'Φυσικός φωτισμός',
];

function Screen3({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div style={{
      background: '#FAF8F5',
      height: 'calc(100dvh - 4px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 16px',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Top bar */}
      <div style={{
        height: 40,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={24} strokeWidth={2} color="#2C1F14" />
        </button>
        <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <X size={22} strokeWidth={2} color="#2C1F14" />
        </button>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(16px, 3.5vw, 19px)',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: '#2C1F14',
        margin: 0,
        letterSpacing: '0.01em',
        lineHeight: 1.2,
        flexShrink: 0,
      }}>
        ΕΤΟΙΜΑΣΤΕΙΤΕ ΓΙΑ ΤΗΝ ΚΑΜΕΡΑ
      </h1>

      {/* Divider */}
      <div style={{ height: 1, background: '#DDD8D0', flexShrink: 0, margin: '8px 0' }} />

      {/* Subtitle */}
      <p style={{
        fontSize: 12,
        fontWeight: 700,
        color: '#2C1F14',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        margin: '0 0 10px',
        flexShrink: 0,
      }}>
        ΓΙΑ ΤΑ ΚΑΛΥΤΕΡΑ ΑΠΟΤΕΛΕΣΜΑΤΑ...
      </p>

      {/* Main content row */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 12,
        flexShrink: 0,
        alignItems: 'stretch',
      }}>
        {/* Left: illustration */}
        <img
          src="https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCxNohQljMz1IBPEndCacQZpLRgO473sS6tikf"
          alt="Camera ready illustration"
          style={{
            width: '42%',
            maxWidth: 160,
            height: 'auto',
            objectFit: 'contain',
            border: '1px solid #DDD8D0',
            display: 'block',
            alignSelf: 'flex-start',
          }}
        />

        {/* Right: checklist */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          gap: 12,
          flex: 1,
        }}>
          {checklist.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src="https://6q04fcrv8e.ufs.sh/f/oRxwcUqHTaVCbU6nvTlpYcj9oBMlzKOE2yGg65Haiw1IZ7WF"
                alt="check"
                style={{ width: 16, height: 16, flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: '#2C1F14', lineHeight: 1.3 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Privacy box */}
      <div style={{
        background: '#F0EDE8',
        padding: 12,
        marginBottom: 10,
        flexShrink: 0,
      }}>
        <p style={{ fontSize: 11, color: '#2C1F14', lineHeight: 1.5, margin: 0 }}>
          Απαιτείται πρόσβαση στην κάμερά σας για την ολοκλήρωση της σάρωσης. Η διαδικασία γίνεται αποκλειστικά στη συσκευή σας. Δεν συλλέγουμε, επεξεργαζόμαστε ή αποθηκεύουμε τα δεδομένα ή την εικόνα σας. Θα διαγραφεί αυτόματα όταν κλείσετε τη σελίδα.
        </p>
      </div>

      {/* CTA button */}
      <button
        onClick={onNext}
        style={{
          height: 46,
          flexShrink: 0,
          width: '100%',
          marginBottom: 12,
          background: 'white',
          border: '1.5px solid #4A3728',
          color: '#4A3728',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 150ms ease',
        }}
      >
        ΕΝΑΡΞΗ ΣΑΡΩΣΗΣ
      </button>
    </div>
  );
}

// ─── Screen 4 — YouCam Camera Kit ────────────────────────────────────────────

declare global {
  interface Window {
    YMK: {
      init: (opts: { faceDetectionMode: string; imageFormat: string; language: string }) => void;
      addEventListener: (event: string, cb: (result: { images: { image: string }[] }) => void) => void;
      openCameraKit: () => void;
      closeCameraKit?: () => void;
    };
  }
}

function startHidingEnglishBadges(): () => void {
  let attempts = 0;
  const id = window.setInterval(() => {
    attempts++;
    const iframe = document.querySelector('#YMK-module iframe') as HTMLIFrameElement | null;
    if (!iframe) {
      if (attempts >= 33) window.clearInterval(id);
      return;
    }
    const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iDoc) {
      if (attempts >= 33) window.clearInterval(id);
      return;
    }
    const badgeRow = iDoc.querySelector('div[style*="position: absolute"][style*="top: 40px"]') as HTMLElement | null;
    if (badgeRow) {
      badgeRow.style.visibility = 'hidden';
      console.log('BadgeHide: found and hid badge row');
      window.clearInterval(id);
    } else {
      console.log('BadgeHide: badge row not found yet');
      if (attempts >= 33) window.clearInterval(id);
    }
  }, 300);
  return () => window.clearInterval(id);
}

type QualityState = 'good' | 'ok' | 'bad' | 'none';

interface QualityBadge {
  label: string;
  state: QualityState;
  stateLabel: string;
}

interface YmkQuality {
  hasFace: boolean;
  position: string;
  frontal: string;
  lighting: string;
}

const badgeColors: Record<QualityState, { bg: string; text: string }> = {
  good: { bg: 'rgba(34,197,94,0.85)', text: '#fff' },
  ok: { bg: 'rgba(234,179,8,0.85)', text: '#fff' },
  bad: { bg: 'rgba(239,68,68,0.85)', text: '#fff' },
  none: { bg: 'rgba(120,120,120,0.7)', text: '#ddd' },
};

function qualityToBadges(q: YmkQuality | null): QualityBadge[] {
  if (!q) {
    return [
      { label: 'Φωτισμός', state: 'none', stateLabel: '...' },
      { label: 'Κοιτάξτε Ευθεία', state: 'none', stateLabel: '...' },
      { label: 'Θέση Προσώπου', state: 'none', stateLabel: '...' },
    ];
  }
  if (!q.hasFace) {
    return [
      { label: 'Φωτισμός', state: 'none', stateLabel: 'Δεν Εντοπίστηκε' },
      { label: 'Κοιτάξτε Ευθεία', state: 'none', stateLabel: 'Δεν Εντοπίστηκε' },
      { label: 'Θέση Προσώπου', state: 'none', stateLabel: 'Δεν Εντοπίστηκε' },
    ];
  }

  const lighting: QualityBadge = q.lighting === 'good'
    ? { label: 'Φωτισμός', state: 'good', stateLabel: 'Καλό' }
    : q.lighting === 'ok'
      ? { label: 'Φωτισμός', state: 'ok', stateLabel: 'Εντάξει' }
      : { label: 'Φωτισμός', state: 'bad', stateLabel: 'Αυξήστε το Φως' };

  const frontal: QualityBadge = q.frontal === 'good'
    ? { label: 'Κοιτάξτε Ευθεία', state: 'good', stateLabel: 'Καλό' }
    : { label: 'Κοιτάξτε Ευθεία', state: 'bad', stateLabel: 'Όχι Καλό' };

  const position: QualityBadge = q.position === 'good'
    ? { label: 'Θέση Προσώπου', state: 'good', stateLabel: 'Καλό' }
    : q.position === 'toosmall'
      ? { label: 'Θέση Προσώπου', state: 'bad', stateLabel: 'Πλησιάστε' }
      : q.position === 'outofboundary'
        ? { label: 'Θέση Προσώπου', state: 'bad', stateLabel: 'Εκτός Πλαισίου' }
        : { label: 'Θέση Προσώπου', state: 'bad', stateLabel: 'Εκτός Πλαισίου' };

  return [lighting, frontal, position];
}

function CameraQualityOverlay({ badges }: { badges: QualityBadge[] }) {
  return (
    <div style={{
      position: 'fixed', top: 16, left: 0, width: '100%',
      display: 'flex', justifyContent: 'center', gap: 8,
      zIndex: 60, pointerEvents: 'none',
    }}>
      {badges.map((b) => {
        const colors = badgeColors[b.state];
        return (
          <div key={b.label} style={{
            background: colors.bg, color: colors.text,
            padding: '6px 14px', borderRadius: 20,
            fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}>
            <span style={{ fontSize: 10, opacity: 0.9 }}>{b.label}</span>
            <span>{b.stateLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

function Screen4({ onCapture, onBack }: { onCapture: (dataUrl: string, landmarks: Landmark[] | null) => void; onBack: () => void }) {
  const [isLoading, setIsLoading] = useState(!window.YMK);
  const capturedRef = useRef(false);
  const [quality, setQuality] = useState<YmkQuality | null>(null);

  useEffect(() => {
    let stopHiding: (() => void) | null = null;

    const handleCapture = (capturedResult: { images: { image: string }[] }) => {
      if (capturedRef.current) return;
      capturedRef.current = true;
      stopHiding?.();
      const base64 = capturedResult.images[0]?.image;
      if (base64) {
        onCapture(base64, null);
      }
    };

    const handleQuality = (q: YmkQuality) => {
      console.log('Quality event:', JSON.stringify(q));
      setQuality(q);
    };

    if (window.YMK) {
      window.YMK.addEventListener('faceDetectionCaptured', handleCapture);
      window.YMK.addEventListener('faceQualityChanged', handleQuality);
      stopHiding = startHidingEnglishBadges();
    } else {
      const pollId = window.setInterval(() => {
        if (window.YMK) {
          window.clearInterval(pollId);
          window.YMK.init({
            faceDetectionMode: 'skincare',
            imageFormat: 'base64',
            language: 'enu',
          });
          window.YMK.openCameraKit();
          window.YMK.addEventListener('faceDetectionCaptured', handleCapture);
          window.YMK.addEventListener('faceQualityChanged', handleQuality);
          stopHiding = startHidingEnglishBadges();
          setIsLoading(false);
        }
      }, 200);
      return () => {
        window.clearInterval(pollId);
        stopHiding?.();

        if (window.YMK && typeof window.YMK.closeCameraKit === 'function') {
          try {
            window.YMK.closeCameraKit();
          } catch (e) {
            console.error('Failed to close YMK camera:', e);
          }
        }

        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.touchAction = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.touchAction = '';
      };
    }

    return () => {
      stopHiding?.();

      if (window.YMK && typeof window.YMK.closeCameraKit === 'function') {
        try {
          window.YMK.closeCameraKit();
        } catch (e) {
          console.error('Failed to close YMK camera:', e);
        }
      }

      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.touchAction = '';
    };
  }, [onCapture]);

  const badges = qualityToBadges(quality);

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      background: '#000',
      flex: 1,
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', zIndex: 20,
        }}>
          <span style={{ color: 'white', fontSize: 16, fontWeight: 600, letterSpacing: '0.05em' }}>
            Φόρτωση κάμερας...
          </span>
        </div>
      )}

      <CameraQualityOverlay badges={badges} />

      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 70,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, display: 'flex', alignItems: 'center',
        }}
      >
        <X size={22} color="white" />
      </button>

    </div>
  );
}

// ─── Screen 5 ─────────────────────────────────────────────────────────────────

const tabOrder: TabKey[] = ['pores', 'dark_spots', 'dehydration', 'dark_circles', 'wrinkles'];

const STRONG_POINT_THRESHOLD = 30;
const FOCUS_AREA_THRESHOLD = 70;

// suppress unused warning — mockResults scores could drive UI in future
void mockResults.pores;
void mockResults.wrinkles;
void mockResults.dark_circles;
void mockResults.dark_spots;

type MaskUrls = Record<TabKey, string | null>;

type AnalysisScores = {
  pores: number;
  wrinkles: number;
  dark_circles: number;
  dehydration: number;
  dark_spots: number;
  primary_concern: TabKey;
  key_strength: TabKey;
};

function Screen5({
  photoDataUrl,
  skinType,
  ageGroup,
  onReset,
}: {
  photoDataUrl: string;
  capturedLandmarks?: Landmark[] | null;
  skinType: SkinType;
  ageGroup: AgeGroup;
  onReset: () => void;
}) {
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Αναλύουμε το δέρμα σας...');
  const [analysisScores, setAnalysisScores] = useState<AnalysisScores | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('pores');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [maskUrls, setMaskUrls] = useState<MaskUrls | null>(null);

  const maskFilters: Record<TabKey, string> = {
    pores:        'hue-rotate(55deg) saturate(2.5) brightness(0.18)',
    wrinkles:     'none',
    dark_circles: 'none',
    dehydration:  'none',
    dark_spots:   'none',
  };

  // Inject spin keyframes once
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const analyzePhoto = useCallback(async () => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    setLoadingMessage('Αναλύουμε τη φωτογραφία σας...');

    try {
      const submitRes = await fetch(`${SUPABASE_URL}/functions/v1/analyze-skin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ photoDataUrl, skinType, ageGroup }),
      });

      const submitData = await submitRes.json();

      if (!submitRes.ok || submitData.error) {
        throw new Error(submitData.error || `Request failed with status ${submitRes.status}`);
      }

      const taskId: string = submitData.task_id;
      if (!taskId) throw new Error('No task_id returned');

      const MAX_ATTEMPTS = 60;
      const POLL_INTERVAL = 1500;
      let attempts = 0;

      const poll = (): Promise<void> => new Promise((resolve, reject) => {
        const id = window.setInterval(async () => {
          attempts++;
          try {
            const pollRes = await fetch(
              `${SUPABASE_URL}/functions/v1/get-analysis-result?task_id=${encodeURIComponent(taskId)}`,
              {
                headers: {
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                  'apikey': SUPABASE_ANON_KEY,
                },
              },
            );
            const pollData = await pollRes.json();

            if (pollData.status === 'success' && pollData.result) {
              window.clearInterval(id);
              const scores: AnalysisScores = pollData.result;
              setAnalysisScores(scores);
              setActiveTab(scores.primary_concern);
              if (pollData.result.mask_urls) {
                setMaskUrls(pollData.result.mask_urls as MaskUrls);
              }
              resolve();
            } else if (pollData.status === 'error') {
              window.clearInterval(id);
              reject(new Error(pollData.error_message || 'Analysis failed'));
            } else if (attempts >= MAX_ATTEMPTS) {
              window.clearInterval(id);
              reject(new Error('Η ανάλυση καθυστερεί, παρακαλώ δοκιμάστε ξανά.'));
            }
          } catch (e) {
            window.clearInterval(id);
            reject(e);
          }
        }, POLL_INTERVAL);
      });

      await poll();
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisError(
        err instanceof Error && err.message.includes('καθυστερεί')
          ? err.message
          : 'Δεν μπορέσαμε να αναλύσουμε τη φωτογραφία σας. Δοκιμάστε ξανά.'
      );
    } finally {
      setAnalysisLoading(false);
    }
  }, [photoDataUrl, skinType, ageGroup]);

  useEffect(() => {
    if (!photoDataUrl) return;
    analyzePhoto();
  }, [photoDataUrl, analyzePhoto]);

  const submitLead = async () => {
    if (!leadName.trim() || !leadEmail.trim()) {
      setLeadError('Συμπληρώστε όνομα και email.');
      return;
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail.trim());
    if (!emailValid) {
      setLeadError('Το email δεν είναι έγκυρο.');
      return;
    }
    setLeadSubmitting(true);
    setLeadError(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/quiz_leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          name: leadName.trim(),
          email: leadEmail.trim(),
          skin_type: skinType,
          age_group: ageGroup,
          pores: analysisScores?.pores ?? null,
          wrinkles: analysisScores?.wrinkles ?? null,
          dark_circles: analysisScores?.dark_circles ?? null,
          dehydration: analysisScores?.dehydration ?? null,
          dark_spots: analysisScores?.dark_spots ?? null,
          primary_concern: analysisScores?.primary_concern ?? null,
          key_strength: analysisScores?.key_strength ?? null,
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Request failed with status ${response.status}`);
      }
      setLeadSubmitted(true);
    } catch (err) {
      console.error('Lead submit failed:', err);
      setLeadError('Κάτι πήγε στραβά. Δοκιμάστε ξανά.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  const product = productData[activeTab];
  const currentScore = analysisScores ? (analysisScores[activeTab as keyof Pick<AnalysisScores, TabKey>] as number) : 0;
  const tabLabel = tabLabels[activeTab];
  const isFocusArea = currentScore >= FOCUS_AREA_THRESHOLD;
  const isStrongPoint = currentScore <= STRONG_POINT_THRESHOLD;
  const showBanner = isFocusArea || isStrongPoint;

  const routineConcerns: TabKey[] = analysisScores
    ? ([...tabOrder] as TabKey[]).sort(
        (a, b) => (analysisScores[b] as number) - (analysisScores[a] as number)
      ).slice(0, 3)
    : [];
  const routineProducts = routineConcerns.map((tab) => ({ tab, ...productData[tab] }));

  return (
    <div style={{ background: '#FAF8F5', minHeight: '100dvh', padding: '0 16px', boxSizing: 'border-box' }}>

      {/* Loading overlay */}
      {analysisLoading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: '#FAF8F5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid #DDD8D0',
            borderTop: '3px solid #4A3728',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: 20,
          }} />
          <p style={{ fontSize: 15, color: '#4A3728', fontWeight: 500, margin: 0 }}>
            {loadingMessage}
          </p>
          <p style={{ fontSize: 12, color: '#8B7355', marginTop: 8 }}>
            Αυτό θα πάρει μερικά δευτερόλεπτα
          </p>
        </div>
      )}

      {/* SECTION 1 — Top bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, marginBottom: 12 }}>
        <button
          onClick={onReset}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <X size={22} strokeWidth={2} color="#2C1F14" />
        </button>
      </div>

      {/* Error state */}
      {analysisError && !analysisLoading && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#fce8ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <X size={24} color="#9B4D5A" />
          </div>
          <p style={{ fontSize: 15, color: '#2C1F14', fontWeight: 600, margin: '0 0 8px', lineHeight: 1.4 }}>
            {analysisError}
          </p>
          <button
            onClick={analyzePhoto}
            style={{
              marginTop: 16,
              padding: '12px 32px',
              background: '#4A3728',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.04em',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Δοκιμάστε ξανά
          </button>
        </div>
      )}

      {/* Results content — only shown when analysis succeeded */}
      {!analysisError && !analysisLoading && analysisScores && (<>

      {/* SECTION 2 — Title */}
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#2C1F14', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.2 }}>
        ΤΑ ΑΠΟΤΕΛΕΣΜΑΤΑ ΤΗΣ ΑΝΑΛΥΣΗΣ ΣΑΣ
      </h1>
      <p style={{ fontSize: 13, color: '#2C1F14', lineHeight: 1.5, margin: '0 0 0', fontWeight: 400 }}>
        Έχω αποκωδικοποιήσει τα αποτελέσματα της ανάλυσης δέρματός σας για να σας δώσω εξατομικευμένες συμβουλές και προτάσεις περιποίησης για τον <strong>τύπο δέρματος + ηλικία</strong> σας. Περιηγηθείτε στις καρτέλες παρακάτω!
      </p>

      {/* SECTION 3 — Tabs */}
      <div
        className="scrollbar-hide"
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          margin: '12px -16px',
          padding: '0 16px 4px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          touchAction: 'pan-x',
          overscrollBehaviorX: 'contain',
        } as React.CSSProperties}>
        {tabOrder.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 24,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
                background: isActive ? '#4A3728' : 'white',
                border: `1px solid ${isActive ? '#4A3728' : '#DDD8D0'}`,
                color: isActive ? 'white' : '#2C1F14',
                transition: 'all 150ms ease',
              }}
            >
              <img
                src={tabIcons[tab]}
                alt=""
                style={{
                  width: 24,
                  height: 24,
                  objectFit: 'contain',
                  filter: isActive ? 'invert(1)' : 'none',
                  mixBlendMode: isActive ? 'screen' : 'multiply',
                }}
              />
              {tabLabels[tab]}
            </button>
          );
        })}
      </div>

      {/* SECTION 4 — Photo + overlay */}
      <div style={{
        width: 'calc(100% + 32px)',
        margin: '0 -16px',
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: '3 / 4',
        borderRadius: 0,
        transform: 'scaleX(-1)',
      }}>
        <img
          src={photoDataUrl || 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=600'}
          alt="Skin analysis"
          style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center center' }}
        />
        {/* mask_urls are pre-signed S3 URLs that expire ~2h after generation; valid for current session only */}
        {maskUrls?.[activeTab] && (
          <img
            src={maskUrls[activeTab]!}
            alt=""
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center center',
              pointerEvents: 'none', opacity: 0.8,
              filter: maskFilters[activeTab],
            }}
          />
        )}
      </div>

      {/* SECTION 5 — Focus/Strength label (threshold-based) */}
      {showBanner && (
        <div style={{
          width: 'calc(100% + 32px)',
          padding: '10px 16px',
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          background: isFocusArea ? '#fce8ed' : '#e8f0fc',
          color: '#4A3728',
          boxSizing: 'border-box',
          display: 'block',
          margin: '0 -16px',
        } as React.CSSProperties}>
          {isFocusArea
            ? `${tabLabel.toUpperCase()} ΕΙΝΑΙ Η ΠΕΡΙΟΧΗ ΕΣΤΙΑΣΗΣ ΣΑΣ`
            : `${tabLabel.toUpperCase()} ΕΙΝΑΙ ΤΟ ΔΥΝΑΤΟ ΣΑΣ ΣΗΜΕΙΟ`}
        </div>
      )}

      {/* SECTION 6 — Copy text */}
      <p style={{ fontSize: 14, color: '#2C1F14', lineHeight: 1.6, padding: '16px 0 8px', margin: 0 }}>
        Μπορείτε να στοχεύσετε και να βελτιώσετε την εμφάνιση των <strong>{tabLabel.toLowerCase()}</strong> με την παρακάτω άμεση λύση αναζωογόνησης δέρματος!
      </p>

      {/* SECTION 7 — Product card */}
      <div style={{ background: 'white', border: '0.5px solid #DDD8D0', marginBottom: 0 }}>

        {/* 7a — Product image */}
        <div style={{ width: '100%', height: 280, overflow: 'hidden' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              display: 'block',
            }}
          />
        </div>

        {/* 7b — Product info */}
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#2C1F14', margin: 0, textTransform: 'uppercase', flex: 1 }}>
              {product.name}
            </p>
            <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}>
              <Heart size={20} color="#2C1F14" strokeWidth={1.5} />
            </button>
          </div>

          <span style={{
            fontSize: 12,
            border: '1px solid #DDD8D0',
            borderRadius: 2,
            padding: '3px 8px',
            color: '#2C1F14',
            display: 'inline-block',
            margin: '8px 0',
          }}>
            {product.size}
          </span>

          {product.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ color: '#C8A96E', fontSize: 14 }}>★★★★★</span>
              <span style={{ fontSize: 13, color: '#8B7355' }}>
                {product.rating} ({product.reviews.toLocaleString()})
              </span>
            </div>
          )}

          <p style={{ fontSize: 18, fontWeight: 700, color: '#2C1F14', margin: '8px 0' }}>{product.price}</p>

          <button
            onClick={() => window.open(product.url, '_blank')}
            style={{
              width: '100%',
              height: 50,
              background: '#4A3728',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.06em',
              borderRadius: 0,
              border: 'none',
              marginBottom: 16,
              cursor: 'pointer',
            }}
          >
            ΠΡΟΣΘΗΚΗ ΣΤΟ ΚΑΛΑΘΙ
          </button>
        </div>

        {/* 7c — Key benefits */}
        <div style={{ padding: '0 16px 16px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: '#2C1F14', margin: '0 0 12px' }}>
            ΚΥΡΙΑ ΟΦΕΛΗ
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {product.benefits.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="10" cy="10" r="9" stroke="#C8A96E" strokeWidth="1" />
                  <path d="M6 10l3 3 5-5" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 13, color: '#2C1F14', lineHeight: 1.4 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7d — Unlock button */}
        <button
          onClick={() => window.open(product.url, '_blank')}
          style={{
            width: '100%',
            height: 48,
            background: '#4A3728',
            border: 'none',
            color: 'white',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.06em',
            borderRadius: 0,
            cursor: 'pointer',
          }}
        >
          ΞΕΚΛΕΙΔΩΣΤΕ ΕΞΕΙΔΙΚΕΥΜΕΝΕΣ ΣΥΜΒΟΥΛΕΣ ΓΙΑ {tabLabel.toUpperCase()}
        </button>
      </div>

      {/* SECTION 8 — Personalised skincare routine */}
      <div style={{ background: '#F5F3F0', padding: '20px 16px', marginTop: 0, margin: '0 -16px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#2C1F14', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.01em' }}>
          Η ΕΞΑΤΟΜΙΚΕΥΜΕΝΗ ΡΟΥΤΙΝΑ ΠΕΡΙΠΟΙΗΣΗΣ ΣΑΣ
        </h2>
        <p style={{ fontSize: 13, color: '#2C1F14', lineHeight: 1.5, margin: 0 }}>
          Ανακαλύψτε την ιδανική εξατομικευμένη ρουτίνα περιποίησης, βασισμένη στον τύπο δέρματός σας και τα αποτελέσματα της ανάλυσής σας!
        </p>

        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 16,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}>
          {routineProducts.map((rp) => (
            <div key={rp.tab} style={{ width: 160, flexShrink: 0, background: 'white', border: '0.5px solid #DDD8D0', position: 'relative' }}>
              <button
                style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer', zIndex: 1 }}
                aria-label="Αποθήκευση"
              >
                <Heart size={18} color="#2C1F14" strokeWidth={1.5} />
              </button>
              <img
                src={rp.image}
                alt={rp.name}
                style={{
                  width: '100%',
                  height: 180,
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  display: 'block',
                }}
              />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2C1F14', padding: '8px 8px 4px', margin: 0, textTransform: 'uppercase', lineHeight: 1.3 }}>
                {rp.name}
              </p>
              <p style={{ fontSize: 11, color: '#8B7355', padding: '0 8px', margin: 0 }}>{rp.size}</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#2C1F14', padding: '4px 8px', margin: 0 }}>{rp.price}</p>
              <button
                onClick={() => window.open(rp.url, '_blank')}
                style={{
                  width: 'calc(100% - 16px)',
                  margin: '0 8px 8px',
                  height: 36,
                  border: '1px solid #4A3728',
                  background: 'white',
                  color: '#4A3728',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ΠΡΟΣΘΗΚΗ ΣΤΟ ΚΑΛΑΘΙ
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 9 — Save your results / lead capture */}
      <div style={{ padding: '24px 16px', background: '#FAF8F5' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#2C1F14', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.01em' }}>
          ΑΠΟΘΗΚΕΥΣΤΕ ΤΑ ΑΠΟΤΕΛΕΣΜΑΤΑ ΣΑΣ
        </h2>
        <p style={{ fontSize: 13, color: '#2C1F14', lineHeight: 1.5, margin: '0 0 16px' }}>
          Αφήστε τα στοιχεία σας για να λάβετε τα αποτελέσματα της ανάλυσής σας και εξατομικευμένες προτάσεις περιποίησης στο email σας.
        </p>

        {leadSubmitted ? (
          <div style={{ padding: '16px', background: '#e8f0fc', borderRadius: 4, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#2C1F14', margin: 0, fontWeight: 600 }}>
              Ευχαριστούμε! Τα αποτελέσματά σας αποθηκεύτηκαν.
            </p>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="Όνομα"
              style={{
                width: '100%', boxSizing: 'border-box', height: 44, padding: '0 12px',
                marginBottom: 10, border: '1px solid #DDD8D0', borderRadius: 0, fontSize: 14,
                background: 'white', color: '#2C1F14',
              }}
            />
            <input
              type="email"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              placeholder="Email"
              style={{
                width: '100%', boxSizing: 'border-box', height: 44, padding: '0 12px',
                marginBottom: 10, border: '1px solid #DDD8D0', borderRadius: 0, fontSize: 14,
                background: 'white', color: '#2C1F14',
              }}
            />
            {leadError && (
              <p style={{ fontSize: 12, color: '#b91c1c', margin: '0 0 10px' }}>{leadError}</p>
            )}
            <button
              onClick={submitLead}
              disabled={leadSubmitting}
              style={{
                width: '100%', height: 48, background: leadSubmitting ? '#8B7355' : '#4A3728',
                color: 'white', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
                border: 'none', cursor: leadSubmitting ? 'default' : 'pointer',
              }}
            >
              {leadSubmitting ? 'ΑΠΟΘΗΚΕΥΣΗ...' : 'ΑΠΟΘΗΚΕΥΣΗ ΑΠΟΤΕΛΕΣΜΑΤΩΝ'}
            </button>
          </>
        )}
      </div>

      </>)}

    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>(0);
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [capturedLandmarks, setCapturedLandmarks] = useState<Landmark[] | null>(null);
  const [skinType, setSkinType] = useState<SkinType>('normal');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('25-34');
  const [visible, setVisible] = useState(true);

  const navigate = (to: Screen) => {
    setVisible(false);
    setTimeout(() => {
      setScreen(to);
      setVisible(true);
    }, 220);
  };

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#DDD8D0' }}>
      <div
        id="YMK-module"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: screen === 4 ? 50 : -100,
          opacity: screen === 4 ? 1 : 0,
          visibility: screen === 4 ? 'visible' : 'hidden',
          pointerEvents: screen === 4 ? 'auto' : 'none',
          transition: 'opacity 220ms ease',
        }}
      />
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: 430,
          minWidth: 0,
          overflowX: 'clip',
          overflowY: 'auto',
          height: '100dvh',
          background: '#FAF8F5',
          position: 'relative',
          boxShadow: '0 0 40px rgba(0,0,0,0.12)',
        }}
      >
        {screen >= 1 && screen !== 4 && (
          <ProgressBar pct={screen === 1 ? 20 : (screen / 5) * 100} />
        )}

        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 220ms ease',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {screen === 0 && (
            <Screen0 onNext={() => navigate(1)} />
          )}
          {screen === 1 && (
            <Screen1 onBack={() => navigate(0)} onNext={(skin) => { setSkinType(skin); navigate(2); }} />
          )}
          {screen === 2 && (
            <Screen2 onBack={() => navigate(1)} onNext={(age) => { setAgeGroup(age); navigate(3); }} />
          )}
          {screen === 3 && (
            <Screen3 onBack={() => navigate(2)} onNext={() => {
              console.log('YMK exists?', typeof window.YMK);
              try {
                window.YMK.init({ faceDetectionMode: 'skincare', imageFormat: 'base64', language: 'enu' });
                console.log('YMK.init called successfully');
                window.YMK.openCameraKit();
                console.log('YMK.openCameraKit called successfully');
              } catch (err) {
                console.error('YMK camera start failed:', err);
              }
              navigate(4);
            }} />
          )}
          {screen === 4 && (
            <Screen4
              onCapture={(url, landmarks) => {
                setPhotoDataUrl(url);
                setCapturedLandmarks(landmarks);
                navigate(5);
              }}
              onBack={() => navigate(3)}
            />
          )}
          {screen === 5 && (
            <Screen5
              photoDataUrl={photoDataUrl}
              capturedLandmarks={capturedLandmarks}
              skinType={skinType}
              ageGroup={ageGroup}
              onReset={() => navigate(0)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
