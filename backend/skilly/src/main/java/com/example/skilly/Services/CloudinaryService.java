package com.example.skilly.Services;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
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

    public Map<String, String> uploadVideo(MultipartFile file, String folder) throws IOException {
        // Create a proper Cloudinary Transformation object
        Transformation transformation = new Transformation().duration(30);

        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "video",
                        "folder", folder,
                        "use_filename", true,
                        "unique_filename", true,
                        "eager", Arrays.asList(transformation)
                )
        );

        // Extract duration from result
        Integer duration = null;
        if (uploadResult.containsKey("duration")) {
            duration = ((Number) uploadResult.get("duration")).intValue();
        }

        Map<String, String> result = new HashMap<>();
        result.put("url", uploadResult.get("secure_url").toString());
        result.put("public_id", uploadResult.get("public_id").toString());

        if (duration != null) {
            result.put("duration", duration.toString());
        }

        return result;
    }

    // Delete file using public_id
    public boolean deleteFile(String publicId) {
        if (publicId == null || publicId.isEmpty()) {
            System.out.println("Cannot delete image: publicId is null or empty");
            return false;
        }

        try {
            System.out.println("Attempting to delete image with publicId: " + publicId);
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

            // Check if deletion was successful
            String status = (String) result.get("result");
            boolean success = "ok".equals(status);

            System.out.println("Image deletion result: " + result);
            return success;
        } catch (IOException e) {
            System.err.println("Error deleting image from Cloudinary: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // Overloaded method for default folder
    public Map<String, String> uploadFile(MultipartFile file) throws IOException {
        return uploadFile(file, "profile_pictures");
    }
}