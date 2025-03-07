let imageFile;

function toggleDarkMode() {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
}

function toggleAbout() {
    document.getElementById('aboutModal').showModal();
}

function closeAbout() {
    document.getElementById('aboutModal').close();
}

function openWatermarkModal() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        imageFile = fileInput.files[0];
        document.getElementById('watermarkModal').showModal();
    }
}

document.getElementById('watermarkForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const position = document.getElementById('position').value;
    const time = document.getElementById('time').value;
    const font = document.getElementById('font').value;
    const roundTime = document.getElementById('roundTime').checked;

    const now = new Date();
    let [hours, minutes] = time.split(':');
    if (!roundTime) {
        const randomOffset = Math.floor(Math.random() * 7) - 3; // -3 to +3 minutes
        minutes = parseInt(minutes) + randomOffset;
        if (minutes < 0) minutes += 60, hours--;
        if (minutes >= 60) minutes -= 60, hours++;
    }
    const watermarkText = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    renderPreview(watermarkText, position, font);
});

function renderPreview(text, position, font) {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Ukuran font relatif terhadap lebar gambar
        const fontSize = Math.min(canvas.width * 0.05, 30);
        ctx.font = `${fontSize}px "${font}"`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // Putih dengan transparansi 10%
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const textWidth = ctx.measureText(text).width;
        const textHeight = fontSize;
        let x, y;

        switch (position) {
            case 'top-left': x = 20; y = textHeight + 10; break;
            case 'top-center': x = (canvas.width - textWidth) / 2; y = textHeight + 10; break;
            case 'top-right': x = canvas.width - textWidth - 20; y = textHeight + 10; break;
            case 'middle-left': x = 20; y = canvas.height / 2; break;
            case 'middle-center': x = (canvas.width - textWidth) / 2; y = canvas.height / 2; break;
            case 'middle-right': x = canvas.width - textWidth - 20; y = canvas.height / 2; break;
            case 'bottom-left': x = 20; y = canvas.height - 20; break;
            case 'bottom-center': x = (canvas.width - textWidth) / 2; y = canvas.height - 20; break;
            case 'bottom-right': x = canvas.width - textWidth - 20; y = canvas.height - 20; break;
        }

        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0; // Reset shadow
        document.getElementById('previewModal').showModal();
    };
    img.src = URL.createObjectURL(imageFile);
}

function downloadImage() {
    const canvas = document.getElementById('previewCanvas');
    const link = document.createElement('a');
    link.download = 'watermarked-image.png';
    link.href = canvas.toDataURL('image/png', 1.0); // Kualitas 100%, tanpa kompresi
    link.click();
}

function retakeImage() {
    document.getElementById('previewModal').close();
    document.getElementById('watermarkModal').close();
    document.getElementById('fileInput').value = '';
}

function shareImage() {
    const canvas = document.getElementById('previewCanvas');
    canvas.toBlob(async (blob) => {
        const file = new File([blob], 'watermarked-image.png', { type: 'image/png' });
        if (navigator.share) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Watermarked Image',
                    text: 'Check out my watermarked image from CameraApp!'
                });
                console.log('Image shared successfully');
            } catch (error) {
                console.error('Error sharing image:', error);
            }
        } else {
            alert('Fitur share tidak didukung di perangkat ini.');
        }
    }, 'image/png', 1.0); // Kualitas 100%, tanpa kompresi
}