import { PrismaClient, UserRole, UserStatus, DonationStatus, FoodType, FoodCategory, VerificationStatus, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('SharePlate@Admin2024!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shareplate.org' },
    update: {},
    create: {
      email: 'admin@shareplate.org',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1-555-0100',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      adminProfile: {
        create: {
          permissions: ['ALL'],
          adminLevel: 3,
        },
      },
    },
  });
  console.log('Admin user created:', admin.email);

  // Create sample donor
  const donorPassword = await bcrypt.hash('Donor@2024!', 12);
  const donor = await prisma.user.upsert({
    where: { email: 'donor@example.com' },
    update: {},
    create: {
      email: 'donor@example.com',
      password: donorPassword,
      firstName: 'John',
      lastName: 'Restaurant',
      phone: '+1-555-0101',
      role: UserRole.DONOR,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      donorProfile: {
        create: {
          organizationName: 'John's Restaurant',
          organizationType: 'RESTAURANT',
          totalDonations: 15,
          totalFoodWeight: 250.5,
          totalPeopleFed: 500,
          carbonSaved: 125.3,
        },
      },
    },
  });
  console.log('Donor user created:', donor.email);

  // Create sample NGO
  const ngoPassword = await bcrypt.hash('Ngo@2024!', 12);
  const ngo = await prisma.user.upsert({
    where: { email: 'ngo@example.com' },
    update: {},
    create: {
      email: 'ngo@example.com',
      password: ngoPassword,
      firstName: 'Sarah',
      lastName: 'Hope',
      phone: '+1-555-0102',
      role: UserRole.NGO,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      latitude: 40.7580,
      longitude: -73.9855,
      address: '456 Hope Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10019',
      ngoProfile: {
        create: {
          organizationName: 'Hope Foundation',
          registrationNumber: 'NGO-2024-001',
          description: 'Feeding the hungry and reducing food waste in NYC',
          mission: 'No one sleeps hungry',
          website: 'https://hopefoundation.org',
          foundedYear: 2015,
          verificationStatus: VerificationStatus.VERIFIED,
          verifiedAt: new Date(),
          maxDailyCapacity: 200,
          storageCapacity: 500,
          refrigeration: true,
          serviceRadius: 10,
          operatingHours: JSON.stringify({
            mon: '08:00-20:00',
            tue: '08:00-20:00',
            wed: '08:00-20:00',
            thu: '08:00-20:00',
            fri: '08:00-20:00',
            sat: '09:00-18:00',
            sun: '10:00-16:00',
          }),
          contactPerson: 'Sarah Hope',
          contactPhone: '+1-555-0102',
          contactEmail: 'contact@hopefoundation.org',
        },
      },
    },
  });
  console.log('NGO user created:', ngo.email);

  // Create sample volunteer
  const volunteerPassword = await bcrypt.hash('Volunteer@2024!', 12);
  const volunteer = await prisma.user.upsert({
    where: { email: 'volunteer@example.com' },
    update: {},
    create: {
      email: 'volunteer@example.com',
      password: volunteerPassword,
      firstName: 'Mike',
      lastName: 'Helper',
      phone: '+1-555-0103',
      role: UserRole.VOLUNTEER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      latitude: 40.7308,
      longitude: -73.9973,
      address: '789 Volunteer St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10012',
      volunteerProfile: {
        create: {
          idVerified: true,
          backgroundCheck: true,
          vehicleType: 'CAR',
          vehicleNumber: 'NY-ABC-1234',
          available: true,
          maxDistance: 15,
          preferredTimeStart: '08:00',
          preferredTimeEnd: '20:00',
          preferredDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
          totalPickups: 25,
          totalDeliveries: 25,
          totalDistance: 150.5,
          rating: 4.8,
          reviewCount: 20,
          onTimeRate: 95.5,
        },
      },
    },
  });
  console.log('Volunteer user created:', volunteer.email);

  // Create sample donation
  const donation = await prisma.donation.create({
    data: {
      donorId: donor.id,
      title: 'Fresh Cooked Meals - Lunch Service',
      description: '50 portions of fresh vegetarian pasta and salad from today's lunch service.',
      status: DonationStatus.AVAILABLE,
      foodType: FoodType.VEGETARIAN,
      foodCategory: FoodCategory.COOKED_MEAL,
      quantity: 50,
      quantityUnit: 'servings',
      servings: 50,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isHalal: false,
      isKosher: false,
      allergens: ['gluten', 'dairy'],
      preparedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      expiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      pickupStartTime: new Date(Date.now() + 30 * 60 * 1000), // 30 min from now
      pickupEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      pickupAddress: '123 Main St, New York, NY 10001',
      pickupLatitude: 40.7128,
      pickupLongitude: -74.0060,
      pickupInstructions: 'Please use the back entrance. Ring the service bell.',
      freshnessScore: 85,
      priorityScore: 75,
      demandScore: 90,
      images: {
        create: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/sample-food-1.jpg',
            thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_200/sample-food-1.jpg',
            publicId: 'sample-food-1',
            isFood: true,
          },
        ],
      },
    },
  });
  console.log('Sample donation created:', donation.title);

  // Create sample notification
  await prisma.notification.create({
    data: {
      userId: donor.id,
      type: NotificationType.SYSTEM,
      title: 'Welcome to SharePlate!',
      message: 'Thank you for joining SharePlate. Start making a difference by creating your first donation.',
      channels: ['IN_APP', 'EMAIL'],
      actionUrl: '/donations/create',
      actionText: 'Create Donation',
    },
  });

  // Create badges
  const badges = [
    { name: 'First Donation', description: 'Created your first food donation', icon: 'gift', color: '#10b981', category: 'DONATION', criteria: '{"donations": 1}' },
    { name: 'Food Hero', description: 'Donated 100+ kg of food', icon: 'star', color: '#f59e0b', category: 'DONATION', criteria: '{"totalFoodWeight": 100}' },
    { name: 'Community Champion', description: 'Fed 500+ people', icon: 'heart', color: '#ef4444', category: 'IMPACT', criteria: '{"totalPeopleFed": 500}' },
    { name: 'First Pickup', description: 'Completed your first pickup', icon: 'truck', color: '#3b82f6', category: 'VOLUNTEER', criteria: '{"pickups": 1}' },
    { name: 'Reliable Volunteer', description: 'Completed 50+ deliveries', icon: 'shield', color: '#8b5cf6', category: 'VOLUNTEER', criteria: '{"deliveries": 50}' },
    { name: 'Eco Warrior', description: 'Saved 100+ kg of CO2', icon: 'leaf', color: '#22c55e', category: 'IMPACT', criteria: '{"carbonSaved": 100}' },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }
  console.log('Badges created');

  // Create system settings
  const settings = [
    { key: 'platform_name', value: 'SharePlate', type: 'STRING', description: 'Platform display name' },
    { key: 'platform_version', value: '1.0.0', type: 'STRING', description: 'Current platform version' },
    { key: 'maintenance_mode', value: 'false', type: 'BOOLEAN', description: 'Enable maintenance mode' },
    { key: 'max_donation_expiry_hours', value: '24', type: 'NUMBER', description: 'Maximum donation expiry time in hours' },
    { key: 'default_pickup_radius', value: '10', type: 'NUMBER', description: 'Default pickup radius in km' },
    { key: 'auto_approve_ngos', value: 'false', type: 'BOOLEAN', description: 'Auto-approve NGO registrations' },
    { key: 'donation_review_required', value: 'true', type: 'BOOLEAN', description: 'Require admin review for donations' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('System settings created');

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
