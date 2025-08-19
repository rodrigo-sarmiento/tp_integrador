/**
 *  * app.js
 *
 * Este archivo contiene la lógica de frontend para interactuar con una API de estudiantes,
 * carreras y categorías. Incluye funciones para registrar, obtener y eliminar datos,
 * así como para poblar y manejar la interfaz de usuario.
 */

// --- 1. Configuración Inicial ---

// URLs base de las APIs. Es buena práctica definirlas como constantes
// para facilitar cambios futuros y mejorar la legibilidad.
const API_STUDENTS_URL = "http://localhost:5001/api/students";
const API_CAREERS_URL = "http://localhost:5001/api/careers";
const API_CATEGORIES_URL = "http://localhost:5001/api/categories";

// Clave de API para autenticación. En un entorno de producción, esta clave
// no debería estar expuesta directamente en el código del frontend por seguridad.
const API_KEY = "12345ABCDEF";

// Cabeceras (headers) comunes para todas las peticiones a la API.
// Incluyen el tipo de contenido y la autorización (Bearer Token).
const headers = {
    "Content-Type": "application/json", // Indica que el cuerpo de la petición es JSON.
    "Authorization": `Bearer ${API_KEY}` // Token de autenticación.
};

// --- 2. Servicios API (Funciones que interactúan con el Backend) ---
// Estas funciones son responsables de realizar las peticiones HTTP (fetch) a la API.
// Todas son 'async' y retornan 'Promesas' que resuelven con la respuesta parseada a JSON.

/**
 * Registra un nuevo estudiante en la API.
 * @param {string} name - Nombre del estudiante.
 * @param {string} lastName - Apellido del estudiante.
 * @param {string} mail - Correo electrónico del estudiante.
 * @param {string} cel - Número de celular del estudiante.
 * @param {string} career - Carrera a la que se inscribe el estudiante.
 * @returns {Promise<Object>} La respuesta JSON de la API.
 */
async function registerStudentService(name, lastName, mail, cel, career) {
    const response = await fetch(API_STUDENTS_URL, {
        method: "POST", // Método HTTP para crear un recurso.
        headers,         // Usa las cabeceras comunes definidas.
        body: JSON.stringify({ name, lastName, mail, cel, career }) // Convierte el objeto a JSON para el cuerpo.
    });
    return response.json(); // Parsea la respuesta a JSON.
}

/**
 * Obtiene los detalles de un estudiante por su ID.
 * @param {string} id - ID del estudiante a buscar.
 * @returns {Promise<Object>} La respuesta JSON de la API con los datos del estudiante.
 */
async function getStudentByIdService(id) {
    const response = await fetch(`${API_STUDENTS_URL}/${id}`, {
        method: "GET", // Método HTTP para obtener un recurso.
        headers          // Usa las cabeceras comunes.
    });
    return response.json();
}

/**
 * Obtiene una lista de estudiantes filtrados por carrera.
 * @param {string} career - Nombre de la carrera para filtrar.
 * @returns {Promise<Array<Object>>} La respuesta JSON de la API con la lista de estudiantes.
 */
async function getStudentsByCareerService(career) {
    const response = await fetch(`${API_STUDENTS_URL}?career=${career}`, {
        method: "GET",
        headers
    });
    return response.json();
}

/**
 * Elimina un estudiante por su ID.
 * @param {string} id - ID del estudiante a eliminar.
 * @returns {Promise<Object>} La respuesta JSON de la API.
 */
async function deleteStudentService(id) {
    const response = await fetch(`${API_STUDENTS_URL}/${id}`, {
        method: "DELETE",
        headers
    });
    return response.json(); // <-- Esto es lo correcto en frontend
}

/**
 * Registra una nueva carrera en la API.
 * @param {string} code - Código único de la carrera.
 * @param {string} type - Tipo de carrera (ej. "Grado", "Posgrado").
 * @param {string} category - Categoría a la que pertenece la carrera.
 * @param {string} name - Nombre completo de la carrera.
 * @returns {Promise<Object>} La respuesta JSON de la API.
 */
