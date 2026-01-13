import { Layout } from "@/components/layout/Layout";
import { PhaseCard } from "@/components/PhaseCard";
import { PrincipleBlock } from "@/components/PrincipleBlock";
import { ExclusionItem } from "@/components/ExclusionItem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Eye, Lock, FileText, Layers } from "lucide-react";

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
  "Viral mechanics or share incentives",
  "Infinite scroll or auto-refresh patterns",
];

const Philosophy = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl font-medium leading-tight text-display mb-6">
              UX Philosophy
            </h1>
            <p className="text-xl text-body leading-relaxed">
              SNOVAA is designed to be boring, calm, and correct. We build truth 
              into the foundation, then carefully expose views that preserve that truth.
              Every decision follows one principle: <strong>Lock truth first → expose 
              views later → never reverse this order.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 border-b border-border">
        <div className="container max-w-6xl">
          <div className="mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-display mb-3">
              Core Principles
            </h2>
            <p className="text-body max-w-2xl">
              These principles are architectural decisions, not guidelines. They define 
              what SNOVAA fundamentally is.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <PrincipleBlock
              icon={<Database className="w-5 h-5" />}
              title="Append-Only"
              description="Every participation record is permanent. No edits, no deletions. History is sacred and immutable."
            />
            <PrincipleBlock
              icon={<Shield className="w-5 h-5" />}
              title="Immutable Core"
              description="The ledger of truth cannot be modified by views, modules, or even AI suggestions."
            />
            <PrincipleBlock
              icon={<Eye className="w-5 h-5" />}
              title="Read-First"
              description="Users consume verified information. No feeds competing for attention, no engagement optimization."
            />
            <PrincipleBlock
              icon={<Lock className="w-5 h-5" />}
              title="Controlled Exposure"
              description="Views are carefully designed. Each one must preserve the underlying truth without distortion."
            />
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="py-16 border-b border-border bg-sunken">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-display mb-3">
                System Architecture
              </h2>
              <p className="text-body mb-6">
                The architecture enforces our philosophy through strict layers. 
                Data flows upward but never backward.
              </p>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-accent-soft border-l-4 border-primary">
                      <div className="flex items-center gap-2 mb-1">
                        <Layers className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">Presentation Layer</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Web app, sponsor views, maps — read only</p>
                    </div>
                    <div className="text-center text-muted-foreground">↑</div>
                    <div className="p-4 rounded-lg bg-muted border-l-4 border-muted-foreground">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium text-sm">Module Layer</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Agenda, speakers, Q&A — extend, never modify</p>
                    </div>
                    <div className="text-center text-muted-foreground">↑</div>
                    <div className="p-4 rounded-lg bg-primary/10 border-l-4 border-primary">
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">Immutable Core</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Participation ledger, events, identity — append only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-display mb-3">
                Features We Will Never Build
              </h2>
              <p className="text-body mb-6">
                These exclusions are permanent. They define what SNOVAA will always 
                refuse to become.
              </p>
              <div className="space-y-1">
                {exclusions.map((item, index) => (
                  <ExclusionItem key={index} text={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Phases */}
      <section className="py-16">
        <div className="container max-w-6xl">
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

      {/* Closing Statement */}
      <section className="py-16 border-t border-border bg-sunken">
        <div className="container max-w-4xl text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-display mb-4">
            Boring. Calm. Correct.
          </h2>
          <p className="text-body text-lg max-w-2xl mx-auto">
            In a world of addictive feeds and engagement metrics, SNOVAA chooses 
            to be boring. We believe the most valuable software is the kind you 
            don't think about—it just works, truthfully.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Philosophy;
