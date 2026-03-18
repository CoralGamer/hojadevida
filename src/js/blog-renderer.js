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
            where("categorias", "array-contains", category), // New: supports multi-category
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
        let errorMsg = `<div class="col-span-full py-12 text-center text-red-500 font-medium">No se pudieron cargar las publicaciones. El sistema necesita crear un Índice en Firestore.</div>`;
        
        if (error.message && error.message.includes("https://console.firebase.google.com")) {
            const linkMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
            if (linkMatch) {
                errorMsg += `
                    <div class="col-span-full text-center mt-4 animate-bounce">
                        <a href="${linkMatch[0]}" target="_blank" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-colors inline-block text-lg">
                           👉 HAZ CLIC AQUÍ PARA CREAR EL ÍNDICE AUTOMÁTICAMENTE EN FIREBASE 👈
                        </a>
                        <p class="text-sm text-gray-500 mt-4 max-w-lg mx-auto">
                            <strong>Instrucciones:</strong> Toca el botón azul de arriba. Se abrirá Firebase. Confirma la creación del índice dándole a <b>Crear</b>. Firebase tardará entre 2 a 5 minutos en compilarlo. Una vez termine, simplemente recarga esta página y verás tus posts mágicamente.
                        </p>
                    </div>`;
            }
        }
        
        container.innerHTML = errorMsg;
    }
}

