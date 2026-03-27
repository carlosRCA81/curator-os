const SB_URL = 'https://cdnpgptmstzzrmowmoke.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbnBncHRtc3R6enJtb3dtb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg2MjYsImV4cCI6MjA5MDE1NDYyNn0.AjCxNqRkBUVlfRVjUJX_DTSJ4IUredKgGUq5py3QQ_4';
const _supabase = supabase.createClient(SB_URL, SB_KEY);

// --- 1. INICIO DE SESIÓN ---
document.getElementById('btn-entrar').onclick = async () => {
    const email = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: pass,
    });

    if (error) {
        alert("Acceso denegado: Datos incorrectos");
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

// --- 2. REGISTRO Y BÚSQUEDA ---
document.getElementById('visitante-cedula').addEventListener('blur', async (e) => {
    const cedula = e.target.value;
    if (cedula.length > 4) {
        const { data } = await _supabase.from('registros_acceso').select('*').eq('cedula', cedula).order('fecha_hora', { ascending: false }).limit(1);
        if (data && data[0]) {
            document.getElementById('visitante-nombre').value = data[0].nombre_visitante;
            document.getElementById('visitante-placa').value = data[0].placa_vehiculo || '';
            const alerta = document.getElementById('alerta-recurrente');
            alerta.innerHTML = `✅ Recurrente: Estuvo en ${data[0].destino}`;
            alerta.classList.remove('hidden');
        }
    }
});

document.getElementById('btn-registrar').onclick = async () => {
    const registro = {
        nombre_visitante: document.getElementById('visitante-nombre').value,
        cedula: document.getElementById('visitante-cedula').value,
        placa_vehiculo: document.getElementById('visitante-placa').value,
        destino: document.getElementById('visitante-destino').value,
        motivo: document.getElementById('visitante-motivo').value,
        agente_guardia: document.getElementById('agente-nombre').value
    };
    await _supabase.from('registros_acceso').insert([registro]);
    location.reload();
};

// --- 3. REPORTES Y MANTENIMIENTO ---
document.getElementById('btn-reporte').onclick = async () => {
    const { data } = await _supabase.from('registros_acceso').select('*').order('fecha_hora', { ascending: true });
    let reporte = `📊 REPORTE V-GATE NEXUS\n👮 ${document.getElementById('agente-nombre').value}\n\n`;
    data.forEach((r, i) => {
        reporte += `${i+1}. ${r.nombre_visitante} - CI: ${r.cedula}\n   📍 ${r.destino} | Ent: ${new Date(r.fecha_hora).toLocaleTimeString()}\n\n`;
    });
    navigator.clipboard.writeText(reporte);
    alert("Copiado al portapapeles");
};

document.getElementById('btn-mantenimiento').onclick = async () => {
    const pass = prompt("Clave de mantenimiento:");
    if (pass === '45Bc*.Ks*9') {
        if (confirm("¿Borrar todos los registros?")) {
            await _supabase.from('registros_acceso').delete().neq('id', 0);
            location.reload();
        }
    } else { alert("Clave incorrecta"); }
};

// --- 4. CARGA DE INTERFAZ ---
async function marcarSalida(id) {
    await _supabase.from('registros_acceso').update({ fecha_hora_salida: new Date().toISOString() }).eq('id', id);
    location.reload();
}

function cambiarTab(tipo) {
    document.getElementById('lista-activos').classList.toggle('hidden', tipo !== 'activos');
    document.getElementById('lista-historial').classList.toggle('hidden', tipo !== 'historial');
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
                ${r.fecha_hora_salida ? '' : `<button onclick="marcarSalida(${r.id})" class="btn-salida">SALIDA</button>`}
            </div>`;
        if (r.fecha_hora_salida) hist.innerHTML += card; else lista.innerHTML += card;
    });
}

window.onload = verificarSesion;
