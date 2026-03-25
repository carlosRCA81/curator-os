// CONFIGURACIÓN DE TU PROYECTO SUPABASE
const SUPABASE_URL = 'https://iyvbufxkgycqcmdeclsf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dmJ1ZnhrZ3ljcWNtZGVjbHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTE5NTMsImV4cCI6MjA4OTk2Nzk1M30.Rt6XfnsvWu1Efwb3-fVOyHCmz7aCJXHpIJxaxGzuThw';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentFilter = "Dashboard";

document.addEventListener("DOMContentLoaded", () => {
    fetchResources(); // Carga de la nube al iniciar
});

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

// GUARDAR EN SUPABASE
async function saveResource() {
    const title = document.getElementById("link-title").value;
    const url = document.getElementById("link-url").value;
    const category = document.getElementById("link-category").value;

    if (!title || !url) return alert("Por favor rellena los campos");

    const { error } = await supabaseClient
        .from('resources')
        .insert([{ title, url, category, isFavorite: false }]);

    if (error) {
        alert("Error al guardar en la nube");
    } else {
        document.getElementById("link-title").value = "";
        document.getElementById("link-url").value = "";
        showToast("¡Guardado en Supabase!");
        fetchResources();
    }
}

// MOSTRAR RECURSOS
async function fetchResources(searchText = "") {
    let { data: links, error } = await supabaseClient
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return;

    const container = document.getElementById("resources-list");
    container.innerHTML = "";

    let filtered = currentFilter === "Dashboard" 
        ? links 
        : links.filter(l => l.category === currentFilter);

    if (searchText) {
        filtered = filtered.filter(l => l.title.toLowerCase().includes(searchText.toLowerCase()));
    }

    filtered.forEach(link => {
        const card = document.createElement("div");
        card.className = "resource-card";
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="category-tag">${link.category}</span>
                <div>
                    <i class='bx bx-qr' onclick="openQR('${link.url}', '${link.title}')" style="color:#10b981; cursor:pointer; margin-right:12px;"></i>
                    <i class='bx bx-trash' onclick="deleteResource(${link.id})" style="color:#ef4444; cursor:pointer;"></i>
                </div>
            </div>
            <h3 style="margin: 15px 0 5px 0;">${link.title}</h3>
            <p style="font-size:12px; opacity:0.6; margin-bottom:15px; overflow:hidden;">${link.url}</p>
            <button onclick="window.open('${link.url}', '_blank')" class="btn-save" style="padding:8px; font-size:12px; width:100%;">ABRIR ENLACE</button>
        `;
        container.appendChild(card);
    });
    updateBadges(links);
}

// ELIMINAR
async function deleteResource(id) {
    if (!confirm("¿Eliminar de la nube?")) return;
    const { error } = await supabaseClient.from('resources').delete().eq('id', id);
    if (!error) fetchResources();
}

// TUS FUNCIONES DE INTERFAZ ORIGINALES
function openSubmenu(element) {
    const submenu = element.nextElementSibling;
    const arrow = element.querySelector(".arrow");
    if (submenu.style.height === "0px" || !submenu.style.height) {
        submenu.style.height = submenu.querySelector("ul").clientHeight + "px";
        if(arrow) arrow.style.transform = "rotate(180deg)";
    } else {
        submenu.style.height = "0px";
        if(arrow) arrow.style.transform = "rotate(0deg)";
    }
}

function gotoPage(btn) {
    currentFilter = btn.innerText.trim();
    document.getElementById("current-category-title").innerText = currentFilter;
    document.querySelectorAll(".sidebar button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    fetchResources();
    if(window.innerWidth <= 768) toggleSidebar();
}

function updateBadges(links) {
    const cats = ["Desarrollo Web", "Diseño UI/UX", "Inversiones", "Notas Rápidas"];
    document.querySelectorAll(".sidebar button p").forEach(p => {
        if (cats.includes(p.innerText)) {
            const count = links.filter(l => l.category === p.innerText).length;
            let badge = p.parentElement.querySelector(".count-badge") || document.createElement("span");
            badge.className = "count-badge";
            badge.innerText = count;
            p.parentElement.appendChild(badge);
        }
    });
}

function openQR(url, title) {
    document.getElementById("qr-modal").style.display = "flex";
    document.getElementById("qr-title").innerText = title;
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = ""; 
    new QRCode(qrContainer, { text: url, width: 180, height: 180 });
}

function closeQRModal() { document.getElementById("qr-modal").style.display = "none"; }

function filterBySearch() {
    fetchResources(document.getElementById("search-input").value);
}

function showToast(m) {
    const t = document.getElementById("toast");
    t.innerText = m; t.style.display = "block";
    setTimeout(() => t.style.display = "none", 2000);
}
