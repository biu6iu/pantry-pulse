/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `DonatedItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DonatedItem_name_key" ON "DonatedItem"("name");
