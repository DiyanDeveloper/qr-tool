document.addEventListener('DOMContentLoaded', () => {
    // === QR Code Generator ===
    const generateBtn = document.getElementById('generateBtn');
    const qrInput = document.getElementById('qrInput');
    const qrResult = document.getElementById('qrResult');
    const qrError = document.getElementById('qrError');

    generateBtn.addEventListener('click', () => {
        const input = qrInput.value.trim();
        qrError.style.display = 'none';
        qrResult.innerHTML = '';

        if (!input) {
            qrError.textContent = 'Please enter some text';
            qrError.style.display = 'block';
            return;
        }

        try {
            if (typeof QRCode === 'undefined') {
                throw new Error('QRCode library not loaded');
            }

            QRCode.toCanvas(qrResult, input, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            }, error => {
                if (error) {
                    console.error('QR Generation Error:', error);
                    qrError.textContent = 'Failed to generate QR code. Please try again.';
                    qrError.style.display = 'block';
                }
            });

        } catch (e) {
            console.error('Exception:', e);
            qrError.textContent = 'An error occurred. Please refresh the page and try again.';
            qrError.style.display = 'block';
        }
    });

    // === QR Code Scanner ===
    const startBtn = document.getElementById('startScanner');
    const stopBtn = document.getElementById('stopScanner');
    const video = document.getElementById('scanner');
    const canvas = document.getElementById('scanner-canvas');
    const scanResult = document.getElementById('scanResult');
    const ctx = canvas.getContext('2d');

    let scannerActive = false;
    let videoStream = null;

    startBtn.addEventListener('click', async () => {
        try {
            videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
            });

            video.srcObject = videoStream;
            await video.play();

            startBtn.disabled = true;
            stopBtn.disabled = false;
            scanResult.innerHTML = 'Scanning...';

            scannerActive = true;
            scanLoop();
        } catch (e) {
            console.error('Scanner Error:', e);
            scanResult.innerHTML = 'Camera access error: ' + e.message;
        }
    });

    stopBtn.addEventListener('click', stopScanner);

    function stopScanner() {
        scannerActive = false;
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        startBtn.disabled = false;
        stopBtn.disabled = true;
        scanResult.innerHTML = '';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function scanLoop() {
        if (!scannerActive) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert"
            });

            if (code) {
                scanResult.innerHTML = `Scanned: <strong>${code.data}</strong>`;
            } else if (scanResult.innerHTML === 'Scanning...') {
                scanResult.innerHTML = 'Point camera at QR code';
            }
        }

        // Scan every 200ms to reduce CPU usage
        setTimeout(scanLoop, 200);
    }

    // Clean up on exit
    window.addEventListener('beforeunload', stopScanner);
});
