import { Module } from '@nestjs/common';
import { HiddenGemsController } from './hidden-gems.controller';
import { HiddenGemsService } from './hidden-gems.service';

@Module({
  controllers: [HiddenGemsController],
  providers: [HiddenGemsService]
})
export class HiddenGemsModule {}
