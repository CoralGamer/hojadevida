import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { db } from '../firebase-config.js';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, increment } from "firebase/firestore";

/**
 * Función para renderizar posts de una categoría específica en un contenedor dado.
 * @param {string} category - ID de la categoría (ej: 'project-management')
 * @param {string} containerId - ID del div donde se pintarán los posts
 */
export async function renderPostsByCategory(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `<div class="col-span-full py-12 text-center text-gray-500 font-medium animate-pulse">Cargando publicaciones...</div>`;

    try {
        const q = query(
            collection(db, "posts"),
            where("categorias", "array-contains", category),
            orderBy("fechaCreacion", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div class="col-span-full py-16 text-center">
                    <div class="inline-flex w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-700">Aún no hay publicaciones</h3>
                    <p class="text-gray-500 mt-2">Mantente atento, pronto publicaremos contenido aquí.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = ''; // Clear loading

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const postId = docSnap.id;
            const postHTML = createPostElement(postId, data, category);
            container.appendChild(postHTML);
        });

    } catch (error) {
        console.error("Error cargando posts: ", error);
        let errorMsg = `<div class="col-span-full py-12 text-center text-red-500 font-medium">Error al cargar publicaciones.</div>`;
        container.innerHTML = errorMsg;
    }
}

export function createPostElement(postId, data, categoryPath) {
    const article = document.createElement('article');
    article.className = 'post-card no-right-click';
    article.id = `post-${postId}`;

    const toolIcons = {
        'blender': 'blender',
        'maya': 'autodeskmaya',
        '3dmax': 'autodesk3dsmax',
        'zmodeler': '3d-dot-com',
        'substance-3d': 'adobesubstance3ddesign',
        'unity': 'unity',
        'unreal': 'unrealengine',
        'roblox-studio': 'roblox',
        'photoshop': 'adobephotoshop',
        'illustrator': 'adobeillustrator',
        'premiere': 'adobepremierepro',
        'after-effects': 'adobeaftereffects',
        'figma': 'figma',
        'gemini': 'googlegemini',
        'claude': 'anthropic',
        'openai': 'openai',
        'n8n': 'n8n',
        'huggingface': 'huggingface',
        'react': 'react',
        'nodejs': 'nodedotjs',
        'javascript': 'javascript',
        'php': 'php',
        'vite': 'vite',
        'vscode': 'visualstudiocode',
        'trello': 'trello',
        'notion': 'notion',
        'google-workspace': 'googleworkspace',
        'office365': 'microsoftoffice'
    };

    const rawHtml = marked.parse(data.contenido || '');
    const cleanHtml = DOMPurify.sanitize(rawHtml);

    let toolsHtml = '';
    if (data.herramientas && data.herramientas.length > 0) {
        data.herramientas.forEach(tool => {
            const slug = toolIcons[tool] || tool;
            const iconUrl = tool === 'antigravity' 
                ? '/hojadevida/src/assets/icons/antigravity-color.svg' 
                : `https://cdn.simpleicons.org/${slug}`; // Not white hex, but original
            toolsHtml += `<img src="${iconUrl}" class="tool-icon" data-tooltip="${tool.charAt(0).toUpperCase() + tool.slice(1)}" alt="${tool}">`;
        });
    }

    const dateStr = data.fechaCreacion ? data.fechaCreacion.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sin fecha';
    const hasClient = data.cliente && !data.cliente.anonimo && (data.cliente.nombre || data.cliente.logo);

    let html = `
        <div class="post-layout w-full border-b border-gray-100 overflow-hidden">
            <!-- Information Column (Left) -->
            <div class="post-info-column flex flex-col h-full bg-white relative">
                <!-- Padding interior para el contenido -->
                <div class="p-8 lg:p-12 flex-grow flex flex-col">
                    <span class="text-[10px] font-black text-[#FF7A00] uppercase tracking-[0.2em] mb-4 block">${dateStr}</span>
                    <h2 class="text-3xl lg:text-4xl font-black text-gray-900 mb-8 leading-tight tracking-tight">${data.titulo}</h2>
                    
                    <div class="post-content-container relative flex-grow" id="content-container-${postId}">
                        <div class="prose max-w-none text-[#4A4A4A]">
                            ${cleanHtml}
                        </div>
                        <div class="post-content-fade" id="content-fade-${postId}"></div>
                    </div>
                    
                    <button class="mt-4 px-6 py-2 bg-gray-50 text-gray-600 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors self-start flex items-center gap-2 ver-mas-btn shrink-0" id="ver-mas-${postId}">
                        <span>Ver más detalle</span>
                        <svg class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>

                <!-- Tools & Client Bar (Bicolor) - Ahora sin spacing, full width -->
                <div class="flex w-full items-stretch mt-auto min-h-[100px]">
                    <div class="bg-[#F5A623] p-5 lg:p-8 flex flex-col justify-center gap-2 flex-[1.2] lg:flex-[1.5]">
                        <span class="text-[10px] font-black uppercase tracking-widest text-black/50">TOOLS USADAS</span>
                        <div class="flex flex-wrap gap-2">
                            ${toolsHtml}
                        </div>
                    </div>
                    ${hasClient ? `
                    <div class="bg-[#E5C494] p-5 lg:p-8 flex flex-col justify-center gap-2 flex-1 border-l border-white/20">
                        <span class="text-[10px] font-black uppercase tracking-widest text-black/50">CLIENTE</span>
                        <a href="${data.cliente.link || '#'}" target="_blank" class="flex items-center gap-3 no-underline group/client hover:opacity-80 transition-opacity">
                            ${data.cliente.logo ? `<img src="${data.cliente.logo}" class="w-10 h-10 object-contain rounded-lg shadow-sm bg-white/30 p-1" alt="Logo Cliente">` : ''}
                            <div class="text-[#2D2D2D] text-xs font-bold leading-tight">
                                ${data.cliente.nombre || 'Ver Sitio'}<br>
                                <span class="opacity-60 font-normal text-[9px] group-hover/client:underline">Visitar link</span>
                            </div>
                        </a>
                    </div>
                    ` : `
                    <div class="bg-[#E5C494] p-5 lg:p-8 flex flex-col justify-center gap-2 flex-1 border-l border-white/20 opacity-70 grayscale">
                        <span class="text-[10px] font-black uppercase tracking-widest text-black/50">CLIENTE</span>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-black/10 rounded-lg flex items-center justify-center text-xs font-bold text-black/40">?</div>
                            <span class="text-[#2D2D2D] text-xs font-bold">Proyecto Propio</span>
                        </div>
                    </div>
                    `}
                </div>
            </div>

            <!-- Media Slider Column (Right) -->
            <div class="post-media-column group relative flex flex-col bg-[#111] min-h-[400px] lg:min-h-[600px] lg:h-full overflow-hidden" id="slider-${postId}">
                <div class="main-media-display relative flex-grow w-full flex items-center justify-center bg-black overflow-hidden" id="media-viewport-${postId}">
                    <!-- Main media content -->
                </div>
                
                <!-- Nav Buttons (Inset) dark translucent style -->
                <button class="absolute top-1/2 left-4 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100 shadow-md slider-nav-btn slider-nav-prev" id="prev-${postId}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button class="absolute top-1/2 right-4 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100 shadow-md slider-nav-btn slider-nav-next" id="next-${postId}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                </button>

                <!-- Thumbnails (Mockup Style: Flat blocks filling 100% width) -->
                <div class="thumbnail-strip flex overflow-hidden bg-[#111] border-t border-[#111] shrink-0 h-28 lg:h-36 relative z-10 w-full" id="thumbs-${postId}">
                    <!-- Thumbnails go here -->
                </div>
            </div>
        </div>

        <!-- Interaction Bar (Integrated Mockup style) -->
        <div class="w-full bg-[#EEEEEE] px-4 py-3 border-t border-gray-200">
            <div class="flex flex-col lg:flex-row items-center gap-4 lg:gap-8 max-w-7xl mx-auto w-full">
                <!-- Left: White Pill with Action Buttons -->
                <div class="flex items-center gap-4 bg-white rounded-full px-5 py-2.5 shadow-sm border border-gray-100">
                    <button class="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors like-btn" id="like-${postId}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        <span>LIKE</span>
                        <span id="likes-count-${postId}" class="text-gray-400 font-normal ml-0.5">${data.likes > 0 ? `(${data.likes})` : ''}</span>
                    </button>
                    
                    <div class="w-px h-5 bg-gray-200"></div>
                    
                    <button class="text-gray-500 hover:text-gray-900 transition-colors share-btn" id="share-${postId}">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8l4-4-4-4v3H6C2.686 3 0 5.686 0 9v6h2V9c0-2.209 1.791-4 4-4h9v3z"/></svg>
                    </button>
                    
                    <div class="w-px h-5 bg-gray-200"></div>
                    
                    <button class="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors comment-toggle-btn" id="comment-toggle-${postId}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12.81 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        <span>COMMENTS</span>
                        <svg class="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                </div>

                <!-- Right: Inputs and Avatar -->
                <div class="flex items-center gap-3 w-full lg:w-auto flex-grow flex-wrap lg:flex-nowrap">
                    <div class="w-9 h-9 rounded-full bg-[#E1F5FE] text-[#03A9F4] flex items-center justify-center font-bold text-sm shrink-0">Tu</div>
                    <input type="text" id="comment-name-${postId}" class="bg-white rounded-full px-4 py-2 border border-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm w-32 placeholder:text-gray-400" placeholder="Tu nombre">
                    <input type="text" id="comment-text-${postId}" class="bg-white rounded-full px-5 py-2 border border-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm flex-grow placeholder:text-gray-400" placeholder="Escribe un comentario amable">
                    <button class="text-gray-500 hover:text-[#03A9F4] transition-colors p-2 shrink-0 submit-comment-btn" id="send-comment-${postId}">
                        <svg class="w-6 h-6 transform rotate-45" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Collapsible Comments List -->
        <div id="comments-section-${postId}" class="hidden w-full bg-white border-t border-gray-100 p-6">
            <div id="comments-list-${postId}" class="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                <p class="text-xs text-gray-400 italic text-center py-4">Cargando comentarios...</p>
            </div>
        </div>
    `;

    article.innerHTML = html;
    
    // Initialize logic
    setTimeout(() => {
        initializePostInteractions(article, postId, data, categoryPath);
        initializeSlider(postId, data);
    }, 0);

    return article;
}

