const SB_URL = 'https://cdnpgptmstzzrmowmoke.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbnBncHRtc3R6enJtb3dtb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg2MjYsImV4cCI6MjA5MDE1NDYyNn0.AjCxNqRkBUVlfRVjUJX_DTSJ4IUredKgGUq5py3QQ_4';
const _supabase = supabase.createClient(SB_URL, SB_KEY);

// --- INICIO DE SESIÓN ---
document.getElementById('btn-entrar').onclick = async () => {
    const userEmail = document.getElementById('login-user').value.trim();
    const userPass = document.getElementById('login-pass').value.trim();

    console.log("Intentando entrar con:", userEmail);

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPass,
    });

    if (error) {
        // Esto nos dirá el error real en una ventana
        alert("ERROR DE ACCESO: " + error.message);
    } else {
        alert("✅ Acceso concedido. Cargando sistema...");
        verificarSesion();
    }
};

async function verificarSesion() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-content').classList.remove('hidden');
        cargarDatos();
    }
}

// --- CARGA DE DATOS ---
async function cargarDatos() {
    const { data, error } = await _supabase.from('registros_acceso').select('*').order('fecha_hora', { ascending: false });
    if (error) {
        console.error("Error cargando datos:", error);
        return;
    }
    const lista = document.getElementById('lista-activos');
    const hist = document.getElementById('lista-historial');
    lista.innerHTML = ""; // Limpiar antes de cargar
    hist.innerHTML = "";

    data.forEach(r => {
        const card = `
            <div class="registro-card">
                <strong>👤 ${r.nombre_visitante}</strong><br>
                <span>📍 ${r.destino}</span><br>
                <small>⏰ ${new Date(r.fecha_hora).toLocaleTimeString()}</small>
                ${r.fecha_hora_salida ? '' : `<button onclick="marcarSalida(${r.id})" class="btn-salida">MARCAR SALIDA</button>`}
            </div>`;
        if (r.fecha_hora_salida) hist.innerHTML += card; else lista.innerHTML += card;
    });
}

// Asegurar que el sistema verifique si ya entraste antes
window.onload = verificarSesion;
