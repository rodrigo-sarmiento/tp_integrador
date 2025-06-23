const API_STUDENTS_URL = "http://localhost:5001/api/students";
const API_CAREERS_URL = "http://localhost:5001/api/careers";
const API_CATEGORIES_URL = "http://localhost:5001/api/categories";
const API_KEY = "12345ABCDEF";

// Headers comunes para todas las peticiones
const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`
};

// Funciones de servicio que retornan Promesas
async function registerStudentService(name, lastName, mail, cel, career) {
    const response = await fetch(API_STUDENTS_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, lastName, mail, cel, career })
    });
    return response.json();
}

async function getStudentByIdService(id) {
    const response = await fetch(`${API_STUDENTS_URL}/${id}`, {
        method: "GET",
        headers
    });
    return response.json();
}

async function getStudentsByCareerService(career) {
    const response = await fetch(`${API_STUDENTS_URL}?career=${career}`, {
        method: "GET",
        headers
    });
    return response.json();
}

async function deleteStudentService(id) {
    const response = await fetch(`${API_STUDENTS_URL}/${id}`, {
        method: "DELETE",
        headers
    });
    return response.json();
}
// Agrega aquí carrera:
async function registerCareerService(code, type, category, name) {
    const response = await fetch(API_CAREERS_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ code, type, category, name })
    });
    return response.json();
}
async function registerCareer() {
    const code = document.getElementById('careerCode').value.trim();
    const type = document.getElementById('careerType').value.trim();
    const category = document.getElementById('careerCategory').value.trim();
    const name = document.getElementById('careerName').value.trim();
    const resultContainer = document.getElementById('careerRegisterResult');

    if (!code || !type || !category || !name) {
        Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor completá todos los campos para el registro.",
            footer: '<a href="#">¿Necesitás ayuda?</a>'
        });
        return;
    }
    try {
        const result = await registerCareerService(code, type, category, name);

        Swal.fire({
            title: "¡Registro exitoso!",
            text: "La carrera fue registrada correctamente.",
            icon: "success"
        });

        // Limpiar campos
        document.getElementById('careerCode').value = '';
        document.getElementById('careerType').value = '';
        document.getElementById('careerCategory').value = '';
        document.getElementById('careerName').value = '';
        resultContainer.textContent = "";
    } catch (error) {
        console.error("Error al registrar carrera:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al registrar la carrera."
        });
        resultContainer.textContent = "Error al registrar la carrera.";
    }
}



// Funciones que manejan eventos de la interfaz

async function registerStudent() {
    const name = document.getElementById('registerName').value.trim();
    const lastName = document.getElementById('registerLastName').value.trim();
    const mail = document.getElementById('registerMail').value.trim();
    const cel = document.getElementById('registerCel').value.trim();
    const careerSelect = document.getElementById('registerCareer');
    const career = careerSelect.value.trim();
    const careerText = careerSelect.options[careerSelect.selectedIndex].text;
    const resultContainer = document.getElementById('registerResult');

    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/;
    const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const celRegex = /^\d+$/;

    // Validaciones completas
    if (!name || !lastName || !mail || !cel || !career ||
        !nameRegex.test(name) || !nameRegex.test(lastName) ||
        !mailRegex.test(mail) || !celRegex.test(cel)) {
        
        Swal.fire({
            icon: "error",
            title: "Campos inválidos o incompletos",
            html: "Revisá los datos: nombre, apellido, mail y celular.",
            footer: '<a href="#">¿Necesitás ayuda?</a>'
        });
        return;
    }

    try {
        const result = await registerStudentService(name, lastName, mail, cel, career);

        Swal.fire({
            title: "¡Felicitaciones!",
            html: `Estás registrado en la carrera: <strong>${careerText}</strong>`,
            icon: "success"
        });

        // Limpiar campos
        document.getElementById('registerName').value = '';
        document.getElementById('registerLastName').value = '';
        document.getElementById('registerMail').value = '';
        document.getElementById('registerCel').value = '';
        document.getElementById('registerCareer').value = '';
    } catch (error) {
        console.error("Error registering student:", error);
        resultContainer.textContent = "Error al registrar al estudiante.";
    }
}




async function getStudentById() {
    const id = document.getElementById('studentId').value.trim();

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
        if (student.error) {
            resultContainer.textContent = student.error;
        } else {
            resultContainer.innerHTML = `
                <strong>ID:</strong> ${student.id}<br>
                <strong>Name:</strong> ${student.name}<br>
                <strong>Career:</strong> ${student.career}
            `;
        }
    } catch (error) {
        console.error("Error fetching student:", error);
        document.getElementById('getResult').textContent = "Failed to fetch student.";
    }
}

async function getStudentsByCareer() {
    const career = document.getElementById('careerFilter').value.trim();

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
            resultContainer.textContent = "No students found for that career.";
            return;
        }

        // Limpiar resultados anteriores
        resultContainer.innerHTML = '';

        // Usamos forEach para recorrer y construir el HTML manualmente
        students.forEach(student => {
            const studentDiv = document.createElement('div');
            studentDiv.classList.add('student-card');
            studentDiv.innerHTML = `
                <strong>ID:</strong> ${student.id}<br>
                <strong>Name:</strong> ${student.name}<br>
                <strong>Career:</strong> ${student.career}
            `;
            resultContainer.appendChild(studentDiv);

            // Separador entre tarjetas (opcional)
            const hr = document.createElement('hr');
            resultContainer.appendChild(hr);
        });

    } catch (error) {
        console.error("Error fetching students:", error);
        document.getElementById('careerResult').textContent = "Failed to fetch students.";
    }
}
//La función que carga las opciones
  function loadCareerOptions(careersArray) {
    const careerSelect = document.getElementById('registerCareer');

    // Limpiar el select y dejar solo la opción inicial
  careerSelect.innerHTML = '<option value="" disabled selected>Selecciona tu carrera*</option>';

  careersArray.forEach(career => {
    const option = document.createElement('option');
    option.value = career;
    option.textContent = career;
    careerSelect.appendChild(option);
  });
 }

// NOTA EDUCATIVA:
// Alternativa .map() para transformar un array en un nuevo array de resultados HTML.
// El método .map() es ideal cuando quieres "transformar" y "devolver" un nuevo array.
// Ejemplo:
// const htmlElements = students.map(student => `<div>${student.name}</div>`).join('');

// En cambio, .forEach() simplemente recorre el array y ejecuta una acción por cada elemento.
// Es más fácil de entende, porque no devuelve nada, solo "hace cosas".
// Aquí usamos forEach para ir creando y agregando manualmente los elementos al HTML.
// resultContainer.innerHTML = students.map(student => 
//     <div class="student-card">
//         <strong>ID:</strong> ${student.id}<br>
//         <strong>Name:</strong> ${student.name}<br>
//         <strong>Career:</strong> ${student.career}
//     </div>
// ).join('<hr>');

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
        if (result.success) {
            Swal.fire({
                icon: "success",
                title: "Eliminado",
                html: "El estudiante fue eliminado correctamente."
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "No eliminado",
                html: result.error || "No se pudo eliminar el estudiante."
            });
        }
        document.getElementById('deleteResult').textContent = JSON.stringify(result, null, 2);
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
