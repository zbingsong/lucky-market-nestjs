import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_ENDPOINT = 'isPublicEndpoint';
export const Public = () => SetMetadata(IS_PUBLIC_ENDPOINT, true);
