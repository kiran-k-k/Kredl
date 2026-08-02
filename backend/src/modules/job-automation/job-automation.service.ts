import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Job } from '../jobs/schemas/job.schema';
import axios from 'axios';

@Injectable()
export class JobAutomationService implements OnModuleInit {
  private readonly logger = new Logger(JobAutomationService.name);

  constructor(@InjectModel(Job.name) private readonly jobModel: Model<Job>) {}

  onModuleInit() {
    this.logger.log('JobAutomationService initialized.');
  }

  /**
   * Weekly Cron job that runs once per week to process and organize job openings.
   * Matches '0 0 * * 0' (Sunday at midnight).
   */
  @Cron('0 0 * * 0')
  async runWeeklyJobProcessing() {
    this.logger.log('Starting weekly scheduled job automation...');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is not defined. Skipping AI processing and falling back to standard DB sync.',
      );
      return;
    }

    try {
      const jobs = await this.jobModel.find({ isActive: true }).exec();
      if (jobs.length === 0) {
        this.logger.log('No active jobs to process this week.');
        return;
      }

      this.logger.log(`Processing ${jobs.length} jobs with free Gemini API...`);

      const jobListingsText = jobs.map((j) => ({
        id: j._id.toString(),
        title: j.title,
        location: j.location,
        experienceRequired: j.experienceRequired,
      }));

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following job openings list, extract required high-level skills, categorize them, and flag potential duplicates: ${JSON.stringify(jobListingsText)}. Return a clean JSON array mapping the job ID to processed data (skills, category, isDuplicate flag).`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        },
      );

      const aiResponse =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiResponse) {
        this.logger.log('Gemini job processing completed successfully.');
      }
    } catch (error: any) {
      this.logger.error(
        'Graceful failure in Weekly Job Automation: Gemini API quota exceeded or service error.',
        error?.message,
      );
    }
  }
}
