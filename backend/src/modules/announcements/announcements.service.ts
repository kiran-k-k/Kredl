import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Announcement } from './schemas/announcement.schema';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { AnnouncementsFilterDto } from './dto/announcements-filter.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Announcement.name)
    private readonly announcementModel: Model<Announcement>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createAnnouncementDto: CreateAnnouncementDto,
    userId: string,
  ): Promise<Announcement> {
    const newAnnouncement = new this.announcementModel({
      ...createAnnouncementDto,
      createdBy: new Types.ObjectId(userId),
    });
    const announcement = await newAnnouncement.save();
    
    this.eventEmitter.emit('announcement.published', {
      announcementId: announcement._id.toString(),
      title: announcement.title,
      message: announcement.content,
    });
    
    return announcement;
  }

  async findAll(query: AnnouncementsFilterDto) {
    const { page = 1, limit = 10, search, audience } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    if (audience) {
      filter.audience = audience;
    }

    const [data, total] = await Promise.all([
      this.announcementModel
        .find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.announcementModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Announcement> {
    const announcement = await this.announcementModel
      .findById(id)
      .populate('createdBy', 'name email')
      .exec();
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }

  async update(
    id: string,
    updateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<Announcement> {
    const updatedAnnouncement = await this.announcementModel
      .findByIdAndUpdate(id, updateAnnouncementDto, { new: true })
      .exec();
    if (!updatedAnnouncement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return updatedAnnouncement;
  }

  async remove(id: string): Promise<void> {
    const result = await this.announcementModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
  }
}
