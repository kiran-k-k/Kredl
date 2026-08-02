import { Logger } from '@nestjs/common';

export const seedLogger = new Logger('Seed');

export async function runSeeder(name: string, seederFn: () => Promise<void>) {
  seedLogger.log(`Seeding ${name}...`);
  try {
    await seederFn();
    seedLogger.log(`✔ ${name} seeded successfully.`);
  } catch (error: any) {
    seedLogger.error(`✖ Error seeding ${name}: ${error.message}`);
    throw error;
  }
}
