package com.example.skilly.Services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    // Upload file and return both URL and public_id
    public Map<String, String> uploadFile(MultipartFile file, String folder) throws IOException {
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "use_filename", true,
                        "unique_filename", true
                )
        );

        return Map.of(
                "url", uploadResult.get("secure_url").toString(),
                "public_id", uploadResult.get("public_id").toString()
        );
    }

    // Delete file using public_id
    public void deleteFile(String publicId) throws IOException {
        if (publicId != null && !publicId.isEmpty()) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }

    // Overloaded method for default folder
    public Map<String, String> uploadFile(MultipartFile file) throws IOException {
        return uploadFile(file, "profile_pictures");
    }
}