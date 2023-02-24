import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CacheService } from './cache.service';
import { RedisConfigService } from './redis.config.service';

describe('CacheService', () => {
  let cacheService: CacheService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        RedisModule.forRootAsync({
          imports: [ConfigModule],
          useClass: RedisConfigService,
          inject: [ConfigService],
        }),
      ],
      providers: [CacheService],
    }).compile();
    cacheService = moduleRef.get<CacheService>(CacheService);
  });

  describe('set', () => {
    it('should be defined', () => {
      expect(cacheService.set).toBeDefined();
    });
    it('should return OK', async () => {
      const result = await cacheService.set('test', 'test', 100);
      expect(result).toBe('OK');
    });
  });
  describe('get', () => {
    it('should be defined', () => {
      expect(cacheService.get).toBeDefined();
    });
    it('should return test', async () => {
      await cacheService.set('test', 'test', 100);
      const result = await cacheService.get('test');
      expect(result).toBe('test');
    });
  });
});
