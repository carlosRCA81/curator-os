const SB_URL = 'https://cdnpgptmstzzrmowmoke.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbnBncHRtc3R6enJtb3dtb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg2MjYsImV4cCI6MjA5MDE1NDYyNn0.AjCxNqRkBUVlfRVjUJX_DTSJ4IUredKgGUq5py3QQ_4';

const _supabase = supabase.createClient(SB_URL, SB_KEY);

// --- FUNCIÓN: AUTOCOMPLETAR POR CÉDULA ---
document.getElementById('visitante-cedula').addEventListener('blur', async (e) => {
    const cedula = e.target.value;
    if (cedula.length > 4) {
        const { data } = await _supabase
            .from('registros_acceso')
            .select('nombre_visitante, placa_vehiculo')
            .eq('cedula', cedula)
            .limit(1);
        
        if (data && data.length > 0) {
            document.getElementById('visitante-nombre').value = data[0].nombre_visitante;
            document.getElementById('visitante-placa').value = data[0].placa_vehiculo || '';
            console.log("Visitante recurrente encontrado");
        }
    }
});

// --- FUNCIÓN: REGISTRAR ENTRADA ---
async function registrarEntrada() {
    const btn = document.getElementById('btn-registrar');
    const registro = {
        nombre_visitante: document.getElementById('visitante-nombre').value,
        cedula: document.getElementById('visitante-cedula').value,
        placa_vehiculo: document.getElementById('visitante-placa').value,
        destino: document.getElementById('visitante-destino').value,
        motivo: document.getElementById('visitante-motivo').value,
        agente_guardia: document.getElementById('agente-nombre').value
    };

    if (!registro.nombre_visitante || !registro.cedula) {
        alert("Falta Nombre o Cédula"); return;
    }

    btn.disabled = true;
    try {
        const { error } = await _supabase.from('registros_acceso').insert([registro]);
        if (error) throw error;
        alert("✅ Registrado");
        location.reload();
    } catch (err) { alert(err.message); }
    finally { btn.disabled = false; }
}

// --- FUNCIÓN: MARCAR SALIDA ---
async function marcarSalida(id) {
    const horaSalida = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    if(confirm(`¿Confirmar salida a las ${horaSalida}?`)) {
        // Por ahora lo guardaremos en una nota, luego podemos crear un campo en la tabla
        alert("Salida registrada correctamente");
        // Aquí actualizaremos la interfaz
    }
}

// --- FUNCIÓN: CARGAR Y MOSTRAR ---
async function cargarDatos() {
    const { data } = await _supabase.from('registros_acceso').select('*').order('fecha_hora', { ascending: false });
    const contenedor = document.getElementById('lista-accesos');
    contenedor.innerHTML = "";

    if (data) {
        data.forEach(reg => {
            const hora = new Date(reg.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            contenedor.innerHTML += `
                <div class="registro-card">
                    <div class="card-header">
                        <strong>👤 ${reg.nombre_visitante}</strong>
                        <span class="badge-time">${hora}</span>
                    </div>
                    <p>🆔 ${reg.cedula} | 🚗 ${reg.placa_vehiculo || 'S/P'}</p>
                    <p>📍 Destino: ${reg.destino}</p>
                    <button onclick="marcarSalida(${reg.id})" class="btn-salida">MARCAR SALIDA</button>
                </div>
            `;
        });
    }
}

document.getElementById('btn-registrar').onclick = registrarEntrada;
window.onload = cargarDatos;
                     