async function registerCareerService(code, type, category, name) {
    const response = await fetch(API_CAREERS_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ code, type, category, name })
    });
    return response.json();
}

// --- 3. Manejadores de Eventos de UI (Funciones que interactúan con el DOM) ---
// Estas funciones se encargan de leer los valores de los formularios,
// realizar validaciones básicas, llamar a los servicios API y actualizar la interfaz.

/**
 * Maneja el proceso de registro de una carrera desde la interfaz de usuario.
 * Obtiene los datos del formulario, valida y llama a `registerCareerService`.
 * Muestra alertas (usando SweetAlert2) según el resultado de la operación.
 */
async function registerCareer() {
    // Obtiene los valores de los campos del formulario, eliminando espacios en blanco.
    const code = document.getElementById('careerCode').value.trim();
    const type = document.getElementById('careerType').value.trim();
    const category = document.getElementById('careerCategory').value.trim();
    const name = document.getElementById('careerName').value.trim();
    const resultContainer = document.getElementById('careerRegisterResult'); // Contenedor para mostrar mensajes.

    // Valida que todos los campos estén completos.
    if (!code || !type || !category || !name) {
        Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor completá todos los campos para el registro.",
            footer: '<a href="#">¿Necesitás ayuda?</a>'
        });
        return; // Detiene la ejecución si hay campos vacíos.
    }

    try {
        // Llama al servicio para registrar la carrera.
        const result = await registerCareerService(code, type, category, name);

        // Muestra una alerta de éxito.
        Swal.fire({
            title: "¡Registro exitoso!",
            text: "La carrera fue registrada correctamente.",
            icon: "success"
        });

        // Limpia los campos del formulario después de un registro exitoso.
        document.getElementById('careerCode').value = '';
        document.getElementById('careerType').value = '';
        document.getElementById('careerCategory').value = '';
        document.getElementById('careerName').value = '';
        resultContainer.textContent = ""; // Limpia cualquier mensaje anterior.

    } catch (error) {
        // Captura y maneja errores durante el registro.
        console.error("Error al registrar carrera:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al registrar la carrera."
        });
        resultContainer.textContent = "Error al registrar la carrera.";
    }
}

/**
 * Maneja el proceso de registro de una categoría desde la interfaz de usuario.
 * Obtiene el nombre de la categoría, valida y realiza la petición POST a la API.
 * Muestra alertas (usando SweetAlert2) según el resultado, incluyendo manejo de conflictos (409).
 */
async function registerCategory() {
    // Usa el id correcto del input
    const name = document.getElementById('categoryName').value.trim();
    const resultContainer = document.getElementById('categoryRegisterResult');

    if (!name) {
        Swal.fire({
            icon: "error",
            title: "Campo incompleto",
            text: "Por favor completá el nombre de la categoría.",
        });
        return;
    }

    try {
        const response = await fetch(API_CATEGORIES_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: "¡Registro exitoso!",
                text: "La categoría fue registrada correctamente.",
                icon: "success"
            });
            resultContainer.textContent = JSON.stringify(data, null, 2);
            document.getElementById('categoryName').value = "";
        } else if (response.status === 409) {
            Swal.fire({
                icon: "error",
                title: "Categoría existente",
                text: data.error || "Ya existe una categoría con ese nombre."
            });
            resultContainer.textContent = data.error || "Ya existe una categoría con ese nombre.";
        } else {
            Swal.fire({
                icon: "error",
                title: "Error al registrar",
                text: data.error || "Ocurrió un error al registrar la categoría."
            });
            resultContainer.textContent = data.error || "Ocurrió un error al registrar la categoría.";
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor."
        });
        resultContainer.textContent = "Error de conexión.";
    }
}


/**
 * Maneja el registro de un estudiante desde el formulario.
 * Valida los campos de entrada, llama al servicio de registro de estudiantes
 * y muestra alertas informativas con SweetAlert2.
 */
