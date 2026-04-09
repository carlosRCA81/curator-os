// app.js - Inteligencia del Analizador CRCA
async function cargarAnalisis() {
    const { data, error } = await _supabase
        .from('historial_resultados')
        .select('*')
        .order('fecha', { ascending: false });

    if (data) {
        console.log("Estudiando algoritmo...");
        // Aquí insertaremos la lógica para el 70% de aciertos
        // Comparando el elemento (Agua/Tierra/Aire) con la hora del sorteo
        actualizarPantalla(data);
    }
}
