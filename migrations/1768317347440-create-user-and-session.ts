import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAndSession1768317347440 implements MigrationInterface {
  name = 'CreateUserAndSession1768317347440';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth"."users" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL, "firstName" character varying, "lastName" character varying, "email" character varying NOT NULL, "password" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_9099c98f00a1b5aca6b8f7f04a3" UNIQUE ("publicId"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9099c98f00a1b5aca6b8f7f04a" ON "auth"."users" ("publicId") `);
    await queryRunner.query(
      `CREATE TABLE "auth"."sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "publicId" character varying NOT NULL, "token" character varying NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "ipAddress" character varying, "userAgent" character varying, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "auth"."sessions"`);
    await queryRunner.query(`DROP INDEX "auth"."IDX_9099c98f00a1b5aca6b8f7f04a"`);
    await queryRunner.query(`DROP TABLE "auth"."users"`);
  }
}
