package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TestController {


    // KHONG CODE FILE NAY



    @GetMapping
    public ApiResponse<String> doTest(){
        String test = "test first API";
        return ApiResponse.success(test);
    }


    @GetMapping("/exception")
    public ApiResponse<String> doTestException(@RequestParam(required = false) int number){

        if (number == 0){
            throw new AppException(ErrorCode.INVALID_USERNAME);
        }

        return ApiResponse.success("the number equals zero");
    }


}
