import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('BlockchainController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/blockchain/value (GET)', () => {
        return request(app.getHttpServer())
            .get('/blockchain/value')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('value');
                expect(res.body).toHaveProperty('blockNumber');
                expect(res.body).toHaveProperty('updatedAt');
            });
    });

    it('/blockchain/owner (GET)', () => {
        return request(app.getHttpServer())
            .get('/blockchain/owner')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('owner');
                expect(res.body.owner).toMatch(/^0x[a-fA-F0-9]{40}$/);
            });
    });

    it('/blockchain/events (GET)', () => {
        return request(app.getHttpServer())
            .get('/blockchain/events')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
            });
    });
});
