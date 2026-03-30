import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";

// Elements
const adminBody = document.getElementById('adminBody');
const adminEmailDisplay = document.getElementById('adminEmailDisplay');
const logoutBtn = document.getElementById('logoutBtn');

// Tabs
const tabCreate = document.getElementById('tabCreate');
const tabModerate = document.getElementById('tabModerate');
const sectionCreate = document.getElementById('sectionCreate');
const sectionModerate = document.getElementById('sectionModerate');

// Form Elements
const createPostForm = document.getElementById('createPostForm');
const addImageBtn = document.getElementById('addImageBtn');
const imageUrlsContainer = document.getElementById('imageUrlsContainer');
const imgEmptyText = document.getElementById('imgEmptyText');
const addYoutubeBtn = document.getElementById('addYoutubeBtn');
const youtubeUrlsContainer = document.getElementById('youtubeUrlsContainer');
const ytEmptyText = document.getElementById('ytEmptyText');
const publishBtn = document.getElementById('publishBtn');
const publishText = document.getElementById('publishText');
const publishSpinner = document.getElementById('publishSpinner');
const publishStatus = document.getElementById('publishStatus');
const editingPostId = document.getElementById('editingPostId');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const publishIcon = document.getElementById('publishIcon');
const clientAnonymous = document.getElementById('clientAnonymous');
const clientFields = document.getElementById('clientInfoFields');

// State
let imageInputsCount = 0;
let youtubeInputsCount = 0;

// ==========================================
// 1. AUTHENTICATION & SECURITY
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Logged in
        adminEmailDisplay.textContent = user.email;
        adminBody.classList.remove('hidden');
        loadPosts(); // Load posts for moderation tab
    } else {
        // Not logged in, kick out
        window.location.href = 'admin-login.html';
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'admin-login.html';
    });
});

// ==========================================
// 2. TABS LOGIC
// ==========================================
tabCreate.addEventListener('click', () => {
    tabCreate.classList.add('border-[#1A73E8]', 'text-[#1A73E8]');
    tabCreate.classList.remove('border-transparent', 'text-gray-500');
    tabModerate.classList.remove('border-[#1A73E8]', 'text-[#1A73E8]');
    tabModerate.classList.add('border-transparent', 'text-gray-500');
    sectionCreate.classList.remove('hidden');
    sectionModerate.classList.add('hidden');
});

tabModerate.addEventListener('click', () => {
    tabModerate.classList.add('border-[#1A73E8]', 'text-[#1A73E8]');
    tabModerate.classList.remove('border-transparent', 'text-gray-500');
    tabCreate.classList.remove('border-[#1A73E8]', 'text-[#1A73E8]');
    tabCreate.classList.add('border-transparent', 'text-gray-500');
    sectionModerate.classList.remove('hidden');
    sectionCreate.classList.add('hidden');
    loadPosts(); // Refresh on tab click
});

// Toggle Client Fields
clientAnonymous.addEventListener('change', (e) => {
    if (e.target.checked) {
        clientFields.classList.add('hidden', 'opacity-50', 'pointer-events-none');
    } else {
        clientFields.classList.remove('hidden', 'opacity-50', 'pointer-events-none');
    }
});

// ==========================================
// 3. DYNAMIC INPUTS (Images & YouTube)
// ==========================================
addImageBtn.addEventListener('click', () => {
    imgEmptyText.classList.add('hidden');
    imageInputsCount++;
    
    const div = document.createElement('div');
    div.className = 'flex gap-2 items-center slide-in';
    div.innerHTML = `
        <input type="url" name="imageUrls[]" placeholder="https://ejemplo.com/imagen.jpg" required
               class="block w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
        <button type="button" class="remove-btn text-gray-400 hover:text-red-500 p-2 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
    `;
    
    div.querySelector('.remove-btn').addEventListener('click', () => {
        div.remove();
        imageInputsCount--;
        if (imageInputsCount === 0) imgEmptyText.classList.remove('hidden');
    });
    
    imageUrlsContainer.appendChild(div);
});

