/*
  Warnings:

  - You are about to drop the `Call` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserCalls` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserCalls" DROP CONSTRAINT "_UserCalls_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserCalls" DROP CONSTRAINT "_UserCalls_B_fkey";

-- DropTable
DROP TABLE "Call";

-- DropTable
DROP TABLE "_UserCalls";

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hostId" TEXT NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Participants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Participants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_code_key" ON "Meeting"("code");

-- CreateIndex
CREATE INDEX "_Participants_B_index" ON "_Participants"("B");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Participants" ADD CONSTRAINT "_Participants_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Participants" ADD CONSTRAINT "_Participants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
