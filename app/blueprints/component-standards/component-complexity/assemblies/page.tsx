import { Sandpack } from '@codesandbox/sandpack-react';
import Link from 'next/link';

export const metadata = {
  title: 'Assemblies | Component Standards',
  description:
    'Assemblies are product-level flows built from system layers. They rarely belong inside the system itself.',
  keywords: [
    'Assemblies',
    'Design System',
    'Product Flows',
    'Checkout',
    'Dashboards',
  ],
  complexity: 'assembly',
};

const checkoutCode = `// Production-grade Checkout Assembly
// This demonstrates how assemblies orchestrate primitives, compounds, and composers
// into complex product flows that live OUTSIDE the design system.

import { useState, useCallback, useMemo, useEffect, useId, createContext, useContext } from 'react';

// ============================================================================
// DESIGN SYSTEM PRIMITIVES (would be imported from @your-org/design-system)
// ============================================================================

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled,
  loading,
  fullWidth,
  children,
  onClick,
  type = 'button',
  'aria-label': ariaLabel
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '14px 24px' : '10px 18px',
    fontSize: size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'inherit'
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#0066cc', color: 'white' },
    secondary: { backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ddd' },
    ghost: { backgroundColor: 'transparent', color: '#0066cc' },
    danger: { backgroundColor: '#dc3545', color: 'white' }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      style={{ ...baseStyles, ...variantStyles[variant] }}
    >
      {loading && <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
      {children}
    </button>
  );
}

// ============================================================================
// DESIGN SYSTEM COMPOUNDS (TextField, Select, Radio, Checkbox, Card, Badge)
// ============================================================================

interface TextFieldProps {
  id?: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
}

function TextField({ 
  id: providedId,
  label, 
  error, 
  hint,
  required, 
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  disabled,
  autoComplete,
  maxLength,
  pattern
}: TextFieldProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = error ? \`\${id}-error\` : undefined;
  const hintId = hint ? \`\${id}-hint\` : undefined;
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <label 
        htmlFor={id}
        style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: 500,
          fontSize: '14px',
          color: error ? '#dc3545' : '#333'
        }}
      >
        {label}
        {required && <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>}
      </label>
      
      <input 
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        pattern={pattern}
        aria-invalid={!!error}
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
        aria-required={required}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: \`1px solid \${error ? '#dc3545' : '#ddd'}\`,
          borderRadius: '8px',
          fontSize: '15px',
          boxSizing: 'border-box',
          backgroundColor: disabled ? '#f8f8f8' : 'white',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          outline: 'none'
        }}
      />
      
      {hint && !error && (
        <p id={hintId} style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
          {hint}
        </p>
      )}
      
      {error && (
        <p id={errorId} role="alert" style={{ margin: '4px 0 0', fontSize: '13px', color: '#dc3545' }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps {
  id?: string;
  label: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

function Select({ id: providedId, label, options, value, onChange, error, required, placeholder }: SelectProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px', color: error ? '#dc3545' : '#333' }}>
        {label}
        {required && <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={!!error}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: \`1px solid \${error ? '#dc3545' : '#ddd'}\`,
          borderRadius: '8px',
          fontSize: '15px',
          backgroundColor: 'white',
          cursor: 'pointer'
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
        ))}
      </select>
      {error && <p role="alert" style={{ margin: '4px 0 0', fontSize: '13px', color: '#dc3545' }}>{error}</p>}
    </div>
  );
}

interface RadioGroupProps {
  legend: string;
  name: string;
  options: Array<{ value: string; label: string; description?: string; price?: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

function RadioGroup({ legend, name, options, value, onChange, error }: RadioGroupProps) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px' }}>
      <legend style={{ fontWeight: 500, fontSize: '14px', marginBottom: '12px', color: error ? '#dc3545' : '#333' }}>{legend}</legend>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map(opt => (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 16px',
              border: \`2px solid \${value === opt.value ? '#0066cc' : '#ddd'}\`,
              borderRadius: '8px',
              cursor: opt.disabled ? 'not-allowed' : 'pointer',
              backgroundColor: value === opt.value ? '#f0f7ff' : 'white',
              opacity: opt.disabled ? 0.5 : 1,
              transition: 'all 0.15s'
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange?.(opt.value)}
              disabled={opt.disabled}
              style={{ marginTop: '2px' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500, fontSize: '14px' }}>{opt.label}</span>
                {opt.price && <span style={{ fontWeight: 600, color: '#0066cc' }}>{opt.price}</span>}
              </div>
              {opt.description && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>{opt.description}</p>}
            </div>
          </label>
        ))}
      </div>
      {error && <p role="alert" style={{ margin: '8px 0 0', fontSize: '13px', color: '#dc3545' }}>{error}</p>}
    </fieldset>
  );
}

interface CheckboxProps {
  id?: string;
  label: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
}

function Checkbox({ id: providedId, label, checked, onChange, error }: CheckboxProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  
  return (
    <div style={{ marginBottom: '12px' }}>
      <label htmlFor={id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          aria-invalid={!!error}
          style={{ marginTop: '2px', width: '18px', height: '18px' }}
        />
        <span style={{ fontSize: '14px', color: '#333' }}>{label}</span>
      </label>
      {error && <p role="alert" style={{ margin: '4px 0 0 28px', fontSize: '13px', color: '#dc3545' }}>{error}</p>}
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
}

function Card({ children, title, subtitle, padding = 'md', variant = 'default' }: CardProps) {
  const paddingMap = { none: 0, sm: 12, md: 20, lg: 28 };
  const variantStyles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: 'white', border: '1px solid #e5e5e5' },
    elevated: { backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    outlined: { backgroundColor: 'transparent', border: '1px solid #ddd' }
  };
  
  return (
    <div style={{ borderRadius: '12px', padding: paddingMap[padding], ...variantStyles[variant] }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: '16px' }}>
          {title && <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{title}</h3>}
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

function Badge({ children, variant = 'default' }: BadgeProps) {
  const colors: Record<string, { bg: string; text: string }> = {
    default: { bg: '#f0f0f0', text: '#333' },
    success: { bg: '#d4edda', text: '#155724' },
    warning: { bg: '#fff3cd', text: '#856404' },
    error: { bg: '#f8d7da', text: '#721c24' },
    info: { bg: '#cce5ff', text: '#004085' }
  };
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      backgroundColor: colors[variant].bg,
      color: colors[variant].text
    }}>
      {children}
    </span>
  );
}

// ============================================================================
// DESIGN SYSTEM COMPOSERS (FormComposer pattern for validation orchestration)
// ============================================================================

interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

interface FieldConfig {
  name: string;
  rules: ValidationRule[];
}

function useFormValidation<T extends Record<string, string>>(fields: FieldConfig[]) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback((name: keyof T, value: string) => {
    const field = fields.find(f => f.name === name);
    if (!field) return undefined;
    
    for (const rule of field.rules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
    return undefined;
  }, [fields]);

  const validateAll = useCallback((data: T) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    
    for (const field of fields) {
      const error = validateField(field.name as keyof T, data[field.name as keyof T] || '');
      if (error) {
        newErrors[field.name as keyof T] = error;
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    setTouched(Object.fromEntries(fields.map(f => [f.name, true])) as Partial<Record<keyof T, boolean>>);
    return isValid;
  }, [fields, validateField]);

  const touchField = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return { errors, touched, validateField, validateAll, touchField, clearErrors, setErrors };
}

// ============================================================================
// PRODUCT-SPECIFIC TYPES (Business domain models)
// ============================================================================

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  sku: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface PaymentMethod {
  type: 'card' | 'paypal' | 'applepay' | 'klarna';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  saveCard?: boolean;
}

interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
}

interface CheckoutState {
  step: 'cart' | 'shipping' | 'payment' | 'review' | 'confirmation';
  cart: CartItem[];
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress | null;
  useSameAddress: boolean;
  shippingMethod: string;
  paymentMethod: PaymentMethod;
  promoCode: PromoCode | null;
  promoInput: string;
  giftMessage: string;
  isGift: boolean;
  acceptedTerms: boolean;
  subscribeNewsletter: boolean;
  orderNumber: string | null;
  isProcessing: boolean;
}

// ============================================================================
// CHECKOUT CONTEXT (State management for the assembly)
// ============================================================================

interface CheckoutContextType {
  state: CheckoutState;
  updateCart: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateShippingAddress: (field: keyof ShippingAddress, value: string) => void;
  updateBillingAddress: (field: keyof ShippingAddress, value: string) => void;
  setUseSameAddress: (same: boolean) => void;
  setShippingMethod: (methodId: string) => void;
  updatePaymentMethod: (updates: Partial<PaymentMethod>) => void;
  applyPromoCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  removePromoCode: () => void;
  setIsGift: (isGift: boolean) => void;
  setGiftMessage: (message: string) => void;
  setAcceptedTerms: (accepted: boolean) => void;
  setSubscribeNewsletter: (subscribe: boolean) => void;
  goToStep: (step: CheckoutState['step']) => void;
  placeOrder: () => Promise<void>;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error('useCheckout must be used within CheckoutProvider');
  return context;
}

// ============================================================================
// MOCK DATA (Would come from API in production)
// ============================================================================

const MOCK_CART: CartItem[] = [
  { id: '1', name: 'Premium Wireless Headphones', price: 299.99, quantity: 1, image: '', variant: 'Midnight Black', sku: 'WH-1000XM5-BLK' },
  { id: '2', name: 'USB-C Charging Cable (2m)', price: 24.99, quantity: 2, image: '', sku: 'CBL-USBC-2M' },
  { id: '3', name: 'Leather Carrying Case', price: 49.99, quantity: 1, image: '', variant: 'Brown', sku: 'CASE-LTH-BRN' }
];

const SHIPPING_METHODS: ShippingMethod[] = [
  { id: 'standard', name: 'Standard Shipping', description: 'Delivered by postal service', price: 5.99, estimatedDays: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', description: 'Priority handling and delivery', price: 14.99, estimatedDays: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Shipping', description: 'Next business day delivery', price: 29.99, estimatedDays: '1 business day' },
  { id: 'free', name: 'Free Shipping', description: 'Orders over $100 qualify', price: 0, estimatedDays: '7-10 business days' }
];

const PROMO_CODES: Record<string, PromoCode> = {
  'SAVE10': { code: 'SAVE10', type: 'percentage', value: 10 },
  'WELCOME20': { code: 'WELCOME20', type: 'percentage', value: 20, minOrderValue: 50 },
  'FLAT15': { code: 'FLAT15', type: 'fixed', value: 15, minOrderValue: 75 }
};

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
];

// ============================================================================
// CHECKOUT PROVIDER (Assembly-level state orchestration)
// ============================================================================

function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CheckoutState>({
    step: 'cart',
    cart: MOCK_CART,
    shippingAddress: { firstName: '', lastName: '', email: '', phone: '', address1: '', address2: '', city: '', state: '', zipCode: '', country: 'US' },
    billingAddress: null,
    useSameAddress: true,
    shippingMethod: 'standard',
    paymentMethod: { type: 'card' },
    promoCode: null,
    promoInput: '',
    giftMessage: '',
    isGift: false,
    acceptedTerms: false,
    subscribeNewsletter: false,
    orderNumber: null,
    isProcessing: false
  });

  const subtotal = useMemo(() => 
    state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.cart]
  );

  const shippingCost = useMemo(() => {
    if (subtotal >= 100 && state.shippingMethod === 'free') return 0;
    const method = SHIPPING_METHODS.find(m => m.id === state.shippingMethod);
    return method?.price || 0;
  }, [state.shippingMethod, subtotal]);

  const discount = useMemo(() => {
    if (!state.promoCode) return 0;
    if (state.promoCode.minOrderValue && subtotal < state.promoCode.minOrderValue) return 0;
    return state.promoCode.type === 'percentage' 
      ? subtotal * (state.promoCode.value / 100)
      : state.promoCode.value;
  }, [state.promoCode, subtotal]);

  const tax = useMemo(() => (subtotal - discount + shippingCost) * 0.0825, [subtotal, discount, shippingCost]);
  const total = useMemo(() => subtotal - discount + shippingCost + tax, [subtotal, discount, shippingCost, tax]);

  const updateCart = useCallback((itemId: string, quantity: number) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.map(item => item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item).filter(item => item.quantity > 0)
    }));
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setState(prev => ({ ...prev, cart: prev.cart.filter(item => item.id !== itemId) }));
  }, []);

  const updateShippingAddress = useCallback((field: keyof ShippingAddress, value: string) => {
    setState(prev => ({ ...prev, shippingAddress: { ...prev.shippingAddress, [field]: value } }));
  }, []);

  const updateBillingAddress = useCallback((field: keyof ShippingAddress, value: string) => {
    setState(prev => ({
      ...prev,
      billingAddress: { ...(prev.billingAddress || prev.shippingAddress), [field]: value }
    }));
  }, []);

  const setUseSameAddress = useCallback((same: boolean) => {
    setState(prev => ({ ...prev, useSameAddress: same, billingAddress: same ? null : prev.shippingAddress }));
  }, []);

  const setShippingMethod = useCallback((methodId: string) => {
    setState(prev => ({ ...prev, shippingMethod: methodId }));
  }, []);

  const updatePaymentMethod = useCallback((updates: Partial<PaymentMethod>) => {
    setState(prev => ({ ...prev, paymentMethod: { ...prev.paymentMethod, ...updates } }));
  }, []);

  const applyPromoCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const promo = PROMO_CODES[code.toUpperCase()];
    if (!promo) {
      return { success: false, error: 'Invalid promo code' };
    }
    
    // Validate minimum order value before applying
    const currentSubtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (promo.minOrderValue && currentSubtotal < promo.minOrderValue) {
      return { 
        success: false, 
        error: \`This promo code requires a minimum order of $\${promo.minOrderValue}\` 
      };
    }
    
    setState(prev => ({ ...prev, promoCode: promo, promoInput: '' }));
    return { success: true };
  }, [state.cart]);

  const removePromoCode = useCallback(() => {
    setState(prev => ({ ...prev, promoCode: null }));
  }, []);

  const setIsGift = useCallback((isGift: boolean) => {
    setState(prev => ({ ...prev, isGift, giftMessage: isGift ? prev.giftMessage : '' }));
  }, []);

  const setGiftMessage = useCallback((message: string) => {
    setState(prev => ({ ...prev, giftMessage: message }));
  }, []);

  const setAcceptedTerms = useCallback((accepted: boolean) => {
    setState(prev => ({ ...prev, acceptedTerms: accepted }));
  }, []);

  const setSubscribeNewsletter = useCallback((subscribe: boolean) => {
    setState(prev => ({ ...prev, subscribeNewsletter: subscribe }));
  }, []);

  const goToStep = useCallback((step: CheckoutState['step']) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const placeOrder = useCallback(async () => {
    setState(prev => ({ ...prev, isProcessing: true }));
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    const orderNumber = \`ORD-\${Date.now().toString(36).toUpperCase()}\`;
    setState(prev => ({ ...prev, isProcessing: false, orderNumber, step: 'confirmation' }));
  }, []);

  const value: CheckoutContextType = {
    state, updateCart, removeFromCart, updateShippingAddress, updateBillingAddress,
    setUseSameAddress, setShippingMethod, updatePaymentMethod, applyPromoCode,
    removePromoCode, setIsGift, setGiftMessage, setAcceptedTerms, setSubscribeNewsletter,
    goToStep, placeOrder, subtotal, shippingCost, discount, tax, total
  };

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

// ============================================================================
// STEP COMPONENTS (Product-specific UI compositions)
// ============================================================================

function CartStep() {
  const { state, updateCart, removeFromCart, goToStep, subtotal } = useCheckout();
  
  if (state.cart.length === 0) {
    return (
      <Card variant="elevated">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>Cart is empty</p>
          <p style={{ color: '#666', marginBottom: '24px' }}>Add some items to get started</p>
          <Button variant="primary">Continue Shopping</Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card variant="elevated" title="Shopping Cart" subtitle={\`\${state.cart.length} item\${state.cart.length !== 1 ? 's' : ''}\`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {state.cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#e0e0e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' }}>
                Image
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{item.name}</h4>
                    {item.variant && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>{item.variant}</p>}
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#999' }}>SKU: {item.sku}</p>
                  </div>
                  <p style={{ margin: 0, fontWeight: 600 }}>\${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button size="sm" variant="secondary" onClick={() => updateCart(item.id, item.quantity - 1)} aria-label="Decrease quantity">-</Button>
                    <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 500 }}>{item.quantity}</span>
                    <Button size="sm" variant="secondary" onClick={() => updateCart(item.id, item.quantity + 1)} aria-label="Increase quantity">+</Button>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.id)}>Remove</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost">Continue Shopping</Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '18px' }}>Subtotal: <strong>\${subtotal.toFixed(2)}</strong></span>
          <Button onClick={() => goToStep('shipping')}>Proceed to Checkout</Button>
        </div>
      </div>
    </div>
  );
}

function ShippingStep() {
  const { state, updateShippingAddress, setShippingMethod, goToStep, subtotal } = useCheckout();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const { applyPromoCode, removePromoCode } = useCheckout();
  
  const { errors, validateAll, touchField } = useFormValidation<ShippingAddress>([
    { name: 'firstName', rules: [{ validate: v => v.length > 0, message: 'First name is required' }] },
    { name: 'lastName', rules: [{ validate: v => v.length > 0, message: 'Last name is required' }] },
    { name: 'email', rules: [
      { validate: v => v.length > 0, message: 'Email is required' },
      { validate: v => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v), message: 'Enter a valid email address' }
    ]},
    { name: 'phone', rules: [
      { validate: v => v.length > 0, message: 'Phone is required' },
      { validate: v => /^[\d\s\-\(\)\+]{10,}$/.test(v), message: 'Enter a valid phone number' }
    ]},
    { name: 'address1', rules: [{ validate: v => v.length > 0, message: 'Address is required' }] },
    { name: 'city', rules: [{ validate: v => v.length > 0, message: 'City is required' }] },
    { name: 'state', rules: [{ validate: v => v.length > 0, message: 'State is required' }] },
    { name: 'zipCode', rules: [
      { validate: v => v.length > 0, message: 'ZIP code is required' },
      { validate: v => /^\\d{5}(-\\d{4})?$/.test(v), message: 'Enter a valid ZIP code' }
    ]}
  ]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim() || applyingPromo) return; // Prevent multiple simultaneous calls
    setApplyingPromo(true);
    setPromoError('');
    try {
      const result = await applyPromoCode(promoInput);
      if (!result.success) {
        setPromoError(result.error || 'Invalid promo code');
      }
    } catch (error) {
      setPromoError('Failed to apply promo code. Please try again.');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleContinue = () => {
    if (validateAll(state.shippingAddress)) {
      goToStep('payment');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Card variant="elevated" title="Contact Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <TextField label="First Name" required value={state.shippingAddress.firstName} onChange={e => updateShippingAddress('firstName', e.target.value)} onBlur={() => touchField('firstName')} error={errors.firstName} autoComplete="given-name" />
            <TextField label="Last Name" required value={state.shippingAddress.lastName} onChange={e => updateShippingAddress('lastName', e.target.value)} onBlur={() => touchField('lastName')} error={errors.lastName} autoComplete="family-name" />
          </div>
          <TextField label="Email" type="email" required value={state.shippingAddress.email} onChange={e => updateShippingAddress('email', e.target.value)} onBlur={() => touchField('email')} error={errors.email} autoComplete="email" hint="We'll send your order confirmation here" />
          <TextField label="Phone" type="tel" required value={state.shippingAddress.phone} onChange={e => updateShippingAddress('phone', e.target.value)} onBlur={() => touchField('phone')} error={errors.phone} autoComplete="tel" hint="For delivery updates" />
        </Card>

        <Card variant="elevated" title="Shipping Address">
          <TextField label="Address" required value={state.shippingAddress.address1} onChange={e => updateShippingAddress('address1', e.target.value)} onBlur={() => touchField('address1')} error={errors.address1} autoComplete="address-line1" />
          <TextField label="Apartment, suite, etc. (optional)" value={state.shippingAddress.address2} onChange={e => updateShippingAddress('address2', e.target.value)} autoComplete="address-line2" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <TextField label="City" required value={state.shippingAddress.city} onChange={e => updateShippingAddress('city', e.target.value)} onBlur={() => touchField('city')} error={errors.city} autoComplete="address-level2" />
            <Select label="State" required options={US_STATES} value={state.shippingAddress.state} onChange={v => updateShippingAddress('state', v)} error={errors.state} placeholder="Select..." />
            <TextField label="ZIP Code" required value={state.shippingAddress.zipCode} onChange={e => updateShippingAddress('zipCode', e.target.value)} onBlur={() => touchField('zipCode')} error={errors.zipCode} autoComplete="postal-code" pattern="[0-9]{5}(-[0-9]{4})?" />
          </div>
        </Card>

        <Card variant="elevated" title="Shipping Method">
          <RadioGroup
            legend="Select shipping speed"
            name="shippingMethod"
            value={state.shippingMethod}
            onChange={setShippingMethod}
            options={SHIPPING_METHODS.map(m => ({
              value: m.id,
              label: m.name,
              description: m.estimatedDays,
              price: m.price === 0 ? 'FREE' : \`$\${m.price.toFixed(2)}\`,
              disabled: m.id === 'free' && subtotal < 100
            }))}
          />
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="ghost" onClick={() => goToStep('cart')}>Back to Cart</Button>
          <Button onClick={handleContinue}>Continue to Payment</Button>
        </div>
      </div>

      <OrderSummary>
        <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '16px' }}>
          <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Promo Code</p>
          {state.promoCode ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#d4edda', borderRadius: '6px' }}>
              <span style={{ fontWeight: 500, color: '#155724' }}>{state.promoCode.code}</span>
              <Button size="sm" variant="ghost" onClick={removePromoCode}>Remove</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={promoInput}
                onChange={e => { setPromoInput(e.target.value); setPromoError(''); }}
                placeholder="Enter code"
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
              />
              <Button size="sm" variant="secondary" onClick={handleApplyPromo} loading={applyingPromo} disabled={!promoInput.trim()}>Apply</Button>
            </div>
          )}
          {promoError && <p style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>{promoError}</p>}
        </div>
      </OrderSummary>
    </div>
  );
}

function PaymentStep() {
  const { state, updatePaymentMethod, setUseSameAddress, updateBillingAddress, setIsGift, setGiftMessage, goToStep } = useCheckout();
  
  const { errors, validateAll, touchField } = useFormValidation<{ cardNumber: string; expiryDate: string; cvv: string; cardholderName: string }>([
    { name: 'cardholderName', rules: [{ validate: v => v.length > 0, message: 'Cardholder name is required' }] },
    { name: 'cardNumber', rules: [
      { validate: v => v.length > 0, message: 'Card number is required' },
      { validate: v => /^\d{13,19}$/.test(v.replace(/\s/g, '')), message: 'Enter a valid card number' }
    ]},
    { name: 'expiryDate', rules: [
      { validate: v => v.length > 0, message: 'Expiry date is required' },
      { validate: v => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v), message: 'Use MM/YY format' }
    ]},
    { name: 'cvv', rules: [
      { validate: v => v.length > 0, message: 'CVV is required' },
      { validate: v => /^\\d{3,4}$/.test(v), message: 'Enter a valid CVV' }
    ]}
  ]);

  const handleContinue = () => {
    if (state.paymentMethod.type === 'card') {
      const cardData = {
        cardholderName: state.paymentMethod.cardholderName || '',
        cardNumber: state.paymentMethod.cardNumber || '',
        expiryDate: state.paymentMethod.expiryDate || '',
        cvv: state.paymentMethod.cvv || ''
      };
      if (!validateAll(cardData)) return;
    }
    goToStep('review');
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\\D/g, '').slice(0, 16);
    return digits.replace(/(\\d{4})(?=\\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\\D/g, '').slice(0, 4);
    if (digits.length >= 2) return \`\${digits.slice(0, 2)}/\${digits.slice(2)}\`;
    return digits;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Card variant="elevated" title="Payment Method">
          <RadioGroup
            legend="Select payment method"
            name="paymentType"
            value={state.paymentMethod.type}
            onChange={type => updatePaymentMethod({ type: type as PaymentMethod['type'] })}
            options={[
              { value: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard, Amex, Discover' },
              { value: 'paypal', label: 'PayPal', description: 'Pay with your PayPal account' },
              { value: 'applepay', label: 'Apple Pay', description: 'Quick checkout with Apple Pay' },
              { value: 'klarna', label: 'Klarna', description: 'Buy now, pay later in 4 installments' }
            ]}
          />

          {state.paymentMethod.type === 'card' && (
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
              <TextField label="Cardholder Name" required value={state.paymentMethod.cardholderName || ''} onChange={e => updatePaymentMethod({ cardholderName: e.target.value })} onBlur={() => touchField('cardholderName')} error={errors.cardholderName} autoComplete="cc-name" />
              <TextField label="Card Number" required value={state.paymentMethod.cardNumber || ''} onChange={e => updatePaymentMethod({ cardNumber: formatCardNumber(e.target.value) })} onBlur={() => touchField('cardNumber')} error={errors.cardNumber} autoComplete="cc-number" placeholder="1234 5678 9012 3456" maxLength={19} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <TextField label="Expiry Date" required value={state.paymentMethod.expiryDate || ''} onChange={e => updatePaymentMethod({ expiryDate: formatExpiry(e.target.value) })} onBlur={() => touchField('expiryDate')} error={errors.expiryDate} autoComplete="cc-exp" placeholder="MM/YY" maxLength={5} />
                <TextField label="CVV" type="password" required value={state.paymentMethod.cvv || ''} onChange={e => updatePaymentMethod({ cvv: e.target.value.replace(/\\D/g, '').slice(0, 4) })} onBlur={() => touchField('cvv')} error={errors.cvv} autoComplete="cc-csc" placeholder="123" maxLength={4} hint="3 or 4 digit code" />
              </div>
              <Checkbox label="Save this card for future purchases" checked={state.paymentMethod.saveCard} onChange={checked => updatePaymentMethod({ saveCard: checked })} />
            </div>
          )}

          {state.paymentMethod.type === 'paypal' && (
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fafafa', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ marginBottom: '16px', color: '#666' }}>You will be redirected to PayPal to complete your purchase securely.</p>
              <div style={{ padding: '12px 24px', backgroundColor: '#ffc439', borderRadius: '24px', display: 'inline-block', fontWeight: 600 }}>PayPal</div>
            </div>
          )}

          {state.paymentMethod.type === 'klarna' && (
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#ffb3c7', borderRadius: '8px' }}>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>Pay in 4 interest-free installments</p>
              <p style={{ fontSize: '14px', color: '#333' }}>Split your purchase into 4 payments. No interest, no fees when you pay on time.</p>
            </div>
          )}
        </Card>

        <Card variant="elevated" title="Billing Address">
          <Checkbox label="Same as shipping address" checked={state.useSameAddress} onChange={setUseSameAddress} />
          
          {!state.useSameAddress && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <TextField label="First Name" required value={state.billingAddress?.firstName || ''} onChange={e => updateBillingAddress('firstName', e.target.value)} />
                <TextField label="Last Name" required value={state.billingAddress?.lastName || ''} onChange={e => updateBillingAddress('lastName', e.target.value)} />
              </div>
              <TextField label="Address" required value={state.billingAddress?.address1 || ''} onChange={e => updateBillingAddress('address1', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <TextField label="City" required value={state.billingAddress?.city || ''} onChange={e => updateBillingAddress('city', e.target.value)} />
                <Select label="State" required options={US_STATES} value={state.billingAddress?.state || ''} onChange={v => updateBillingAddress('state', v)} placeholder="Select..." />
                <TextField label="ZIP Code" required value={state.billingAddress?.zipCode || ''} onChange={e => updateBillingAddress('zipCode', e.target.value)} />
              </div>
            </div>
          )}
        </Card>

        <Card variant="elevated" title="Gift Options">
          <Checkbox label="This order is a gift" checked={state.isGift} onChange={setIsGift} />
          {state.isGift && (
            <div style={{ marginTop: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Gift Message (optional)</label>
              <textarea
                value={state.giftMessage}
                onChange={e => setGiftMessage(e.target.value)}
                placeholder="Add a personal message..."
                maxLength={200}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666', textAlign: 'right' }}>{state.giftMessage.length}/200</p>
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="ghost" onClick={() => goToStep('shipping')}>Back to Shipping</Button>
          <Button onClick={handleContinue}>Review Order</Button>
        </div>
      </div>

      <OrderSummary />
    </div>
  );
}

function ReviewStep() {
  const { state, goToStep, placeOrder, setAcceptedTerms, setSubscribeNewsletter } = useCheckout();
  const [termsError, setTermsError] = useState('');

  const handlePlaceOrder = async () => {
    if (!state.acceptedTerms) {
      setTermsError('You must accept the terms and conditions');
      return;
    }
    setTermsError('');
    await placeOrder();
  };

  const shippingMethod = SHIPPING_METHODS.find(m => m.id === state.shippingMethod);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Card variant="elevated" title="Review Your Order">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Contact</h4>
                <Button size="sm" variant="ghost" onClick={() => goToStep('shipping')}>Edit</Button>
              </div>
              <p style={{ margin: 0, color: '#666' }}>{state.shippingAddress.email}</p>
              <p style={{ margin: '4px 0 0', color: '#666' }}>{state.shippingAddress.phone}</p>
            </section>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Ship to</h4>
                <Button size="sm" variant="ghost" onClick={() => goToStep('shipping')}>Edit</Button>
              </div>
              <p style={{ margin: 0, color: '#666' }}>
                {state.shippingAddress.firstName} {state.shippingAddress.lastName}<br />
                {state.shippingAddress.address1}{state.shippingAddress.address2 && \`, \${state.shippingAddress.address2}\`}<br />
                {state.shippingAddress.city}, {state.shippingAddress.state} {state.shippingAddress.zipCode}
              </p>
            </section>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Shipping Method</h4>
                <Button size="sm" variant="ghost" onClick={() => goToStep('shipping')}>Edit</Button>
              </div>
              <p style={{ margin: 0, color: '#666' }}>
                {shippingMethod?.name} - {shippingMethod?.estimatedDays}<br />
                <span style={{ fontWeight: 500 }}>{shippingMethod?.price === 0 ? 'FREE' : \`$\${shippingMethod?.price.toFixed(2)}\`}</span>
              </p>
            </section>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Payment</h4>
                <Button size="sm" variant="ghost" onClick={() => goToStep('payment')}>Edit</Button>
              </div>
              <p style={{ margin: 0, color: '#666' }}>
                {state.paymentMethod.type === 'card' && \`Card ending in \${state.paymentMethod.cardNumber?.slice(-4) || '****'}\`}
                {state.paymentMethod.type === 'paypal' && 'PayPal'}
                {state.paymentMethod.type === 'applepay' && 'Apple Pay'}
                {state.paymentMethod.type === 'klarna' && 'Klarna - Pay in 4'}
              </p>
            </section>

            {state.isGift && (
              <section>
                <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600 }}>Gift Options</h4>
                <Badge variant="info">This is a gift</Badge>
                {state.giftMessage && <p style={{ margin: '8px 0 0', color: '#666', fontStyle: 'italic' }}>"{state.giftMessage}"</p>}
              </section>
            )}
          </div>
        </Card>

        <Card variant="elevated" title="Items in Your Order">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {state.cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{item.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#666' }}>Qty: {item.quantity}{item.variant && \` | \${item.variant}\`}</p>
                </div>
                <p style={{ margin: 0, fontWeight: 600 }}>\${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="outlined" padding="md">
          <Checkbox
            label={<span>I agree to the <a href="#" style={{ color: '#0066cc' }}>Terms of Service</a> and <a href="#" style={{ color: '#0066cc' }}>Privacy Policy</a></span>}
            checked={state.acceptedTerms}
            onChange={checked => { setAcceptedTerms(checked); setTermsError(''); }}
            error={termsError}
          />
          <Checkbox
            label="Subscribe to our newsletter for exclusive offers and updates"
            checked={state.subscribeNewsletter}
            onChange={setSubscribeNewsletter}
          />
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="ghost" onClick={() => goToStep('payment')}>Back to Payment</Button>
          <Button onClick={handlePlaceOrder} loading={state.isProcessing} disabled={state.isProcessing}>
            {state.isProcessing ? 'Processing...' : 'Place Order'}
          </Button>
        </div>
      </div>

      <OrderSummary />
    </div>
  );
}

function ConfirmationStep() {
  const { state } = useCheckout();
  const shippingMethod = SHIPPING_METHODS.find(m => m.id === state.shippingMethod);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card variant="elevated">
        <div style={{ textAlign: 'center', padding: '20px 0 30px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#d4edda', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
            Done
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '24px' }}>Thank you for your order!</h2>
          <p style={{ margin: 0, color: '#666' }}>Your order has been confirmed and is being processed.</p>
        </div>

        <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#666' }}>Order Number</span>
            <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '16px' }}>{state.orderNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Estimated Delivery</span>
            <span style={{ fontWeight: 500 }}>{shippingMethod?.estimatedDays}</span>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600 }}>Shipping to</h4>
          <p style={{ margin: 0, color: '#666' }}>
            {state.shippingAddress.firstName} {state.shippingAddress.lastName}<br />
            {state.shippingAddress.address1}<br />
            {state.shippingAddress.city}, {state.shippingAddress.state} {state.shippingAddress.zipCode}
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600 }}>Confirmation sent to</h4>
          <p style={{ margin: 0, color: '#666' }}>{state.shippingAddress.email}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button variant="secondary">Track Order</Button>
          <Button>Continue Shopping</Button>
        </div>
      </Card>
    </div>
  );
}

function OrderSummary({ children }: { children?: React.ReactNode }) {
  const { state, subtotal, shippingCost, discount, tax, total } = useCheckout();

  return (
    <div style={{ position: 'sticky', top: '20px' }}>
      <Card variant="elevated" title="Order Summary">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {state.cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>{item.name} x {item.quantity}</span>
              <span>\${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#666' }}>Subtotal</span>
            <span>\${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#28a745' }}>
              <span>Discount ({state.promoCode?.code})</span>
              <span>-\${discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#666' }}>Shipping</span>
            <span>{shippingCost === 0 ? 'FREE' : \`$\${shippingCost.toFixed(2)}\`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#666' }}>Tax (8.25%)</span>
            <span>\${tax.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ borderTop: '2px solid #333', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>Total</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>\${total.toFixed(2)}</span>
        </div>

        {children}
      </Card>
    </div>
  );
}

// ============================================================================
// PROGRESS INDICATOR (Compound component for step visualization)
// ============================================================================

function ProgressIndicator({ currentStep }: { currentStep: CheckoutState['step'] }) {
  const steps = [
    { id: 'cart', label: 'Cart' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
    { id: 'review', label: 'Review' }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  if (currentStep === 'confirmation') return null;

  return (
    <nav aria-label="Checkout progress" style={{ marginBottom: '32px' }}>
      <ol style={{ display: 'flex', justifyContent: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <li key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '24px',
                backgroundColor: isCurrent ? '#0066cc' : isComplete ? '#d4edda' : '#f0f0f0',
                color: isCurrent ? 'white' : isComplete ? '#155724' : '#666',
                fontWeight: isCurrent ? 600 : 400,
                fontSize: '14px'
              }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isCurrent ? 'white' : isComplete ? '#28a745' : '#ddd',
                  color: isCurrent ? '#0066cc' : isComplete ? 'white' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {isComplete ? 'ok' : index + 1}
                </span>
                {step.label}
              </div>
              {index < steps.length - 1 && (
                <div style={{ width: '32px', height: '2px', backgroundColor: isComplete ? '#28a745' : '#ddd', margin: '0 4px' }} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ============================================================================
// MAIN CHECKOUT ASSEMBLY
// ============================================================================

function CheckoutFlow() {
  const { state } = useCheckout();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
      <ProgressIndicator currentStep={state.step} />
      
      {state.step === 'cart' && <CartStep />}
      {state.step === 'shipping' && <ShippingStep />}
      {state.step === 'payment' && <PaymentStep />}
      {state.step === 'review' && <ReviewStep />}
      {state.step === 'confirmation' && <ConfirmationStep />}
    </div>
  );
}

// ============================================================================
// APP ENTRY POINT
// ============================================================================

export default function App() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>TechStore</h1>
          <nav style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Products</a>
            <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Support</a>
            <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Account</a>
          </nav>
        </div>
      </header>
      
      <CheckoutProvider>
        <CheckoutFlow />
      </CheckoutProvider>
      
      <footer style={{ backgroundColor: 'white', borderTop: '1px solid #e5e5e5', padding: '24px', marginTop: '40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#666' }}>
          <p style={{ margin: 0 }}>Secure checkout powered by design system primitives</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>SSL Encrypted</span>
            <span>PCI Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}`;

