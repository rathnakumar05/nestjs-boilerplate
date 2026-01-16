import { SetMetadata } from '@nestjs/common';

export const HAS_TEMP_ACCESS_KEY = 'hasTempAccess';
export const HasTempAccess = () => SetMetadata(HAS_TEMP_ACCESS_KEY, true);
