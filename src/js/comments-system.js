import { db } from '../firebase-config.js';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";

/**
 * Agrega un nuevo comentario a la subcolección de comentarios de un post
 */
export async function addComment(postId, autorNombre, textoComentario) {
    try {
        const commentsRef = collection(db, "posts", postId, "comentarios");
        await addDoc(commentsRef, {
            autor: autorNombre,
            texto: textoComentario,
            fecha: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding comment: ", error);
        alert("Hubo un error al enviar el comentario");
    }
}

/**
 * Escucha en tiempo real (o carga una vez) los comentarios de un post y los renderiza
 */
export function loadCommentsForPost(postId) {
    const listContainer = document.getElementById(`comments-list-${postId}`);
    if (!listContainer) return;
    
    // Mostramos estado de carga breve
    listContainer.innerHTML = `<p class="text-xs text-gray-500 italic block">Cargando comentarios...</p>`;
    
    const commentsRef = collection(db, "posts", postId, "comentarios");
    const q = query(commentsRef, orderBy("fecha", "asc"));
    
    // Usamos onSnapshot para que si alguien comenta, se vea en tiempo real
    onSnapshot(q, (snapshot) => {
        listContainer.innerHTML = ''; // Limpiar carga o comentarios anteriores
        
        if (snapshot.empty) {
            listContainer.innerHTML = `<p class="text-xs text-gray-400 italic">No hay comentarios aún. ¡Sé el primero!</p>`;
            return;
        }
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const dateStr = data.fecha ? data.fecha.toDate().toLocaleDateString('es-ES', {hour: '2-digit', minute:'2-digit'}) : 'Recién';
            
            const commentHTML = `
                <div class="flex gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                    <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs uppercase shadow-inner">
                        ${data.autor.charAt(0)}
                    </div>
                    <div class="flex-grow">
                        <div class="flex items-center justify-between mb-1">
                            <span class="font-bold text-sm text-gray-800">${escapeHTML(data.autor)}</span>
                            <span class="text-[10px] text-gray-400 font-medium">${dateStr}</span>
                        </div>
                        <p class="text-sm text-gray-600 leading-relaxed">${escapeHTML(data.texto)}</p>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', commentHTML);
        });
    }, (error) => {
        console.error("Error listening to comments:", error);
        listContainer.innerHTML = `<p class="text-xs text-red-500">Error al cargar comentarios.</p>`;
    });
}

// Util para evitar XSS en el texto libre de los comentarios
function escapeHTML(str) {
    if(!str) return '';
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
