import { BarChart3 } from 'lucide-react';
import { ModuleScaffold } from '@/components/module-scaffold';

export function ImpactPage() {
  return (
    <ModuleScaffold
      eyebrow="Module 04 · Impact"
      title="Campus Impact"
      description="The collective savings of BIT Patna hostellers — and what you personally kept in your pocket."
      icon={BarChart3}
      heroTitle="Small pools. Very visible savings."
      heroDescription="Animated campus totals, your personal savings card, a module-wise chart, and the hostel leaderboard."
      features={[
        'Campus collective savings and rides shared',
        'Your savings, broken down by module',
        'Savings by module bar chart',
        'Hostel leaderboard from live completions',
      ]}
      seedFacts={[
        'Seeded baseline plus live database sums',
        'Order, ride, and resale totals wired for updates',
        'Hostel leaderboard data points ready',
      ]}
      footerNote="Seeded locally for the judge walkthrough. Module flows land next."
    />
  );
}
