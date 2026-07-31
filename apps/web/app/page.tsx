import React from "react";
import Link from "next/link";
import {
  pageStyles,
  headerStyles,
  heroStyles,
  dailyReviewStyles,
  featuresStyles,
  feature1Styles,
  feature2Styles,
  feature3Styles,
  ctaStyles,
  footerStyles,
} from "./_components/styles";

export default function Home() {
  return (
    <div className={pageStyles.wrapper}>
      {/* Header */}
      <header className={headerStyles.header}>
        <nav className={headerStyles.nav}>
          <div className={headerStyles.logo}>
            Orma
          </div>
          <div className={headerStyles.navLinksWrap}>
            <a
              className={headerStyles.navLinkActive}
              href="#"
            >
              Home
            </a>
            <a
              className={headerStyles.navLinkInactive}
              href="#"
            >
              Features
            </a>
            <a
              className={headerStyles.navLinkInactive}
              href="#"
            >
              Pricing
            </a>
          </div>
          <Link href="/notes" className={headerStyles.ctaButton}>
            Start Learning
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className={heroStyles.section}>
          <div className={heroStyles.inner}>
            <h1 className={heroStyles.heading}>
              Learning that feels like home.
            </h1>
            <p className={heroStyles.subtext}>
              Write notes, and we’ll handle the rest. No complex setups, just you and your curiosity.
            </p>
            <Link href="/notes" className={heroStyles.ctaButton}>
              Start Learning
            </Link>
          </div>
        </section>

        {/* Centered Daily Review Feature Section */}
        <section className={dailyReviewStyles.section}>
          <div className={dailyReviewStyles.panel}>
            {/* Daily Review Card */}
            <div className={dailyReviewStyles.card}>
              <div className={dailyReviewStyles.cardHeaderRow}>
                <div className={dailyReviewStyles.iconBadge}>
                  <span className={dailyReviewStyles.iconText}>
                    auto_stories
                  </span>
                </div>
                <span className={dailyReviewStyles.badge}>
                  5 concepts ready
                </span>
              </div>
              <div className={dailyReviewStyles.titleWrap}>
                <p className={dailyReviewStyles.eyebrow}>
                  Spaced Repetition
                </p>
                <h3 className={dailyReviewStyles.heading}>
                  Your Daily Review is ready to explore.
                </h3>
              </div>
              <p className={dailyReviewStyles.bodyText}>
                We've curated 5 key concepts from your notes on "Renaissance Art" to reinforce today. It only takes 3 minutes.
              </p>
              <Link href="/notes" className={dailyReviewStyles.ctaButton}>
                Begin Session
              </Link>
            </div>
            {/* Decorative background elements */}
            <div className={dailyReviewStyles.decorLeft}>
              <div className={dailyReviewStyles.decorLeftBlob}></div>
            </div>
            <div className={dailyReviewStyles.decorRight}>
              <div className={dailyReviewStyles.decorRightBlob}></div>
            </div>
          </div>
        </section>

        {/* Staggered "Frictionless by Design" Section */}
        <section className={featuresStyles.section}>
          <div className={featuresStyles.headerWrap}>
            <h2 className={featuresStyles.heading}>
              Frictionless by Design
            </h2>
            <div className={featuresStyles.headingUnderline}></div>
          </div>

          <div className={featuresStyles.list}>
            {/* Feature 1: Capture Effortlessly */}
            <div className={featuresStyles.row}>
              <div className={featuresStyles.textCol}>
                <div className={featuresStyles.iconBadge}>
                  <span className={featuresStyles.iconText}>edit_note</span>
                </div>
                <h3 className={featuresStyles.title}>
                  Capture effortlessly
                </h3>
                <p className={featuresStyles.bodyText}>
                  Our editor is built for flow. No complicated markdown, no nested folders—just a clean slate that feels like high-quality paper. Focus on the thought, not the tool.
                </p>
              </div>
              <div className={featuresStyles.textCol}>
                <div className={feature1Styles.visualOuter}>
                  <div className={feature1Styles.visualCard}>
                    <div className={feature1Styles.line1}></div>
                    <div className={feature1Styles.line2}></div>
                    <div className={feature1Styles.line3}></div>
                    <div className={feature1Styles.footerDivider}>
                      <div className={feature1Styles.tagRow}>
                        <div className={feature1Styles.tag1}></div>
                        <div className={feature1Styles.tag2}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Automated Spaced Repetition (Text Right) */}
            <div className={featuresStyles.rowReverse}>
              <div className={featuresStyles.textCol}>
                <div className={featuresStyles.iconBadge}>
                  <span className={featuresStyles.iconText}>update</span>
                </div>
                <h3 className={featuresStyles.title}>
                  Automated Spaced Repetition
                </h3>
                <p className={featuresStyles.bodyText}>
                  Orma automatically identifies key concepts and schedules reviews. Retain more with scientifically-proven learning rhythms that adapt to your pace.
                </p>
              </div>
              <div className={featuresStyles.textCol}>
                <div className={feature2Styles.visualOuter}>
                  <div className={feature2Styles.stackWrap}>
                    <div className={feature2Styles.frontCard}>
                      <p className={feature2Styles.frontCardEyebrow}>Review Today</p>
                      <h4 className={feature2Styles.frontCardTitle}>Golden Ratio</h4>
                      <div className={feature2Styles.frontCardFooterRow}>
                        <div className={feature2Styles.avatarsWrap}>
                          <div className={feature2Styles.avatar1}></div>
                          <div className={feature2Styles.avatar2}></div>
                        </div>
                        <span className={feature2Styles.trendIcon}>
                          trending_up
                        </span>
                      </div>
                    </div>
                    <div className={feature2Styles.backCard}>
                      <div className={feature2Styles.backCardLine1}></div>
                      <div className={feature2Styles.backCardLine2}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Context-Aware AI */}
            <div className={featuresStyles.row}>
              <div className={featuresStyles.textCol}>
                <div className={featuresStyles.iconBadge}>
                  <span className={featuresStyles.iconText}>auto_awesome</span>
                </div>
                <h3 className={featuresStyles.title}>
                  Context-Aware AI
                </h3>
                <p className={featuresStyles.bodyText}>
                  Our AI doesn't write for you; it thinks with you. It connects new notes to your existing library, surfacing relevant insights when you need them most.
                </p>
              </div>
              <div className={featuresStyles.textCol}>
                <div className={feature3Styles.visualOuter}>
                  <div className={feature3Styles.cardWrap}>
                    {/* Insight Card Detail */}
                    <div className={feature3Styles.card}>
                      <div>
                        <div className={feature3Styles.labelRow}>
                          <span className={feature3Styles.labelIcon}>
                            lightbulb
                          </span>
                          <span className={feature3Styles.labelText}>
                            Related Insight
                          </span>
                        </div>
                        <p className={feature3Styles.quoteText}>
                          "This echoes your note from March on Biomimicry in Architecture."
                        </p>
                      </div>
                      <div className={feature3Styles.barsRow}>
                        <div className={feature3Styles.barActive}></div>
                        <div className={feature3Styles.barInactive}></div>
                        <div className={feature3Styles.barInactive}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={ctaStyles.section}>
          <div className={ctaStyles.panel}>
            <div className={ctaStyles.content}>
              <h2 className={ctaStyles.heading}>Ready to find your focus?</h2>
              <p className={ctaStyles.bodyText}>
                Join 20,000+ curious minds who have turned their digital workspace into a peaceful
                sanctuary of learning.
              </p>
              <div className={ctaStyles.buttonRow}>
                <button className={ctaStyles.primaryButton}>
                  Get Orma Free
                </button>
                <button className={ctaStyles.secondaryButton}>
                  See how it works
                </button>
              </div>
            </div>
            <div className={ctaStyles.decorTop}></div>
            <div className={ctaStyles.decorBottom}></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={footerStyles.footer}>
        <div className={footerStyles.inner}>
          <div className={footerStyles.brandCol}>
            <div className={footerStyles.brandTitle}>
              Orma
            </div>
            <p className={footerStyles.copyright}>
              © 2026 Orma Learning. All rights reserved.
            </p>
          </div>
          <div className={footerStyles.linksRow}>
            <a
              className={footerStyles.link}
              href="#"
            >
              Community
            </a>
            <a
              className={footerStyles.link}
              href="#"
            >
              Support
            </a>
            <a
              className={footerStyles.link}
              href="#"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
