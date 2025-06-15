// QR Code Generator
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // QR Code Generator
    const generateBtn = document.getElementById('generateBtn');
    const qrInput = document.getElementById('qrInput');
    const qrResult = document.getElementById('qrResult');
    const qrError = document.getElementById('qrError');

    generateBtn.addEventListener('click', generateQR);

    function generateQR() {
        const input = qrInput.value.trim();
        qrError.style.display = 'none';
        
        if (!input) {
            showError('Please enter some text');
            return;
        }
        
        qrResult.innerHTML = '';
        
        try {
            // Check if QRCode is loaded
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
            }, function(error) {
                if (error) {
                    console.error('QR Generation Error:', error);
                    showError('Failed to generate QR code. Please try again.');
                }
            });
        } catch (e) {
            console.error('Exception:', e);
            showError('An error occurred. Please refresh the page and try again.');
        }
    }

    function showError(message) {
        qrError.textContent = message;
        qrError.style.display = 'block';
    }

    // Rest of your scanner code remains the same...
    let scannerActive = false;
    let videoStream = null;

    document.getElementById('startScanner').addEventListener('click', startScanner);
    document.getElementById('stopScanner').addEventListener('click', stopScanner);

    async function startScanner() {
        const video = document.getElementById('scanner');
        const canvas = document.getElementById('scanner-canvas');
        const scanResult = document.getElementById('scanResult');
        
        try {
            videoStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            video.srcObject = videoStream;
            await video.play();
            document.getElementById('startScanner').disabled = true;
            document.getElementById('stopScanner').disabled = false;
            scannerActive = true;
            
            scanResult.innerHTML = 'Scanning...';
            scanQR(video, canvas, scanResult);
        } catch (e) {
            console.error('Scanner Error:', e);
            scanResult.innerHTML = 'Error: ' + e.message;
        }
    }

    // ... rest of the scanner functions
});
document.getElementById('generateBtn').addEventListener('click', generateQR);

function generateQR() {
    const input = document.getElementById('qrInput').value;
    if (!input) {
        alert('Please enter some text');
        return;
    }
    
    const qrResult = document.getElementById('qrResult');
    qrResult.innerHTML = '';
    
    QRCode.toCanvas(qrResult, input, { 
        width: 200,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    }, function(error) {
        if (error) {
            console.error(error);
            alert('Error generating QR code');
        }
    });
}

// QR Code Scanner
let scannerActive = false;
let videoStream = null;

document.getElementById('startScanner').addEventListener('click', startScanner);
document.getElementById('stopScanner').addEventListener('click', stopScanner);

async function startScanner() {
    const video = document.getElementById('scanner');
    const canvas = document.getElementById('scanner-canvas');
    const scanResult = document.getElementById('scanResult');
    
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        video.srcObject = videoStream;
        video.play();
        document.getElementById('startScanner').disabled = true;
        document.getElementById('stopScanner').disabled = false;
        scannerActive = true;
        
        scanResult.innerHTML = 'Scanning...';
        scanQR(video, canvas, scanResult);
    } catch (e) {
        console.error(e);
        scanResult.innerHTML = 'Error: ' + e.message;
    }
}

function scanQR(video, canvas, resultElement) {
    if (!scannerActive) return;
    
    const canvasContext = canvas.getContext('2d');
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        
        if (code) {
            resultElement.innerHTML = `Scanned: <strong>${code.data}</strong>`;
        } else if (resultElement.innerHTML === 'Scanning...') {
            resultElement.innerHTML = 'Point camera at QR code';
        }
    }
    
    requestAnimationFrame(() => scanQR(video, canvas, resultElement));
}

function stopScanner() {
    scannerActive = false;
    const video = document.getElementById('scanner');
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    document.getElementById('startScanner').disabled = false;
    document.getElementById('stopScanner').disabled = true;
    document.getElementById('scanResult').innerHTML = '';
}

// Clean up when page is closed
window.addEventListener('beforeunload', stopScanner);
