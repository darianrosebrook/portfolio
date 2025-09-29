'use client';

import { useState } from 'react';
import { Chip } from '@/ui/components/Chip';

const cuisines = [
  'Mexican',
  'Italian',
  'Chinese',
  'Japanese',
  'Indian',
  'Greek',
  'French',
  'Spanish',
  'Turkish',
  'Lebanese',
  'Vietnamese',
  'Korean',
  'Argentinian',
  'Peruvian',
  'Ethiopian',
  'Nigerian',
  'German',
  'British',
  'Irish',
  'Swedish',
  'Danish',
  'Polish',
  'Hungarian',
  'Portuguese',
];

const interests = [
  'Technology',
  'Art & Design',
  'Music',
  'Sports',
  'Travel',
  'Food & Cooking',
  'Photography',
  'Reading',
  'Gaming',
  'Fitness',
  'Movies & TV',
  'Fashion',
  'Science',
  'History',
  'Nature',
  'Business',
  'Health',
  'Education',
];

export default function ChipDemo() {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([
    'Italian',
    'Japanese',
  ]);
  const [dismissibleInterests, setDismissibleInterests] = useState<string[]>([
    'Technology',
    'Art & Design',
    'Music',
  ]);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const removeInterest = (interest: string) => {
    setDismissibleInterests((prev) => prev.filter((i) => i !== interest));
  };

  const addRandomInterest = () => {
    const availableInterests = interests.filter(
      (i) => !dismissibleInterests.includes(i)
    );
    if (availableInterests.length > 0) {
      const randomInterest =
        availableInterests[
          Math.floor(Math.random() * availableInterests.length)
        ];
      setDismissibleInterests((prev) => [...prev, randomInterest]);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 pt-40">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-4xl font-semibold mb-12 text-center">
          Chip Component Demo
        </h1>

        {/* Selected variant (checkbox-like) */}
        <div className="mb-16">
          <h2 className="text-white text-2xl font-semibold mb-6">
            Selected Variant (Checkbox-like with Checkmark)
          </h2>
          <p className="text-zinc-400 mb-6">
            Click to toggle selection. Selected chips show a checkmark icon and
            have different styling.
          </p>
          <div className="flex flex-wrap gap-3">
            {cuisines.map((cuisine) => {
              const isSelected = selectedCuisines.includes(cuisine);
              return (
                <Chip
                  key={cuisine}
                  variant={isSelected ? 'selected' : 'default'}
                  onClick={() => toggleCuisine(cuisine)}
                  ariaPressed={isSelected}
                >
                  {cuisine}
                </Chip>
              );
            })}
          </div>
          <p className="text-zinc-500 mt-4 text-sm">
            Selected cuisines: {selectedCuisines.join(', ')}
          </p>
        </div>

        {/* Dismissible variant */}
        <div className="mb-16">
          <h2 className="text-white text-2xl font-semibold mb-6">
            Dismissible Variant (with X icon)
          </h2>
          <p className="text-zinc-400 mb-6">
            Click the X icon to remove chips. These are great for tags or
            removable selections.
          </p>
          <div className="flex flex-wrap gap-3">
            {dismissibleInterests.map((interest) => (
              <Chip
                key={interest}
                variant="dismissible"
                onClick={() => removeInterest(interest)}
                ariaLabel={`Remove ${interest}`}
              >
                {interest}
              </Chip>
            ))}
          </div>
          <button
            onClick={addRandomInterest}
            className="mt-4 px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
          >
            Add Random Interest
          </button>
          <p className="text-zinc-500 mt-2 text-sm">
            Current interests: {dismissibleInterests.join(', ')}
          </p>
        </div>

        {/* Size variants */}
        <div className="mb-16">
          <h2 className="text-white text-2xl font-semibold mb-6">
            Size Variants
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg font-medium mb-3">Small</h3>
              <div className="flex flex-wrap gap-2">
                <Chip size="small" variant="selected">
                  Small Selected
                </Chip>
                <Chip size="small" variant="dismissible">
                  Small Dismissible
                </Chip>
                <Chip size="small">Small Default</Chip>
              </div>
            </div>
            <div>
              <h3 className="text-white text-lg font-medium mb-3">
                Medium (Default)
              </h3>
              <div className="flex flex-wrap gap-2">
                <Chip size="medium" variant="selected">
                  Medium Selected
                </Chip>
                <Chip size="medium" variant="dismissible">
                  Medium Dismissible
                </Chip>
                <Chip size="medium">Medium Default</Chip>
              </div>
            </div>
            <div>
              <h3 className="text-white text-lg font-medium mb-3">Large</h3>
              <div className="flex flex-wrap gap-2">
                <Chip size="large" variant="selected">
                  Large Selected
                </Chip>
                <Chip size="large" variant="dismissible">
                  Large Dismissible
                </Chip>
                <Chip size="large">Large Default</Chip>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility features */}
        <div className="mb-16">
          <h2 className="text-white text-2xl font-semibold mb-6">
            Accessibility Features
          </h2>
          <div className="flex flex-wrap gap-3">
            <Chip
              variant="selected"
              ariaLabel="Toggle favorite cuisine: Italian food"
              title="Italian cuisine selection"
            >
              Italian (with aria-label)
            </Chip>
            <Chip
              variant="dismissible"
              role="button"
              ariaLabel="Remove technology interest"
            >
              Technology (custom role)
            </Chip>
            <Chip disabled>Disabled Chip</Chip>
          </div>
        </div>
      </div>
    </div>
  );
}
