import { PrismaClient, LeadStatus, LeadSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const mockLeads = [
  {
    name: 'Aarav Patel',
    email: 'aarav.patel@tatadigital.com',
    phone: '+91 98201 23456',
    company: 'Tata Digital',
    source: LeadSource.Website,
    status: LeadStatus.New,
    notes: 'Inbound inquiry for enterprise sales CRM integration across omnichannel stores.',
  },
  {
    name: 'Ananya Sharma',
    email: 'ananya.sharma@razorpay.com',
    phone: '+91 98112 34567',
    company: 'Razorpay Tech',
    source: LeadSource.LinkedIn,
    status: LeadStatus.Contacted,
    notes: 'Met at Bengaluru Tech Summit; scheduling product demo with fintech team.',
  },
  {
    name: 'Rohan Deshmukh',
    email: 'rohan@zerodha.com',
    phone: '+91 99304 56789',
    company: 'Zerodha Broking',
    source: LeadSource.Referral,
    status: LeadStatus.Qualified,
    notes: 'Budget approved by operations lead; security audit in progress.',
  },
  {
    name: 'Pooja Iyer',
    email: 'pooja.iyer@freshworks.io',
    phone: '+91 94440 12345',
    company: 'Freshworks Global',
    source: LeadSource.Cold_Outreach,
    status: LeadStatus.Contacted,
    notes: 'Responded to cold outreach; requested pricing sheet for 50 seats.',
  },
  {
    name: 'Vikramaditya Singhania',
    email: 'vikram@reliancecorp.in',
    phone: '+91 98220 98765',
    company: 'Reliance Retail',
    source: LeadSource.Website,
    status: LeadStatus.Qualified,
    notes: 'High-value prospective deal for nationwide retail outlet pipeline tracking.',
  },
  {
    name: 'Sneha Kulkarni',
    email: 'sneha.k@swiggy.in',
    phone: '+91 98450 67890',
    company: 'Swiggy Dineout',
    source: LeadSource.Referral,
    status: LeadStatus.Lost,
    notes: 'Postponed CRM procurement until next fiscal quarter due to budget reallocation.',
  },
  {
    name: 'Aditya Verma',
    email: 'aditya.verma@delhivery.com',
    phone: '+91 99100 23456',
    company: 'Delhivery Logistics',
    source: LeadSource.Other,
    status: LeadStatus.New,
    notes: 'Connected via Mumbai Logistics Expo; needs automated dispatch lead capture.',
  },
  {
    name: 'Kavita Rao',
    email: 'kavita.rao@infosys.com',
    phone: '+91 98410 34567',
    company: 'Infosys Enterprise',
    source: LeadSource.LinkedIn,
    status: LeadStatus.Qualified,
    notes: 'Vendor evaluation completed; contract forwarded to legal department.',
  },
  {
    name: 'Rahul Mehra',
    email: 'rahul.mehra@zomato.com',
    phone: '+91 98101 45678',
    company: 'Zomato For Enterprise',
    source: LeadSource.Cold_Outreach,
    status: LeadStatus.Lost,
    notes: 'Decided to continue using internal proprietary tool for the current year.',
  },
  {
    name: 'Neha Gupta',
    email: 'neha@nykaafashion.com',
    phone: '+91 98205 67890',
    company: 'Nykaa Fashion',
    source: LeadSource.Website,
    status: LeadStatus.Contacted,
    notes: 'Sent customized demo recording highlighting retail campaign workflows.',
  },
  {
    name: 'Siddharth Malhotra',
    email: 'siddharth@flipkart.com',
    phone: '+91 98452 78901',
    company: 'Flipkart Wholesale',
    source: LeadSource.Referral,
    status: LeadStatus.Qualified,
    notes: 'Commercials negotiation in progress. Expected closure by month-end.',
  },
  {
    name: 'Divya Nair',
    email: 'divya@zohoinnovations.com',
    phone: '+91 94441 89012',
    company: 'Zoho Innovations',
    source: LeadSource.Other,
    status: LeadStatus.New,
    notes: 'Inbound request submitted for partnership distribution lead pipeline.',
  },
  {
    name: 'Karan Kapoor',
    email: 'karan.k@paytm.com',
    phone: '+91 99105 90123',
    company: 'Paytm Payments',
    source: LeadSource.Cold_Outreach,
    status: LeadStatus.Contacted,
    notes: 'Followed up via call; requested compliance and SOC2 certificates.',
  },
  {
    name: 'Ritu Sen',
    email: 'ritu.sen@olaelectric.in',
    phone: '+91 98300 01234',
    company: 'Ola Electric Mobility',
    source: LeadSource.Website,
    status: LeadStatus.New,
    notes: 'Inquiring about franchise dealer onboarding pipeline management.',
  },
  {
    name: 'Manish Tiwari',
    email: 'manish@wiprodigital.com',
    phone: '+91 98455 12345',
    company: 'Wipro Digital',
    source: LeadSource.LinkedIn,
    status: LeadStatus.Lost,
    notes: 'Project postponed due to enterprise leadership restructuring.',
  },
];

async function main() {
  console.log('🌱 Starting database seed with Indian contacts & authentication...');

  // Clear existing leads and users
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleared existing tables.');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create primary Demo Sales Rep (Indian account)
  const demoUser = await prisma.user.create({
    data: {
      name: 'Aarav Sharma',
      email: 'demo@leadmanager.io',
      password: hashedPassword,
    },
  });
  console.log(`👤 Created Demo User: ${demoUser.name} (${demoUser.email} / password: password123)`);

  // 2. Create secondary user (Priya Nair) to prove multi-tenant isolation
  const priyaUser = await prisma.user.create({
    data: {
      name: 'Priya Nair',
      email: 'priya.nair@tatadigital.com',
      password: hashedPassword,
    },
  });
  console.log(`👤 Created Secondary User: ${priyaUser.name} (${priyaUser.email} / password: password123)`);

  // 3. Seed Indian leads assigned to demoUser
  for (const lead of mockLeads) {
    await prisma.lead.create({
      data: {
        ...lead,
        userId: demoUser.id,
      },
    });
  }

  // 4. Seed 2 Indian leads assigned specifically to priyaUser
  await prisma.lead.create({
    data: {
      name: 'Arjun Reddy',
      email: 'arjun@reddyenterprises.in',
      phone: '+91 98490 11223',
      company: 'Reddy Enterprises',
      source: LeadSource.Referral,
      status: LeadStatus.Qualified,
      notes: 'Strategic account managed solely by Priya Nair.',
      userId: priyaUser.id,
    },
  });

  await prisma.lead.create({
    data: {
      name: 'Meera Joshi',
      email: 'meera.joshi@punesoft.com',
      phone: '+91 98220 33445',
      company: 'Pune Software Labs',
      source: LeadSource.Website,
      status: LeadStatus.Contacted,
      notes: 'SaaS cloud migration project lead in Pune.',
      userId: priyaUser.id,
    },
  });

  const totalLeads = await prisma.lead.count();
  const totalUsers = await prisma.user.count();
  console.log(`✅ Seeded ${totalUsers} users and ${totalLeads} Indian leads into SQLite database.`);
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
