package com.swp391.horseracing.module.common.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.common.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {
    private final Cloudinary cloudinary;


    @Override
    public String uploadFile(MultipartFile file, String folder) {
        try {
            Map result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto"
                    )
            );

            return (String) result.get("secure_url");

        } catch (IOException e) {
            throw new AppException(ErrorCode.CLOUDINARY_UPLOAD_FAILED);
        }
    }

    @Override
    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

        } catch (IOException e) {
            throw new AppException(ErrorCode.CLOUDINARY_DELETE_FAILED);
        }
    }
}