export default function Page() {
  return (
    <section className="content">
      <article>
        <p>Let&apos;s close the loop with the Assemblies deep dive.</p>
        <h1>Deep Dive: Assemblies</h1>

        <h2>What Assemblies Are</h2>
        <p>
          Assemblies are the product-level constructs that combine primitives,
          compounds, and composers into flows and interfaces that deliver
          business value. They represent the highest level of complexity in
          component architecture - where design system building blocks meet
          real-world product requirements.
        </p>

        <p>
          Unlike primitives, compounds, or composers which are generalized and
          reusable across products, assemblies are inherently product-specific.
          They encode business logic, domain knowledge, and user flows that are
          unique to a particular application or feature.
        </p>

        <h3>Examples of Assemblies</h3>
        <ul>
          <li>
            <strong>E-commerce Checkout:</strong> A multi-step flow combining
            cart management, address forms, shipping selection, payment
            processing, promo codes, gift options, and order confirmation.
          </li>
          <li>
            <strong>Project Board:</strong> A Kanban-style interface with
            drag-and-drop cards, swimlanes, filters, bulk actions, and real-time
            collaboration.
          </li>
          <li>
            <strong>Analytics Dashboard:</strong> A reporting interface with
            interactive charts, data tables, date range pickers, export
            functionality, and drill-down capabilities.
          </li>
          <li>
            <strong>User Onboarding:</strong> A guided flow with progressive
            disclosure, account setup, preference selection, and feature
            introduction.
          </li>
          <li>
            <strong>Content Editor:</strong> A rich text editing experience with
            formatting tools, media embedding, collaboration features, and
            publishing workflow.
          </li>
        </ul>

        <p>
          Assemblies are recognizable as &quot;applications within the
          application.&quot; They encode product logic, not just design rules.
        </p>

        <h2>Why Assemblies Don&apos;t Belong in the System</h2>
        <p>
          Design systems succeed by being generalized, reusable, and
          product-agnostic. Assemblies are the opposite. Here&apos;s why they
          should live in application code, not the design system:
        </p>

        <ol>
          <li>
            <strong>Too Product-Specific</strong>
            <ul>
              <li>
                A checkout flow for an e-commerce platform has completely
                different requirements than a subscription management flow for a
                SaaS product.
              </li>
              <li>
                Standardizing at this level risks forcing patterns onto products
                that don&apos;t share context, leading to awkward workarounds
                and technical debt.
              </li>
              <li>
                Domain-specific terminology, validation rules, and business
                logic don&apos;t generalize across products.
              </li>
            </ul>
          </li>
          <li>
            <strong>Volatile Requirements</strong>
            <ul>
              <li>
                Assemblies change rapidly with product strategy, A/B tests,
                regulatory requirements, and competitive pressures.
              </li>
              <li>
                System teams can&apos;t chase every product update without
                becoming a bottleneck for the entire organization.
              </li>
              <li>
                The release cadence of a design system (monthly/quarterly)
                doesn&apos;t match the pace of product iteration (daily/weekly).
              </li>
            </ul>
          </li>
          <li>
            <strong>Unscalable Scope</strong>
            <ul>
              <li>
                If the design system codifies assemblies, it risks becoming a
                parallel product organization with unsustainable maintenance
                burden.
              </li>
              <li>
                The surface area explodes: every team wants their feature
                &quot;blessed&quot; as a system component.
              </li>
              <li>
                Documentation, testing, and versioning become exponentially more
                complex.
              </li>
            </ul>
          </li>
          <li>
            <strong>Diluted Governance</strong>
            <ul>
              <li>
                At the assembly level, product managers and business
                stakeholders own the flows, not designers or engineers.
              </li>
              <li>
                The system should not become the arbiter of business rules or
                product decisions.
              </li>
              <li>
                Ownership boundaries become unclear when the system team
                maintains product-specific code.
              </li>
            </ul>
          </li>
        </ol>

        <h2>The Role of the System Team</h2>
        <p>
          While assemblies don&apos;t belong inside the design system, they are
          where the system proves its value. The system team&apos;s role shifts
          from author to consultant:
        </p>

        <ul>
          <li>
            <strong>Inform:</strong> Provide primitives, compounds, and
            composers that make assemblies easy to build without reinvention.
            Ensure the building blocks are flexible enough to support diverse
            use cases.
          </li>
          <li>
            <strong>Advise:</strong> Consult on accessibility, composability,
            and interaction patterns when teams compose assemblies. Offer office
            hours, design reviews, and pairing sessions.
          </li>
          <li>
            <strong>Audit:</strong> Help teams evaluate whether their assembly
            aligns with system conventions or accidentally reinvents a
            primitive/compound. Identify opportunities to extract reusable
            patterns.
          </li>
          <li>
            <strong>Inspire:</strong> Show examples of successful assemblies
            built on the system to spread patterns laterally across product
            teams. Maintain a gallery of reference implementations.
          </li>
          <li>
            <strong>Extract:</strong> When multiple teams independently build
            similar patterns, work with them to extract common functionality
            into the system at the appropriate layer (usually composer level).
          </li>
        </ul>

        <p>
          This is how assemblies become success stories of the system in use -
          not by being part of the system, but by demonstrating its power.
        </p>

        <h2>Example: Production-Grade Checkout Flow</h2>
        <p>
          The following example demonstrates a near-production checkout assembly
          that showcases how design system primitives, compounds, and composers
          combine to create a complex product flow. Notice how the assembly:
        </p>

        <ul>
          <li>
            Uses primitives (Button, Input) and compounds (TextField, Card,
            RadioGroup) from the design system
          </li>
          <li>
            Implements the FormComposer pattern for validation orchestration
          </li>
          <li>
            Manages complex state through React Context (CheckoutProvider)
          </li>
          <li>
            Handles real-world concerns: promo codes, shipping methods, multiple
            payment types, gift options
          </li>
          <li>
            Provides proper accessibility with ARIA attributes, form
            associations, and keyboard navigation
          </li>
          <li>
            Implements business logic that would never belong in a design system
          </li>
        </ul>

        <Sandpack
          template="react-ts"
          theme="light"
          files={{
            '/App.tsx': checkoutCode,
          }}
          options={{
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 600,
          }}
        />

        <h3>What Makes This Assembly Complex</h3>
        <p>
          This checkout flow demonstrates production-level complexity that would
          never belong in a design system:
        </p>

        <ul>
          <li>
            <strong>Multi-step state machine:</strong> Cart, shipping, payment,
            review, and confirmation steps with bidirectional navigation
          </li>
          <li>
            <strong>Form validation orchestration:</strong> Field-level
            validation with touch tracking, async promo code verification, and
            cross-field dependencies
          </li>
          <li>
            <strong>Dynamic pricing calculation:</strong> Subtotal, shipping
            rates based on order value, percentage/fixed discounts, tax
            computation
          </li>
          <li>
            <strong>Multiple payment methods:</strong> Credit card with
            formatting, PayPal redirect flow, Apple Pay, and Klarna installments
          </li>
          <li>
            <strong>Address management:</strong> Separate shipping/billing with
            &quot;same as shipping&quot; toggle, US state selection
          </li>
          <li>
            <strong>Cart operations:</strong> Quantity adjustment, item removal,
            empty cart handling
          </li>
          <li>
            <strong>Gift options:</strong> Gift toggle with optional message and
            character limit
          </li>
          <li>
            <strong>Order processing:</strong> Loading states, order number
            generation, confirmation display
          </li>
        </ul>

        <p>
          The design system didn&apos;t ship a &quot;CheckoutFlow&quot;
          component. Instead, it provided the building blocks, orchestration
          patterns, and accessibility rules. The product team composed them into
          a flow that matched their specific business logic.
        </p>

        <h2>Pitfalls When Assemblies Creep Into Systems</h2>
        <p>
          When organizations blur the line between system components and
          assemblies, several anti-patterns emerge:
        </p>

        <ol>
          <li>
            <strong>Assembly Drift:</strong> One team&apos;s flow becomes a
            &quot;component&quot; in the system, and suddenly the system is
            maintaining product-specific features. Other teams either adopt it
            awkwardly or fork it, defeating the purpose.
          </li>
          <li>
            <strong>Over-standardization:</strong> Forcing every product to use
            the same assembly pattern, even when needs diverge. This leads to
            configuration explosion (dozens of props to handle edge cases) or
            teams abandoning the system entirely.
          </li>
          <li>
            <strong>System Bloat:</strong> The system grows too heavy, making
            adoption harder rather than easier. Bundle sizes increase, learning
            curves steepen, and the system becomes a liability rather than an
            asset.
          </li>
          <li>
            <strong>Ownership Confusion:</strong> When bugs appear in an
            assembly-level component, is it the system team&apos;s
            responsibility or the product team&apos;s? This ambiguity leads to
            finger-pointing and delayed fixes.
          </li>
          <li>
            <strong>Innovation Stagnation:</strong> Teams become afraid to
            experiment with new patterns because they&apos;re locked into
            &quot;blessed&quot; assemblies that don&apos;t fit their needs.
          </li>
        </ol>

        <h2>Success Metrics for Assemblies</h2>
        <p>
          The system team shouldn&apos;t measure success by &quot;number of
          assemblies in the system,&quot; but rather by:
        </p>

        <ul>
          <li>
            <strong>Speed of composition:</strong> How quickly can product teams
            build flows using primitives, compounds, and composers? Measure
            time-to-feature for new product initiatives.
          </li>
          <li>
            <strong>Reduction in reinvention:</strong> Fewer ad-hoc components
            created to plug assembly gaps. Track the ratio of system components
            to custom components in product codebases.
          </li>
          <li>
            <strong>Consistency of experience:</strong> Flows across products
            feel coherent because they share the same underlying grammar, even
            when the specific assemblies differ.
          </li>
          <li>
            <strong>Confidence in accessibility:</strong> Product teams
            don&apos;t have to relearn label associations, focus rules, or ARIA
            conventions - they inherit them from system components.
          </li>
          <li>
            <strong>Developer satisfaction:</strong> Teams report that building
            with the system is faster and more enjoyable than building from
            scratch. Survey regularly.
          </li>
          <li>
            <strong>Upgrade velocity:</strong> When the system releases updates,
            product teams can adopt them quickly because assemblies are built on
            stable abstractions.
          </li>
        </ul>

        <h2>Summary</h2>
        <ul>
          <li>
            <strong>Assemblies are where the system meets the product</strong>,
            but they rarely belong inside the design system itself.
          </li>
          <li>
            <strong>What they are:</strong> Application-specific flows
            (checkout, boards, dashboards, onboarding) that encode business
            logic.
          </li>
          <li>
            <strong>Why they don&apos;t belong:</strong> Product-specific,
            volatile, unscalable, and business-owned - the opposite of what
            makes a good system component.
          </li>
          <li>
            <strong>Role of the system:</strong> Consult, inform, audit, and
            inspire - not codify. Be a partner, not a gatekeeper.
          </li>
          <li>
            <strong>Success story:</strong> When a team builds a complex flow
            quickly, confidently, and accessibly because of the system, not
            inside it.
          </li>
        </ul>

        <h2>Next Steps</h2>
        <p>
          Assemblies are built using{' '}
          <Link href="/blueprints/component-standards/component-complexity/primitives">
            primitives
          </Link>
          ,{' '}
          <Link href="/blueprints/component-standards/component-complexity/compound">
            compounds
          </Link>
          , and{' '}
          <Link href="/blueprints/component-standards/component-complexity/composer">
            composers
          </Link>{' '}
          from your design system, but they live in your application code, not
          in the system itself. Understanding this boundary is crucial for
          maintaining a healthy, scalable design system.
        </p>

        <p>
          Return to the{' '}
          <Link href="/blueprints/component-standards/component-complexity">
            Component Complexity overview
          </Link>{' '}
          to see how all these layers work together.
        </p>
      </article>
      <Link href="/blueprints/component-standards/component-complexity">
        ← Back to Component Standards
      </Link>
    </section>
  );
}
