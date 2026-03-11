"use client";

import { useState } from "react";
import CollectionPanel from "@/components/CollectionPanel";
import FeaturePanel from "@/components/FeaturePanel";
import Hero from "@/components/Hero";
import InsightPanel from "@/components/InsightPanel";
import ReferenceShelf from "@/components/ReferenceShelf";
import StatePanel from "@/components/StatePanel";
import StatsStrip from "@/components/StatsStrip";
import WorkspacePanel from "@/components/WorkspacePanel";
import { createInsights, createPlan } from "@/lib/api";

const APP_NAME = "Route Postcard";
const TAGLINE = "Print\u2011ready Korean adventures, delivered as editorial postcards.";
const FEATURE_CHIPS = ["{'name': 'Mood\u2011Driven Wizard', 'description': 'Full\u2011bleed hero form with city dropdown, visual mood cards (Foodie, Relaxed, Adventurous, etc.), length slider and budget selector. Selections instantly power the postcard generator without a page reload.'}", "{'name': 'Dynamic Postcard Generator', 'description': 'Client\u2011side engine composes day\u2011by\u2011day postcard cards: selects high\u2011resolution hero image, writes short editorial copy, applies handwritten\u2011style date stamp, and wraps everything in a Polaroid\u2011style frame.'}", "{'name': 'Rain\u2011Pivot Flip', 'description': 'Tapping the rain\u2011umbrella icon triggers a 3\u2011D flip animation that swaps the outdoor suggestion with a curated indoor backup, complete with a subtle rain overlay animation.'}", "{'name': 'Neighborhood Stack Explorer', 'description': 'Vertical side panel that groups attractions by district. Each stack shows a thumbnail collage; clicking expands a micro\u2011gallery without leaving the main itinerary view.'}"];
const PROOF_POINTS = ["Curated by seasoned Korean travel writers with bios displayed beside the content.", "Official partnership badge with the Korea Tourism Organization.", "Beta\u2011user testimonial carousel with printed\u2011postcard photos and quotes.", "Sample postcard gallery on the home screen showing real trips."];
const SURFACE_LABELS = {"hero": "Travel\u2011magazine pressroom \u2013 each itinerary appears as a printable postcard spread", "workspace": "Full\u2011bleed hero input form with city selector, mood cards, length & budget controls, and the primary \u2018Generate My Postcards\u2019 button.", "result": "Horizontal postcard carousel (day\u2011by\u2011day cards) that appears directly below the hero and is scrollable on desktop, swipeable on mobile.", "support": "Travel\u2011writer credentials badge", "collection": "Vertical Neighborhood Stack panel showing district thumbnails and expandable micro\u2011galleries."};
const PLACEHOLDERS = {"query": "Select your adventure", "preferences": "Set mood, length & budget"};
const DEFAULT_STATS = [{"label": "DayPostcard", "value": "6"}, {"label": "Travel\u2011writer credentials badge", "value": "0"}, {"label": "Readiness score", "value": "88"}];
const READY_TITLE = "A user selects \u201cSeoul \u2013 Foodie \u2013 5\u202fdays \u2013 Moderate budget\u201d. The hero image fades to a night\u2011market scene, then a stack of five postcard cards slides in from the right, each with a mouth\u2011watering food photo.";
const READY_DETAIL = "Show a quick input of \u2018Seoul, foodie mood, 5\u2011day, moderate budget\u2019 and watch the app generate a vibrant stack of postcard cards, then toggle a rain icon to instantly reveal alternate indoor suggestions for each day. / A user selects \u201cSeoul \u2013 Foodie \u2013 5\u202fdays \u2013 Moderate budget\u201d. The hero image fades to a night\u2011market scene, then a stack of five postcard cards slides in from the right, each with a mouth\u2011watering food photo. / Clicking the rain\u2011drop overlay flips day\u202f3\u2019s outdoor market card into a cozy indoor tea\u2011house suggestion, while a soft rain animation drizzles over the card background.";
const COLLECTION_TITLE = "Travel\u2011Magazine Pressroom \u2013 Each Itinerary Appears As A Printable Postcard Spread stays visible after each run.";
const SUPPORT_TITLE = "Travel\u2011Writer Credentials Badge";
const REFERENCE_TITLE = "Rain\u2011Pivot Overlay Button (Umbrella Icon) On Each Postcard That Triggers The 3\u2011D Flip Animation.";
const BUTTON_LABEL = "Generate My Postcards";
const LAYOUT = "studio";
const UI_COPY_TONE = "Warm, travel\u2011magazine editorial";
const SAMPLE_ITEMS = ["{'city': 'Seoul', 'district': 'Hongdae', 'dayTitle': 'Indie Caf\u00e9 Crawl', 'image': 'hongdae_cafe.jpg', 'rainBackup': 'Cozy board\u2011game lounge in Mangwon'}", "{'city': 'Busan', 'district': 'Haeundae', 'dayTitle': 'Seafood Sunset Market', 'image': 'haeundae_market.jpg', 'rainBackup': 'Jagalchi indoor fish\u2011restaurant with ocean\u2011view windows'}", "{'city': 'Jeju', 'district': 'Seongsan', 'dayTitle': 'Sunrise Crater Hike', 'image': 'seongsan_crater.jpg', 'rainBackup': 'Jeju Folk Village museum tour'}", "{'city': 'Seoul', 'district': 'Insadong', 'dayTitle': 'Traditional Crafts Walk', 'image': 'insadong_art.jpg', 'rainBackup': 'National Museum of Modern and Contemporary Art'}"];
const REFERENCE_OBJECTS = ["City skyline hero image", "Polaroid postcard frame", "Rain\u2011umbrella icon", "Neighborhood thumbnail collage", "Download/Print button"];

