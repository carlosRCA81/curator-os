// CONFIGURACIÓN LIMPIA
const SB_URL = 'https://cdnpgptmstzzrmowmoke.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbnBncHRtc3R6enJtb3dtb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg2MjYsImV4cCI6MjA5MDE1NDYyNn0.AjCxNqRkBUVlfRVjUJX_DTSJ4IUredKgGUq5py3QQ_4';

const _supabase = supabase.createClient(SB_URL, SB_KEY);

const btnRegistrar = document.getElementById('btn-registrar');

async function registrarEntrada() {
    const registro = {
        nombre_visitante: document.getElementById('visitante-nombre').value,
        cedula: document.getElementById('visitante-cedula').value,
        placa_vehiculo: document.getElementById('visitante-placa').value,
        destino: document.getElementById('visitante-destino').value,
        motivo: document.getElementById('visitante-motivo').value,
        agente_guardia: document.getElementById('agente-nombre').value
    };

    if (!registro.nombre_visitante || !registro.cedula) {
        alert("Falta Nombre o Cédula");
        return;
    }

    btnRegistrar.disabled = true;
    btnRegistrar.innerText = "Guardando...";

    try {
        const { error } = await _supabase.from('registros_acceso').insert([registro]);
        if (error) throw error;

        alert("✅ ¡Guardado con éxito!");
        location.reload(); 
    } catch (err) {
        alert("❌ Error: " + err.message);
    } finally {
        btnRegistrar.disabled = false;
        btnRegistrar.innerText = "REGISTRAR ENTRADA";
    }
}

async function cargarDatos() {
    try {
        const { data, error } = await _supabase.from('registros_acceso').select('*').order('fecha_hora', { ascending: false });
        if (data) {
            const contenedor = document.getElementById('lista-accesos');
            contenedor.innerHTML = data.map(reg => `
                <div class="registro-card">
                    <h4>👤 ${reg.nombre_visitante}</h4>
                    <p>🆔 CI: ${reg.cedula} | 🚗 Placa: ${reg.placa_vehiculo || 'N/A'}</p>
                    <p>📍 Destino: ${reg.destino}</p>
                    <div class="card-footer">🛡️ Guardia: ${reg.agente_guardia}</div>
                </div>
            `).join('');
        }
    } catch (e) { console.error(e); }
}

btnRegistrar.onclick = registrarEntrada;
window.onload = cargarDatos;