addYoutubeBtn.addEventListener('click', () => {
    ytEmptyText.classList.add('hidden');
    youtubeInputsCount++;
    
    const div = document.createElement('div');
    div.className = 'flex gap-2 items-center slide-in';
    div.innerHTML = `
        <input type="url" name="youtubeUrls[]" placeholder="https://www.youtube.com/watch?v=..." required
               class="block w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm">
        <button type="button" class="remove-btn text-gray-400 hover:text-red-500 p-2 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
    `;
    
    div.querySelector('.remove-btn').addEventListener('click', () => {
        div.remove();
        youtubeInputsCount--;
        if (youtubeInputsCount === 0) ytEmptyText.classList.remove('hidden');
    });
    
    youtubeUrlsContainer.appendChild(div);
});

// ==========================================
// 3.1 MARKDOWN TOOLBAR LOGIC
// ==========================================
const postContent = document.getElementById('postContent');

const applyFormat = (type) => {
    const start = postContent.selectionStart;
    const end = postContent.selectionEnd;
    const selectedText = postContent.value.substring(start, end);
    const fullText = postContent.value;
    
    let replacement = '';
    let newCursorPos = start;

    switch (type) {
        case 'bold':
            replacement = `**${selectedText || 'texto'}**`;
            newCursorPos = start + (selectedText ? replacement.length : 2);
            break;
        case 'italic':
            replacement = `*${selectedText || 'texto'}*`;
            newCursorPos = start + (selectedText ? replacement.length : 1);
            break;
        case 'h1':
            replacement = `\n# ${selectedText || 'Título 1'}\n`;
            break;
        case 'h2':
            replacement = `\n## ${selectedText || 'Título 2'}\n`;
            break;
        case 'link':
            replacement = `[${selectedText || 'texto'}](https://example.com)`;
            break;
        case 'image':
            replacement = `![${selectedText || 'descripción'}](https://example.com/imagen.jpg)`;
            break;
        case 'table':
            replacement = `\n| Cabecera 1 | Cabecera 2 |\n| ----------- | ----------- |\n| Celda 1 | Celda 2 |\n`;
            break;
        case 'list':
            replacement = `\n- ${selectedText || 'elemento'}\n`;
            break;
        case 'quote':
            replacement = `\n> ${selectedText || 'cita'}\n`;
            break;
        case 'code':
            replacement = `\n\`\`\`javascript\n${selectedText || '// código aquí'}\n\`\`\`\n`;
            break;
        case 'rule':
            replacement = `\n---\n`;
            break;
    }

    postContent.value = fullText.substring(0, start) + replacement + fullText.substring(end);
    postContent.focus();
    
    // Set selection for better UX
    if (selectedText) {
        postContent.setSelectionRange(start + replacement.length, start + replacement.length);
    } else {
        // If nothing was selected, select the placeholder text
        const placeholderMatch = replacement.match(/texto|Título 1|Título 2|elemento|cita|https:\/\/example\.com/);
        if (placeholderMatch) {
            const pStart = start + replacement.indexOf(placeholderMatch[0]);
            postContent.setSelectionRange(pStart, pStart + placeholderMatch[0].length);
        }
    }
};

document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const format = btn.getAttribute('data-format');
        applyFormat(format);
    });
});

