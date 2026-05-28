import { Injectable } from '@nestjs/common';
import { Setting } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { UpdateSettingDto } from '../dtos/update-setting.dto';

@Injectable()
export class SettingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(): Promise<Setting | null> {
    return this.prisma.setting.findFirst();
  }

  async upsert(data: UpdateSettingDto): Promise<Setting> {
    const existing = await this.findFirst();
    if (existing) {
      return this.prisma.setting.update({
        where: { settingId: existing.settingId },
        data
      });
    }
    return this.prisma.setting.create({
      data: {
        siteName: data.siteName || 'SOLARN',
        ...data
      }
    });
  }
}