async function registerStudent() {
    // Obtiene los valores de los campos del formulario y los limpia.
    const name = document.getElementById('registerName').value.trim();
    const lastName = document.getElementById('registerLastName').value.trim();
    const mail = document.getElementById('registerMail').value.trim();
    const cel = document.getElementById('registerCel').value.trim();
    const careerSelect = document.getElementById('registerCareer');
    const career = careerSelect.value.trim();
    // Obtiene el texto de la opción seleccionada para mostrar en el mensaje de éxito.
    const careerText = careerSelect.options[careerSelect.selectedIndex].text;
    const resultContainer = document.getElementById('registerResult');

    // Expresiones regulares para validación de formato.
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/; // Mínimo 2 letras, incluye acentos y ñ.
    const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   // Formato de correo electrónico básico.
    const celRegex = /^\d+$/;                         // Solo dígitos para el celular.

    // Validaciones completas: campos no vacíos y cumplen con el formato.
    if (!name || !lastName || !mail || !cel || !career ||
        !nameRegex.test(name) || !nameRegex.test(lastName) ||
        !mailRegex.test(mail) || !celRegex.test(cel)) {

        Swal.fire({
            icon: "error",
            title: "Campos inválidos o incompletos",
            html: "Revisá los datos: nombre, apellido, mail y celular.",
            footer: '<a href="#">¿Necesitás ayuda?</a>'
        });
        return; // Detiene la ejecución.
    }

    try {
        // Llama al servicio para registrar al estudiante.
        const result = await registerStudentService(name, lastName, mail, cel, career);

        // Muestra alerta de éxito.
        Swal.fire({
            title: "¡Felicitaciones!",
            html: `Estás registrado en la carrera: <strong>${careerText}</strong>`,
            icon: "success"
        });

        // Limpia los campos del formulario.
        document.getElementById('registerName').value = '';
        document.getElementById('registerLastName').value = '';
        document.getElementById('registerMail').value = '';
        document.getElementById('registerCel').value = '';
        document.getElementById('registerCareer').value = ''; // Resetea el select.
        // No es estrictamente necesario limpiar resultContainer aquí si el SweetAlert es el principal feedback.
    } catch (error) {
        // Manejo de errores durante el proceso de registro.
        console.error("Error registering student:", error);
        // Podrías usar SweetAlert aquí también para una experiencia consistente.
        resultContainer.textContent = "Error al registrar al estudiante.";
    }
}

/**
 * Obtiene y muestra los detalles de un estudiante por su ID.
 * Lee el ID del campo de entrada y usa `getStudentByIdService`.
 */
async function getStudentById() {
    const id = document.getElementById('studentId').value.trim();

    // Valida que se haya ingresado un ID.
    if (!id) {
        Swal.fire({
            icon: "warning",
            title: "Falta el ID",
            html: "Por favor ingresa un ID de estudiante."
        });
        return;
    }

    try {
        const student = await getStudentByIdService(id);
        const resultContainer = document.getElementById('getResult');

        // Verifica si la API devolvió un error (ej. estudiante no encontrado).
        if (student.error) {
            resultContainer.textContent = student.error;
            // Considera usar SweetAlert aquí también.
            Swal.fire({
                icon: "info",
                title: "Estudiante no encontrado",
                text: student.error
            });
        } else {
            // Muestra los datos del estudiante en el contenedor.
            resultContainer.innerHTML = `
                <strong>ID:</strong> ${student.id}<br>
                <strong>Name:</strong> ${student.name}<br>
                <strong>Career:</strong> ${student.career}
            `;
        }
    } catch (error) {
        console.error("Error fetching student:", error);
        // Manejo de errores de conexión o del servidor.
        document.getElementById('getResult').textContent = "Failed to fetch student.";
        Swal.fire({
            icon: "error",
            title: "Error al buscar",
            text: "No se pudo obtener el estudiante."
        });
    }
}

