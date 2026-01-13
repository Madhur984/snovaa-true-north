import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PhaseCard } from "@/components/PhaseCard";
import { PrincipleBlock } from "@/components/PrincipleBlock";
import { ExclusionItem } from "@/components/ExclusionItem";
import { Button } from "@/components/ui/button";
import { Shield, Database, Eye, Lock, ArrowRight } from "lucide-react";

const phases = [
  { number: 0, title: "Foundation", description: "Lock core invariants and domain models. Define what we will never build.", status: "locked" as const },
  { number: 1, title: "Immutable Core", description: "Build user identity services and append-only participation ledgers.", status: "locked" as const },
  { number: 2, title: "Event Flow", description: "Manual event creation and attendance confirmation. No galleries, no AI.", status: "locked" as const },
  { number: 3, title: "Presentation Layer", description: "Calm web app experience. Read-first, no feeds or notifications.", status: "locked" as const },
  { number: 4, title: "Event Memory", description: "Enable media uploads with organizer approval. No engagement metrics.", status: "locked" as const },
  { number: 5, title: "Module System", description: "Predefined modules with controlled flexibility. Read-only from ledger.", status: "locked" as const },
  { number: 6, title: "AI Orchestration", description: "AI suggests configurations. Never writes core records or changes participation.", status: "locked" as const },
  { number: 7, title: "Sponsor Readiness", description: "Read-only sponsor views. Strict exclusion of social metrics.", status: "locked" as const },
  { number: 8, title: "Participation Map", description: "City-level heatmaps and participation volume. No live tracking.", status: "locked" as const },
  { number: 9, title: "Polish & Harden", description: "Performance and data integrity. Remove anything noisy or addictive.", status: "locked" as const },
  { number: 10, title: "Closed Pilots", description: "Real-world validation. No social features.", status: "current" as const },
];

const exclusions = [
  "Likes, reactions, or any engagement metrics",
  "Follower counts or social graphs",
  "Algorithmic feeds or content ranking",
  "Push notifications or attention-grabbing alerts",
  "Comments, threads, or public discussions",
  "Live tracking or real-time presence indicators",
  "Gamification, streaks, or reward systems",
  "User-generated content moderation complexity",
];

const Index = () => {
  return (
    <Layout showHeader={true}>
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="container max-w-5xl">
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-display">
              Truth-first event participation
            </h1>
            <p className="text-xl text-body leading-relaxed max-w-2xl">
              A calm, immutable record of where people gather. No feeds. No likes. 
              No notifications. Just verified participation, preserved with integrity.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/events">Browse Events</Link>
              </Button>
            </div>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-soft text-primary text-sm font-medium">
                <Lock className="w-4 h-4" />
                <span>Lock truth first — expose views later</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="py-16 border-t border-border">
        <div className="container max-w-5xl">
          <div className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-display mb-3">
              Core Philosophy
            </h2>
            <p className="text-body max-w-2xl">
              SNOVAA is designed to be boring, calm, and correct. We build truth 
              into the foundation, then carefully expose views that preserve that truth.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <PrincipleBlock
              icon={<Database className="w-5 h-5" />}
              title="Append-Only"
              description="Every participation record is permanent. No edits, no deletions. History is sacred."
            />
            <PrincipleBlock
              icon={<Shield className="w-5 h-5" />}
              title="Immutable Core"
              description="The ledger of truth cannot be modified by views, modules, or even AI suggestions."
            />
            <PrincipleBlock
              icon={<Eye className="w-5 h-5" />}
              title="Read-First"
              description="Users consume verified information. No feeds competing for attention."
            />
            <PrincipleBlock
              icon={<Lock className="w-5 h-5" />}
              title="Controlled Exposure"
              description="Views are carefully designed. Each one must preserve the underlying truth."
            />
          </div>
        </div>
      </section>

      {/* What We Never Build */}
      <section className="py-16 border-t border-border bg-sunken">
        <div className="container max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-display mb-3">
                Features We Will Never Build
              </h2>
              <p className="text-body mb-8">
                These exclusions are not temporary. They are architectural decisions 
                that define what SNOVAA is — and what it will always refuse to become.
              </p>
            </div>
            <div className="space-y-1">
              {exclusions.map((item, index) => (
                <ExclusionItem key={index} text={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Development Phases */}
      <section className="py-16 border-t border-border">
        <div className="container max-w-5xl">
          <div className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-display mb-3">
              Development Phases
            </h2>
            <p className="text-body max-w-2xl">
              Each phase locks in decisions before moving forward. We never reverse 
              the order: truth first, then views, then features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {phases.map((phase) => (
              <PhaseCard
                key={phase.number}
                number={phase.number}
                title={phase.title}
                description={phase.description}
                status={phase.status}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border bg-accent-soft">
        <div className="container max-w-5xl text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-display mb-4">
            Ready to participate?
          </h2>
          <p className="text-body text-lg max-w-xl mx-auto mb-8">
            Join the truth-first event network. Your participation matters—and it will be recorded with integrity.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/signup">Create Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/philosophy">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
