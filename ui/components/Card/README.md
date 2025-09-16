# Card (Compound)

Card groups related content and actions. It supports composition via explicit subcomponents and token-driven styling.

## Usage

```tsx
import Card from '@/ui/components/Card';

<Card interactive>
  <Card.Header>
    <Card.Badge status="completed">Already built</Card.Badge>
  </Card.Header>
  <Card.Content>
    <Card.Title>Typography Inspector</Card.Title>
    <Card.Description>
      Canvas-based tool that visualizes x-height, cap height, baselines...
    </Card.Description>
  </Card.Content>
  <Card.Footer>
    <Card.Actions>
      <Card.Link href="/blueprints/foundations/typography">Explore →</Card.Link>
    </Card.Actions>
    <Card.Note>Ideal for documenting typography tokens.</Card.Note>
  </Card.Footer>
</Card>;
```

## Props

- Card
  - interactive?: boolean — enables hover elevation and translateY
  - ...div props
- Card.Badge
  - status?: 'completed' | 'in-progress' | 'planned' | 'deprecated' | 'category' | 'complexity'
  - ...span props
- Card.Link
  - ...anchor props

## Accessibility

- Uses semantic elements: h3 for title, p for description, blockquote for note
- Link is an anchor; consumers may wrap with Next Link as needed

## Tokens

- Consumes `Card.tokens.json` → `Card.tokens.generated.scss`
- Background, radius, padding, elevation all map to semantic tokens

## Related

- Details, Popover, Button, Status
