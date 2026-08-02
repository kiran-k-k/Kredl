import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { BookmarkType } from './schemas/bookmark.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';

@ApiTags('Bookmarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  @Roles(RoleEnum.STUDENT, RoleEnum.TPO, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get all bookmarks for the user' })
  @ApiResponse({ status: 200, description: 'Return all bookmarks' })
  async getBookmarks(@CurrentUser() user: { sub: string }) {
    return this.bookmarksService.getBookmarks(user.sub);
  }

  @Post('toggle')
  @Roles(RoleEnum.STUDENT, RoleEnum.TPO, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Toggle a bookmark' })
  @ApiResponse({ status: 200, description: 'Bookmark toggled' })
  async toggleBookmark(
    @CurrentUser() user: { sub: string },
    @Body() body: { entityId: string; entityType: BookmarkType },
  ) {
    return this.bookmarksService.toggleBookmark(
      user.sub,
      body.entityId,
      body.entityType,
    );
  }

  @Delete(':id')
  @Roles(RoleEnum.STUDENT, RoleEnum.TPO, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Delete a bookmark by ID' })
  @ApiResponse({ status: 200, description: 'Bookmark deleted' })
  async deleteBookmark(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.bookmarksService.deleteBookmark(user.sub, id);
  }
}
