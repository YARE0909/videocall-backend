/*
  Warnings:

  - The values [PENDING] on the enum `MeetingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MeetingStatus_new" AS ENUM ('ACTIVE', 'ENDED');
ALTER TABLE "Meeting" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Meeting" ALTER COLUMN "status" TYPE "MeetingStatus_new" USING ("status"::text::"MeetingStatus_new");
ALTER TYPE "MeetingStatus" RENAME TO "MeetingStatus_old";
ALTER TYPE "MeetingStatus_new" RENAME TO "MeetingStatus";
DROP TYPE "MeetingStatus_old";
ALTER TABLE "Meeting" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "Meeting" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