function initializePostInteractions(article, postId, data, categoryPath) {
    const likesKey = `liked_${postId}`;
    const hasLiked = localStorage.getItem(likesKey) === 'true';

    // Ver más logic
    const contentContainer = article.querySelector(`#content-container-${postId}`);
    const verMasBtn = article.querySelector(`#ver-mas-${postId}`);
    const fade = article.querySelector(`#content-fade-${postId}`);

    if (contentContainer.scrollHeight <= 400) {
        verMasBtn.style.display = 'none';
        fade.style.display = 'none';
    }

    verMasBtn.addEventListener('click', () => {
        contentContainer.classList.toggle('is-expanded');
        const icon = verMasBtn.querySelector('svg');
        const text = verMasBtn.querySelector('span');
        
        if (contentContainer.classList.contains('is-expanded')) {
            icon.style.transform = 'rotate(180deg)';
            text.textContent = 'Ver menos detalles';
        } else {
            icon.style.transform = 'rotate(0deg)';
            text.textContent = 'Ver más detalle';
            contentContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // Like logic
    const likeBtn = article.querySelector(`#like-${postId}`);
    const likeCountSpan = article.querySelector(`#likes-count-${postId}`);
    
    if (hasLiked) {
        likeBtn.classList.add('is-active');
        likeBtn.querySelector('svg').style.fill = 'currentColor';
    }

    likeBtn.addEventListener('click', async () => {
         if (localStorage.getItem(likesKey) === 'true') return;

         likeBtn.disabled = true;
         likeBtn.classList.add('is-active');
         likeBtn.querySelector('svg').style.fill = 'currentColor';
         
         const currentLikes = data.likes || 0;
         likeCountSpan.textContent = `(${currentLikes + 1})`;
         likeCountSpan.style.display = 'inline';
         
         localStorage.setItem(likesKey, 'true');
         
         try {
             await updateDoc(doc(db, "posts", postId), {
                 likes: increment(1)
             });
         } catch (error) {
             console.error("Error giving like", error);
         }
    });

    // Share logic & Client-Side SEO Injection on direct link Match
    if (window.location.hash === `#post-${postId}`) {
        const fullTitle = `${data.titulo} – Portafolio Web de Jeefry Archila`;
        document.title = fullTitle;

        const fallbackImg = data.imagenes && data.imagenes.length > 0 ? data.imagenes[0] : 'https://coralgamer.github.io/hojadevida/assets/icons/LogoPNG.png';
        const finalSeoImage = data.seoThumbnail || fallbackImg;

        // Helper: actualiza tag existente o crea uno nuevo
        const setMeta = (attr, key, value) => {
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
            el.setAttribute('content', value);
        };

        setMeta('property', 'og:site_name', 'Portafolio Web de Jeefry Archila');
        setMeta('property', 'og:type',      'article');
        setMeta('property', 'og:title',     data.titulo);
        setMeta('property', 'og:description', fullTitle);
        setMeta('property', 'og:image',     finalSeoImage);
        setMeta('property', 'og:image:width',  '1200');
        setMeta('property', 'og:image:height', '630');
        setMeta('property', 'og:url',       window.location.href);
        setMeta('name',     'twitter:card',  'summary_large_image');
        setMeta('name',     'twitter:title', data.titulo);
        setMeta('name',     'twitter:description', fullTitle);
        setMeta('name',     'twitter:image', finalSeoImage);

        // Scroll al post automáticamente
        setTimeout(() => {
            const el = document.getElementById(`post-${postId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
    }

    const shareBtn = article.querySelector(`#share-${postId}`);
    shareBtn.addEventListener('click', () => {
        const baseUrl = '/hojadevida/';
        const urlCompartir = `${window.location.origin}${baseUrl}pages/servicios/${categoryPath}.html#post-${postId}`;
        
        if (navigator.share) {
            navigator.share({
                title: data.titulo,
                text: `${data.titulo} – Portafolio Web de Jeefry Archila`,
                url: urlCompartir
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(urlCompartir);
            alert('Enlace copiado al portapapeles');
        }
    });

    // Toggle comments
    const commentBtn = article.querySelector(`#comment-toggle-${postId}`);
    const commentsSection = article.querySelector(`#comments-section-${postId}`);
    commentBtn.addEventListener('click', () => {
        commentsSection.classList.toggle('hidden');
        if (!commentsSection.classList.contains('hidden')) {
            import('./comments-system.js').then(module => {
                module.loadCommentsForPost(postId);
            });
        }
    });

    // Add comment listener (Inline Bar)
    const submitCommentBtn = article.querySelector(`#send-comment-${postId}`);
    submitCommentBtn.addEventListener('click', () => {
         const nameInput = article.querySelector(`#comment-name-${postId}`).value.trim();
         const textInput = article.querySelector(`#comment-text-${postId}`).value.trim();
         if (nameInput && textInput) {
             submitCommentBtn.disabled = true;
             import('./comments-system.js').then(module => {
                module.addComment(postId, nameInput, textInput).then(() => {
                    article.querySelector(`#comment-text-${postId}`).value = '';
                    submitCommentBtn.disabled = false;
                    // Refresh comments list if open
                    if (!commentsSection.classList.contains('hidden')) {
                        module.loadCommentsForPost(postId);
                    }
                });
             });
         } else {
             alert('Escribe tu nombre y comentario.');
         }
    });

    // Security: Right click prevention on media
    const mediaColumn = article.querySelector('.post-media-column');
    mediaColumn.addEventListener('contextmenu', (e) => e.preventDefault());
}

async function initializeSlider(postId, data) {
    const { initSlider } = await import('./media-slider.js');
    initSlider(postId, data);
}
