-- AlterTable
ALTER TABLE "MonthlySummary" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "totalIncome" SET DEFAULT 0,
ALTER COLUMN "totalExpense" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Operation" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "DailySummary" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExpense" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklySummary" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExpense" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "WeeklySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailySummary_userId_date_key" ON "DailySummary"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySummary_userId_week_year_key" ON "WeeklySummary"("userId", "week", "year");

-- AddForeignKey
ALTER TABLE "DailySummary" ADD CONSTRAINT "DailySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklySummary" ADD CONSTRAINT "WeeklySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