/**
 * Obtiene y muestra una lista de estudiantes filtrados por carrera.
 * Lee el nombre de la carrera del campo de entrada y usa `getStudentsByCareerService`.
 */
async function getStudentsByCareer() {
    const career = document.getElementById('careerFilter').value.trim();

    // Valida que se haya ingresado una carrera.
    if (!career) {
        Swal.fire({
            icon: "warning",
            title: "Falta la carrera",
            text: "Por favor ingresa una carrera para filtrar."
        });
        return;
    }

    try {
        const students = await getStudentsByCareerService(career);
        const resultContainer = document.getElementById('careerResult');

        if (students.length === 0) {
            resultContainer.textContent = "No se encontraron estudiantes para esa carrera.";
            Swal.fire({
                icon: "info",
                title: "Sin resultados",
                text: "No se encontraron estudiantes para la carrera especificada."
            });
            return;
        }

        // Limpia cualquier resultado anterior en el contenedor.
        resultContainer.innerHTML = '';

        // Itera sobre la lista de estudiantes y crea elementos HTML para cada uno.
        students.forEach(student => {
            const studentDiv = document.createElement('div');
            studentDiv.classList.add('student-card'); // Agrega una clase para estilizar.
            studentDiv.innerHTML = `
                <strong>ID:</strong> ${student.id}<br>
                <strong>Name:</strong> ${student.name}<br>
                <strong>Career:</strong> ${student.career}
            `;
            resultContainer.appendChild(studentDiv);

            // Agrega un separador visual entre cada tarjeta de estudiante.
            const hr = document.createElement('hr');
            resultContainer.appendChild(hr);
        });

    } catch (error) {
        console.error("Error fetching students:", error);
        document.getElementById('careerResult').textContent = "Failed to fetch students.";
        Swal.fire({
            icon: "error",
            title: "Error al buscar",
            text: "No se pudieron obtener los estudiantes por carrera."
        });
    }
}

/**
 * Carga opciones de carrera en un elemento <select>.
 * @param {Array<string>} careersArray - Un array de nombres de carreras.
 */
function loadCareerOptions(careersArray) {
    const careerSelect = document.getElementById('registerCareer');

    // Limpia las opciones existentes y agrega una opción por defecto.
    careerSelect.innerHTML = '<option value="" disabled selected>Selecciona tu carrera*</option>';

    // Agrega cada carrera del array como una nueva opción.
    careersArray.forEach(career => {
        const option = document.createElement('option');
        option.value = career;       // El valor de la opción será el nombre de la carrera.
        option.textContent = career; // El texto visible será el nombre de la carrera.
        careerSelect.appendChild(option);
    });
}

// NOTA EDUCATIVA:
// Alternativa .map() para transformar un array en un nuevo array de resultados HTML.
// El método .map() es ideal cuando quieres "transformar" y "devolver" un nuevo array.
// Ejemplo de cómo se podría haber usado .map() en `getStudentsByCareer` para generar el HTML:
/*
resultContainer.innerHTML = students.map(student =>
    `<div class="student-card">
        <strong>ID:</strong> ${student.id}<br>
        <strong>Name:</strong> ${student.name}<br>
        <strong>Career:</strong> ${student.career}
    </div>`
).join('<hr>'); // Une todos los strings HTML con una línea horizontal entre ellos.
*/
// En cambio, .forEach() simplemente recorre el array y ejecuta una acción por cada elemento,
// sin devolver un nuevo array. Es más fácil de entender cuando solo se necesita
// "hacer cosas" (como agregar elementos al DOM) por cada ítem.


/**
 * Maneja la eliminación de un estudiante por su ID.
 * Lee el ID del campo de entrada y usa `deleteStudentService`.
 */
