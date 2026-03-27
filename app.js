// CONFIGURACIÓN DE SUPABASE
const SB_URL = 'https://cdnpgptmstzzrmowmoke.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbnBncHRtc3R6enJtb3dtb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg2MjYsImV4cCI6MjA5MDE1NDYyNn0.AjCxNqRkBUVlfRVjUJX_DTSJ4IUredKgGUq5py3QQ_4';
const _supabase = supabase.createClient(SB_URL, SB_KEY);

// --- 1. ACCESO Y SEGURIDAD ---
document.getElementById('btn-entrar').onclick = async () => {
    const email = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    const { data, error } = await _supabase.auth.signInWithPassword({ email, password: pass });

    if (error) {
        alert("Error: " + error.message);
    } else {
        verificarSesion();
    }
};

async function verificarSesion() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        cargarDatos();
    }
}

function cerrarSesion() {
    _supabase.auth.signOut();
    location.reload();
}

// --- 2. REGISTRO DE VISITANTES ---
document.getElementById('btn-registrar').onclick = async () => {
    const registro = {
        nombre_visitante: document.getElementById('visitante-nombre').value,
        cedula: document.getElementById('visitante-cedula').value,
        placa_vehiculo: document.getElementById('visitante-placa').value,
        destino: document.getElementById('visitante-destino').value,
        motivo: document.getElementById('visitante-motivo').value,
        agente_guardia: document.getElementById('agente-nombre').value
    };

    const { error } = await _supabase.from('registros_acceso').insert([registro]);
    if (error) alert("Error al registrar");
    else location.reload();
};

async function marcarSalida(id) {
    await _supabase.from('registros_acceso').update({ fecha_hora_salida: new Date().toISOString() }).eq('id', id);
    location.reload();
}

// --- 3. REPORTE Y LIMPIEZA ---
document.getElementById('btn-reporte').onclick = async () => {
    const { data } = await _supabase.from('registros_acceso').select('*').order('fecha_hora', { ascending: true });
    let texto = `📊 REPORTE V-GATE NEXUS\n\n`;
    data.forEach((r, i) => {
        texto += `${i+1}. ${r.nombre_visitante} | Destino: ${r.destino}\n   Entrada: ${new Date(r.fecha_hora).toLocaleTimeString()}\n\n`;
    });
    navigator.clipboard.writeText(texto);
    alert("Reporte copiado para pegar en WhatsApp");
};

document.getElementById('btn-mantenimiento').onclick = async () => {
    const p = prompt("Clave maestra:");
    if (p === '45Bc*.Ks*9') {
        if(confirm("¿Borrar todo?")) {
            await _supabase.from('registros_acceso').delete().neq('id', 0);
            location.reload();
        }
    }
};

// --- 4. CARGA DE LISTAS ---
function cambiarTab(tipo) {
    document.getElementById('lista-activos').classList.toggle('hidden', tipo !== 'activos');
    document.getElementById('lista-historial').classList.toggle('hidden', tipo !== 'historial');
    document.getElementById('tab-activos').classList.toggle('active', tipo === 'activos');
    document.getElementById('tab-historial').classList.toggle('active', tipo === 'historial');
}

async function cargarDatos() {
    const { data } = await _supabase.from('registros_acceso').select('*').order('fecha_hora', { ascending: false });
    const lista = document.getElementById('lista-activos');
    const hist = document.getElementById('lista-historial');
    
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

window.onload = verificarSesion;
