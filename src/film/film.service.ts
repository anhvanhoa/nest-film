import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '~/prisma/prisma.service';

@Injectable()
export class FilmService {
  constructor(private prisma: PrismaService) {}

  nowShow(slug: string = '') {
    return this.prisma.film.findMany({
      where: {
        status: 'now_showing',
        NOT: {
          slug,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  comingSoon() {
    return this.prisma.film.findMany({
      where: {
        status: 'coming_soon',
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async film(slug: string) {
    const film = await this.prisma.film.findUnique({
      where: {
        slug,
      },
    });
    if (film) return film;
    throw new NotFoundException('không tìm thấy phim');
  }
}
