document.addEventListener('DOMContentLoaded', () => {
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

    QRCode.toCanvas(document.createElement('canvas'), input, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000',
        light: '#fff'
      }
    }, (err, canvas) => {
      if (err) {
        console.error(err);
        qrError.textContent = 'QR code generation failed';
        qrError.style.display = 'block';
        return;
      }
      qrResult.appendChild(canvas);
    });
  });

  // Scanner logic
  let videoStream = null;
  let scannerActive = false;

  const startScannerBtn = document.getElementById('startScanner');
  const stopScannerBtn = document.getElementById('stopScanner');
  const video = document.getElementById('scanner');
  const canvas = document.getElementById('scanner-canvas');
  const scanResult = document.getElementById('scanResult');

  startScannerBtn.addEventListener('click', async () => {
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      video.srcObject = videoStream;
      video.setAttribute('playsinline', true);
      await video.play();
      scannerActive = true;

      startScannerBtn.disabled = true;
      stopScannerBtn.disabled = false;
      scanQR();
    } catch (e) {
      scanResult.textContent = 'Camera error: ' + e.message;
    }
  });

  stopScannerBtn.addEventListener('click', stopScanner);

  function stopScanner() {
    scannerActive = false;
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    startScannerBtn.disabled = false;
    stopScannerBtn.disabled = true;
    scanResult.textContent = '';
  }

  function scanQR() {
    if (!scannerActive) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      scanResult.innerHTML = `Scanned: <strong>${code.data}</strong>`;
      stopScanner();
      return;
    }

    requestAnimationFrame(scanQR);
  }

  window.addEventListener('beforeunload', stopScanner);
});
