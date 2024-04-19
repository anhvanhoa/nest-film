import { Controller, Get, Param, Query } from '@nestjs/common';
import { FilmService } from './film.service';

@Controller('film')
export default class FilmController {
  constructor(private filmService: FilmService) {}
  @Get('now-showing')
  nowShow(@Query('current') slug?: string) {
    return this.filmService.nowShow(slug);
  }

  @Get('coming-soon')
  comingSoon() {
    return this.filmService.comingSoon();
  }

  @Get(':slug')
  film(@Param('slug') slug: string) {
    return this.filmService.film(slug);
  }
}
