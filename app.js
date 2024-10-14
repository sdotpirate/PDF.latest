document.getElementById('createPdfButton').addEventListener('click', async function () {
    const { jsPDF } = window.jspdf;
    const fileNameInput = document.getElementById('fileName').value || `iSpeedPix2PDF_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
    const rotationOption = document.getElementById('rotationOption').value;
    const imageInput = document.getElementById('imageInput');
    const files = imageInput.files;

    if (files.length === 0) {
        alert("Please select at least one image.");
        return;
    }

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter" // Letter size: 8.5 x 11 inches
    });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await readFileAsDataURL(file);
        const img = new Image();
        img.src = imageUrl;

        await new Promise((resolve) => {
            img.onload = function () {
                const imgWidth = img.width;
                const imgHeight = img.height;

                let scaledWidth, scaledHeight;

                // Calculate aspect ratio to fit within page margins
                const pageWidth = pdf.internal.pageSize.getWidth() - 20;
                const pageHeight = pdf.internal.pageSize.getHeight() - 20;
                const widthRatio = pageWidth / imgWidth;
                const heightRatio = pageHeight / imgHeight;
                const scale = Math.min(widthRatio, heightRatio);

                scaledWidth = imgWidth * scale;
                scaledHeight = imgHeight * scale;

                const xOffset = (pageWidth - scaledWidth) / 2 + 10;
                const yOffset = (pageHeight - scaledHeight) / 2 + 10;

                // Handle different rotation options
                if (rotationOption === 'default') {
                    if (imgWidth > imgHeight) {
                        // Rotate landscape images to fit in portrait layout for easy viewing
                        pdf.addImage(img, 'JPEG', xOffset, yOffset, scaledHeight, scaledWidth, undefined, 90);
                    } else {
                        pdf.addImage(img, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight);
                    }
                } else if (rotationOption === 'nonOriented') {
                    // Preserve original orientation of each image
                    pdf.addImage(img, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight);
                } else if (rotationOption === 'fixedPortrait') {
                    // Keep all pages in portrait, landscape images stay sideways without rotation
                    pdf.addImage(img, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight);
                }

                if (i < files.length - 1) {
                    pdf.addPage();
                }
                resolve();
            };
        });
    }

    pdf.save(fileNameInput);
});

function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}
