const SB_URL = 'https://cdnpgptmstzzrmowmoke.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbnBncHRtc3R6enJtb3dtb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg2MjYsImV4cCI6MjA5MDE1NDYyNn0.AjCxNqRkBUVlfRVjUJX_DTSJ4IUredKgGUq5py3QQ_4';
const _supabase = supabase.createClient(SB_URL, SB_KEY);

// 1. INICIO Y CIERRE DE SESIÓN
document.getElementById('btn-entrar').onclick = async () => {
    const email = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const { error } = await _supabase.auth.signInWithPassword({ email, password: pass });
    if (error) alert("Acceso denegado: " + error.message);
    else verificarSesion();
};

async function verificarSesion() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        cargarDatos();
    }
}

async function cerrarSesion() {
    await _supabase.auth.signOut();
    location.reload(); // Al recargar volverá a pedir login
}

// 2. REGISTRAR ENTRADA
document.getElementById('btn-registrar').onclick = async () => {
    const registro = {
        nombre_visitante: document.getElementById('visitante-nombre').value,
        cedula: document.getElementById('visitante-cedula').value,
        placa_vehiculo: document.getElementById('visitante-placa').value,
        destino: document.getElementById('visitante-destino').value,
        motivo: document.getElementById('visitante-motivo').value,
        agente_guardia: "Carlos Carvallo"
    };
    const { error } = await _supabase.from('registros_acceso').insert([registro]);
    if (error) alert("Error al registrar");
    else location.reload();
};

// 3. MARCAR SALIDA
async function marcarSalida(id) {
    await _supabase.from('registros_acceso').update({ fecha_hora_salida: new Date().toISOString() }).eq('id', id);
    location.reload();
}

// 4. WHATSAPP (Envío directo)
document.getElementById('btn-whatsapp').onclick = async () => {
    const { data } = await _supabase.from('registros_acceso').select('*').order('fecha_hora', { ascending: true });
    let texto = `*📊 REPORTE V-GATE NEXUS - ${new Date().toLocaleDateString()}*\n\n`;
    
    data.forEach((r, i) => {
        const hEntrada = new Date(r.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const hSalida = r.fecha_hora_salida ? new Date(r.fecha_hora_salida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "PENDIENTE";
        texto += `*${i+1}. ${r.nombre_visitante.toUpperCase()}*\n📍 Destino: ${r.destino}\n⏰ E: ${hEntrada} | S: ${hSalida}\n\n`;
    });

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
};

// 5. CALENDARIO MÁGICO (Busca por fecha)
async function consultarHistorial() {
    const fechaElegida = document.getElementById('filtro-fecha').value;
    if (!fechaElegida) return;

    const { data } = await _supabase.from('registros_acceso')
        .select('*')
        .gte('fecha_hora', `${fechaElegida}T00:00:00`)
        .lte('fecha_hora', `${fechaElegida}T23:59:59`);

    const divHist = document.getElementById('lista-historial');
    cambiarTab('historial');
    divHist.innerHTML = `<h3 style="color:#3b82f6">📅 Registros del día ${fechaElegida}:</h3>`;
    
    if (data.length === 0) divHist.innerHTML += "<p>No hubo movimientos este día.</p>";
    
    data.forEach(r => {
        divHist.innerHTML += `
            <div class="registro-card">
                <strong>👤 ${r.nombre_visitante}</strong><br>
                <span>📍 Destino: ${r.destino}</span><br>
                <small>⏰ Ingreso: ${new Date(r.fecha_hora).toLocaleString()}</small>
            </div>`;
    });
}

// 6. FUNCIONES DE APOYO
function cambiarTab(tab) {
    document.getElementById('lista-activos').classList.toggle('hidden', tab !== 'activos');
    document.getElementById('lista-historial').classList.toggle('hidden', tab !== 'historial');
    document.getElementById('tab-activos').classList.toggle('active', tab === 'activos');
    document.getElementById('tab-historial').classList.toggle('active', tab === 'historial');
}

async function cargarDatos() {
    const { data } = await _supabase.from('registros_acceso').select('*').order('fecha_hora', { ascending: false });
    const listaA = document.getElementById('lista-activos');
    const listaH = document.getElementById('lista-historial');
    
    data.forEach(r => {
        const html = `
            <div class="registro-card">
                <strong>👤 ${r.nombre_visitante}</strong><br>
                <span>📍 ${r.destino}</span><br>
                <small>⏰ ${new Date(r.fecha_hora).toLocaleTimeString()}</small><br>
                ${r.fecha_hora_salida ? `<small>✅ Salió: ${new Date(r.fecha_hora_salida).toLocaleTimeString()}</small>` : `<button onclick="marcarSalida(${r.id})" class="btn-salida">MARCAR SALIDA</button>`}
            </div>`;
        if (r.fecha_hora_salida) listaH.innerHTML += html;
        else listaA.innerHTML += html;
    });
}

window.onload = verificarSesion;
