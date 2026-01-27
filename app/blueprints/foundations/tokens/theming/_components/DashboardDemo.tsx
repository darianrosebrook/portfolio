'use client';

import React, { useState } from 'react';
import styles from './DashboardDemo.module.scss';

/**
 * Comprehensive UI showcase demonstrating brand theming across
 * a wide range of component types and configurations.
 * Inspired by Radix Themes live examples with full-bleed layout.
 */
export const DashboardDemo: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState('9');
  const [activeTab, setActiveTab] = useState('profile');
  const [switchStates, setSwitchStates] = useState({
    notifications: true,
    marketing: false,
    analytics: true,
  });

  return (
    <div className={styles.showcase}>
      {/* Search and Filter Card */}
      <div className={styles.searchCard}>
        <h3>Search products</h3>
        <div className={styles.searchInput}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchField}
          />
        </div>
        <div className={styles.filterTags}>
          <button className={`${styles.filterTag} ${styles.active}`}>
            All
          </button>
          <button className={styles.filterTag}>New</button>
          <button className={styles.filterTag}>Sale</button>
          <button className={styles.filterTag}>Featured</button>
        </div>
      </div>

      {/* Notification Card */}
      <div className={styles.notificationCard}>
        <div className={styles.notificationHeader}>
          <div className={styles.notificationIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className={styles.notificationContent}>
            <h4>New order received</h4>
            <p>Order #1006 for $234.50</p>
          </div>
          <button className={styles.closeButton}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.notificationActions}>
          <button className={styles.secondaryButton}>View order</button>
          <button className={styles.primaryButton}>Mark as read</button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            <span>JD</span>
          </div>
          <div className={styles.profileInfo}>
            <h4>John Doe</h4>
            <p>john.doe@example.com</p>
          </div>
        </div>
        <div className={styles.profileStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>24</span>
            <span className={styles.statLabel}>Orders</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>$1,234</span>
            <span className={styles.statLabel}>Spent</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>12</span>
            <span className={styles.statLabel}>Reviews</span>
          </div>
        </div>
        <button className={styles.secondaryButton}>View profile</button>
      </div>

      {/* Stats Card */}
      <div className={styles.statsCard}>
        <h3>Today&apos;s metrics</h3>
        <div className={styles.metricList}>
          <div className={styles.metricItem}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Revenue</span>
              <span className={`${styles.metricChange} ${styles.positive}`}>
                +12.5%
              </span>
            </div>
            <div className={styles.metricValue}>$4,832</div>
            <div className={styles.metricBar}>
              <div className={styles.metricBarFill} style={{ width: '75%' }} />
            </div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Orders</span>
              <span className={`${styles.metricChange} ${styles.positive}`}>
                +8.2%
              </span>
            </div>
            <div className={styles.metricValue}>284</div>
            <div className={styles.metricBar}>
              <div className={styles.metricBarFill} style={{ width: '60%' }} />
            </div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Customers</span>
              <span className={`${styles.metricChange} ${styles.negative}`}>
                -2.1%
              </span>
            </div>
            <div className={styles.metricValue}>1,429</div>
            <div className={styles.metricBar}>
              <div className={styles.metricBarFill} style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed Card */}
      <div className={styles.activityCard}>
        <h3>Recent activity</h3>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              </svg>
            </div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>Order #1005 shipped</p>
              <p className={styles.activityTime}>2 minutes ago</p>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>New customer registered</p>
              <p className={styles.activityTime}>15 minutes ago</p>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>Payment received: $234.50</p>
              <p className={styles.activityTime}>1 hour ago</p>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>Conversion rate updated</p>
              <p className={styles.activityTime}>2 hours ago</p>
            </div>
          </div>
        </div>
        <button className={styles.linkButton}>View all activity</button>
      </div>

      {/* Settings Card */}
      <div className={styles.settingsCard}>
        <h3>Preferences</h3>
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span>Email notifications</span>
            <span className={styles.settingDescription}>
              Receive updates via email
            </span>
          </div>
          <label className={styles.toggle}>
            <input type="checkbox" defaultChecked />
            <span className={styles.toggleSlider} />
          </label>
        </div>
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span>Marketing emails</span>
            <span className={styles.settingDescription}>
              Promotional content
            </span>
          </div>
          <label className={styles.toggle}>
            <input type="checkbox" />
            <span className={styles.toggleSlider} />
          </label>
        </div>
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span>Dark mode</span>
            <span className={styles.settingDescription}>Use dark theme</span>
          </div>
          <label className={styles.toggle}>
            <input type="checkbox" defaultChecked />
            <span className={styles.toggleSlider} />
          </label>
        </div>
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span>Auto-save</span>
            <span className={styles.settingDescription}>
              Save changes automatically
            </span>
          </div>
          <label className={styles.toggle}>
            <input type="checkbox" defaultChecked />
            <span className={styles.toggleSlider} />
          </label>
        </div>
      </div>

      {/* Tabs Card */}
      <div className={styles.tabsCard}>
        <div className={styles.tabList}>
          <button className={`${styles.tab} ${styles.tabActive}`}>
            Overview
          </button>
          <button className={styles.tab}>Analytics</button>
          <button className={styles.tab}>Reports</button>
          <button className={styles.tab}>Settings</button>
        </div>
        <div className={styles.tabContent}>
          <h4>Dashboard overview</h4>
          <p>View your key metrics and recent activity at a glance.</p>
          <div className={styles.quickStats}>
            <div className={styles.quickStat}>
              <span className={styles.quickStatValue}>1,234</span>
              <span className={styles.quickStatLabel}>Total users</span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.quickStatValue}>$45K</span>
              <span className={styles.quickStatLabel}>Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className={styles.progressCard}>
        <h3>Project progress</h3>
        <div className={styles.progressItem}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Design System</span>
            <span className={styles.progressPercent}>85%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: '85%' }} />
          </div>
        </div>
        <div className={styles.progressItem}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>API Integration</span>
            <span className={styles.progressPercent}>62%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: '62%' }} />
          </div>
        </div>
        <div className={styles.progressItem}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Documentation</span>
            <span className={styles.progressPercent}>45%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: '45%' }} />
          </div>
        </div>
        <div className={styles.progressItem}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Testing</span>
            <span className={styles.progressPercent}>30%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: '30%' }} />
          </div>
        </div>
      </div>

      {/* Slider Card */}
      <div className={styles.sliderCard}>
        <h3>Volume control</h3>
        <div className={styles.sliderGroup}>
          <label>Master volume</label>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="75"
              className={styles.slider}
            />
            <span className={styles.sliderValue}>75%</span>
          </div>
        </div>
        <div className={styles.sliderGroup}>
          <label>Bass</label>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              className={styles.slider}
            />
            <span className={styles.sliderValue}>50%</span>
          </div>
        </div>
        <div className={styles.sliderGroup}>
          <label>Treble</label>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="60"
              className={styles.slider}
            />
            <span className={styles.sliderValue}>60%</span>
          </div>
        </div>
      </div>
      {/* Alert Card */}
      <div className={styles.alertCard}>
        <div className={styles.alertIcon}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className={styles.alertContent}>
          <h4>Low inventory warning</h4>
          <p>5 products are running low on stock. Consider restocking soon.</p>
        </div>
        <button className={styles.alertAction}>View products</button>
      </div>

      {/* Hero Section with Cards */}
      <section className={styles.heroSection}>
        <div className={styles.heroCard}>
          <div className={styles.cardImage}>
            <div className={styles.imagePlaceholder}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          </div>
          <div className={styles.cardContent}>
            <h3>Back to basics</h3>
            <p>Simple and versatile</p>
            <button className={styles.cardButton}>Shop now</button>
          </div>
        </div>

        <div className={styles.heroCard}>
          <div className={styles.cardImage}>
            <div className={styles.imagePlaceholder}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <div className={styles.cardContent}>
            <h3>Pants and jeans</h3>
            <h4>Jeans #7</h4>
            <p className={styles.price}>$149</p>
            <p className={styles.description}>
              Jeans with a sense of nostalgia, as if they carry whispered tales
              of past adventures.
            </p>
            <div className={styles.cardActions}>
              <select className={styles.select}>
                <option>Lighter</option>
                <option>Darker</option>
              </select>
              <select className={styles.select}>
                <option>30</option>
                <option>32</option>
                <option>34</option>
              </select>
              <button className={styles.primaryButton}>Add to cart</button>
            </div>
          </div>
        </div>

        <div className={styles.heroCard}>
          <div className={styles.cardImage}>
            <div className={styles.imagePlaceholder}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
          </div>
          <div className={styles.cardContent}>
            <h3>Footwear</h3>
            <h4>Sneakers #12</h4>
            <p className={styles.price}>$149</p>
            <p className={styles.description}>
              Love at the first sight for enthusiasts seeking a fresh and
              whimsical style.
            </p>
            <div className={styles.cardActions}>
              <select className={styles.select}>
                <option>Pastel</option>
                <option>Bold</option>
              </select>
              <select className={styles.select}>
                <option>8</option>
                <option>9</option>
                <option>10</option>
              </select>
              <button className={styles.primaryButton}>Buy</button>
            </div>
          </div>
        </div>
      </section>

      {/* Forms and Inputs Section */}
      <div className={styles.formCard}>
        <h3>Edit product</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              defaultValue="Skirt #16"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Price</label>
            <input type="text" defaultValue="$99" className={styles.input} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Media</label>
          <div className={styles.mediaGrid}>
            <div className={styles.mediaItem}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div className={styles.mediaItem}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <div className={styles.textEditor}>
            <div className={styles.editorToolbar}>
              <button className={styles.toolButton}>
                <strong>B</strong>
              </button>
              <button className={styles.toolButton}>
                <em>I</em>
              </button>
              <button className={styles.toolButton}>
                <u>U</u>
              </button>
              <button className={styles.toolButton}>≡</button>
              <button className={styles.toolButton}>≣</button>
              <button className={styles.toolButton}>≢</button>
            </div>
            <textarea
              className={styles.textarea}
              defaultValue="Amidst the soft hues and delicate silence, one's gaze is always drawn towards this skirt..."
              rows={4}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Main material</label>
            <div className={styles.chipGroup}>
              <button className={`${styles.chip} ${styles.chipActive}`}>
                Synthetic
              </button>
              <button className={styles.chip}>Wool</button>
              <button className={styles.chip}>Cotton</button>
              <button className={styles.chip}>Linen</button>
              <button className={styles.chip}>Denim</button>
              <button className={styles.chip}>Leather</button>
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Main color</label>
            <div className={styles.colorGrid}>
              <button className={`${styles.colorSwatch} ${styles.white}`} />
              <button className={`${styles.colorSwatch} ${styles.gray}`} />
              <button className={`${styles.colorSwatch} ${styles.black}`} />
              <button className={`${styles.colorSwatch} ${styles.red}`} />
              <button className={`${styles.colorSwatch} ${styles.pink}`} />
              <button className={`${styles.colorSwatch} ${styles.violet}`} />
              <button className={`${styles.colorSwatch} ${styles.blue}`} />
              <button className={`${styles.colorSwatch} ${styles.green}`} />
              <button className={`${styles.colorSwatch} ${styles.beige}`} />
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Sizes</label>
          <div className={styles.sizeGrid}>
            <button className={styles.sizeButton}>XS</button>
            <button className={styles.sizeButton}>S</button>
            <button className={styles.sizeButton}>M</button>
            <button className={styles.sizeButton}>L</button>
            <button className={styles.sizeButton}>XL</button>
          </div>
        </div>
      </div>

      {/* Size Selector */}
      <div className={styles.sizeCard}>
        <h4>Size</h4>
        <div className={styles.sizeSelector}>
          {['5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'].map(
            (size) => (
              <button
                key={size}
                className={`${styles.sizeOption} ${selectedSize === size ? styles.active : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            )
          )}
        </div>

        <h4>Material</h4>
        <div className={styles.materialSelector}>
          <button className={styles.materialButton}>Leather</button>
          <button className={styles.materialButton}>Suede</button>
          <button className={styles.materialButton}>Mesh</button>
          <button className={styles.materialButton}>Canvas</button>
        </div>

        <h4>Color</h4>
        <div className={styles.colorSelector}>
          <button className={`${styles.colorButton} ${styles.white}`}>
            White
          </button>
          <button className={`${styles.colorButton} ${styles.gray}`}>
            Gray
          </button>
          <button className={`${styles.colorButton} ${styles.black}`}>
            Black
          </button>
          <button className={`${styles.colorButton} ${styles.red}`}>Red</button>
          <button className={`${styles.colorButton} ${styles.pink}`}>
            Pink
          </button>
          <button className={`${styles.colorButton} ${styles.violet}`}>
            Violet
          </button>
          <button className={`${styles.colorButton} ${styles.blue}`}>
            Blue
          </button>
          <button className={`${styles.colorButton} ${styles.green}`}>
            Green
          </button>
          <button className={`${styles.colorButton} ${styles.beige}`}>
            Beige
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.ordersTable}>
        <div className={styles.tableHeader}>
          <h3>Orders</h3>
          <span className={styles.dateLabel}>May 2023</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order no.</th>
              <th>Payment</th>
              <th>Fulfillment</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#1005</td>
              <td>
                <span className={`${styles.badge} ${styles.success}`}>
                  Paid
                </span>
              </td>
              <td>
                <span className={`${styles.badge} ${styles.warning}`}>
                  Delivering
                </span>
              </td>
              <td>$154.60</td>
            </tr>
            <tr>
              <td>#1004</td>
              <td>
                <span className={`${styles.badge} ${styles.success}`}>
                  Paid
                </span>
              </td>
              <td>
                <span className={`${styles.badge} ${styles.warning}`}>
                  Unfulfilled
                </span>
              </td>
              <td>$93.49</td>
            </tr>
            <tr>
              <td>#1003</td>
              <td>
                <span className={`${styles.badge} ${styles.neutral}`}>
                  Refunded
                </span>
              </td>
              <td>
                <span className={`${styles.badge} ${styles.error}`}>
                  Cancelled
                </span>
              </td>
              <td>$39.00</td>
            </tr>
            <tr>
              <td>#1002</td>
              <td>
                <span className={`${styles.badge} ${styles.warning}`}>
                  Unpaid
                </span>
              </td>
              <td>
                <span className={`${styles.badge} ${styles.warning}`}>
                  Unfulfilled
                </span>
              </td>
              <td>$438.90</td>
            </tr>
            <tr>
              <td>#1001</td>
              <td>
                <span className={`${styles.badge} ${styles.success}`}>
                  Paid
                </span>
              </td>
              <td>
                <span className={`${styles.badge} ${styles.success}`}>
                  Fulfilled
                </span>
              </td>
              <td>$532.64</td>
            </tr>
            <tr>
              <td>#1000</td>
              <td>
                <span className={`${styles.badge} ${styles.success}`}>
                  Paid
                </span>
              </td>
              <td>
                <span className={`${styles.badge} ${styles.success}`}>
                  Fulfilled
                </span>
              </td>
              <td>$625.03</td>
            </tr>
          </tbody>
        </table>
        <button className={styles.showMoreButton}>Show more</button>
      </div>

      {/* Delivery Card */}
      <div className={styles.deliveryCard}>
        <h3>Delivery</h3>
        <div className={styles.deliveryOptions}>
          <button className={styles.deliveryOption}>Tomorrow</button>
          <button className={styles.deliveryOption}>Within 3 days</button>
        </div>
        <div className={styles.deliveryTime}>
          <p className={styles.label}>Tomorrow</p>
          <p className={styles.time}>12:00 pm – 2:00 pm</p>
        </div>
        <div className={styles.deliveryAddress}>
          <p className={styles.name}>Luna Rodriguez</p>
          <p className={styles.address}>9876 Maple Avenue</p>
          <p className={styles.address}>Cityville, WA 54321</p>
        </div>
        <div className={styles.mapPlaceholder}>
          <svg width="100%" height="120" viewBox="0 0 200 120" fill="none">
            <rect
              width="200"
              height="120"
              fill="var(--semantic-color-background-secondary)"
            />
            <path
              d="M20 80 Q60 40 100 60 T180 50"
              stroke="var(--semantic-color-foreground-accent)"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="100"
              cy="60"
              r="4"
              fill="var(--semantic-color-foreground-accent)"
            />
          </svg>
        </div>
        <div className={styles.deliveryActions}>
          <button className={styles.secondaryButton}>Edit</button>
          <button className={styles.primaryButton}>Confirm</button>
        </div>
      </div>

      {/* Shopping Cart */}
      <div className={styles.cartCard}>
        <h3>Shopping cart</h3>
        <div className={styles.cartItems}>
          <div className={styles.cartItem}>
            <div className={styles.itemImage}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              </svg>
            </div>
            <div className={styles.itemDetails}>
              <p className={styles.itemName}>Poncho #4</p>
              <p className={styles.itemSize}>Size M</p>
            </div>
            <select className={styles.quantitySelect}>
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <p className={styles.itemPrice}>$79</p>
          </div>

          <div className={styles.cartItem}>
            <div className={styles.itemImage}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
            </div>
            <div className={styles.itemDetails}>
              <p className={styles.itemName}>Jeans #8</p>
              <p className={styles.itemSize}>Size 30</p>
            </div>
            <select className={styles.quantitySelect}>
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <p className={styles.itemPrice}>$118</p>
          </div>

          <div className={styles.cartItem}>
            <div className={styles.itemImage}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div className={styles.itemDetails}>
              <p className={styles.itemName}>Sneakers #14</p>
              <p className={styles.itemSize}>Size 8</p>
            </div>
            <select className={styles.quantitySelect}>
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <p className={styles.itemPrice}>$116</p>
          </div>
        </div>

        <div className={styles.cartTotal}>
          <span>Total</span>
          <span className={styles.totalAmount}>$313</span>
        </div>
        <button className={styles.checkoutButton}>Go to checkout</button>
      </div>

      {/* Tags Collection Card */}
      <div className={styles.tagsCard}>
        <h3>Product tags</h3>
        <div className={styles.tagCollection}>
          <span className={`${styles.tag} ${styles.tagActive}`}>Featured</span>
          <span className={styles.tag}>New Arrival</span>
          <span className={styles.tag}>Best Seller</span>
          <span className={styles.tag}>Limited Edition</span>
          <span className={styles.tag}>Sale</span>
          <span className={styles.tag}>Eco-Friendly</span>
          <span className={styles.tag}>Premium</span>
          <span className={styles.tag}>Vintage</span>
          <span className={styles.tag}>Handmade</span>
          <span className={styles.tag}>Organic</span>
        </div>
        <button className={styles.linkButton}>Manage tags</button>
      </div>
      {/* Bookmarks */}
      <div className={styles.bookmarksCard}>
        <div className={styles.bookmarksHeader}>
          <h3>Bookmarks</h3>
          <button className={styles.linkButton}>Buy all</button>
        </div>
        <div className={styles.bookmarkGrid}>
          <div className={styles.bookmarkItem}>
            <div className={styles.bookmarkImage}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                <rect
                  width="100"
                  height="100"
                  fill="var(--semantic-color-background-secondary)"
                />
              </svg>
            </div>
            <p className={styles.bookmarkName}>Jeans #8</p>
            <p className={styles.bookmarkPrice}>$118</p>
          </div>
          <div className={styles.bookmarkItem}>
            <div className={styles.bookmarkImage}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                <rect
                  width="100"
                  height="100"
                  fill="var(--semantic-color-background-secondary)"
                />
              </svg>
            </div>
            <p className={styles.bookmarkName}>Jacket #3</p>
            <p className={styles.bookmarkPrice}>$49</p>
          </div>
          <div className={styles.bookmarkItem}>
            <div className={styles.bookmarkImage}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                <rect
                  width="100"
                  height="100"
                  fill="var(--semantic-color-background-secondary)"
                />
              </svg>
            </div>
            <p className={styles.bookmarkName}>Pants #10</p>
            <p className={styles.bookmarkPrice}>$32</p>
          </div>
          <div className={styles.bookmarkItem}>
            <div className={styles.bookmarkImage}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                <rect
                  width="100"
                  height="100"
                  fill="var(--semantic-color-background-secondary)"
                />
              </svg>
            </div>
            <p className={styles.bookmarkName}>Shirt #11</p>
            <p className={styles.bookmarkPrice}>$39</p>
          </div>
        </div>
      </div>

      {/* Bookmarks Card */}
      <div className={styles.bookmarksCard}>
        <div className={styles.bookmarksHeader}>
          <h3>Bookmarks</h3>
          <button className={styles.linkButton}>Buy all</button>
        </div>
        <div className={styles.bookmarkGrid}>
          <div className={styles.bookmarkItem}>
            <div className={styles.bookmarkImage}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                <rect
                  width="100"
                  height="100"
                  fill="var(--semantic-color-background-secondary)"
                />
              </svg>
            </div>
            <p className={styles.bookmarkName}>Jeans #8</p>
            <p className={styles.bookmarkPrice}>$118</p>
          </div>
          <div className={styles.bookmarkItem}>
            <div className={styles.bookmarkImage}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                <rect
                  width="100"
                  height="100"
                  fill="var(--semantic-color-background-secondary)"
                />
              </svg>
            </div>
            <p className={styles.bookmarkName}>Jacket #3</p>
            <p className={styles.bookmarkPrice}>$49</p>
          </div>
          <div className={styles.bookmarkItem}>
            <div className={styles.bookmarkImage}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                <rect
                  width="100"
                  height="100"
                  fill="var(--semantic-color-background-secondary)"
                />
              </svg>
            </div>
            <p className={styles.bookmarkName}>Pants #10</p>
            <p className={styles.bookmarkPrice}>$32</p>
          </div>
          <div className={styles.bookmarkItem}>
            <div className={styles.bookmarkImage}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                <rect
                  width="100"
                  height="100"
                  fill="var(--semantic-color-background-secondary)"
                />
              </svg>
            </div>
            <p className={styles.bookmarkName}>Shirt #11</p>
            <p className={styles.bookmarkPrice}>$39</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDemo;
