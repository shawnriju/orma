import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-body-md overflow-x-hidden min-h-screen bg-surface text-on-background">
      {/* Header */}
      <header className="w-full top-0 sticky z-50 bg-surface/90 backdrop-blur-md dark:bg-on-background">
        <nav className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto">
          <div className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
            Orma
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a
              className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1"
              href="#"
            >
              Home
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors duration-200"
              href="#"
            >
              Features
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors duration-200"
              href="#"
            >
              Pricing
            </a>
          </div>
          <Link href="/notes/renaissance-architecture" className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-lg font-label-md text-label-md active:scale-95 transition-transform cursor-pointer">
            Start Learning
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-gutter py-stack-lg md:pt-24 md:pb-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display-lg text-display-lg text-on-surface mb-6 leading-tight">
              Learning that feels like home.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
              Write notes, and we’ll handle the rest. No complex setups, just you and your curiosity.
            </p>
            <Link href="/notes/renaissance-architecture" className="inline-block bg-primary-container text-on-primary-container px-10 py-4 rounded-xl font-label-md text-[18px] hover:opacity-90 transition-all active:scale-95 cursor-pointer">
              Start Learning
            </Link>
          </div>
        </section>

        {/* Centered Daily Review Feature Section */}
        <section className="max-w-container-max mx-auto px-gutter pb-stack-lg">
          <div className="relative bg-surface-container-low rounded-[3rem] p-8 md:p-24 overflow-hidden flex flex-col items-center justify-center">
            {/* Daily Review Card */}
            <div className="tonal-card p-10 md:p-12 rounded-[2rem] warm-glow border-primary/10 max-w-lg w-full cursor-default relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-container text-3xl">
                    auto_stories
                  </span>
                </div>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-label-sm font-label-md">
                  5 concepts ready
                </span>
              </div>
              <div className="mb-8">
                <p className="font-label-md text-label-md text-secondary mb-2">
                  Spaced Repetition
                </p>
                <h3 className="font-headline-md text-headline-md text-on-surface leading-snug">
                  Your Daily Review is ready to explore.
                </h3>
              </div>
              <p className="font-body-md text-body-lg text-on-surface-variant mb-10">
                We've curated 5 key concepts from your notes on "Renaissance Art" to reinforce today. It only takes 3 minutes.
              </p>
              <Link href="/notes/renaissance-architecture" className="inline-block w-full text-center bg-primary-container text-on-primary-container font-label-md text-lg py-4 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/10 cursor-pointer">
                Begin Session
              </Link>
            </div>
            {/* Decorative background elements */}
            <div className="absolute -left-20 -bottom-20 opacity-30 pointer-events-none">
              <div className="w-64 h-64 bg-primary-container rounded-full blur-3xl"></div>
            </div>
            <div className="absolute -right-20 -top-20 opacity-30 pointer-events-none">
              <div className="w-80 h-80 bg-secondary-container rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Staggered "Frictionless by Design" Section */}
        <section className="max-w-container-max mx-auto px-gutter py-stack-lg">
          <div className="text-center mb-24">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
              Frictionless by Design
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="space-y-32">
            {/* Feature 1: Capture Effortlessly */}
            <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
              <div className="w-full md:w-1/2">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">
                  Capture effortlessly
                </h3>
                <p className="font-body-md text-body-lg text-on-surface-variant leading-relaxed">
                  Our editor is built for flow. No complicated markdown, no nested folders—just a clean slate that feels like high-quality paper. Focus on the thought, not the tool.
                </p>
              </div>
              <div className="w-full md:w-1/2">
                <div className="bg-surface-container-high rounded-[2rem] p-8 aspect-video flex items-center justify-center">
                  <div className="tonal-card w-full h-full rounded-xl p-6 space-y-4 shadow-sm overflow-hidden">
                    <div className="h-4 w-3/4 bg-surface-container-highest/40 rounded"></div>
                    <div className="h-4 w-full bg-surface-container-highest/20 rounded"></div>
                    <div className="h-4 w-5/6 bg-surface-container-highest/20 rounded"></div>
                    <div className="pt-4 border-t border-outline-variant/20">
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-primary-container/20 rounded-full"></div>
                        <div className="h-6 w-20 bg-secondary-container/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Automated Spaced Repetition (Text Right) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-16 md:gap-24">
              <div className="w-full md:w-1/2">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary">update</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">
                  Automated Spaced Repetition
                </h3>
                <p className="font-body-md text-body-lg text-on-surface-variant leading-relaxed">
                  Orma automatically identifies key concepts and schedules reviews. Retain more with scientifically-proven learning rhythms that adapt to your pace.
                </p>
              </div>
              <div className="w-full md:w-1/2">
                <div className="bg-secondary-container/30 rounded-[2rem] p-10 aspect-video flex items-center justify-center">
                  <div className="relative">
                    <div className="tonal-card p-6 rounded-2xl w-56 transform -rotate-4 relative z-20">
                      <p className="text-label-sm text-secondary mb-2">Review Today</p>
                      <h4 className="font-headline-sm text-on-surface font-semibold">Golden Ratio</h4>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-secondary/20 border-2 border-white"></div>
                        </div>
                        <span className="material-symbols-outlined text-outline text-sm">
                          trending_up
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 tonal-card p-6 rounded-2xl w-56 transform rotate-6 opacity-60 z-10">
                      <div className="h-4 w-20 bg-surface-container rounded mb-4"></div>
                      <div className="h-2 w-full bg-surface-container/40 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Context-Aware AI */}
            <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
              <div className="w-full md:w-1/2">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">
                  Context-Aware AI
                </h3>
                <p className="font-body-md text-body-lg text-on-surface-variant leading-relaxed">
                  Our AI doesn't write for you; it thinks with you. It connects new notes to your existing library, surfacing relevant insights when you need them most.
                </p>
              </div>
              <div className="w-full md:w-1/2">
                <div className="bg-primary-container/10 rounded-[2rem] p-8 aspect-video flex items-center justify-center">
                  <div className="relative w-full max-w-xs h-40">
                    {/* Insight Card Detail */}
                    <div className="absolute inset-0 tonal-card p-6 rounded-2xl flex flex-col justify-between border-primary/20 bg-surface-bright">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-primary text-sm">
                            lightbulb
                          </span>
                          <span className="text-label-sm text-primary uppercase tracking-wider">
                            Related Insight
                          </span>
                        </div>
                        <p className="font-label-md text-on-surface italic">
                          "This echoes your note from March on Biomimicry in Architecture."
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <div className="h-1 flex-1 bg-primary rounded-full"></div>
                        <div className="h-1 flex-1 bg-primary/20 rounded-full"></div>
                        <div className="h-1 flex-1 bg-primary/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-container-max mx-auto px-gutter py-stack-lg">
          <div className="bg-primary text-on-primary rounded-3xl p-12 md:p-24 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-display-lg text-display-lg mb-6">Ready to find your focus?</h2>
              <p className="font-body-lg text-body-lg mb-10 opacity-90 max-w-xl mx-auto">
                Join 20,000+ curious minds who have turned their digital workspace into a peaceful
                sanctuary of learning.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button className="bg-surface text-primary px-10 py-4 rounded-xl font-label-md text-lg active:scale-95 transition-all cursor-pointer">
                  Get Orma Free
                </button>
                <button className="border border-white/30 text-white px-10 py-4 rounded-xl font-label-md text-lg hover:bg-white/10 transition-all cursor-pointer">
                  See how it works
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-stack-lg bg-surface-container dark:bg-surface-container-highest">
        <div className="flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Orma
            </div>
            <p className="font-label-sm text-label-sm text-on-surface/80 dark:text-on-surface-variant">
              © 2026 Orma Learning. All rights reserved.
            </p>
          </div>
          <div className="flex gap-gutter">
            <a
              className="font-label-sm text-label-sm text-on-surface dark:text-on-surface-variant hover:text-primary transition-colors"
              href="#"
            >
              Community
            </a>
            <a
              className="font-label-sm text-label-sm text-on-surface dark:text-on-surface-variant hover:text-primary transition-colors"
              href="#"
            >
              Support
            </a>
            <a
              className="font-label-sm text-label-sm text-on-surface dark:text-on-surface-variant hover:text-primary transition-colors"
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
