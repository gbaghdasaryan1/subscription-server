import { PartialType } from '@nestjs/swagger';
import { RegisterDto } from './registration.dto';

export class UpdateAuthDto extends PartialType(RegisterDto) {}
