import Link from 'next/link';
import { Sandpack } from '@codesandbox/sandpack-react';

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

export default function Page() {
  return (
    <section className="content">
      <article>
        <p>Let’s close the loop with the Assemblies deep dive.</p>
        <h1>Deep Dive: Assemblies</h1>
        <h2>What Assemblies Are</h2>
        <p>
          Assemblies are the product-level constructs that combine primitives,
          compounds, and composers into flows and interfaces that deliver
          business value.
        </p>
        <ul>
          <li>
            A checkout flow that strings together forms, summaries, payment
            methods, and confirmation.
          </li>
          <li>
            A project board that combines cards, drag-and-drop lists, filters,
            and bulk actions.
          </li>
          <li>
            A reporting dashboard with charts, tables, filters, and export
            actions.
          </li>
        </ul>
        <p>
          Assemblies are recognizable as applications inside the application.
          They encode product logic, not just design rules.
        </p>
        <h2>Why Assemblies Don’t Belong in the System</h2>
        <p>
          Design systems succeed by being generalized, reusable, and
          product-agnostic. Assemblies are the opposite:
        </p>
        <ol>
          <li>
            Too Product-Specific
            <ul>
              <li>
                A checkout flow in Commerce is irrelevant to a dashboard in
                SaaS.
              </li>
              <li>
                Standardizing at this level risks forcing a pattern onto
                products that don’t share context.
              </li>
            </ul>
          </li>
          <li>
            Volatile Requirements
            <ul>
              <li>
                Assemblies change rapidly with product strategy, business
                models, and regulations.
              </li>
              <li>
                System teams can’t chase every update without becoming a
                bottleneck.
              </li>
            </ul>
          </li>
          <li>
            Unscalable Scope
            <ul>
              <li>
                If the design system codifies assemblies, it risks becoming a
                parallel product org.
              </li>
              <li>
                The surface area explodes: every team wants their feature
                “blessed” as a system component.
              </li>
            </ul>
          </li>
          <li>
            Diluted Governance
            <ul>
              <li>At the assembly level, product managers own flows.</li>
              <li>
                The system should not become the arbiter of business rules.
              </li>
            </ul>
          </li>
        </ol>
        <h2>The Role of the System Team</h2>
        <p>
          While assemblies don’t belong inside the design system, they are where
          the system proves its value. The system team’s role shifts from author
          to consultant:
        </p>
        <ul>
          <li>
            Inform: provide primitives, compounds, and composers that make
            assemblies easy to build without reinvention.
          </li>
          <li>
            Advise: consult on accessibility, composability, and interaction
            pitfalls when teams compose assemblies.
          </li>
          <li>
            Audit: help teams evaluate whether their assembly aligns with system
            conventions or accidentally reinvents a primitive/compound.
          </li>
          <li>
            Inspire: show examples of successful assemblies built on the system,
            to spread patterns laterally across product teams.
          </li>
        </ul>
        <p>
          This is how assemblies become success stories of the system in use.
        </p>
        <h2>Example: Checkout Flow</h2>
        <Sandpack
          template="react-ts"
          theme="light"
          files={{
            '/Button.tsx': `// Primitive from design system
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled, 
  children,
  onClick,
  type = 'button'
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: size === 'sm' ? '8px 12px' : size === 'lg' ? '12px 20px' : '10px 16px',
        backgroundColor: variant === 'primary' ? '#007bff' : variant === 'danger' ? '#dc3545' : '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontSize: size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px'
      }}
    >
      {children}
    </button>
  );
}`,
            '/TextField.tsx': `// Compound from design system
export interface TextFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TextField({ 
  id, 
  label, 
  error, 
  required, 
  placeholder,
  type = 'text',
  value,
  onChange
}: TextFieldProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label 
        htmlFor={id}
        style={{
          display: 'block',
          marginBottom: '4px',
          fontWeight: '500',
          color: error ? '#dc3545' : '#333'
        }}
      >
        {label}
        {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      
      <input 
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: \`1px solid \${error ? '#dc3545' : '#ccc'}\`,
          borderRadius: '4px',
          fontSize: '16px',
          boxSizing: 'border-box'
        }}
      />
      
      {error && (
        <p style={{
          margin: '4px 0 0 0',
          fontSize: '14px',
          color: '#dc3545'
        }}>
          {error}
        </p>
      )}
    </div>
  );
}`,
            '/Card.tsx': `// Compound from design system
export interface CardProps {
  children: React.ReactNode;
  title?: string;
}

export function Card({ children, title }: CardProps) {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {title && (
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '18px', 
          fontWeight: '600' 
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}`,
            '/CheckoutFlow.tsx': `// Assembly - Product-specific flow using system components
import { useState } from 'react';
import { Button } from './Button';
import { TextField } from './TextField';
import { Card } from './Card';

interface CheckoutData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export function CheckoutFlow() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CheckoutData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Partial<CheckoutData>>({});

  const updateField = (field: keyof CheckoutData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Partial<CheckoutData> = {};
    
    if (currentStep === 1) {
      if (!data.email) newErrors.email = 'Email is required';
      if (!data.firstName) newErrors.firstName = 'First name is required';
      if (!data.lastName) newErrors.lastName = 'Last name is required';
    } else if (currentStep === 2) {
      if (!data.address) newErrors.address = 'Address is required';
      if (!data.city) newErrors.city = 'City is required';
      if (!data.zipCode) newErrors.zipCode = 'ZIP code is required';
    } else if (currentStep === 3) {
      if (!data.cardNumber) newErrors.cardNumber = 'Card number is required';
      if (!data.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!data.cvv) newErrors.cvv = 'CVV is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => setStep(prev => prev - 1);

  const completeOrder = () => {
    if (validateStep(step)) {
      alert('Order completed! 🎉');
      // Reset flow
      setStep(1);
      setData({
        email: '', firstName: '', lastName: '', address: '',
        city: '', zipCode: '', cardNumber: '', expiryDate: '', cvv: ''
      });
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Progress indicator */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '30px',
        padding: '0 20px'
      }}>
        {[1, 2, 3, 4].map(num => (
          <div key={num} style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: step >= num ? '#007bff' : '#e0e0e0',
            color: step >= num ? 'white' : '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600'
          }}>
            {num}
          </div>
        ))}
      </div>

      {/* Step 1: Contact Info */}
      {step === 1 && (
        <Card title="Contact Information">
          <TextField
            id="email"
            label="Email"
            type="email"
            required
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            error={errors.email}
            placeholder="your@email.com"
          />
          <TextField
            id="firstName"
            label="First Name"
            required
            value={data.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            error={errors.firstName}
            placeholder="John"
          />
          <TextField
            id="lastName"
            label="Last Name"
            required
            value={data.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            error={errors.lastName}
            placeholder="Doe"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button onClick={nextStep}>Continue to Shipping</Button>
          </div>
        </Card>
      )}

      {/* Step 2: Shipping */}
      {step === 2 && (
        <Card title="Shipping Address">
          <TextField
            id="address"
            label="Address"
            required
            value={data.address}
            onChange={(e) => updateField('address', e.target.value)}
            error={errors.address}
            placeholder="123 Main St"
          />
          <TextField
            id="city"
            label="City"
            required
            value={data.city}
            onChange={(e) => updateField('city', e.target.value)}
            error={errors.city}
            placeholder="New York"
          />
          <TextField
            id="zipCode"
            label="ZIP Code"
            required
            value={data.zipCode}
            onChange={(e) => updateField('zipCode', e.target.value)}
            error={errors.zipCode}
            placeholder="10001"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <Button variant="secondary" onClick={prevStep}>Back</Button>
            <Button onClick={nextStep}>Continue to Payment</Button>
          </div>
        </Card>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <Card title="Payment Information">
          <TextField
            id="cardNumber"
            label="Card Number"
            required
            value={data.cardNumber}
            onChange={(e) => updateField('cardNumber', e.target.value)}
            error={errors.cardNumber}
            placeholder="1234 5678 9012 3456"
          />
          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              id="expiryDate"
              label="Expiry Date"
              required
              value={data.expiryDate}
              onChange={(e) => updateField('expiryDate', e.target.value)}
              error={errors.expiryDate}
              placeholder="MM/YY"
            />
            <TextField
              id="cvv"
              label="CVV"
              required
              value={data.cvv}
              onChange={(e) => updateField('cvv', e.target.value)}
              error={errors.cvv}
              placeholder="123"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <Button variant="secondary" onClick={prevStep}>Back</Button>
            <Button onClick={nextStep}>Review Order</Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <Card title="Order Review">
          <div style={{ marginBottom: '20px' }}>
            <h4>Contact: {data.email}</h4>
            <h4>Name: {data.firstName} {data.lastName}</h4>
            <h4>Address: {data.address}, {data.city} {data.zipCode}</h4>
            <h4>Payment: ****{data.cardNumber.slice(-4)}</h4>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <Button variant="secondary" onClick={prevStep}>Back</Button>
            <Button onClick={completeOrder}>Complete Order</Button>
          </div>
        </Card>
      )}
    </div>
  );
}`,
            '/App.tsx': `import { CheckoutFlow } from './CheckoutFlow';

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Assembly Example: Checkout Flow</h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          This checkout flow is an <strong>assembly</strong> - a product-specific flow that uses 
          primitives (Button), compounds (TextField, Card), and composers (form orchestration) 
          from the design system, but lives in the application code.
        </p>
      </div>
      
      <CheckoutFlow />
      
      <div style={{ 
        maxWidth: '600px', 
        margin: '40px auto 0', 
        padding: '20px', 
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <h3>Assembly Characteristics:</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>🏗️ <strong>Product-specific:</strong> Checkout logic unique to this business</li>
          <li>🧩 <strong>Uses system layers:</strong> Primitives + Compounds + Composers</li>
          <li>📍 <strong>Lives in app code:</strong> Not in the design system itself</li>
          <li>🔄 <strong>Business logic:</strong> Validation, flow control, data handling</li>
          <li>⚡ <strong>Fast to build:</strong> System provides reliable building blocks</li>
        </ul>
      </div>
    </div>
  );
}`,
          }}
          options={{
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 500,
          }}
        />
        <p>
          The design system didn't ship a "CheckoutFlow" component. Instead, it
          provided the building blocks, orchestration patterns, and
          accessibility rules. The product team composed them into a flow that
          matched their business logic.
        </p>
        <h2>Pitfalls When Assemblies Creep Into Systems</h2>
        <ol>
          <li>
            Assembly Drift: one team’s flow becomes a “component” in the system,
            and suddenly the system is maintaining product-specific features.
          </li>
          <li>
            Over-standardization: forcing every product to use the same assembly
            pattern, even when needs diverge.
          </li>
          <li>
            System Bloat: the system grows too heavy, making adoption harder
            rather than easier.
          </li>
        </ol>
        <h2>Success Metrics for Assemblies</h2>
        <p>
          The system team shouldn’t measure success by “number of assemblies in
          the system,” but rather by:
        </p>
        <ul>
          <li>
            Speed of composition: how quickly product teams can build flows
            using primitives/compounds/composers.
          </li>
          <li>
            Reduction in reinvention: fewer ad-hoc components created to plug
            assembly gaps.
          </li>
          <li>
            Consistency of experience: flows across products feel coherent
            because they share the same underlying grammar.
          </li>
          <li>
            Confidence in accessibility: product teams don’t have to relearn
            label associations, focus rules, or ARIA conventions — they inherit
            them.
          </li>
        </ul>
        <h2>Summary</h2>
        <ul>
          <li>
            Assemblies are where the system meets the product, but they rarely
            belong inside the design system.
          </li>
          <li>
            What they are: application-specific flows (checkout, boards,
            dashboards).
          </li>
          <li>
            Why they don’t belong: product-specific, volatile, unscalable,
            business-owned.
          </li>
          <li>
            Role of the system: consult, inform, audit, inspire — not codify.
          </li>
          <li>
            Success story: when a team builds a complex flow quickly,
            confidently, and accessibly because of the system, not inside it.
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
          in the system itself.
        </p>
      </article>
      <Link href="/blueprints/component-standards/component-complexity">
        ← Back to Component Standards
      </Link>
    </section>
  );
}
