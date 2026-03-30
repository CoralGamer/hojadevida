/**
 * Módulo para manejar la lógica del slider multimedia de los posts.
 * Soporta manual navigation, YouTube priority y thumbnails interactivos.
 */

export function initSlider(postId, data) {
    const viewport = document.getElementById(`media-viewport-${postId}`);
    const thumbsContainer = document.getElementById(`thumbs-${postId}`);
    const prevBtn = document.getElementById(`prev-${postId}`);
    const nextBtn = document.getElementById(`next-${postId}`);

    if (!viewport || !data) return;

    // 1. Preparar el array de medios (YouTube primero)
    const media = [];
    
    if (data.youtubeIds && data.youtubeIds.length > 0) {
        data.youtubeIds.forEach(id => media.push({ type: 'youtube', id: id }));
    }
    
    if (data.imagenes && data.imagenes.length > 0) {
        data.imagenes.forEach(url => media.push({ type: 'image', url: url }));
    }

    if (media.length === 0) {
        viewport.innerHTML = '<div class="text-gray-500 text-xs italic">Sin multimedia disponible</div>';
        [prevBtn, nextBtn, enlargeBtn].forEach(b => b?.remove());
        return;
    }

    let currentIndex = 0;

    // 2. Renderizar Miniaturas
    function renderThumbnails() {
        thumbsContainer.innerHTML = '';
        
        // Ocultar la tira de miniaturas si solo hay 1 recurso (no tiene sentido previsualizar consigo mismo)
        if (media.length <= 1) {
            thumbsContainer.classList.add('hidden');
            [prevBtn, nextBtn].forEach(b => b?.classList.add('hidden'));
            return;
        } else {
            thumbsContainer.classList.remove('hidden');
            [prevBtn, nextBtn].forEach(b => b?.classList.remove('hidden'));
        }

        // Seleccionamos estáticamente máximo 3 thumbnails (Mockup constraint)
        const maxThumbs = 3;
        const thumbsToShow = media.slice(0, maxThumbs);

        thumbsToShow.forEach((item, index) => {
            const thumb = document.createElement('div');
            thumb.className = `thumb-item ${index === currentIndex ? 'is-active' : ''}`;
            
            if (item.type === 'youtube') {
                thumb.innerHTML = `
                    <div class="thumb-video-icon">
                        <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6z"/><path d="M21.56 7.14c-.21-.79-.83-1.41-1.62-1.62C18.17 5 12 5 12 5s-6.17 0-7.94.52c-.79.21-1.41.83-1.62 1.62C2 8.91 2 12.64 2 12.64s0 3.73.44 5.5c.21.79.83 1.41 1.62 1.62C5.83 20.28 12 20.28 12 20.28s6.17 0 7.94-.52c.79-.21 1.41-.83 1.62-1.62.44-1.77.44-5.5.44-5.5s0-3.73-.44-5.5z"/></svg>
                    </div>
                `;
            } else {
                thumb.innerHTML = `<img src="${item.url}" alt="Thumbnail">`;
            }

            // Overlay de más imágenes si hay más allá de las 3 visibles
            if (index === 2 && media.length > 3) {
                const extras = media.length - 3;
                thumb.innerHTML += `<div class="more-overlay">+${extras}</div>`;
            }

            thumb.addEventListener('click', () => {
                currentIndex = index;
                updateDisplay();
            });
            thumbsContainer.appendChild(thumb);
        });
    }

    // Lightbox System
    function openLightbox(url) {
        let lightbox = document.getElementById('media-lightbox-global');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'media-lightbox-global';
            lightbox.className = 'fixed inset-0 z-[9999] bg-black/95 hidden flex items-center justify-center p-4 lg:p-12 backdrop-blur-sm transition-opacity';
            
            lightbox.innerHTML = `
                <button id="lightbox-close-btn" class="absolute top-4 right-4 text-white hover:text-gray-300 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                <div id="lightbox-content-container" class="w-full h-full flex items-center justify-center relative max-w-[1200px] mx-auto"></div>
            `;
            document.body.appendChild(lightbox);
            
            document.getElementById('lightbox-close-btn').addEventListener('click', () => {
                 lightbox.classList.add('hidden');
                 document.getElementById('lightbox-content-container').innerHTML = '';
                 document.body.style.overflow = '';
            });

            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox || e.target.id === 'lightbox-content-container') {
                    lightbox.classList.add('hidden');
                    document.getElementById('lightbox-content-container').innerHTML = '';
                    document.body.style.overflow = '';
                }
            });
        }
        
        const container = document.getElementById('lightbox-content-container');
        container.innerHTML = `<img src="${url}" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Imagen ampliada">`;
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // 3. Actualizar Visualización Principal
    function updateDisplay() {
        const current = media[currentIndex];
        viewport.innerHTML = '';
        
        if (current.type === 'youtube') {
            viewport.innerHTML = `
                <iframe class="absolute inset-0 w-full h-full border-0" 
                    src="https://www.youtube.com/embed/${current.id}?autoplay=0" 
                    allowfullscreen></iframe>
            `;
        } else {
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'absolute inset-0 cursor-zoom-in group/img overflow-hidden flex items-center justify-center bg-black';
            imgWrapper.innerHTML = `
                <img src="${current.url}" class="w-full h-full object-contain select-none transition-transform duration-500 group-hover/img:scale-[1.02]" 
                     draggable="false" alt="Imagen del post">
                <div class="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100 z-10 pointer-events-none">
                    <div class="bg-black/50 text-white p-3 rounded-full backdrop-blur-md shadow-lg transform transition-transform group-hover/img:scale-110">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                    </div>
                </div>
            `;
            imgWrapper.addEventListener('click', () => openLightbox(current.url));
            viewport.appendChild(imgWrapper);
        }

        // Actualizar miniaturas activas
        document.querySelectorAll(`#thumbs-${postId} .thumb-item`).forEach((t, i) => {
            t.classList.toggle('is-active', i === currentIndex);
        });

        // Scroll a la miniatura activa
        const activeThumb = thumbsContainer.children[currentIndex];
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    // 4. Listeners de Navegación
    prevBtn?.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + media.length) % media.length;
        updateDisplay();
    });

    nextBtn?.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % media.length;
        updateDisplay();
    });

    // Iniciar
    renderThumbnails();
    updateDisplay();
}
