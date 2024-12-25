document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Device is ready');
    updatePluginStatus('Checking plugin status...', 'checking');
    checkPluginStatus(); // ตรวจสอบสถานะของปลั๊กอิน
    requestLocationPermission();
    startWatchingLocation(); // เริ่มติดตามตำแหน่ง
}

async function requestLocationPermission() {
    try {
        const permission = cordova.plugins.permissions;
        permission.requestPermission(permission.ACCESS_FINE_LOCATION, function (status) {
            if (status.hasPermission) {
                console.log('Location permission granted');
                updatePluginStatus('Location permission granted', 'success');
            } else {
                console.error('Location permission denied');
                updatePluginStatus('Location permission denied', 'error');
            }
        }, function (error) {
            console.error('Permission request failed:', error);
            updatePluginStatus('Permission request failed', 'error');
        });
    } catch (error) {
        console.error('Error requesting permission:', error);
        updatePluginStatus('Error requesting permission', 'error');
    }
}

function checkPluginStatus() {
    if (cordova.plugins && cordova.plugins.CordovaDetectMockLocationPlugin) {
        console.log("MockLocationChecker plugin is loaded.");
        updatePluginStatus('Plugin is loaded and ready to use.', 'success');
    } else {
        console.error("MockLocationChecker plugin is not available.");
        updatePluginStatus('Plugin is not available.', 'error');
    }
}

function startWatchingLocation() {
    try {
        updatePluginStatus('Getting location...', 'checking');

        navigator.geolocation.watchPosition(
            function (position) {
                const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;

                // สร้างข้อความเพื่อแสดงตำแหน่ง
                const locationInfo = `
                    Latitude: ${latitude.toFixed(6)}<br>
                    Longitude: ${longitude.toFixed(6)}<br>
                    Accuracy: ${accuracy} meters<br>
                    Altitude: ${altitude || 'N/A'} meters<br>
                    Heading: ${heading || 'N/A'}°<br>
                    Speed: ${speed || 'N/A'} m/s
                `;

                // อัปเดต UI ด้วยข้อมูลตำแหน่ง
                updateLocationStatus(locationInfo, 'success');
            },
            function (error) {
                console.error('Error getting location:', error);
                updateLocationStatus(`Error: ${error.message}`, 'error');
            },
            { enableHighAccuracy: true, maximumAge: 0 }
        );
    } catch (error) {
        console.error('Error starting location watch:', error);
        updateLocationStatus('Error starting location watch', 'error');
    }
}

function updatePluginStatus(status, type) {
    const statusElement = document.getElementById('plugin-status');
    const sectionElement = document.getElementById('plugin-status-section');
    statusElement.textContent = status;

    sectionElement.classList.remove('status-checking', 'status-success', 'status-error');
    sectionElement.classList.add(`status-${type}`);
}

function updateLocationStatus(status, type) {
    const locationElement = document.getElementById('location');
    const sectionElement = document.getElementById('location-section');
    locationElement.innerHTML = status;

    // จัดการคลาสสำหรับสถานะ
    sectionElement.classList.remove('status-checking', 'status-success', 'status-error');
    sectionElement.classList.add(`status-${type}`);
}
