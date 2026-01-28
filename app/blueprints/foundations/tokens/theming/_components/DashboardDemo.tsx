'use client';

import React from 'react';
import styles from './DashboardDemo.module.scss';
import { SearchCard } from './SearchCard';
import { TeamCard } from './TeamCard';
import { NotificationCard } from './NotificationCard';
import { SignUpCard } from './SignUpCard';
import { ProfileCard } from './ProfileCard';
import { MetricsCard } from './MetricsCard';
import { InvoiceCard } from './InvoiceCard';
import { ActivityCard } from './ActivityCard';
import { SettingsCard } from './SettingsCard';
import { TodoCard } from './TodoCard';
import { TopCustomersCard } from './TopCustomersCard';
import { TabsCard } from './TabsCard';
import { ProgressCard } from './ProgressCard';
import { SliderCard } from './SliderCard';
import { AlertCard } from './AlertCard';
import { EditorialCard } from './EditorialCard';
import { HeroProductCards } from './HeroProductCards';
import { PricingCard } from './PricingCard';
import { EditProductCard } from './EditProductCard';
import { SizeSelectorCard } from './SizeSelectorCard';
import { OrdersTableCard } from './OrdersTableCard';
import { DeliveryCard } from './DeliveryCard';
import { ShoppingCartCard } from './ShoppingCartCard';
import { TagsAndBookmarksCards } from './TagsAndBookmarksCards';
import { CompanyCardVisual } from './CompanyCardVisual';
import { ShipmentTrackingCard } from './ShipmentTrackingCard';
import { InvoicePaidCard } from './InvoicePaidCard';
import { FinancialPerformanceCard } from './FinancialPerformanceCard';
import { NotificationSettingsCard } from './NotificationSettingsCard';
import { ProfileEditCard } from './ProfileEditCard';

/**
 * Comprehensive UI showcase demonstrating brand theming across
 * a wide range of component types and configurations.
 * Inspired by Radix Themes live examples with full-bleed layout.
 */
export const DashboardDemo: React.FC = () => {
  return (
    <div className={styles.showcase}>
      {/* Hero Section with Cards */}
      <section className={styles.heroSection}>
        <EditorialCard />
        <HeroProductCards />
      </section>
      <SearchCard />
      <TeamCard />
      <NotificationCard />
      <SignUpCard />
      <CompanyCardVisual />
      <ProfileCard />
      <MetricsCard />
      <FinancialPerformanceCard />
      <InvoiceCard />
      <InvoicePaidCard />
      <ActivityCard />
      <SettingsCard />
      <NotificationSettingsCard />
      <TodoCard />
      <TopCustomersCard />
      <ProfileEditCard />
      <TabsCard />
      <ProgressCard />
      <SliderCard />
      <AlertCard />

      <PricingCard />
      <EditProductCard />
      <SizeSelectorCard />
      <OrdersTableCard />
      <ShipmentTrackingCard />
      <DeliveryCard />
      <ShoppingCartCard />
      <TagsAndBookmarksCards />
    </div>
  );
};

export default DashboardDemo;
