-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_history" (
    "id" SERIAL NOT NULL,
    "change_type" VARCHAR(50) NOT NULL,
    "old_email" TEXT,
    "old_phone" TEXT,
    "old_password_hash" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auth_id" INTEGER NOT NULL,

    CONSTRAINT "auth_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "owner_id" INTEGER NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_levels" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "permission_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_collaborators" (
    "id" SERIAL NOT NULL,
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "id_permission_level" INTEGER NOT NULL,

    CONSTRAINT "note_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "auth_email_key" ON "auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_id_key" ON "auth"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "permission_levels_name_key" ON "permission_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "note_collaborators_note_id_user_id_key" ON "note_collaborators"("note_id", "user_id");

-- AddForeignKey
ALTER TABLE "auth" ADD CONSTRAINT "auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_history" ADD CONSTRAINT "auth_history_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_collaborators" ADD CONSTRAINT "note_collaborators_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_collaborators" ADD CONSTRAINT "note_collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_collaborators" ADD CONSTRAINT "note_collaborators_id_permission_level_fkey" FOREIGN KEY ("id_permission_level") REFERENCES "permission_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Función guardar los cambios
CREATE OR REPLACE FUNCTION log_auth_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email <> OLD.email THEN
        INSERT INTO "auth_history" ("auth_id", "change_type", "old_email", "changed_at")
        VALUES (OLD.id, 'EMAIL_CHANGE', OLD.email, NOW());
    END IF;

    IF NEW.password_hash <> OLD.password_hash THEN
        INSERT INTO "auth_history" ("auth_id", "change_type", "old_password_hash", "changed_at")
        VALUES (OLD.id, 'PASSWORD_CHANGE', OLD.password_hash, NOW());
    END IF;

    IF NEW.phone IS DISTINCT FROM OLD.phone THEN
        INSERT INTO "auth_history" ("auth_id", "change_type", "old_phone", "changed_at")
        VALUES (OLD.id, 'PHONE_CHANGE', OLD.phone, NOW());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_auth_audit
AFTER UPDATE ON "auth"
FOR EACH ROW
EXECUTE FUNCTION log_auth_changes();