type PlanItem = { title: string; detail: string; score: number };
type InsightPayload = { insights: string[]; next_actions: string[]; highlights: string[] };
type PlanPayload = { summary: string; score: number; items: PlanItem[]; insights?: InsightPayload };

export default function Page() {
  const [query, setQuery] = useState("");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<PlanPayload | null>(null);
  const [saved, setSaved] = useState<PlanPayload[]>([]);
  const layoutClass = LAYOUT.replace(/_/g, "-");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const nextPlan = await createPlan({ query, preferences });
      const insightPayload = await createInsights({
        selection: nextPlan.items?.[0]?.title ?? query,
        context: preferences || query,
      });
      const composed = { ...nextPlan, insights: insightPayload };
      setPlan(composed);
      setSaved((previous) => [composed, ...previous].slice(0, 4));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const stats = DEFAULT_STATS.map((stat, index) => {
    if (index === 0) return { ...stat, value: String(FEATURE_CHIPS.length) };
    if (index === 1) return { ...stat, value: String(saved.length) };
    if (index === 2) return { ...stat, value: plan ? String(plan.score) : stat.value };
    return stat;
  });

  const heroNode = (
    <Hero
      appName={APP_NAME}
      tagline={TAGLINE}
      proofPoints={PROOF_POINTS}
      eyebrow={SURFACE_LABELS.hero}
    />
  );
  const statsNode = <StatsStrip stats={stats} />;
  const workspaceNode = (
    <WorkspacePanel
      query={query}
      preferences={preferences}
      onQueryChange={setQuery}
      onPreferencesChange={setPreferences}
      onGenerate={handleGenerate}
      loading={loading}
      features={FEATURE_CHIPS}
      eyebrow={SURFACE_LABELS.workspace}
      queryPlaceholder={PLACEHOLDERS.query}
      preferencesPlaceholder={PLACEHOLDERS.preferences}
      actionLabel={BUTTON_LABEL}
    />
  );
  const primaryNode = error ? (
    <StatePanel eyebrow="Request blocked" title="Request blocked" tone="error" detail={error} />
  ) : plan ? (
    <InsightPanel plan={plan} eyebrow={SURFACE_LABELS.result} />
  ) : (
    <StatePanel eyebrow={SURFACE_LABELS.result} title={READY_TITLE} tone="neutral" detail={READY_DETAIL} />
  );
  const featureNode = (
    <FeaturePanel eyebrow={SURFACE_LABELS.support} title={SUPPORT_TITLE} features={FEATURE_CHIPS} proofPoints={PROOF_POINTS} />
  );
  const collectionNode = <CollectionPanel eyebrow={SURFACE_LABELS.collection} title={COLLECTION_TITLE} saved={saved} />;
  const referenceNode = (
    <ReferenceShelf
      eyebrow={SURFACE_LABELS.support}
      title={REFERENCE_TITLE}
      items={SAMPLE_ITEMS}
      objects={REFERENCE_OBJECTS}
      tone={UI_COPY_TONE}
    />
  );

  function renderLayout() {
    if (LAYOUT === "storyboard") {
      return (
        <>
          {heroNode}
          {statsNode}
          <section className="storyboard-stage">
            <div className="storyboard-main">
              {workspaceNode}
              {primaryNode}
            </div>
            <div className="storyboard-side">
              {referenceNode}
              {featureNode}
            </div>
          </section>
          {collectionNode}
        </>
      );
    }

    if (LAYOUT === "operations_console") {
      return (
        <section className="console-shell">
          <div className="console-top">
            {heroNode}
            {statsNode}
          </div>
          <div className="console-grid">
            <div className="console-operator-lane">
              {workspaceNode}
              {referenceNode}
            </div>
            <div className="console-timeline-lane">{primaryNode}</div>
            <div className="console-support-lane">
              {featureNode}
              {collectionNode}
            </div>
          </div>
        </section>
      );
    }

    if (LAYOUT === "studio") {
      return (
        <section className="studio-shell">
          <div className="studio-top">
            {heroNode}
            {primaryNode}
          </div>
          {statsNode}
          <div className="studio-bottom">
            <div className="studio-left">
              {workspaceNode}
              {collectionNode}
            </div>
            <div className="studio-right">
              {referenceNode}
              {featureNode}
            </div>
          </div>
        </section>
      );
    }

    if (LAYOUT === "atlas") {
      return (
        <section className="atlas-shell">
          <div className="atlas-hero-row">
            {heroNode}
            <div className="atlas-side-stack">
              {statsNode}
              {referenceNode}
            </div>
          </div>
          <div className="atlas-main-row">
            <div className="atlas-primary-stack">
              {primaryNode}
              {collectionNode}
            </div>
            <div className="atlas-secondary-stack">
              {workspaceNode}
              {featureNode}
            </div>
          </div>
        </section>
      );
    }

    if (LAYOUT === "notebook") {
      return (
        <section className="notebook-shell">
          {heroNode}
          <div className="notebook-top">
            <div className="notebook-left">
              {primaryNode}
              {referenceNode}
            </div>
            <div className="notebook-right">
              {workspaceNode}
              {featureNode}
            </div>
          </div>
          <div className="notebook-bottom">
            {collectionNode}
            {statsNode}
          </div>
        </section>
      );
    }

    return (
      <>
        {heroNode}
        {statsNode}
        <section className="content-grid">
          {workspaceNode}
          <div className="stack">
            {primaryNode}
            {referenceNode}
            {featureNode}
          </div>
        </section>
        {collectionNode}
      </>
    );
  }

  return (
    <main className={`page-shell layout-${layoutClass}`}>
      {renderLayout()}
    </main>
  );
}