// ==========================================
// 4. PUBLISHING POSTS TO FIRESTORE
// ==========================================
const setPublishingState = (isPublishing) => {
    const isEditing = editingPostId.value !== "";
    if (isPublishing) {
        publishText.textContent = isEditing ? 'ACTUALIZANDO...' : 'PUBLICANDO...';
        publishSpinner.classList.remove('hidden');
        publishBtn.disabled = true;
        publishBtn.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
        publishText.textContent = isEditing ? 'GUARDAR CAMBIOS' : 'PUBLICAR AHORA';
        publishSpinner.classList.add('hidden');
        publishBtn.disabled = false;
        publishBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
};

const showStatus = (message, isError = false) => {
    publishStatus.textContent = message;
    publishStatus.className = `p-4 rounded-xl text-center text-sm font-bold ${isError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`;
    publishStatus.classList.remove('hidden');
    
    setTimeout(() => {
        publishStatus.classList.add('hidden');
    }, 5000);
};

// Helper: Extract YouTube Video ID from standard URL or short URL
function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setPublishingState(true);
    
    const isEditing = editingPostId.value !== "";
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const customDate = document.getElementById('postDate').value;
    
    // Collect Categories (Multi)
    const selectedCategories = [];
    document.querySelectorAll('input[name="postCategories[]"]:checked').forEach(checkbox => {
        selectedCategories.push(checkbox.value);
    });

    if (selectedCategories.length === 0) {
        showStatus('Por favor selecciona al menos una categoría.', true);
        setPublishingState(false);
        return;
    }

    // Collect Tools (Expanded)
    const selectedTools = [];
    document.querySelectorAll('input[name="postTools[]"]:checked').forEach(checkbox => {
        selectedTools.push(checkbox.value);
    });
    
    // Collect Images
    const imageUrls = [];
    document.querySelectorAll('input[name="imageUrls[]"]').forEach(input => {
        if (input.value.trim()) imageUrls.push(input.value.trim());
    });
    
    // Collect YouTubes & Convert to Embed IDs
    const youtubeIds = [];
    document.querySelectorAll('input[name="youtubeUrls[]"]').forEach(input => {
        const url = input.value.trim();
        if (url) {
            const videoId = extractVideoID(url);
            if (videoId) youtubeIds.push(videoId);
            else if (url.length === 11) youtubeIds.push(url); // Assume it's already an ID
        }
    });

    // Collect Client Info
    const clientInfo = {
        anonimo: clientAnonymous.checked,
        nombre: document.getElementById('clientName').value.trim(),
        logo: document.getElementById('clientLogo').value.trim(),
        link: document.getElementById('clientLink').value.trim()
    };
    
    // SEO Thumbnail
    const seoThumbnail = document.getElementById('seoThumbnail').value.trim();
    
    try {
        let finalTimestamp = serverTimestamp();
        if (customDate) {
            const dateObj = new Date(customDate + 'T12:00:00'); 
            finalTimestamp = dateObj; 
        }

        const postData = {
            titulo: title,
            contenido: content,
            categorias: selectedCategories,
            categoria: selectedCategories[0],
            herramientas: selectedTools,
            cliente: clientInfo,
            seoThumbnail: seoThumbnail,
            imagenes: imageUrls,
            youtubeIds: youtubeIds,
            // Only update date if it's a new post or if manual date was provided during edit
            ...( (!isEditing || customDate) && { fechaCreacion: finalTimestamp } )
        };
        
        if (isEditing) {
            await updateDoc(doc(db, "posts", editingPostId.value), postData);
            showStatus('¡Publicación actualizada con éxito!');
        } else {
            postData.likes = 0;
            await addDoc(collection(db, "posts"), postData);
            showStatus('¡Publicación creada con éxito!');
        }
        
        // Reset Form and Mode
        resetForm();
        
    } catch (error) {
        console.error("Error saving document: ", error);
        showStatus(`Error al guardar: ${error.message}`, true);
    } finally {
        setPublishingState(false);
    }
});

