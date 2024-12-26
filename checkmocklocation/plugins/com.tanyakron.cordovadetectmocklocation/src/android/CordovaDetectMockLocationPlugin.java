package com.tanyakron.cordovadetectmocklocation; // ระบุ package ที่โค้ดนี้อยู่

// Import library ต่างๆ ที่จำเป็น
import android.Manifest; // สำหรับจัดการสิทธิ์การเข้าถึง
import android.annotation.SuppressLint; // ใช้สำหรับหลีกเลี่ยงคำเตือน MissingPermission
import android.content.Context; // ใช้จัดการ Context ของ Android
import android.content.pm.PackageManager; // ใช้ตรวจสอบสถานะสิทธิ์
import android.location.Location; // สำหรับข้อมูลตำแหน่ง
import android.location.LocationManager; // สำหรับจัดการ provider ที่ให้ตำแหน่ง
import android.os.Build; // ใช้ตรวจสอบเวอร์ชัน Android
import android.util.Log; // ใช้สำหรับบันทึก Log
import android.provider.Settings; // ใช้เข้าถึงการตั้งค่าของอุปกรณ์

import androidx.core.app.ActivityCompat; // ใช้ตรวจสอบและร้องขอสิทธิ์ใน runtime

// Import library ของ Cordova
import org.apache.cordova.CallbackContext; // ใช้ส่งผลลัพธ์กลับไปยัง JavaScript
import org.apache.cordova.CordovaPlugin; // คลาสพื้นฐานสำหรับสร้าง Plugin
import org.apache.cordova.PluginResult; // ใช้สำหรับจัดการผลลัพธ์ของ Plugin
import org.json.JSONException; // ใช้จัดการข้อผิดพลาดเกี่ยวกับ JSON
import org.json.JSONObject; // ใช้สร้างและจัดการข้อมูล JSON
import org.json.JSONArray; // ใช้จัดการข้อมูล JSON Array

import java.util.List; // ใช้สำหรับจัดการ List ใน Java

// ประกาศคลาสหลักที่สืบทอดจาก CordovaPlugin
public class CordovaDetectMockLocationPlugin extends CordovaPlugin {

    // กำหนดรหัสสำหรับร้องขอสิทธิ์ตำแหน่ง
    private static final int REQUEST_LOCATION_PERMISSION = 1;

    // ตัวแปรสำหรับเก็บ CallbackContext ที่ส่งมาจาก JavaScript
    private CallbackContext callbackContext;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        this.callbackContext = callbackContext; // บันทึก callback context

        // ตรวจสอบ action ที่รับจาก JavaScript
        if ("detectMockLocation".equals(action)) { // ถ้า action คือ "detectMockLocation"
            if (checkLocationPermission()) { // ตรวจสอบว่ามีสิทธิ์ตำแหน่งหรือไม่
                detectMockLocation(callbackContext); // ตรวจจับตำแหน่งจำลอง
            } else {
                requestLocationPermission(); // ร้องขอสิทธิ์ตำแหน่ง
            }
            return true; // แจ้งว่า action นี้ดำเนินการสำเร็จ
        }

        // ตรวจสอบ action สำหรับการอนุญาตตำแหน่งจำลอง
        if ("detectAllowMockLocation".equals(action)) { // ถ้า action คือ "detectAllowMockLocation"
            detectAllowMockLocation(callbackContext); // ตรวจสอบการตั้งค่าอนุญาตตำแหน่งจำลอง
            return true;
        }

