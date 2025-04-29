-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserCalls" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserCalls_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserCalls_B_index" ON "_UserCalls"("B");

-- AddForeignKey
ALTER TABLE "_UserCalls" ADD CONSTRAINT "_UserCalls_A_fkey" FOREIGN KEY ("A") REFERENCES "Call"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserCalls" ADD CONSTRAINT "_UserCalls_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
