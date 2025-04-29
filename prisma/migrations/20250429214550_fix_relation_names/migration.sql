/*
  Warnings:

  - You are about to drop the column `endTime` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Meeting` table. All the data in the column will be lost.
  - The `status` column on the `Meeting` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_Participants` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('JOINED', 'LEFT');

-- DropForeignKey
ALTER TABLE "_Participants" DROP CONSTRAINT "_Participants_A_fkey";

-- DropForeignKey
ALTER TABLE "_Participants" DROP CONSTRAINT "_Participants_B_fkey";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "MeetingStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "_Participants";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "MeetingParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "MeetingParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingParticipant_userId_meetingId_key" ON "MeetingParticipant"("userId", "meetingId");

-- AddForeignKey
ALTER TABLE "MeetingParticipant" ADD CONSTRAINT "MeetingParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingParticipant" ADD CONSTRAINT "MeetingParticipant_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
