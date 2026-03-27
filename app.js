// Configuración de conexión (Ya validada con tus capturas)
const SB_URL = 'https://cdnpgptmstzzrmowmoke.supabase.co';
const SB_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbnBncHRtc3R6enJtb3dtb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg2MjYsImV4cCI6MjA5MDE1NDYyNn0.AjCxNqRkBUVlfRVjUJX_DTSJ4IUredKgGUq5py3QQ_4';

const _supabase = supabase.createClient(SB_URL, SB_KEY);

// Función para guardar datos
async function registrarEntrada() {
    const btn = document.getElementById('btn-registrar');
    
    const nuevoRegistro = {
        nombre_visitante: document.getElementById('visitante-nombre').value,
        cedula: document.getElementById('visitante-cedula').value,
        placa_vehiculo: document.getElementById('visitante-placa').value,
        destino: document.getElementById('visitante-destino').value,
        motivo: document.getElementById('visitante-motivo').value,
        agente_guardia: document.getElementById('agente-nombre').value
    };

    if (!nuevoRegistro.nombre_visitante || !nuevoRegistro.cedula) {
        alert("⚠️ Por favor ingresa al menos Nombre y Cédula");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Guardando...";

    try {
        const { error } = await _supabase
            .from('registros_acceso')
            .insert([nuevoRegistro]);

        if (error) throw error;

        alert("✅ Registro guardado con éxito");
        
        // Limpiar campos
        document.getElementById('visitante-nombre').value = "";
        document.getElementById('visitante-cedula').value = "";
        document.getElementById('visitante-placa').value = "";
        document.getElementById('visitante-destino').value = "";
        document.getElementById('visitante-motivo').value = "";
        
        cargarRegistros(); // Actualizar lista

    } catch (err) {
        alert("❌ Error de conexión: " + err.message);
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerText = "REGISTRAR ENTRADA";
    }
}

// Función para leer y mostrar datos
async function cargarRegistros() {
    const lista = document.getElementById('lista-accesos');
    
    try {
        const { data, error } = await _supabase
            .from('registros_acceso')
            .select('*')
            .order('fecha_hora', { ascending: false });

        if (error) throw error;

        lista.innerHTML = "";
        if (data) {
            data.forEach(reg => {
                const hora = new Date(reg.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                lista.innerHTML += `
                    <div class="registro-card">
                        <div class="card-header">
                            <strong>👤 ${reg.nombre_visitante}</strong>
                            <span class="badge-time">${hora}</span>
                        </div>
                        <p>🆔 CI: ${reg.cedula} | 🚗 Placa: ${reg.placa_vehiculo || 'N/A'}</p>
                        <p>📍 Destino: ${reg.destino} | 📄 ${reg.motivo}</p>
                        <div class="card-footer">🛡️ Guardia: ${reg.agente_guardia}</div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error("Error cargando lista:", err);
    }
}

document.getElementById('btn-registrar').addEventListener('click', registrarEntrada);
window.onload = cargarRegistros;
