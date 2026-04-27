-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "schedule_template_id" TEXT;

-- CreateTable
CREATE TABLE "class_schedule_templates" (
    "template_id" TEXT NOT NULL,
    "template_name" VARCHAR(255) NOT NULL,
    "weekdays" VARCHAR(20) NOT NULL,
    "shift_code" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "class_schedule_templates_pkey" PRIMARY KEY ("template_id")
);

-- CreateIndex
CREATE INDEX "class_schedule_templates_shift_code_idx" ON "class_schedule_templates"("shift_code");

-- CreateIndex
CREATE INDEX "class_schedule_templates_is_active_idx" ON "class_schedule_templates"("is_active");

-- CreateIndex
CREATE INDEX "classes_schedule_template_id_idx" ON "classes"("schedule_template_id");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_schedule_template_id_fkey" FOREIGN KEY ("schedule_template_id") REFERENCES "class_schedule_templates"("template_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedule_templates" ADD CONSTRAINT "class_schedule_templates_shift_code_fkey" FOREIGN KEY ("shift_code") REFERENCES "study_shifts"("shift_code") ON DELETE RESTRICT ON UPDATE CASCADE;
