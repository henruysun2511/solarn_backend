import { Injectable } from '@nestjs/common';

import { UpdateSettingDto } from '../dtos/update-setting.dto';
import { SettingRepository } from '../repositories/setting.repository';

@Injectable()
export class SettingService {
  constructor(private readonly settingRepo: SettingRepository) {}

  async get() {
    const setting = await this.settingRepo.findFirst();
    if (!setting) {
      return {
        siteName: 'SOLARN',
        logoUrl: null,
        hotline: null,
        email: null,
        address: null,
        metaTitle: null,
        metaDescription: null
      };
    }
    return setting;
  }

  async update(dto: UpdateSettingDto) {
    return this.settingRepo.upsert(dto);
  }
}
