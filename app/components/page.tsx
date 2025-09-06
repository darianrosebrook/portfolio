import { Container, Title, BodyContent, Icon } from '@/components/AlertNotice';

export default function ComponentsPage() {
  return (
    <>
      <section className="content">
        <h2>Components</h2>
        <p>
          This is a visual collection of all the components in our design
          system, as a test for our design system congruency and consistency.
        </p>
      </section>
      <section className="content">
        <h2>Component Library</h2>
        {/* 3x3 grid of components */}
        <div className="grid">
          {/* card */}
          <div>
            <Container index={0}>
              <Icon status="info" />
              <Title>Alert Notice</Title>
              <BodyContent>
                This is a test of the alert notice component.
              </BodyContent>
            </Container>
          </div>
        </div>
      </section>
    </>
  );
}
