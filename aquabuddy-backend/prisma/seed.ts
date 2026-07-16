import { PrismaClient, UserRole, RobotStatus, AlertType, AlertSeverity, AlertStatus, FeedbackStatus, LogLevel, NotificationPriority, FirmwareStatus, DeploymentStatus, RevenueType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.revenue.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.systemHealth.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.userSetting.deleteMany();
  await prisma.robotFirmwareDeployment.deleteMany();
  await prisma.firmwareRecord.deleteMany();
  await prisma.robotLog.deleteMany();
  await prisma.serviceHistory.deleteMany();
  await prisma.robotAnalytics.deleteMany();
  await prisma.robotActivation.deleteMany();
  await prisma.session.deleteMany();
  await prisma.systemLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.analyticsSnapshot.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.robotCommand.deleteMany();
  await prisma.robot.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const ownerPassword = await bcrypt.hash('Owner123!', 12);
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const userPassword = await bcrypt.hash('User123!', 12);

  const owner = await prisma.user.create({
    data: {
      email: 'aquabuddytechnologies@gmail.com',
      password: ownerPassword,
      firstName: 'Platform',
      lastName: 'Owner',
      phone: '+919988776655',
      country: 'India',
      city: 'Mangaluru',
      timezone: 'Asia/Kolkata',
      theme: 'system',
      language: 'en',
      role: UserRole.OWNER,
      status: 'ACTIVE',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@aquabuddy.com',
      password: adminPassword,
      firstName: 'AquaBuddy',
      lastName: 'Admin',
      phone: '+918877665544',
      country: 'India',
      city: 'Udupi',
      timezone: 'Asia/Kolkata',
      theme: 'dark',
      language: 'en',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@aquabuddy.com',
      password: userPassword,
      firstName: 'Sanith',
      lastName: 'Shetty',
      phone: '+917766554433',
      country: 'India',
      city: 'Mangaluru',
      timezone: 'Asia/Kolkata',
      theme: 'light',
      language: 'en',
      role: UserRole.USER,
      status: 'ACTIVE',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@aquabuddy.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+916655443322',
      country: 'India',
      city: 'Manipal',
      timezone: 'Asia/Kolkata',
      theme: 'dark',
      language: 'en',
      role: UserRole.USER,
      status: 'ACTIVE',
    },
  });

  console.log('Seeding user settings...');
  await prisma.userSetting.create({
    data: {
      userId: owner.id,
      preferences: { dashboardLayout: 'grid', timeFormat: '24h' },
      notifications: { emailAlerts: true, pushAlerts: true, weeklyReport: true },
      privacy: { showLocation: false, shareData: false },
    },
  });
  await prisma.userSetting.create({
    data: {
      userId: admin.id,
      preferences: { dashboardLayout: 'list', timeFormat: '24h' },
      notifications: { emailAlerts: true, pushAlerts: true },
      privacy: { showLocation: false, shareData: true },
    },
  });
  await prisma.userSetting.create({
    data: {
      userId: user1.id,
      preferences: { dashboardLayout: 'grid', timeFormat: '12h' },
      notifications: { emailAlerts: true, pushAlerts: true, weeklyReport: true },
      privacy: { showLocation: true, shareData: false },
    },
  });
  await prisma.userSetting.create({
    data: {
      userId: user2.id,
      preferences: { dashboardLayout: 'grid', timeFormat: '24h' },
      notifications: { emailAlerts: false, pushAlerts: true },
      privacy: { showLocation: false, shareData: false },
    },
  });

  console.log('Seeding sessions...');
  const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: {
      token: 'sess-owner-dev-token-001',
      userId: owner.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Seed-Script',
      expiresAt: sessionExpiry,
    },
  });
  await prisma.session.create({
    data: {
      token: 'sess-admin-dev-token-001',
      userId: admin.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Seed-Script',
      expiresAt: sessionExpiry,
    },
  });

  console.log('Seeding robots...');
  const robot1 = await prisma.robot.create({
    data: {
      code: 'AQB-00001',
      name: 'AquaBuddy Pro - AIET Campus',
      model: 'AQB-PRO',
      status: RobotStatus.ONLINE,
      lat: 13.0456,
      lng: 74.9818,
      ownerId: user1.id,
      waterGenerated: 1450.5,
      battery: 92,
      qrCode: 'qr-aqb-00001-encrypted-secret',
      firmwareVersion: '1.0.0',
      hardwareVersion: 'v1.1',
      manufacturingBatch: 'BATCH-2026-A',
      macAddress: 'AA:BB:CC:DD:EE:01',
      manufactureDate: new Date('2026-01-10'),
      warrantyStatus: 'ACTIVE',
      lastMaintenanceAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  const robot2 = await prisma.robot.create({
    data: {
      code: 'AQB-00002',
      name: 'AquaBuddy Classic - AIET East Wing',
      model: 'AQB-CLASSIC',
      status: RobotStatus.ONLINE,
      lat: 13.0470,
      lng: 74.9830,
      ownerId: user2.id,
      waterGenerated: 890.2,
      battery: 78,
      qrCode: 'qr-aqb-00002-encrypted-secret',
      firmwareVersion: '1.0.0',
      hardwareVersion: 'v1.0',
      manufacturingBatch: 'BATCH-2025-C',
      macAddress: 'AA:BB:CC:DD:EE:02',
      manufactureDate: new Date('2025-11-24'),
      warrantyStatus: 'ACTIVE',
      lastMaintenanceAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
  });

  const robot3 = await prisma.robot.create({
    data: {
      code: 'AQB-00003',
      name: 'AquaBuddy Max - AIET Workshop',
      model: 'AQB-MAX',
      status: RobotStatus.MAINTENANCE,
      lat: 13.0430,
      lng: 74.9800,
      ownerId: user1.id,
      waterGenerated: 2310.8,
      battery: 45,
      qrCode: 'qr-aqb-00003-encrypted-secret',
      firmwareVersion: '1.0.1',
      hardwareVersion: 'v1.2',
      manufacturingBatch: 'BATCH-2026-B',
      macAddress: 'AA:BB:CC:DD:EE:03',
      manufactureDate: new Date('2026-02-18'),
      warrantyStatus: 'ACTIVE',
    },
  });

  console.log('Seeding robot activations...');
  const futureExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  await prisma.robotActivation.create({
    data: {
      code: 'ACT-AQB-PRO-001',
      robotId: robot1.id,
      activatedBy: user1.id,
      activatedAt: new Date('2026-01-15'),
      expiresAt: futureExpiry,
    },
  });
  await prisma.robotActivation.create({
    data: {
      code: 'ACT-AQB-CLASSIC-002',
      robotId: robot2.id,
      activatedBy: user2.id,
      activatedAt: new Date('2025-12-01'),
      expiresAt: futureExpiry,
    },
  });
  await prisma.robotActivation.create({
    data: {
      code: 'ACT-AQB-MAX-003',
      robotId: robot3.id,
      expiresAt: futureExpiry,
    },
  });

  console.log('Seeding maintenance logs...');
  await prisma.maintenanceLog.create({
    data: {
      robotId: robot3.id,
      type: 'Filter Replacement',
      description: 'Replacing dust and carbon filter. Scheduled maintenance.',
      technician: 'Ramesh Kumar',
      status: 'PLANNED',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      installationDate: new Date('2026-02-18'),
      warrantyExpiry: new Date('2028-02-18'),
      partsReplaced: 'HEPA Active Carbon Filter Array',
      lifetimeWaterGenerated: 2310.8,
      lifetimeRuntime: 1450,
      pumpRuntime: 980,
      fanRuntime: 1200,
      relayCycles: 1840,
      batteryHealth: 'Nominal',
      sensorHealth: 'Calibration Required',
      errorHistory: 'Compressor cycle timeout warning on 2026-06-12',
      downtime: 180,
      efficiencyHistory: 'Excellent-89%,Good-80%,Needs Maintenance-72%',
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      robotId: robot1.id,
      type: 'Routine Inspection',
      description: 'Standard system check and calibration.',
      technician: 'Anil Kumar',
      status: 'COMPLETED',
      scheduledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      installationDate: new Date('2026-01-10'),
      warrantyExpiry: new Date('2028-01-10'),
      partsReplaced: 'None',
      lifetimeWaterGenerated: 1450.5,
      lifetimeRuntime: 820,
      pumpRuntime: 560,
      fanRuntime: 790,
      relayCycles: 940,
      batteryHealth: 'Excellent',
      sensorHealth: 'Nominal',
      errorHistory: 'None',
      downtime: 0,
      efficiencyHistory: 'Excellent-94%,Excellent-92%',
    },
  });

  console.log('Seeding service history...');
  await prisma.serviceHistory.create({
    data: {
      robotId: robot1.id,
      serviceType: 'ROUTINE',
      description: 'Quarterly inspection and sensor calibration',
      performedBy: admin.id,
      partsReplaced: 'None',
      cost: 0,
      notes: 'All systems nominal',
      performedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextServiceDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.serviceHistory.create({
    data: {
      robotId: robot1.id,
      serviceType: 'FIRMWARE_UPDATE',
      description: 'OTA firmware update to v1.1',
      performedBy: admin.id,
      cost: 0,
      notes: 'Update completed successfully',
      performedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.serviceHistory.create({
    data: {
      robotId: robot2.id,
      serviceType: 'REPAIR',
      description: 'Water pump replacement due to bearing wear',
      performedBy: admin.id,
      partsReplaced: 'Water pump assembly',
      cost: 250.0,
      notes: 'Pump was running hot. Replaced with v2 model.',
      performedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      nextServiceDue: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Seeding firmware records...');
  const fw1 = await prisma.firmwareRecord.create({
    data: {
      version: '1.0.0',
      robotModel: 'AQB-PRO',
      fileUrl: 'https://firmware.aquabuddy.com/aqb-pro-v1.0.0.bin',
      fileSize: 4194304,
      checksum: 'sha256-a1b2c3d4e5f6...',
      changelog: 'Initial release',
      status: FirmwareStatus.RELEASED,
      uploadedBy: admin.id,
      minHardwareVersion: 'v1.0',
    },
  });
  const fw2 = await prisma.firmwareRecord.create({
    data: {
      version: '1.1.0',
      robotModel: 'AQB-PRO',
      fileUrl: 'https://firmware.aquabuddy.com/aqb-pro-v1.1.0.bin',
      fileSize: 5242880,
      checksum: 'sha256-b2c3d4e5f6a7...',
      changelog: 'Improved water flow algorithm, bug fixes',
      status: FirmwareStatus.RELEASED,
      uploadedBy: admin.id,
      minHardwareVersion: 'v1.0',
    },
  });
  await prisma.firmwareRecord.create({
    data: {
      version: '1.0.0',
      robotModel: 'AQB-CLASSIC',
      fileUrl: 'https://firmware.aquabuddy.com/aqb-classic-v1.0.0.bin',
      fileSize: 3145728,
      checksum: 'sha256-c3d4e5f6a7b8...',
      changelog: 'Initial release for Classic model',
      status: FirmwareStatus.RELEASED,
      uploadedBy: admin.id,
      minHardwareVersion: 'v1.0',
    },
  });
  await prisma.robotFirmwareDeployment.create({
    data: {
      robotId: robot1.id,
      firmwareId: fw2.id,
      status: DeploymentStatus.SUCCESS,
      deployedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000 + 300000),
    },
  });
  await prisma.robotFirmwareDeployment.create({
    data: {
      robotId: robot1.id,
      firmwareId: fw1.id,
      status: DeploymentStatus.SUCCESS,
      deployedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000 + 240000),
    },
  });

  console.log('Seeding sensor readings...');
  const now = new Date();
  const readings = [];
  for (let i = 48; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000);
    const hum1 = 70 + Math.sin(i / 5) * 10 + Math.random() * 5;
    const temp1 = 26 + Math.cos(i / 5) * 3 + Math.random() * 2;
    const waterFlow1 = hum1 > 75 ? 1.5 + Math.random() * 0.5 : 1.0 + Math.random() * 0.4;
    readings.push({
      robotId: robot1.id,
      humidity: parseFloat(hum1.toFixed(2)),
      temperature: parseFloat(temp1.toFixed(2)),
      waterFlow: parseFloat(waterFlow1.toFixed(2)),
      waterLevel: parseFloat((80 + Math.sin(i / 10) * 15).toFixed(2)),
      powerConsumption: parseFloat((250 + Math.random() * 30).toFixed(2)),
      battery: 92,
      current: 4.8,
      voltage: 228.4,
      motorStatus: "RUNNING",
      obstacle: false,
      irDetection: false,
      signalStrength: -58,
      runtime: 820,
      createdAt: timestamp,
    });
  }
  await prisma.sensorReading.createMany({ data: readings });

  console.log('Seeding robot logs...');
  const logSources = ['system', 'sensor', 'network', 'motor', 'firmware'];
  const logMessages = [
    { level: LogLevel.INFO, message: 'System boot completed successfully' },
    { level: LogLevel.INFO, message: 'Sensor calibration verified' },
    { level: LogLevel.WARN, message: 'Water flow rate slightly below optimum' },
    { level: LogLevel.INFO, message: 'Network connection established' },
    { level: LogLevel.DEBUG, message: 'Motor PWM frequency adjusted to 250Hz' },
    { level: LogLevel.ERROR, message: 'Communication timeout with humidity sensor, retrying' },
    { level: LogLevel.INFO, message: 'Firmware health check passed' },
    { level: LogLevel.WARN, message: 'Battery level dropped below 50%' },
    { level: LogLevel.INFO, message: 'Daily water generation report generated' },
    { level: LogLevel.FATAL, message: 'Pump motor overcurrent detected, emergency stop triggered' },
  ];
  for (const robot of [robot1, robot2, robot3]) {
    for (let i = 0; i < 10; i++) {
      const logEntry = logMessages[i % logMessages.length];
      await prisma.robotLog.create({
        data: {
          robotId: robot.id,
          level: logEntry.level,
          message: logEntry.message,
          source: logSources[i % logSources.length],
          meta: JSON.stringify({ pid: 1234, uptime: `${i * 24}h` }),
          createdAt: new Date(now.getTime() - i * 6 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('Seeding robot analytics...');
  for (const robot of [robot1, robot2, robot3]) {
    for (let i = 7; i > 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);
      const baseWater = robot.id === robot3.id ? 300 : robot.id === robot1.id ? 200 : 120;
      await prisma.robotAnalytics.create({
        data: {
          robotId: robot.id,
          date,
          totalWaterGenerated: baseWater + Math.random() * 50,
          averageHumidity: 70 + Math.random() * 10,
          averageTemperature: 26 + Math.random() * 3,
          totalPowerConsumed: 10 + Math.random() * 5,
          averageBattery: 70 + Math.random() * 25,
          minBattery: Math.floor(50 + Math.random() * 20),
          maxBattery: Math.floor(90 + Math.random() * 10),
          alertCount: Math.floor(Math.random() * 3),
          runtimeHours: 20 + Math.random() * 4,
          uptimePercentage: 95 + Math.random() * 5,
        },
      });
    }
  }

  console.log('Seeding analytics snapshots...');
  const snapshots = [];
  for (let i = 7; i > 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);
    snapshots.push({
      date,
      totalWaterGenerated: 120 + Math.random() * 40,
      averageHumidity: 72 + Math.random() * 8,
      averageTemperature: 27 + Math.random() * 3,
      totalActiveRobots: 2,
      totalPowerConsumed: 12.5 + Math.random() * 3.2,
      newUsers: Math.floor(Math.random() * 5),
      totalRevenue: Math.random() * 1000,
    });
  }
  await prisma.analyticsSnapshot.createMany({ data: snapshots });

  console.log('Seeding predictions...');
  await prisma.prediction.create({
    data: {
      robotId: robot1.id,
      type: 'WATER_YIELD',
      targetDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      value: 15.6,
      confidence: 0.88,
    },
  });

  console.log('Seeding alerts...');
  await prisma.alert.create({
    data: {
      robotId: robot3.id,
      type: AlertType.SYSTEM_ERROR,
      severity: AlertSeverity.CRITICAL,
      message: 'Airflow blocked. Check intake grill.',
      status: AlertStatus.ACTIVE,
    },
  });
  await prisma.alert.create({
    data: {
      robotId: robot1.id,
      type: AlertType.TANK_FULL,
      severity: AlertSeverity.INFO,
      message: 'Storage tank at 95% capacity.',
      status: AlertStatus.ACTIVE,
    },
  });

  console.log('Seeding notifications...');
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'ALERT',
      title: 'High Temperature Alert',
      message: 'Robot AQB-00003 registered temperature of 38°C.',
      priority: NotificationPriority.HIGH,
    },
  });
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'SYSTEM',
      title: 'Weekly Report Ready',
      message: 'Your water yield summary for last week is ready.',
      priority: NotificationPriority.NORMAL,
    },
  });
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'FIRMWARE',
      title: 'Firmware Update Available',
      message: 'Version 1.1.0 is available for your AQB-PRO robot.',
      priority: NotificationPriority.LOW,
    },
  });

  console.log('Seeding feedback...');
  await prisma.feedback.create({
    data: {
      userId: user1.id,
      subject: 'Excellent water taste',
      message: 'The water quality exceeds my expectation. Filters work wonders!',
      rating: 5,
      category: 'General',
      status: FeedbackStatus.NEW,
    },
  });

  console.log('Seeding platform settings...');
  const platformSettings = [
    { key: 'site_name', value: '"AquaBuddy E-Tech"', type: 'string', description: 'Platform display name', isPublic: true },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Enable maintenance mode', isPublic: false },
    { key: 'max_robots_per_user', value: '10', type: 'number', description: 'Maximum robots per user account', isPublic: true },
    { key: 'default_theme', value: '"system"', type: 'string', description: 'Default theme for new users', isPublic: true },
    { key: 'session_timeout_minutes', value: '60', type: 'number', description: 'Inactive session timeout', isPublic: false },
    { key: 'firmware_auto_update', value: 'false', type: 'boolean', description: 'Auto-deploy firmware updates', isPublic: false },
    { key: 'alert_retention_days', value: '90', type: 'number', description: 'Days to retain resolved alerts', isPublic: false },
    { key: 'telemetry_interval_seconds', value: '30', type: 'number', description: 'Sensor reading interval', isPublic: true },
  ];
  for (const setting of platformSettings) {
    await prisma.platformSetting.create({ data: setting });
  }

  console.log('Seeding feature flags...');
  const featureFlags = [
    { key: 'dashboard_v2', enabled: true, name: 'Dashboard v2', description: 'New dashboard layout and charts' },
    { key: 'ai_chat', enabled: true, name: 'AI Chat', description: 'AquaBot AI assistant chat interface' },
    { key: 'remote_control', enabled: true, name: 'Remote Control', description: 'Manual robot remote control' },
    { key: 'firmware_ota', enabled: true, name: 'Firmware OTA', description: 'Over-the-air firmware updates' },
    { key: 'analytics_export', enabled: true, name: 'Analytics Export', description: 'Export analytics to CSV/JSON' },
    { key: 'live_map', enabled: true, name: 'Live Map', description: 'Real-time robot location map' },
    { key: 'predictive_maintenance', enabled: false, name: 'Predictive Maintenance', description: 'AI-powered maintenance predictions' },
    { key: 'multi_fleet', enabled: false, name: 'Multi-Fleet Management', description: 'Organization fleet management' },
  ];
  for (const flag of featureFlags) {
    await prisma.featureFlag.create({ data: flag });
  }

  console.log('Seeding system health...');
  const components = [
    { component: 'database', status: 'healthy', message: 'PostgreSQL connected', latencyMs: 5 },
    { component: 'redis', status: 'degraded', message: 'Redis not configured, using in-memory cache', latencyMs: null },
    { component: 'websocket', status: 'healthy', message: 'Socket.IO active', latencyMs: 2 },
    { component: 'api', status: 'healthy', message: 'Express server running', latencyMs: 3 },
    { component: 's3_storage', status: 'healthy', message: 'S3 compatible storage available', latencyMs: 45 },
  ];
  for (const comp of components) {
    await prisma.systemHealth.create({ data: comp });
  }

  console.log('Seeding revenue...');
  const revenueRecords = [
    { type: RevenueType.SUBSCRIPTION, description: 'Premium plan - AIET Campus', amount: 499.99, date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
    { type: RevenueType.ONE_TIME, description: 'AQB-PRO robot purchase', amount: 2999.00, date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    { type: RevenueType.MAINTENANCE, description: 'Filter replacement service', amount: 149.99, date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
    { type: RevenueType.MAINTENANCE, description: 'Pump replacement (AQB-CLASSIC)', amount: 250.00, date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) },
    { type: RevenueType.SUBSCRIPTION, description: 'Basic plan - Individual', amount: 99.99, date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
  ];
  for (const rec of revenueRecords) {
    await prisma.revenue.create({ data: rec });
  }

  console.log('Database seeding completed successfully!');
  console.log(`  Users: 4 (Owner, Admin, ${user1.firstName} ${user1.lastName}, ${user2.firstName} ${user2.lastName})`);
  console.log(`  Robots: 3 (${robot1.name}, ${robot2.name}, ${robot3.name})`);
  console.log(`  Sessions: 2`);
  console.log(`  User Settings: 4`);
  console.log(`  Robot Activations: 3`);
  console.log(`  Firmware Records: 3`);
  console.log(`  Firmware Deployments: 2`);
  console.log(`  Platform Settings: 8`);
  console.log(`  Feature Flags: 8`);
  console.log(`  System Health: 5`);
  console.log(`  Revenue Records: 5`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
