/*
  Warnings:

  - A unique constraint covering the columns `[eventId,participantId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('PG', 'Volei', 'Culto_Domingo', 'Culto_Sabádo', 'Evento_GD');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "category" "EventCategory" NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_eventId_participantId_key" ON "Attendance"("eventId", "participantId");
