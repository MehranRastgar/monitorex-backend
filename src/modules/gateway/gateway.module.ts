import { CacheModule, Module } from '@nestjs/common';
import { MyGateway } from './gateway.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 1000 * 60, // the time-to-live (TTL) for cached items in seconds
      max: 1000, // the maximum number of items that can be stored in the cache at one time
    }),
  ],
  providers: [MyGateway],
})
export class GatewayModule {}
