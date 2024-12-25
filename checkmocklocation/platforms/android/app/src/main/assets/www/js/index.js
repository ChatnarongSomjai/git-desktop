document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('อุปกรณ์พร้อมใช้งาน');
    updatePluginStatus('กำลังตรวจสอบสถานะปลั๊กอิน...', 'checking');
    checkPluginStatus(); // ตรวจสอบสถานะของปลั๊กอิน
    requestLocationPermission();
    startWatchingLocation(); // เริ่มติดตามตำแหน่ง
}

async function requestLocationPermission() {
    try {
        const permission = cordova.plugins.permissions;
        permission.requestPermission(permission.ACCESS_FINE_LOCATION, function (status) {
            if (status.hasPermission) {
                console.log('ได้รับสิทธิ์การเข้าถึงตำแหน่งแล้ว');
                updatePluginStatus('ได้รับสิทธิ์การเข้าถึงตำแหน่งแล้ว', 'success');
            } else {
                console.error('ไม่ได้รับสิทธิ์การเข้าถึงตำแหน่ง');
                updatePluginStatus('ไม่ได้รับสิทธิ์การเข้าถึงตำแหน่ง', 'error');
            }
        }, function (error) {
            console.error('คำขอสิทธิ์ล้มเหลว:', error);
            updatePluginStatus('คำขอสิทธิ์ล้มเหลว', 'error');
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการขอสิทธิ์:', error);
        updatePluginStatus('เกิดข้อผิดพลาดในการขอสิทธิ์', 'error');
    }
}

function checkPluginStatus() {
    if (cordova.plugins && cordova.plugins.CordovaDetectMockLocationPlugin) {
        console.log("ปลั๊กอิน MockLocationChecker ถูกโหลดแล้ว");
        updatePluginStatus('ปลั๊กอินพร้อมใช้งาน', 'success');
    } else {
        console.error("ไม่พบปลั๊กอิน MockLocationChecker");
        updatePluginStatus('ไม่พบปลั๊กอิน', 'error');
    }
}

function startWatchingLocation() {
    try {
        updatePluginStatus('กำลังตรวจสอบตำแหน่ง...', 'checking');

        navigator.geolocation.watchPosition(
            function (position) {
                const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;

                // สร้างข้อความเพื่อแสดงตำแหน่ง
                const locationInfo = `
                    ละติจูด: ${latitude.toFixed(6)}<br>
                    ลองจิจูด: ${longitude.toFixed(6)}<br>
                    ความแม่นยำ: ${accuracy} เมตร<br>
                    ความสูง: ${altitude || 'ไม่มีข้อมูล'} เมตร<br>
                    ทิศทาง: ${heading || 'ไม่มีข้อมูล'}°<br>
                    ความเร็ว: ${speed || 'ไม่มีข้อมูล'} เมตร/วินาที
                `;

                // อัปเดต UI ด้วยข้อมูลตำแหน่ง
                updateLocationStatus(locationInfo, 'success');
            },
            function (error) {
                console.error('เกิดข้อผิดพลาดในการรับตำแหน่ง:', error);
                updateLocationStatus(`ข้อผิดพลาด: ${error.message}`, 'error');
            },
            { enableHighAccuracy: true, maximumAge: 0 }
        );
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเริ่มการติดตามตำแหน่ง:', error);
        updateLocationStatus('เกิดข้อผิดพลาดในการเริ่มการติดตามตำแหน่ง', 'error');
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

// เพิ่มการตรวจจับ Mock Location
function detectMockLocation() {
    try {
        cordova.plugins.CordovaDetectMockLocationPlugin.detectMockLocation(
            function (result) {
                const isMock = result.isMockLocation;
                if (isMock) {
                    if (confirm('ตรวจพบตำแหน่งจำลอง! ต้องการปิดแอปหรือไม่?')) {
                        navigator.app.exitApp();
                    }
                } else {
                    alert('ตำแหน่งที่ตรวจพบเป็นของจริง');
                }
            },
            function (error) {
                console.error('เกิดข้อผิดพลาดในการตรวจจับตำแหน่งจำลอง:', error);
                alert('ข้อผิดพลาด: ' + error.message);
            }
        );
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการตรวจจับตำแหน่งจำลอง:', error);
    }
}

// ผูกฟังก์ชันกับปุ่มตรวจสอบ
document.getElementById('check-mock-location-btn').addEventListener('click', detectMockLocation);
