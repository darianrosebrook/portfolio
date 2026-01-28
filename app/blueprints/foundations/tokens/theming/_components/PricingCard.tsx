'use client';

import React from 'react';
import styles from './DashboardDemo.module.scss';

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--semantic-color-feedback-success-default)"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface PlanFeature {
  label: string;
}

interface Plan {
  name: string;
  price: string;
  members: string;
  features: PlanFeature[];
  buttonLabel: string;
  buttonVariant: 'primary' | 'secondary';
}

const plans: Plan[] = [
  {
    name: 'Basic',
    price: '$0',
    members: '3 team members',
    features: [
      { label: 'Expense tracking' },
      { label: 'Invoicing' },
      { label: 'Basic reports' },
    ],
    buttonLabel: 'Downgrade',
    buttonVariant: 'secondary',
  },
  {
    name: 'Growth',
    price: '$49',
    members: '10 team members',
    features: [
      { label: 'Online payments' },
      { label: 'Bill management' },
      { label: 'Detailed reports' },
    ],
    buttonLabel: 'Go to Billing',
    buttonVariant: 'secondary',
  },
  {
    name: 'Pro',
    price: '$99',
    members: 'Unlimited members',
    features: [
      { label: 'Custom invoices' },
      { label: 'Multi-business' },
      { label: 'Priority support' },
    ],
    buttonLabel: 'Upgrade',
    buttonVariant: 'primary',
  },
];

export const PricingCard: React.FC = () => {
  return (
    <div className={styles.formCard}>
      <h3>Pricing</h3>
      <p
        style={{
          margin: '0 0 var(--semantic-spacing-margin-section)',
          fontSize: '13px',
          lineHeight: 1.6,
          color: 'var(--semantic-color-foreground-secondary)',
        }}
      >
        No credit card required. Every plan includes a 30-day trial of all Pro
        features.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--semantic-spacing-gap-grid)',
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--semantic-spacing-gap-component)',
            }}
          >
            {/* Plan name */}
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--semantic-color-foreground-primary)',
              }}
            >
              {plan.name}
            </span>

            {/* Member count */}
            <span
              style={{
                fontSize: '13px',
                color: 'var(--semantic-color-foreground-secondary)',
              }}
            >
              {plan.members}
            </span>

            {/* Price */}
            <div>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--semantic-color-foreground-primary)',
                }}
              >
                {plan.price}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--semantic-color-foreground-secondary)',
                }}
              >
                /mo
              </span>
            </div>

            {/* Features */}
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--semantic-spacing-gap-component)',
              }}
            >
              {plan.features.map((feature) => (
                <li
                  key={feature.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--semantic-spacing-gap-component)',
                    fontSize: '13px',
                    color: 'var(--semantic-color-foreground-primary)',
                  }}
                >
                  <CheckIcon />
                  {feature.label}
                </li>
              ))}
            </ul>

            {/* Action button */}
            <button
              className={
                plan.buttonVariant === 'primary'
                  ? styles.primaryButton
                  : styles.secondaryButton
              }
              style={{ marginTop: 'auto' }}
            >
              {plan.buttonLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingCard;
