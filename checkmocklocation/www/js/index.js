document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Device is ready');
    updatePluginStatus('Checking plugin status...', 'checking');
    requestLocationPermission();
}

async function requestLocationPermission() {
    try {
        const permission = cordova.plugins.permissions;
        permission.requestPermission(permission.ACCESS_FINE_LOCATION, function (status) {
            if (status.hasPermission) {
                console.log('Location permission granted');
                updatePluginStatus('Location permission granted', 'success');
                startWatchingLocation();
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

function updatePluginStatus(status, type) {
    const statusElement = document.getElementById('plugin-status');
    const sectionElement = document.getElementById('plugin-status-section');
    statusElement.textContent = status;

    sectionElement.classList.remove('status-checking', 'status-success', 'status-error');
    sectionElement.classList.add(`status-${type}`);
}

function startWatchingLocation() {
    try {
        updateLocationStatus('Getting location...', 'checking');

        navigator.geolocation.watchPosition(
            position => {
                const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
                const locationInfo = `
                    Latitude: ${latitude.toFixed(6)}<br>
                    Longitude: ${longitude.toFixed(6)}<br>
                    Accuracy: ${accuracy} meters<br>
                    Altitude: ${altitude || 'N/A'} meters<br>
                    Heading: ${heading || 'N/A'}°<br>
                    Speed: ${speed || 'N/A'} m/s`;
                updateLocationStatus(locationInfo, 'success');
            },
            error => {
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

function updateLocationStatus(status, type) {
    const locationElement = document.getElementById('location');
    const sectionElement = document.getElementById('location-section');
    locationElement.innerHTML = status;

    sectionElement.classList.remove('status-checking', 'status-success', 'status-error');
    sectionElement.classList.add(`status-${type}`);
}

// Mock Location Checker
const mockLocationBtn = document.getElementById('check-mock-location-btn');
mockLocationBtn.addEventListener('click', () => {
    cordova.plugins.mockLocationChecker.isMockLocation(
        isMock => {
            if (isMock) {
                alert('Mock location detected!');
            } else {
                alert('Genuine location detected.');
            }
        },
        error => {
            console.error('Error detecting mock location:', error);
            alert(`Error: ${error.message}`);
        }
    );
});


document.addEventListener('pause', function () {
    console.log("App paused, releasing resources...");
    // ปล่อยทรัพยากรที่ไม่จำเป็น
    if (window.cordova && cordova.plugins && cordova.plugins.WebView) {
        cordova.plugins.WebView.pause();
    }
});

document.addEventListener('resume', function () {
    console.log("App resumed, restoring resources...");
    // คืนค่าทรัพยากรที่จำเป็น
    if (window.cordova && cordova.plugins && cordova.plugins.WebView) {
        cordova.plugins.WebView.resume();
    }
});
