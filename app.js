// Configuración de la conexión a SafeGuard Pro
const supabaseUrl = 'https://cdnpgptmstzzrmowmoke.supabase.co';
const supabaseKey = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbnBncHRtc3R6enJtb3dtb2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg2MjYsImV4cCI6MjA5MDE1NDYyNn0.AjCxNqRkBUVlfRVjUJX_DTSJ4IUredKgGUq5py3QQ_4';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Elementos de la interfaz
const btnRegistrar = document.getElementById('btn-registrar');
const listaAccesos = document.getElementById('lista-accesos');

// Función para guardar en la base de datos
async function registrarEntrada() {
    const agente = document.getElementById('agente-nombre').value;
    const nombre = document.getElementById('visitante-nombre').value;
    const cedula = document.getElementById('visitante-cedula').value;
    const placa = document.getElementById('visitante-placa').value;
    const destino = document.getElementById('visitante-destino').value;
    const motivo = document.getElementById('visitante-motivo').value;

    if (!nombre || !cedula || !destino) {
        alert("⚠️ Error: Nombre, Cédula y Destino son obligatorios");
        return;
    }

    const { data, error } = await _supabase
        .from('registros_acceso')
        .insert([
            { 
                nombre_visitante: nombre, 
                cedula: cedula, 
                placa_vehiculo: placa, 
                destino: destino, 
                motivo: motivo,
                agente_guardia: agente 
            }
        ]);

    if (error) {
        console.error("Error:", error);
        alert("❌ Error al guardar en la base de datos");
    } else {
        alert("✅ Registro guardado exitosamente");
        limpiarFormulario();
        cargarRegistros();
    }
}

// Función para limpiar los campos
function limpiarFormulario() {
    document.getElementById('visitante-nombre').value = "";
    document.getElementById('visitante-cedula').value = "";
    document.getElementById('visitante-placa').value = "";
    document.getElementById('visitante-destino').value = "";
    document.getElementById('visitante-motivo').value = "";
}

// Función para mostrar los datos en tiempo real
async function cargarRegistros() {
    const { data, error } = await _supabase
        .from('registros_acceso')
        .select('*')
        .order('fecha_hora', { ascending: false });

    if (data) {
        listaAccesos.innerHTML = "";
        data.forEach(reg => {
            const fecha = new Date(reg.fecha_hora).toLocaleString();
            listaAccesos.innerHTML += `
                <div class="registro-card">
                    <h4>👤 ${reg.nombre_visitante}</h4>
                    <p>🆔 CI: ${reg.cedula} | 🚗 Placa: ${reg.placa_vehiculo || 'N/A'}</p>
                    <p>📍 Destino: ${reg.destino} | 📄 Motivo: ${reg.motivo}</p>
                    <div class="meta-info">
                        🕒 ${fecha} | 🛡️ Guardia: ${reg.agente_guardia}
                    </div>
                </div>
            `;
        });
    }
}

// Iniciar eventos
btnRegistrar.onclick = registrarEntrada;
window.onload = cargarRegistros;