function createPostElement(postId, data, categoryPath) {
    const article = document.createElement('article');
    article.className = 'bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1';
    article.id = `post-${postId}`;

    // Fecha
    const dateStr = data.fechaCreacion ? data.fechaCreacion.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    
    // Contenido Base
    const rawHtml = marked.parse(data.contenido || '');
    const cleanHtml = DOMPurify.sanitize(rawHtml);

    let html = `
        <div class="p-8">
            <span class="text-xs font-bold text-[#1A73E8] uppercase tracking-widest mb-3 block">${dateStr}</span>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">${data.titulo}</h2>
            <div class="prose prose-blue max-w-none text-gray-600 mb-8 leading-relaxed text-lg">
                ${cleanHtml}
            </div>
    `;

    // Medios: Videos de YouTube (primero, para mayor impacto)
    if (data.youtubeIds && data.youtubeIds.length > 0) {
        html += `<div class="space-y-6 mb-8">`;
        data.youtubeIds.forEach(id => {
            html += `
                <div class="relative w-full rounded-2xl overflow-hidden shadow-md" style="padding-top: 56.25%;">
                    <iframe class="absolute top-0 left-0 w-full h-full border-0" 
                        src="https://www.youtube.com/embed/${id}" 
                        title="YouTube video player" frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen>
                    </iframe>
                </div>
            `;
        });
        html += `</div>`;
    }

    // Medios: Imágenes Extras
    if (data.imagenes && data.imagenes.length > 0) {
        html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">`;
        data.imagenes.forEach(url => {
            html += `
                <div class="relative group h-64 md:h-80 rounded-2xl overflow-hidden cursor-zoom-in" onclick="window.open('${url}', '_blank')">
                    <img src="${url}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Imagen del post">
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
            `;
        });
        html += `</div>`;
    }

    // Pie del Post (Interacciones)
    const baseUrl = import.meta.env.BASE_URL || '/';
    const urlCompartir = `${window.location.origin}${baseUrl}pages/servicios/${categoryPath}.html#post-${postId}`;
    const likesKey = `liked_${postId}`;
    const hasLiked = localStorage.getItem(likesKey) === 'true';

    html += `
            <div class="pt-6 border-t border-gray-100 flex items-center justify-between">
                <!-- Like Button -->
                <button class="like-btn flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${hasLiked ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-50 hover:bg-red-50 hover:text-red-500'}" data-id="${postId}">
                    <svg class="w-5 h-5 ${hasLiked ? 'fill-current' : 'fill-none stroke-2'} " stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    <span class="like-count text-sm">${data.likes || 0}</span>
                </button>
                
                <div class="flex gap-2">
                    <!-- Share Button -->
                    <button class="share-btn flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 bg-gray-50 hover:bg-gray-100 font-bold transition-colors text-sm" data-title="${data.titulo}" data-url="${urlCompartir}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                        Compartir
                    </button>
                    <!-- Comments Button placeholder -->
                     <button class="comment-btn flex items-center gap-2 px-4 py-2 rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold transition-colors text-sm" data-id="${postId}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        Comentarios
                    </button>
                </div>
            </div>
            
            <!-- Comment Section Drawer (Hidden default) -->
            <div id="comments-drawer-${postId}" class="mt-6 pt-6 border-t border-gray-100 hidden">
                <h4 class="font-bold text-gray-800 mb-4">Comentarios</h4>
                <!-- Input area -->
                <div class="flex gap-3 mb-6">
                    <div class="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs uppercase">TU</div>
                    <div class="flex-grow flex flex-col gap-2">
                        <input type="text" id="comment-name-${postId}" placeholder="Tu nombre..." class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none w-1/2">
                        <div class="relative">
                            <textarea id="comment-text-${postId}" rows="2" placeholder="Escribe un comentario amigable..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                            <button class="submit-comment-btn absolute bottom-3 right-3 text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors font-bold text-xs" data-id="${postId}">Enviar</button>
                        </div>
                    </div>
                </div>
                <!-- Comments list (to be filled by JS) -->
                <div id="comments-list-${postId}" class="space-y-4">
                     <p class="text-xs text-gray-400 italic">Cargando...</p>
                </div>
            </div>
        </div>
    `;

    article.innerHTML = html;

    // EVENT LISTENERS
    
    // Like logic
    const likeBtn = article.querySelector('.like-btn');
    const likeCountSpan = article.querySelector('.like-count');
    
    if (!hasLiked) {
        likeBtn.addEventListener('click', async () => {
             // Disable immediately to prevent double clicks
             likeBtn.disabled = true;
             likeBtn.classList.remove('text-gray-500', 'bg-gray-50', 'hover:bg-red-50', 'hover:text-red-500');
             likeBtn.classList.add('text-red-500', 'bg-red-50');
             likeBtn.querySelector('svg').classList.replace('fill-none', 'fill-current');
             likeBtn.querySelector('svg').classList.remove('stroke-2');
             
             const currentLikes = parseInt(likeCountSpan.textContent);
             likeCountSpan.textContent = currentLikes + 1;
             
             localStorage.setItem(likesKey, 'true');
             
             try {
                 await updateDoc(doc(db, "posts", postId), {
                     likes: increment(1)
                 });
             } catch (error) {
                 console.error("Error giving like", error);
             }
        }, { once: true });
    }

    // Share logic
    const shareBtn = article.querySelector('.share-btn');
    shareBtn.addEventListener('click', () => {
        const title = shareBtn.getAttribute('data-title');
        const url = shareBtn.getAttribute('data-url');
        
        if (navigator.share) {
            navigator.share({
                title: title,
                text: 'Mira esta publicación interesante',
                url: url
            }).catch(console.error);
        } else {
            // Fallback for desktop/unsupported browsers
            navigator.clipboard.writeText(url);
            const originalText = shareBtn.innerHTML;
            shareBtn.innerHTML = '<span class="text-green-600">¡Enlace copiado!</span>';
            setTimeout(() => shareBtn.innerHTML = originalText, 2000);
        }
    });

    // Toggle comments
    const commentBtn = article.querySelector('.comment-btn');
    const commentsDrawer = article.querySelector(`#comments-drawer-${postId}`);
    commentBtn.addEventListener('click', () => {
        commentsDrawer.classList.toggle('hidden');
        if (!commentsDrawer.classList.contains('hidden')) {
            // Here we will trigger loading comments if not loaded yet
            import('./comments-system.js').then(module => {
                module.loadCommentsForPost(postId);
            });
        }
    });

    // Add comment listener
    const submitCommentBtn = article.querySelector('.submit-comment-btn');
    submitCommentBtn.addEventListener('click', () => {
         const nameInput = article.querySelector(`#comment-name-${postId}`).value.trim();
         const textInput = article.querySelector(`#comment-text-${postId}`).value.trim();
         if (nameInput && textInput) {
             submitCommentBtn.textContent = '...';
             submitCommentBtn.disabled = true;
             import('./comments-system.js').then(module => {
                module.addComment(postId, nameInput, textInput).then(() => {
                    article.querySelector(`#comment-text-${postId}`).value = '';
                    submitCommentBtn.textContent = 'Enviar';
                    submitCommentBtn.disabled = false;
                });
             });
         } else {
             alert('Por favor escribe tu nombre y el comentario.');
         }
    });

    return article;
}

// Util para evitar XSS en el texto libre
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}
