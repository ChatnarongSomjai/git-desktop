package com.example.plugins;

import android.location.Location;
import android.location.LocationManager;
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

            if (location != null && location.isFromMockProvider()) {
                callbackContext.success(1); // Mock location detected
            } else {
                callbackContext.success(0); // Genuine location
            }
            return true;
        }
        return false;
    }
}
