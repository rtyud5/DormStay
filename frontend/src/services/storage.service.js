import { supabase } from "../lib/supabase";

const StorageService = {
  async uploadFile(file, bucket = "profiles", folder = "") {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Lỗi khi tải ảnh:", error);
      throw error;
    }
  }
};

export default StorageService;