async function deleteStudent() {
    const id = document.getElementById('deleteId').value.trim();

    if (!id) {
        Swal.fire({
            icon: "warning",
            title: "Falta el ID",
            text: "Por favor ingresa un ID de estudiante para eliminar."
        });
        return;
    }

    try {
        const result = await deleteStudentService(id);
        const deleteResultContainer = document.getElementById('deleteResult');

        if (!result.error) {
            Swal.fire({
                icon: "success",
                title: "Eliminado",
                html: "El estudiante fue eliminado correctamente."
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "No eliminado",
                html: result.error || "No se pudo eliminar el estudiante."
            });
        }
        deleteResultContainer.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        console.error("Error deleting student:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            html: "Error al eliminar el estudiante."
        });
        document.getElementById('deleteResult').textContent = "Failed to delete student.";
    }
}

// --- 4. Lógica de Inicialización (Se ejecuta cuando la página carga) ---
// Estas funciones se ejecutan automáticamente una vez que el DOM está completamente cargado.

/**
 * Listener que se activa cuando todo el contenido del DOM ha sido cargado.
 * Se encarga de:
 * 1. Poblar una tabla de estudiantes si existe en la página.
 * 2. Poblar un campo <select> de categorías si existe en la página.
 * 3. (Implicitamente, si hay un <select> de carreras) Poblar las opciones de carrera.
 */
document.addEventListener("DOMContentLoaded", async function() {
    // --- Poblar la tabla de estudiantes ---
    const studentTableBody = document.querySelector("#tabla-estudiantes tbody");
    // Solo intenta poblar la tabla si el elemento 'tbody' existe en el DOM.
    if (studentTableBody) {
        try {
            // Realiza la petición para obtener todos los estudiantes.
            const response = await fetch(API_STUDENTS_URL, { headers });
            const students = await response.json();

            studentTableBody.innerHTML = ""; // Limpia la tabla antes de agregar nuevos datos.

            // Itera sobre cada estudiante y crea una nueva fila en la tabla.
            students.forEach(student => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${student.id || ""}</td>
                    <td>${student.name || ""}</td>
                    <td>${student.lastName || ""}</td>
                    <td>${student.mail || ""}</td>
                    <td>${student.cel || ""}</td>
                    <td>${student.career || ""}</td>
                `;
                studentTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("No se pudieron cargar los estudiantes en la tabla:", error);
            // Podrías mostrar un mensaje de error en la UI aquí.
        }
    }

    // --- Poblar el select de categorías para el registro de carreras ---
    const careerCategorySelect = document.getElementById('careerCategory');
    // Solo intenta poblar el select si el elemento existe en el DOM.
    if (careerCategorySelect) {
        try {
            // Realiza la petición para obtener todas las categorías.
            const response = await fetch(API_CATEGORIES_URL, {
                // Se repiten las cabeceras aquí. Es mejor usar la constante 'headers' global.
                headers: {
                    "Authorization": "Bearer 12345ABCDEF"
                }
            });
            const categories = await response.json();

            // Limpia el select y añade la opción por defecto.
            careerCategorySelect.innerHTML = '<option value="" disabled selected>Selecciona una categoría*</option>';

            // Agrega cada categoría como una opción al select.
            categories.forEach(category => {
                careerCategorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`;
            });
        } catch (error) {
            console.error("No se pudieron cargar las categorías:", error);
            // Podrías mostrar un mensaje de error en la UI aquí.
        }
    }

    // --- Poblar el select de carreras para el registro de estudiantes ---
    // Esta parte asume que hay un endpoint para obtener todas las carreras,
    // similar a cómo se obtienen estudiantes y categorías.
    // Si no hay un servicio para listar todas las carreras, esta sección necesitará ajuste.
    const registerCareerSelect = document.getElementById('registerCareer');
    if (registerCareerSelect) {
        try {
            const response = await fetch(API_CAREERS_URL, { headers });
            const careers = await response.json(); // Asume que devuelve un array de objetos con `name`.
            // Extraer solo los nombres de las carreras para la función `loadCareerOptions`.
            const careerNames = careers.map(career => career.name);
            loadCareerOptions(careerNames);
        } catch (error) {
            console.error("No se pudieron cargar las carreras para el select:", error);
            // Podrías mostrar un mensaje de error en la UI aquí.
        }
    }
});