import path from "path";
import fs from "fs/promises";

// delete image file (SAFE + ASYNC)
export async function RemoveFile(photoPath: string) {
    try {
        if (!photoPath) return;

        const filePath = path.join(process.cwd(), photoPath);

        await fs.unlink(filePath);
    } catch (error: any) {
        // Ignore si le fichier n'existe pas
        if (error.code !== "ENOENT") {
            console.error("Failed to remove file:", error.message);
        }
    }
}