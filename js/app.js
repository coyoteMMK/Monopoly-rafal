document.addEventListener('DOMContentLoaded', () => {
    const siteSelector = document.getElementById('site-selector');
    const imageUpload = document.getElementById('image-upload');
    const dropZone = document.getElementById('drop-zone');
    const downloadBtn = document.getElementById('download-btn');

    const cardTitlePreview = document.getElementById('card-title-preview');
    const cardPricePreview = document.getElementById('card-price-preview');
    const cardPriceContainer = document.getElementById('card-price-container');
    const cardColorHeader = document.getElementById('card-color-header');
    const cardImagePreview = document.getElementById('card-image-preview');
    const noImageText = document.getElementById('no-image-text');
    const cardBackText = document.getElementById('card-back-text');
    const cardBackBorder = document.getElementById('card-back-border');
    const normalContainer = document.getElementById('card-back-normal-container');
    const policeContainer = document.getElementById('card-back-police-container');
    const stationTitle = document.getElementById('card-back-station-title');
    const logoTuareg = document.getElementById('card-back-logo-top');
    const busIcon = document.getElementById('card-back-bus-icon');

    const fallbackScript = document.getElementById('casillas-data');
    let datosCasillas = [];

    try {
        if (fallbackScript) {
            datosCasillas = JSON.parse(fallbackScript.textContent);
        } else {
            throw new Error('No hay datos incrustados en la página.');
        }
    } catch (error) {
        console.error('No se pudieron cargar los datos:', error);
        showMessage('No se pudieron cargar las casillas.');
        return;
    }

    datosCasillas.forEach((casilla) => {
        const option = document.createElement('option');
        option.value = casilla.id;
        option.textContent = casilla.nombre;
        siteSelector.appendChild(option);
    });

    siteSelector.addEventListener('change', (event) => {
        const seleccion = datosCasillas.find((casilla) => casilla.id === event.target.value);
        if (!seleccion) {
            return;
        }

        cardTitlePreview.textContent = seleccion.nombre;
        const tienePalabraLarga = seleccion.nombre.split(' ').some((palabra) => palabra.length >= 10);
        cardTitlePreview.className = tienePalabraLarga
            ? 'monopoly-font font-bold text-xl sm:text-2xl text-center uppercase leading-tight text-white tracking-wide w-full'
            : 'monopoly-font font-bold text-2xl sm:text-3xl text-center uppercase leading-tight text-white tracking-widest w-full';

        cardColorHeader.style.backgroundColor = seleccion.color;
        const red = parseInt(seleccion.color.substr(1, 2), 16);
        const green = parseInt(seleccion.color.substr(3, 2), 16);
        const blue = parseInt(seleccion.color.substr(5, 2), 16);
        const yiq = ((red * 299) + (green * 587) + (blue * 114)) / 1000;
        cardTitlePreview.style.color = yiq >= 140 ? '#000000' : '#ffffff';

        if (seleccion.precio !== null) {
            cardPricePreview.textContent = `${seleccion.precio}€`;
            cardPriceContainer.style.display = 'flex';
        } else {
            cardPriceContainer.style.display = 'none';
        }

        if (seleccion.tipo === 'policia') {
            normalContainer.style.display = 'none';
            policeContainer.style.display = 'flex';
            cardBackBorder.style.backgroundColor = 'transparent';
        } else if (seleccion.tipo === 'estacion') {
            normalContainer.style.display = 'flex';
            policeContainer.style.display = 'none';
            stationTitle.style.display = 'block';
            logoTuareg.style.display = 'none';
            busIcon.style.display = 'block';
            cardBackText.textContent = 'RAFAL';
            cardBackText.className = 'monopoly-font font-bold text-4xl sm:text-5xl uppercase tracking-[0.15em] text-[#ed1b24]';
            cardBackBorder.style.backgroundColor = 'transparent';
        } else {
            normalContainer.style.display = 'flex';
            policeContainer.style.display = 'none';
            stationTitle.style.display = 'none';
            logoTuareg.style.display = 'block';
            busIcon.style.display = 'none';
            cardBackText.textContent = 'RAFAL';
            cardBackText.className = 'monopoly-font font-bold text-5xl sm:text-6xl uppercase tracking-[0.15em] text-[#ed1b24]';
            cardBackBorder.style.backgroundColor = 'transparent';
        }
    });

    const handleImage = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                cardImagePreview.src = event.target.result;
                noImageText.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            showMessage('Sube un archivo JPG o PNG válido.');
        }
    };

    imageUpload.addEventListener('change', (event) => handleImage(event.target.files[0]));

    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.classList.add('border-red-500', 'bg-red-50');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-red-500', 'bg-red-50');
    });

    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropZone.classList.remove('border-red-500', 'bg-red-50');
        if (event.dataTransfer.files.length) {
            imageUpload.files = event.dataTransfer.files;
            handleImage(event.dataTransfer.files[0]);
        }
    });

    downloadBtn.addEventListener('click', async () => {
        if (!siteSelector.value) {
            showMessage('¡Selecciona una casilla primero!');
            return;
        }

        const cardElement = document.getElementById('monopoly-card');
        const cardBackElement = document.getElementById('monopoly-card-back');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generando PDF...';
        downloadBtn.disabled = true;

        try {
            const seleccion = datosCasillas.find((casilla) => casilla.id === siteSelector.value);
            const fileName = seleccion ? seleccion.nombre.replace(/\s+/g, '_').toLowerCase() : 'casilla';
            const canvasFront = await html2canvas(cardElement, { scale: 3, useCORS: true, backgroundColor: null });
            await new Promise((resolve) => setTimeout(resolve, 300));
            const canvasBack = await html2canvas(cardBackElement, { scale: 3, useCORS: true, backgroundColor: null });
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvasFront.width, canvasFront.height]
            });

            pdf.addImage(canvasFront.toDataURL('image/png'), 'PNG', 0, 0, canvasFront.width, canvasFront.height);
            pdf.addPage();
            pdf.addImage(canvasBack.toDataURL('image/png'), 'PNG', 0, 0, canvasBack.width, canvasBack.height);
            pdf.save(`monopoly_rafal_${fileName}.pdf`);
        } catch (error) {
            console.error('Error:', error);
            showMessage('Hubo un error al generar el PDF.');
        } finally {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    });

    function showMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-500';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
});