function resetForm() {
    createPostForm.reset();
    editingPostId.value = "";
    publishText.textContent = "PUBLICAR AHORA";
    publishIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>`;
    cancelEditBtn.classList.add('hidden');
    clientFields.classList.remove('hidden', 'opacity-50', 'pointer-events-none');
    document.getElementById('seoThumbnail').value = "";
    
    // Clear dynamic inputs
    document.querySelectorAll('.remove-btn').forEach(btn => btn.click());
    
    // Clear checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
}

cancelEditBtn.addEventListener('click', resetForm);

// ==========================================
// 5. MODERATION (Load Posts)
// ==========================================
const postsTableBody = document.getElementById('postsTableBody');

async function loadPosts() {
    try {
        const q = query(collection(db, "posts"), orderBy("fechaCreacion", "desc"));
        const querySnapshot = await getDocs(q);
        
        postsTableBody.innerHTML = ''; // Clear loading
        
        if (querySnapshot.empty) {
            postsTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No hay publicaciones aún.</td></tr>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const date = data.fechaCreacion ? data.fechaCreacion.toDate().toLocaleDateString('es-ES') : 'Reciente';
            
            const tr = document.createElement('tr');
            const categories = data.categorias ? data.categorias.join(', ') : data.categoria;

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${date}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 max-w-[150px] truncate" title="${categories}">
                        ${categories}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${data.titulo}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     <span class="flex items-center gap-1"><svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> ${data.likes || 0}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button data-id="${docSnap.id}" class="edit-post-btn text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg transition-colors">Editar</button>
                    <button data-id="${docSnap.id}" class="delete-post-btn text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition-colors">Eliminar</button>
                </td>
            `;
            postsTableBody.appendChild(tr);
        });
        
        // Add edit listeners
        document.querySelectorAll('.edit-post-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                loadPostToForm(id);
            });
        });

        // Add delete listeners
        document.querySelectorAll('.delete-post-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if(confirm("¿Estás seguro de que quieres eliminar esta publicación para siempre? Esta acción no se puede deshacer.")) {
                    try {
                        await deleteDoc(doc(db, "posts", id));
                        loadPosts(); // reload
                    } catch (error) {
                        console.error('Error deleting', error);
                        alert("Error al eliminar");
                    }
                }
            });
        });

        // After loading posts, let's load comments for moderation
        loadRecentComments(querySnapshot.docs);

    } catch (error) {
        console.error("Error fetching posts:", error);
        postsTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-red-500">Error cargando publicaciones.</td></tr>`;
    }
}

