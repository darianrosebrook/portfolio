/**
 * {{componentName}} Assembly - {{description}}
 * 
 * Layer: Assembly
 * Characteristics: Application-specific flows, uses system components
 * 
 * Complete user flow that combines primitives, compounds, and composers
 * to solve specific application problems. Lives at the app layer.
 */
'use client';
import React, { useState } from 'react';
import { Button } from '@/ui/components/Button';
import { Field } from '@/ui/components/Field';
import { Input } from '@/ui/components/Input';
// Import other system components as needed
import styles from './{{componentName}}.module.scss';

export interface {{componentName}}Props {
  /** Callback when flow completes */
  onComplete?: (data: {{componentName}}Data) => void;
  /** Callback when flow is cancelled */
  onCancel?: () => void;
  /** Initial data for the flow */
  initialData?: Partial<{{componentName}}Data>;
  /** Additional CSS classes */
  className?: string;
}

export interface {{componentName}}Data {
  // Define the data structure for this flow
  [key: string]: any;
}

export const {{componentName}}: React.FC<{{componentName}}Props> = ({
  onComplete,
  onCancel,
  initialData = {},
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<{{componentName}}Data>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    'Step 1',
    'Step 2', 
    'Step 3',
    // Define your flow steps
  ];

  const handleNext = async () => {
    setIsLoading(true);
    try {
      // Validate current step
      const stepErrors = validateStep(currentStep, formData);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        setErrors({});
      } else {
        // Final step - complete the flow
        await onComplete?.(formData);
      }
    } catch (error) {
      console.error('Flow error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={`${styles.{{componentNameLower}}} ${className}`}>
      {/* Progress indicator */}
      <div className={styles.progress}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <span className={styles.progressText}>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
        </span>
      </div>

      {/* Step content */}
      <div className={styles.stepContent}>
        {renderStepContent(currentStep, formData, updateFormData, errors)}
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <div className={styles.navigationLeft}>
          {currentStep > 0 && (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </Button>
          )}
        </div>
        
        <div className={styles.navigationRight}>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button
            variant="primary"
            onClick={handleNext}
            loading={isLoading}
          >
            {currentStep < steps.length - 1 ? 'Next' : 'Complete'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper function to render step content
function renderStepContent(
  step: number,
  data: {{componentName}}Data,
  updateData: (field: string, value: any) => void,
  errors: Record<string, string>
) {
  switch (step) {
    case 0:
      return (
        <div className={styles.step}>
          <h2>Step 1: Basic Information</h2>
          <Field>
            <Field.Label>Name</Field.Label>
            <Input
              value={data.name || ''}
              onChange={(e) => updateData('name', e.target.value)}
              placeholder="Enter your name"
            />
            {errors.name && <Field.Error>{errors.name}</Field.Error>}
          </Field>
        </div>
      );
    
    case 1:
      return (
        <div className={styles.step}>
          <h2>Step 2: Additional Details</h2>
          {/* Add more fields as needed */}
        </div>
      );
    
    case 2:
      return (
        <div className={styles.step}>
          <h2>Step 3: Review & Confirm</h2>
          <div className={styles.summary}>
            <h3>Review your information:</h3>
            <dl>
              <dt>Name:</dt>
              <dd>{data.name}</dd>
              {/* Display other form data */}
            </dl>
          </div>
        </div>
      );
    
    default:
      return null;
  }
}

// Helper function to validate each step
function validateStep(step: number, data: {{componentName}}Data): Record<string, string> {
  const errors: Record<string, string> = {};
  
  switch (step) {
    case 0:
      if (!data.name?.trim()) {
        errors.name = 'Name is required';
      }
      break;
    
    case 1:
      // Add validation for step 2
      break;
    
    case 2:
      // Add validation for final step
      break;
  }
  
  return errors;
}

{{componentName}}.displayName = '{{componentName}}';

export default {{componentName}};