        return false; // หาก action ไม่ตรง ส่งกลับ false
    }

    @SuppressLint("MissingPermission") // หลีกเลี่ยงคำเตือน MissingPermission
    private void detectMockLocation(CallbackContext callbackContext) {
        JSONObject resultJSON = new JSONObject(); // สร้าง JSON สำหรับเก็บผลลัพธ์

        // เข้าถึง LocationManager เพื่อใช้บริการตำแหน่ง
        LocationManager locationManager = (LocationManager) cordova.getActivity()
                .getSystemService(Context.LOCATION_SERVICE);

        if (locationManager == null) { // หากไม่พบ LocationManager
            handleError(resultJSON, "LOCATION_MANAGER_OBJ_NOT_FOUND", "\"locationManager\" not found.",
                    callbackContext); // ส่งข้อผิดพลาดกลับ
            return; // หยุดการทำงาน
        }

        Location location = null; // ตัวแปรสำหรับเก็บตำแหน่ง
        String usedProvider = ""; // ตัวแปรสำหรับเก็บชื่อ provider ที่ใช้
        List<String> providers = locationManager.getProviders(true); // ดึง provider ทั้งหมดที่เปิดใช้งาน

        // ตรวจสอบ provider แต่ละตัว
        for (String provider : providers) {
            Location locationFromProvider = locationManager.getLastKnownLocation(provider); // ดึงตำแหน่งล่าสุด

            // เลือกตำแหน่งที่แม่นยำที่สุด
            if (locationFromProvider != null
                    && (location == null || locationFromProvider.getAccuracy() < location.getAccuracy())) {
                location = locationFromProvider; // บันทึกตำแหน่งที่แม่นยำกว่า
                usedProvider = provider; // บันทึกชื่อ provider
            }
        }

        if (location != null) { // หากพบตำแหน่ง
            // ตรวจสอบว่าตำแหน่งเป็น Mock Location หรือไม่
            boolean isMockLocation = (Build.VERSION.SDK_INT < 31) ? location.isFromMockProvider()
                    : location.isMock();

            try {
                resultJSON.put("isMockLocation", isMockLocation); // ใส่ผลลัพธ์ลงใน JSON
                Log.d("CordovaDetectMockLocation", "Used location provider is: " + usedProvider); // บันทึก Log
            } catch (JSONException e) {
                e.printStackTrace();
            }
        } else { // หากไม่พบตำแหน่ง
            handleError(resultJSON, "LOCATION_OBJ_NOT_FOUND",
                    "\"location\" object not found. (lastKnownLocation may be null)", callbackContext); // ส่งข้อผิดพลาดกลับ
        }

        // ส่งผลลัพธ์กลับไปยัง JavaScript
        PluginResult result = new PluginResult(PluginResult.Status.OK, resultJSON);
        callbackContext.sendPluginResult(result);
    }

    private void detectAllowMockLocation(CallbackContext callbackContext) {
        boolean isAllowMockLocation;
        JSONObject resultJSON = new JSONObject(); // สร้าง JSON สำหรับเก็บผลลัพธ์

        // ตรวจสอบการตั้งค่า Mock Location สำหรับ Android <= Lollipop
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.LOLLIPOP) {
            isAllowMockLocation = !Settings.Secure.getString(
                    cordova.getActivity().getContentResolver(),
                    Settings.Secure.ALLOW_MOCK_LOCATION).equals("0");
        } else {
            isAllowMockLocation = false; // สำหรับเวอร์ชันใหม่กว่าไม่สามารถตรวจสอบได้
        }

        try {
            resultJSON.put("isAllowMockLocation", isAllowMockLocation); // ใส่ผลลัพธ์ลงใน JSON
        } catch (JSONException e) {
            e.printStackTrace();
        }

        // ส่งผลลัพธ์กลับไปยัง JavaScript
        PluginResult result = new PluginResult(PluginResult.Status.OK, resultJSON);
        callbackContext.sendPluginResult(result);
    }

    private boolean checkLocationPermission() {
        // ตรวจสอบว่าสิทธิ์ตำแหน่งถูกอนุญาตแล้วหรือไม่
        return cordova.hasPermission(Manifest.permission.ACCESS_FINE_LOCATION) ||
                cordova.hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION);
    }

    private void requestLocationPermission() {
        // ร้องขอสิทธิ์ตำแหน่ง
        cordova.requestPermission(this, REQUEST_LOCATION_PERMISSION, Manifest.permission.ACCESS_FINE_LOCATION);
    }

    @Override
    public void onRequestPermissionResult(int requestCode, String[] permissions, int[] grantResults)
            throws JSONException {
        super.onRequestPermissionResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_LOCATION_PERMISSION) { // ตรวจสอบรหัสการร้องขอสิทธิ์
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                detectMockLocation(callbackContext); // หากได้รับสิทธิ์ ดำเนินการตรวจจับตำแหน่งจำลอง
            } else {
                handleError(new JSONObject(), "PERMISSION_DENIED", "Location permission denied.", callbackContext); // หากไม่ได้รับสิทธิ์ ส่งข้อผิดพลาด
            }
        }
    }

    private void handleError(JSONObject resultJSON, String code, String message, CallbackContext callbackContext) {
        try {
            JSONObject error = new JSONObject(); // สร้าง JSON สำหรับข้อผิดพลาด
            error.put("code", code); // ใส่รหัสข้อผิดพลาด
            error.put("message", message); // ใส่ข้อความข้อผิดพลาด
            resultJSON.put("isMockLocation", ""); // ไม่มีค่าตำแหน่ง
            resultJSON.put("error", error); // เพิ่มข้อมูลข้อผิดพลาด
            PluginResult result = new PluginResult(PluginResult.Status.ERROR, resultJSON);
            callbackContext.sendPluginResult(result); // ส่งข้อผิดพลาดกลับไปยัง JavaScript
        } catch (JSONException e) {
            Log.e("CordovaDetectMockLocation", "Error creating JSON error object", e);
        }
    }
}