async function loadRecentComments(postSnapshots) {
    const commentsContainer = document.getElementById('commentsContainer');
    // Generar un número de carga único para evitar la race condition (doble render)
    const currentLoadId = Date.now();
    commentsContainer.dataset.loadId = currentLoadId;
    
    // Preparar UI inicial
    commentsContainer.innerHTML = '';
    let hasAnyComments = false;
    
    // Crear un contenedor temporal para los resultados
    const tempFragment = document.createDocumentFragment();
    
    for (const postDoc of postSnapshots) {
        if (commentsContainer.dataset.loadId != currentLoadId) return; // Abortar si hubo otro clic
        
        const postId = postDoc.id;
        const postData = postDoc.data();
        
        try {
            const commentsRef = collection(db, "posts", postId, "comentarios");
            const qComments = query(commentsRef, orderBy("fecha", "desc"));
            const commentsSnap = await getDocs(qComments);
            
            if (!commentsSnap.empty) {
                hasAnyComments = true;
                
                // Add header for this post
                const header = document.createElement('h3');
                header.className = 'text-sm font-bold text-gray-500 mt-6 mb-3 uppercase tracking-wider';
                header.textContent = `En post: ${postData.titulo}`;
                tempFragment.appendChild(header);
                
                // Add comments
                commentsSnap.forEach(commentDoc => {
                    const cData = commentDoc.data();
                    const cId = commentDoc.id;
                    const dateStr = cData.fecha ? cData.fecha.toDate().toLocaleDateString('es-ES', {hour: '2-digit', minute:'2-digit'}) : 'Recién';
                    
                    const div = document.createElement('div');
                    div.className = 'flex items-start justify-between bg-gray-50 p-4 rounded-xl border border-gray-100';
                    div.innerHTML = `
                        <div>
                            <p class="text-sm font-bold text-gray-800">${cData.autor} <span class="text-xs font-normal text-gray-400 ml-2">${dateStr}</span></p>
                            <p class="text-sm text-gray-600 mt-1">${cData.texto}</p>
                        </div>
                        <button data-postid="${postId}" data-commentid="${cId}" class="delete-comment-btn ml-4 text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">Eliminar</button>
                    `;
                    tempFragment.appendChild(div);
                });
            }
        } catch(err) {
            console.error("No se pudieron leer comentarios para post", postId, err);
        }
    }
    
    if (commentsContainer.dataset.loadId != currentLoadId) return; // One last check
    
    if (!hasAnyComments) {
        commentsContainer.innerHTML = '<div class="text-center py-8 text-gray-500 text-sm">No hay comentarios en las publicaciones recientes.</div>';
    } else {
        commentsContainer.appendChild(tempFragment);
        // Add delete listeners to comments
        document.querySelectorAll('.delete-comment-btn').forEach(btn => {
             btn.addEventListener('click', async (e) => {
                 const pId = e.currentTarget.getAttribute('data-postid');
                 const cId = e.currentTarget.getAttribute('data-commentid');
                 
                 if(confirm("¿Eliminar este comentario para siempre?")) {
                     try {
                         await deleteDoc(doc(db, "posts", pId, "comentarios", cId));
                         e.currentTarget.parentElement.remove(); // Remove from UI visually
                     } catch(err) {
                         alert("Error borrando el comentario");
                         console.error(err);
                     }
                 }
             });
        });
    }
}
async function loadPostToForm(id) {
    try {
        const docSnap = await getDoc(doc(db, "posts", id));
        if (!docSnap.exists()) return;
        
        const data = docSnap.data();
        
        // Change to Create Tab
        tabCreate.click();
        
        // Reset and Set Mode
        resetForm();
        editingPostId.value = id;
        publishText.textContent = "GUARDAR CAMBIOS";
        publishIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>`;
        cancelEditBtn.classList.remove('hidden');
        
        // Fill data
        document.getElementById('postTitle').value = data.titulo || "";
        document.getElementById('postContent').value = data.contenido || "";
        document.getElementById('seoThumbnail').value = data.seoThumbnail || "";
        
        if (data.fechaCreacion) {
            const dateStr = data.fechaCreacion.toDate().toISOString().split('T')[0];
            document.getElementById('postDate').value = dateStr;
        }

        // Categories
        if (data.categorias) {
            data.categorias.forEach(cat => {
                const cb = document.querySelector(`input[name="postCategories[]"][value="${cat}"]`);
                if (cb) cb.checked = true;
            });
        } else if (data.categoria) {
            const cb = document.querySelector(`input[name="postCategories[]"][value="${data.categoria}"]`);
            if (cb) cb.checked = true;
        }

        // Tools
        if (data.herramientas) {
            data.herramientas.forEach(tool => {
                const cb = document.querySelector(`input[name="postTools[]"][value="${tool}"]`);
                if (cb) cb.checked = true;
            });
        }

        // Client
        if (data.cliente) {
            clientAnonymous.checked = data.cliente.anonimo || false;
            document.getElementById('clientName').value = data.cliente.nombre || "";
            document.getElementById('clientLogo').value = data.cliente.logo || "";
            document.getElementById('clientLink').value = data.cliente.link || "";
            
            if (data.cliente.anonimo) {
                clientFields.classList.add('hidden', 'opacity-50', 'pointer-events-none');
            }
        }

        // Images
        if (data.imagenes) {
            data.imagenes.forEach(url => {
                addImageBtn.click();
                const inputs = document.querySelectorAll('input[name="imageUrls[]"]');
                inputs[inputs.length - 1].value = url;
            });
        }

        // YouTube
        if (data.youtubeIds) {
            data.youtubeIds.forEach(id => {
                addYoutubeBtn.click();
                const inputs = document.querySelectorAll('input[name="youtubeUrls[]"]');
                inputs[inputs.length - 1].value = `https://www.youtube.com/watch?v=${id}`;
            });
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error("Error loading post to form", err);
        alert("Error al cargar la publicación");
    }
}
