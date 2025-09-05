-- Sample case study data for initial setup
-- This migration adds sample case studies based on the existing work pages

-- Insert sample case studies
INSERT INTO public.case_studies (
    slug,
    headline,
    alternativeHeadline,
    description,
    keywords,
    author,
    articleSection,
    image,
    status,
    published_at,
    articleBody
) VALUES 
(
    'definition-of-done',
    'Designer''s Definition of Done',
    'Standardizing handoff between design and development',
    'A Figma widget that helps designers build good habits and file hygiene before interfacing with their partners during the product design lifecycle.',
    'design systems, figma, collaboration, handoff, process',
    (SELECT id FROM public.profiles WHERE username = 'darianrosebrook' LIMIT 1),
    'Design Systems',
    '/dod/dod-1.png',
    'published',
    '2023-11-01T00:00:00Z',
    '{
        "type": "doc",
        "content": [
            {
                "type": "heading",
                "attrs": { "level": 1 },
                "content": [{ "type": "text", "text": "Definition of Done Figma Widget" }]
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "Standardizing handoff between design and development requires a handful of common checks and practices for designers to go through to consider their work \"Ready\" for another person to review and work on. We brought in experts across each discipline to build on these standards in collaboration with teams like Content, Accessibility, Project Management, and more."
                    }
                ]
            },
            {
                "type": "heading",
                "attrs": { "level": 3 },
                "content": [{ "type": "text", "text": "Responsibilities" }]
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "Project coordination, user research, design, development, user testing, delivery and presentation"
                    }
                ]
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "Designers: Darian Rosebrook, Catalina Manea"
                    }
                ]
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "Research: Darian Rosebrook, Catalina Manea"
                    }
                ]
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "Developers: Darian Rosebrook, Cordelia McGee-Tubb"
                    }
                ]
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "Scope of impact: Whole Product Organization"
                    }
                ]
            }
        ]
    }'::jsonb
),
(
    'iconography-sync',
    'Iconography Sync',
    'Bridging the gap between design and code',
    'A Figma plugin for design system teams that allows design and development to be closer in sync, enabling an optimized and automated process for syncing design assets to code assets through GitHub.',
    'figma, design systems, automation, github, icons',
    (SELECT id FROM public.profiles WHERE username = 'darianrosebrook' LIMIT 1),
    'Design Systems',
    '/icon-tool/icon-tool.jpg',
    'published',
    '2024-01-15T00:00:00Z',
    '{
        "type": "doc",
        "content": [
            {
                "type": "heading",
                "attrs": { "level": 1 },
                "content": [{ "type": "text", "text": "Iconography Sync" }]
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "I''ve created a figma plugin for design system teams that allows design and development to be closer in sync, allowing for a fairly optimized and automated process for syncing our design assets to our code assets through GitHub. Designers have control over which of their designed assets gets output from the tooling, developers have control over what gets checked into the codebase, site, and packages."
                    }
                ]
            },
            {
                "type": "heading",
                "attrs": { "level": 3 },
                "content": [{ "type": "text", "text": "Main Goals" }]
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "Utilizing bidirectional sync with GitHub based on versioning, design and development now have a dual turn key moment for releasing new changes in things like iconography, design tokens, and illustrations. Designers have the ability to see the status of their work, and developers have visibility into what changes are made instead of reaching blindly into the google folder to grab all icons and hope that nothing breaks again."
                    }
                ]
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "By bridging the gap between design and code here, our design system team can now create, publish, and release new iconography from Figma to the team''s codebase the same day. Much better than the 6-8 week turnaround due to meetings, backlogging tickets, and working around release schedules."
                    }
                ]
            }
        ]
    }'::jsonb
),
(
    'design-process',
    'Design Process',
    'Dual Track Agile',
    'An overview of the design process and methodology used in product development.',
    'design process, agile, methodology, product development',
    (SELECT id FROM public.profiles WHERE username = 'darianrosebrook' LIMIT 1),
    'Process',
    null,
    'published',
    '2024-02-01T00:00:00Z',
    '{
        "type": "doc",
        "content": [
            {
                "type": "heading",
                "attrs": { "level": 1 },
                "content": [{ "type": "text", "text": "Design Process" }]
            },
            {
                "type": "heading",
                "attrs": { "level": 2 },
                "content": [{ "type": "text", "text": "Dual Track Agile" }]
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "This case study explores the design process and methodology used in product development, focusing on the dual track agile approach that balances discovery and delivery."
                    }
                ]
            }
        ]
    }'::jsonb
);

-- Update word counts for the inserted case studies
UPDATE public.case_studies 
SET wordCount = (
    SELECT LENGTH(REGEXP_REPLACE(articleBody::text, '<[^>]*>', '', 'g')) / 5
    WHERE id = case_studies.id
)
WHERE articleBody IS NOT NULL;




