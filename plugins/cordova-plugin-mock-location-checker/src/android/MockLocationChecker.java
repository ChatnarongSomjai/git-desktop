package com.example.plugins;

import android.app.AppOpsManager;
import android.content.Context;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

public class MockLocationChecker extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if ("isMockLocation".equals(action)) {
            LocationManager locationManager = (LocationManager) this.cordova.getActivity().getSystemService(Context.LOCATION_SERVICE);
            Location location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);

            boolean isMock = isMockLocation(location);
            callbackContext.success(isMock ? 1 : 0);
            return true;
        }
        return false;
    }

    private boolean isMockLocation(Location location) {
        if (location == null) {
            return false;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) { // Android 12+
            AppOpsManager appOpsManager = (AppOpsManager) this.cordova.getActivity().getSystemService(Context.APP_OPS_SERVICE);
            int status = appOpsManager.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), this.cordova.getActivity().getPackageName());
            return (status == AppOpsManager.MODE_ALLOWED);
        }

        return location.isFromMockProvider();
    }
}
