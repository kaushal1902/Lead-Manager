import { PrismaClient, LeadStatus, LeadSource } from '@prisma/client';

const prisma = new PrismaClient();

const mockLeads = [
  {
    name: 'Alex Rivera',
    email: 'alex.rivera@apexcloud.io',
    phone: '+1 (555) 234-5678',
    company: 'Apex Cloud Systems',
    source: LeadSource.Website,
    status: LeadStatus.New,
    notes: 'Requested enterprise trial via inbound website contact form.',
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@fintechpulse.com',
    phone: '+1 (555) 345-6789',
    company: 'FinTech Pulse',
    source: LeadSource.LinkedIn,
    status: LeadStatus.Contacted,
    notes: 'Had initial 15-min discovery call. Interested in CRM integration.',
  },
  {
    name: 'Marcus Vance',
    email: 'marcus@vancecapital.co',
    phone: '+1 (555) 456-7890',
    company: 'Vance Capital',
    source: LeadSource.Referral,
    status: LeadStatus.Qualified,
    notes: 'Budget pre-approved ($25k/yr). Moving to procurement review.',
  },
  {
    name: 'Elena Rostova',
    email: 'e.rostova@hypergrowth.ai',
    phone: '+1 (555) 567-8901',
    company: 'HyperGrowth AI',
    source: LeadSource.Cold_Outreach,
    status: LeadStatus.Contacted,
    notes: 'Responded positively to cold outreach. Demo booked for Thursday.',
  },
  {
    name: 'David Kim',
    email: 'david.kim@orbitallabs.dev',
    phone: '+1 (555) 678-9012',
    company: 'Orbital Labs',
    source: LeadSource.Website,
    status: LeadStatus.Qualified,
    notes: 'Evaluating our API against competitor. High purchasing intent.',
  },
  {
    name: 'Sophia Martinez',
    email: 's.martinez@stratahealth.org',
    phone: '+1 (555) 789-0123',
    company: 'Strata Health Care',
    source: LeadSource.Referral,
    status: LeadStatus.Lost,
    notes: 'Decided to renew with current vendor due to existing multi-year contract.',
  },
  {
    name: 'Liam O’Connor',
    email: 'liam@beaconlogistics.net',
    phone: '+1 (555) 890-1234',
    company: 'Beacon Logistics',
    source: LeadSource.Other,
    status: LeadStatus.New,
    notes: 'Connected at SaaS Conference 2026. Needs fleet dispatch integration.',
  },
  {
    name: 'Priya Patel',
    email: 'priya@nexussystems.in',
    phone: '+1 (555) 901-2345',
    company: 'Nexus Systems',
    source: LeadSource.LinkedIn,
    status: LeadStatus.Qualified,
    notes: 'Technical team approved architecture. Awaiting contract sign-off.',
  },
  {
    name: 'James Wilson',
    email: 'jwilson@timbercrest.com',
    phone: '+1 (555) 012-3456',
    company: 'Timbercrest Media',
    source: LeadSource.Cold_Outreach,
    status: LeadStatus.Lost,
    notes: 'Out of budget for the current fiscal quarter. Revisit in Q4.',
  },
  {
    name: 'Hannah Abbott',
    email: 'hannah@luminarydesign.co',
    phone: '+1 (555) 123-4567',
    company: 'Luminary Studio',
    source: LeadSource.Website,
    status: LeadStatus.Contacted,
    notes: 'Sent pricing tiers and product walkthrough video.',
  },
  {
    name: 'Carlos Gomez',
    email: 'carlos@veloxcommerce.com',
    phone: '+1 (555) 234-9876',
    company: 'Velox Commerce',
    source: LeadSource.Referral,
    status: LeadStatus.Qualified,
    notes: 'Fast-growing e-commerce shop looking for custom automation.',
  },
  {
    name: 'Zoe Washington',
    email: 'zoe@quantumdata.io',
    phone: '+1 (555) 345-8765',
    company: 'Quantum Data Corp',
    source: LeadSource.Other,
    status: LeadStatus.New,
    notes: 'Submitted quote request through partner integration page.',
  },
  {
    name: 'Nathan Drake',
    email: 'ndrake@unchartedops.org',
    phone: '+1 (555) 456-7654',
    company: 'Uncharted Operations',
    source: LeadSource.Cold_Outreach,
    status: LeadStatus.Contacted,
    notes: 'Followed up via phone call. Requested security whitepaper.',
  },
  {
    name: 'Rachel Green',
    email: 'rachel@centralperkfranchise.com',
    phone: '+1 (555) 567-6543',
    company: 'Central Perk Retail',
    source: LeadSource.Website,
    status: LeadStatus.New,
    notes: 'Looking for multi-location sales pipeline tracking.',
  },
  {
    name: 'Thomas Mueller',
    email: 't.mueller@bavariasoftware.de',
    phone: '+1 (555) 678-5432',
    company: 'Bavaria Software AG',
    source: LeadSource.LinkedIn,
    status: LeadStatus.Lost,
    notes: 'Internal project was cancelled due to management restructuring.',
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing leads for clean idempotent seeding
  await prisma.lead.deleteMany();
  console.log('🧹 Cleared existing leads table.');

  for (const lead of mockLeads) {
    await prisma.lead.create({
      data: lead,
    });
  }

  const count = await prisma.lead.count();
  console.log(`✅ Successfully seeded ${count} leads into SQLite database.`);
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
