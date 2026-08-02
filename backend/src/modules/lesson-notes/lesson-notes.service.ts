import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { LessonNote, LessonNoteDocument } from './schemas/lesson-note.schema';
import { CreateLessonNoteDto } from './dto/create-lesson-note.dto';
import { UpdateLessonNoteDto } from './dto/update-lesson-note.dto';
import { LessonNotesFilterDto } from './dto/lesson-notes-filter.dto';

@Injectable()
export class LessonNotesService {
  constructor(
    @InjectModel(LessonNote.name)
    private readonly lessonNoteModel: Model<LessonNoteDocument>,
  ) {}

  async create(
    createLessonNoteDto: CreateLessonNoteDto,
    userId: string,
    session?: ClientSession,
  ): Promise<LessonNote> {
    const lessonNote = new this.lessonNoteModel({
      ...createLessonNoteDto,
      lessonId: new Types.ObjectId(createLessonNoteDto.lessonId),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    return lessonNote.save({ session });
  }

  async findAll(query: LessonNotesFilterDto) {
    const { page = 1, limit = 10, search, lessonId } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (lessonId) {
      filter.lessonId = new Types.ObjectId(lessonId);
    }

    const [data, total] = await Promise.all([
      this.lessonNoteModel
        .find(filter)
        .populate('lessonId', 'title')
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.lessonNoteModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<LessonNote> {
    const lessonNote = await this.lessonNoteModel
      .findById(id)
      .populate('lessonId', 'title moduleId') // Lightweight populate
      .exec();

    if (!lessonNote) {
      throw new NotFoundException(`LessonNote #${id} not found`);
    }
    return lessonNote;
  }

  async update(
    id: string,
    updateLessonNoteDto: UpdateLessonNoteDto,
    userId: string,
    session?: ClientSession,
  ): Promise<LessonNote> {
    const updateData: Record<string, any> = {
      ...updateLessonNoteDto,
      updatedBy: new Types.ObjectId(userId),
    };
    if (updateLessonNoteDto.lessonId) {
      updateData.lessonId = new Types.ObjectId(updateLessonNoteDto.lessonId);
    }

    const lessonNote = await this.lessonNoteModel
      .findByIdAndUpdate(id, updateData, { new: true, session })
      .exec();

    if (!lessonNote) {
      throw new NotFoundException(`LessonNote #${id} not found`);
    }
    return lessonNote;
  }

  async remove(id: string, session?: ClientSession): Promise<void> {
    const lessonNote = await this.lessonNoteModel
      .findByIdAndDelete(id, { session })
      .exec();
    if (!lessonNote) {
      throw new NotFoundException(`LessonNote #${id} not found`);
    }
  }

  async findByLessonId(lessonId: string): Promise<LessonNote | null> {
    return this.lessonNoteModel
      .findOne({ lessonId: new Types.ObjectId(lessonId) })
      .exec();
  }
}
