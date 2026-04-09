const supabaseUrl = 'https://jvbsalpnycnokynpsexw.supabase.co';
const supabaseKey = 'sb_publisible_hurtMxONK9ce5XNemgTYFg_4TzbkkVe';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DICCIONARIO COMPLETO (Base de datos interna)
const animales = {
    "00": "Ballena", "0": "Delfín", "1": "Carnero", "2": "Toro", "3": "Ciempiés",
    "4": "Alacrán", "5": "León", "6": "Rana", "7": "Perico", "8": "Ratón",
    "9": "Águila", "10": "Tigre", "11": "Gato", "12": "Caballo", "13": "Mono",
    "14": "Paloma", "15": "Zorro", "16": "Oso", "17": "Pavo", "18": "Burro",
    "19": "Chivo", "20": "Cochino", "21": "Gallo", "22": "Camello", "23": "Cebra",
    "24": "Iguana", "25": "Gallina", "26": "Vaca", "27": "Perro", "28": "Zamuro",
    "29": "Elefante", "30": "Caimán", "31": "Lapa", "32": "Ardilla", "33": "Pescado",
    "34": "Venado", "35": "Jirafa", "36": "Culebra", "37": "Tortuga", "38": "Mono",
    "39": "Zorro", "40": "Avispa", "41": "Canguro", "42": "Tucán", "43": "Mariposa",
    "44": "Chigüire", "45": "Garza", "46": "Puma", "47": "Pavo Real", "48": "Puercoespín",
    "49": "Pereza", "50": "Canario", "51": "Pelícano", "52": "Pulpo", "53": "Caracol",
    "54": "Grillo", "55": "Hormiga", "56": "Tiburón", "57": "Puercoespín", "58": "Gato",
    "59": "Chivo", "60": "Hipopótamo", "61": "Gacela", "62": "Gorila", "63": "Mapache",
    "64": "Camaleón", "65": "Rinoceronte", "66": "Oso", "67": "Búho", "68": "Tortuga",
    "69": "Pájaro", "70": "Pájaro", "71": "Pájaro", "72": "Pájaro", "73": "Hipopótamo",
    "74": "Turpial", "75": "Guácharo"
};

function verificarAcceso() {
    const p = prompt("Sistema Blindado CRCA. Ingrese Clave:");
    if (p !== "7575") { document.body.innerHTML = "<h1>ACCESO DENEGADO</h1>"; }
    else { cargarDatos(); }
}

async function guardarDato() {
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const num = document.getElementById('num').value;

    if (!animales[num]) { alert("Número no válido"); return; }

    const { error } = await _supabase.from('historial_resultados').insert([
        { fecha: fecha, hora: hora, numero: num, nombre_animal: animales[num] }
    ]);

    if (error) alert("Error de conexión");
    else { 
        document.getElementById('status-msg').innerText = "Guardado con éxito.";
        cargarDatos(); 
    }
}

async function cargarDatos() {
    const { data } = await _supabase.from('historial_resultados').select('*').order('created_at', { ascending: false });
    
    if (data) {
        // Lógica de Historial
        const lista = document.getElementById('lista-historial');
        lista.innerHTML = data.slice(0, 5).map(i => `
            <div class="history-item">
                <span><b>${i.hora}</b> - ${i.numero} (${i.nombre_animal})</span>
                <span>${i.fecha}</span>
            </div>
        `).join('');

        // Contador del 75
        const c75 = data.filter(i => i.numero === "75").length;
        document.getElementById('count-75').innerText = c75 + " veces";
    }
}
