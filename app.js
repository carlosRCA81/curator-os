const SB_URL = 'https://cdnpgptmstzzrmowmoke.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbnBncHRtc3R6enJtb3dtb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg2MjYsImV4cCI6MjA5MDE1NDYyNn0.AjCxNqRkBUVlfRVjUJX_DTSJ4IUredKgGUq5py3QQ_4';
const _supabase = supabase.createClient(SB_URL, SB_KEY);

// --- BUSCAR HISTORIAL AL PONER CÉDULA ---
document.getElementById('visitante-cedula').addEventListener('blur', async (e) => {
    const cedula = e.target.value;
    const alerta = document.getElementById('alerta-recurrente');
    
    if (cedula.length > 4) {
        const { data } = await _supabase
            .from('registros_acceso')
            .select('*')
            .eq('cedula', cedula)
            .order('fecha_hora', { ascending: false })
            .limit(1);
        
        if (data && data.length > 0) {
            document.getElementById('visitante-nombre').value = data[0].nombre_visitante;
            document.getElementById('visitante-placa').value = data[0].placa_vehiculo || '';
            
            alerta.innerHTML = `⚠️ <b>Historial:</b> Estuvo el ${new Date(data[0].fecha_hora).toLocaleDateString()} en ${data[0].destino}`;
            alerta.classList.remove('hidden');
        } else {
            alerta.classList.add('hidden');
        }
    }
});

// --- REGISTRAR ENTRADA ---
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
    if (!error) { alert("Entrada Registrada"); location.reload(); }
};

// --- MARCAR SALIDA ---
async function marcarSalida(id) {
    const { error } = await _supabase
        .from('registros_acceso')
        .update({ fecha_hora_salida: new Date().toISOString() })
        .eq('id', id);
    if (!error) location.reload();
}

// --- CAMBIAR PESTAÑAS ---
function cambiarTab(tipo) {
    document.getElementById('lista-activos').classList.toggle('hidden', tipo !== 'activos');
    document.getElementById('lista-historial').classList.toggle('hidden', tipo !== 'historial');
    document.getElementById('tab-activos').classList.toggle('active', tipo === 'activos');
    document.getElementById('tab-historial').classList.toggle('active', tipo === 'historial');
}

// --- CARGAR DATOS SEPARADOS ---
async function cargarDatos() {
    const { data } = await _supabase.from('registros_acceso').select('*').order('fecha_hora', { ascending: false });
    const activos = document.getElementById('lista-activos');
    const historial = document.getElementById('lista-historial');

    data.forEach(reg => {
        const hEntrada = new Date(reg.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const card = `
            <div class="registro-card ${reg.fecha_hora_salida ? 'historial-card' : ''}">
                <div class="card-header">
                    <strong>👤 ${reg.nombre_visitante}</strong>
                    <span class="badge">${hEntrada}</span>
                </div>
                <p>🆔 ${reg.cedula} | 📍 ${reg.destino}</p>
                ${reg.fecha_hora_salida 
                    ? `<p class="salida-text">✔️ Salió: ${new Date(reg.fecha_hora_salida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>`
                    : `<button onclick="marcarSalida(${reg.id})" class="btn-salida">MARCAR SALIDA</button>`
                }
            </div>`;
        
        if (reg.fecha_hora_salida) historial.innerHTML += card;
        else activos.innerHTML += card;
    });
}
window.onload = cargarDatos;
