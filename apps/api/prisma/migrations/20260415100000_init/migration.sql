-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MemberCategory" AS ENUM ('TITULAR', 'DEPENDENTE', 'CONVIDADO');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ATIVO', 'SUSPENSO', 'INATIVO', 'PENDENTE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMADO', 'CANCELADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO');

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "photoUrl" TEXT,
    "category" "MemberCategory" NOT NULL DEFAULT 'TITULAR',
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDENTE',
    "holderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL,
    "rules" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_holderId_idx" ON "Member"("holderId");

-- CreateIndex
CREATE INDEX "Member_status_idx" ON "Member"("status");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_areaId_idx" ON "AvailabilitySlot"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilitySlot_areaId_dayOfWeek_startTime_key" ON "AvailabilitySlot"("areaId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "BlockedDate_areaId_idx" ON "BlockedDate"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDate_areaId_date_key" ON "BlockedDate"("areaId", "date");

-- CreateIndex
CREATE INDEX "Booking_memberId_idx" ON "Booking"("memberId");

-- CreateIndex
CREATE INDEX "Booking_areaId_date_idx" ON "Booking"("areaId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_areaId_slotId_date_status_key" ON "Booking"("areaId", "slotId", "date", "status");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AvailabilitySlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
