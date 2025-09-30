import { PartialType } from '@nestjs/swagger';
import { CreateOneCDto } from './create-one-c.dto';

export class UpdateOneCDto extends PartialType(CreateOneCDto) {}
