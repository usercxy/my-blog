import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';

@Injectable()
export class SiteService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSettings() {
    const setting = await this.prismaService.siteSetting.findFirst({
      orderBy: {
        id: 'asc',
      },
    });

    if (setting) {
      return setting;
    }

    return this.prismaService.siteSetting.create({
      data: {
        siteName: '个人博客',
      },
    });
  }

  async updateSettings(dto: UpdateSiteSettingsDto) {
    const current = await this.getSettings();
    const data: Prisma.SiteSettingUpdateInput = {
      ...dto,
      contactEmail: dto.contactEmail?.trim(),
      skills: dto.skills?.map((item) => item.trim()).filter(Boolean),
      experiences: dto.experiences?.map((item) => ({
        period: item.period.trim(),
        title: item.title.trim(),
        description: item.description.trim(),
      })),
      socialLinks: dto.socialLinks?.map((item) => ({
        label: item.label.trim(),
        href: item.href.trim(),
      })),
    };

    return this.prismaService.siteSetting.update({
      where: {
        id: current.id,
      },
      data,
    });
  }
}
