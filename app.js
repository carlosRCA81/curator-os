const SB_URL = 'https://cdnpgptmstzzrmowmoke.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbnBncHRtc3R6enJtb3dtb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg2MjYsImV4cCI6MjA5MDE1NDYyNn0.AjCxNqRkBUVlfRVjUJX_DTSJ4IUredKgGUq5py3QQ_4';
const _supabase = supabase.createClient(SB_URL, SB_KEY);

// BUSCAR HISTORIAL AUTOMÁTICO
document.getElementById('visitante-cedula').addEventListener('blur', async (e) => {
    const cedula = e.target.value;
    const alerta = document.getElementById('alerta-recurrente');
    if (cedula.length > 4) {
        const { data } = await _supabase.from('registros_acceso').select('*').eq('cedula', cedula).order('fecha_hora', { ascending: false }).limit(1);
        if (data && data.length > 0) {
            document.getElementById('visitante-nombre').value = data[0].nombre_visitante;
            document.getElementById('visitante-placa').value = data[0].placa_vehiculo || '';
            alerta.innerHTML = `✅ <b>Recurrente:</b> Estuvo el ${new Date(data[0].fecha_hora).toLocaleDateString()} en ${data[0].destino}`;
            alerta.classList.remove('hidden');
        } else { alerta.classList.add('hidden'); }
    }
});

// REGISTRAR
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
    if (!error) location.reload();
};

// SALIDA
async function marcarSalida(id) {
    await _supabase.from('registros_acceso').update({ fecha_hora_salida: new Date().toISOString() }).eq('id', id);
    location.reload();
}

// REPORTES
document.getElementById('btn-reporte').onclick = async () => {
    const { data } = await _supabase.from('registros_acceso').select('*').order('fecha_hora', { ascending: true });
    let txt = `📊 REPORTE V-GATE NEXUS\n📅 ${new Date().toLocaleDateString()}\n👮 ${document.getElementById('agente-nombre').value}\n----------\n`;
    data.forEach((r, i) => {
        const ent = new Date(r.fecha_hora).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        const sal = r.fecha_hora_salida ? new Date(r.fecha_hora_salida).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "---";
        txt += `${i+1}. ${r.nombre_visitante} (ID: ${r.cedula})\n📍 Destino: ${r.destino} | ⏰ ${ent} - ${sal}\n\n`;
    });
    navigator.clipboard.writeText(txt);
    alert("📋 Reporte copiado. ¡Pégalo en WhatsApp!");
};

function cambiarTab(t) {
    document.getElementById('lista-activos').classList.toggle('hidden', t !== 'activos');
    document.getElementById('lista-historial').classList.toggle('hidden', t !== 'historial');
    document.getElementById('tab-activos').classList.toggle('active', t === 'activos');
    document.getElementById('tab-historial').classList.toggle('active', t === 'historial');
}

async function cargar() {
    const { data } = await _supabase.from('registros_acceso').select('*').order('fecha_hora', { ascending: false });
    const activos = document.getElementById('lista-activos');
    const historial = document.getElementById('lista-historial');
    data.forEach(reg => {
        const hE = new Date(reg.fecha_hora).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        const card = `
            <div class="registro-card ${reg.fecha_hora_salida ? 'historial-card' : ''}">
                <strong>👤 ${reg.nombre_visitante}</strong><br>
                <small>🆔 ${reg.cedula} | 🚗 ${reg.placa_vehiculo || 'S/P'}</small><br>
                <span>📍 ${reg.destino}</span><br>
                <small>⏰ Entrada: ${hE}</small>
                ${reg.fecha_hora_salida ? `<br><small>✔️ Salida: ${new Date(reg.fecha_hora_salida).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>` : `<button onclick="marcarSalida(${reg.id})" class="btn-salida">MARCAR SALIDA</button>`}
            </div>`;
        if (reg.fecha_hora_salida) historial.innerHTML += card;
        else activos.innerHTML += card;
    });
}
window.onload = cargar;
