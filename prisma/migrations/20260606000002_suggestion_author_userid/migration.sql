-- AddColumn authorUserId to suggestions
ALTER TABLE `suggestions` ADD COLUMN `authorUserId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `suggestions` ADD CONSTRAINT `suggestions_authorUserId_fkey`
  FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
