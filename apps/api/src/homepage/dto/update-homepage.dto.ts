import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';

class LocationDto {
  @IsString() @IsNotEmpty() @MaxLength(80) city!: string;
  @IsString() @IsNotEmpty() @MaxLength(120) timeZone!: string;
}

export class UpdateHomepageDto {
  @IsString() @IsNotEmpty() @MaxLength(120) name!: string;
  @IsString() @IsNotEmpty() @MaxLength(200) eyebrow!: string;
  @IsString() @IsNotEmpty() @MaxLength(200) role!: string;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(4) @ValidateNested({ each: true }) @Type(() => LocationDto) locations!: LocationDto[];
  @IsString() @IsNotEmpty() @MaxLength(500) aboutHeadline!: string;
  @IsString() @IsNotEmpty() @MaxLength(500) aboutNote!: string;
  @IsString() @IsNotEmpty() @MaxLength(200) currently!: string;
  @IsString() @IsNotEmpty() @MaxLength(200) interests!: string;
  @IsString() @IsNotEmpty() @MaxLength(100) instagramLabel!: string;
  @IsUrl({ require_protocol: true }) instagramUrl!: string;
  @IsArray() @ArrayMinSize(12) @ArrayMaxSize(12) @IsString({ each: true }) collageImages!: string[];
}
