let allData = [];
let filteredData = [];
let currentPage = 1;
const pageSize = 50;

document.getElementById('file-input').addEventListener('change', handleFile);

function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        allData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        filteredData = [...allData];
        currentPage = 1;
        renderTable();
    };
    reader.readAsArrayBuffer(file);
}

function applyFilters() {
    const claveMas = document.getElementById('clave_cucop_mas').value.toLowerCase();
    const clave = document.getElementById('clave_cucop').value.toLowerCase();
    const tipo = document.getElementById('tipo_contratacion').value.toLowerCase();

    filteredData = allData.filter(row => {
        return (
            (row["CLAVE CUCoP +"]?.toString().toLowerCase().includes(claveMas)) &&
            (row["CLAVE CUCoP"]?.toString().toLowerCase().includes(clave)) &&
            (tipo === "" || row["TIPO DE CONTRATACIÓN"]?.toLowerCase() === tipo)
        );
    });
    currentPage = 1;
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);

    for (const row of pageData) {
        const tr = document.createElement("tr");
        const columns = [
            "CLAVE CUCoP +", "CLAVE CUCoP", "DESCRIPCIÓN", "UNIDAD DE MEDIDA (sugerida)",
            "TIPO DE CONTRATACIÓN", "PARTIDA ESPECÍFICA", "DESC. PARTIDA ESPECÍFICA",
            "PARTIDA GENÉRICA", "DESC. PARTIDA GENÉRICA", "CONCEPTO", "DESC. CONCEPTO",
            "CAPÍTULO", "DESC. CAPÍTULO", "FECHA ALTA CUCOP", "FECHA MODIFICACIÓN CUCOP"
        ];

        for (const col of columns) {
            const td = document.createElement("td");
            td.textContent = row[col] || "";
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }

    document.getElementById("page-info").textContent = `Página ${currentPage} de ${Math.ceil(filteredData.length / pageSize)}`;
}

function changePage(delta) {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    currentPage += delta;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    renderTable();
}
function clearField(fieldId) {
    document.getElementById(fieldId).value = "";
    filterData();
}


function clearAllFields() {
    document.getElementById("clave_cucop_mas").value = "";
    document.getElementById("clave_cucop").value = "";
    document.getElementById("tipo_contratacion").value = "";
}
function sendEmail() {
    let emailInput = document.getElementById("Email");
    let emails = emailInput.value.trim();

    if (!emails) {
        alert("Por favor, ingrese al menos un correo.");
        return;
    }

    let emailList = emails.split(",")
        .map(email => email.trim())
        .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    if (emailList.length === 0) {
        alert("Ningún correo válido ingresado.");
        return;
    }

    let table = document.getElementById("table-body");
    let rows = table.getElementsByTagName("tr");

   
    let contenido = `
        <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th>CLAVE CUCoP +</th>
                    <th>CLAVE CUCoP</th>
                    <th>DESCRIPCIÓN</th>
                    <th>UNIDAD DE MEDIDA (sugerida)</th>
                    <th>TIPO DE CONTRATACIÓN</th>
                    <th>PARTIDA ESPECÍFICA</th>
                    <th>DESC. PARTIDA ESPECÍFICA</th>
                    <th>PARTIDA GENÉRICA</th>
                    <th>DESC. PARTIDA GENÉRICA</th>
                    <th>CONCEPTO</th>
                    <th>DESC. CONCEPTO</th>
                    <th>CAPÍTULO</th>
                    <th>DESC. CAPÍTULO</th>
                    <th>FECHA ALTA CUCOP</th>
                    <th>FECHA MODIFICACIÓN CUCOP</th>
            </tr>
            </thead>
            <tbody>`;

    for (let row of rows) {
        let cells = row.getElementsByTagName("td");
        contenido += "<tr>";
        for (let cell of cells) {
            contenido += `<td style="border: 1px solid #ddd; padding: 8px;">${cell.innerText}</td>`;
        }
        contenido += "</tr>";
    }

    contenido += `</tbody></table>`;

    emailjs.init("irZw3NCdf3mB2o8ml");

    emailList.forEach(email => {
        let toName = email.split("@")[0]; 

        let templateParams = {
            to_email: email,
            to_name: toName,
            html_message: contenido 
        };

        emailjs.send("service_72kt43c", "template_98qwnog", templateParams)
            .then(response => {
                alert(`✅ Correo enviado a: ${email}`);
                console.log(`Correo enviado a: ${email}`, response);
                emailInput.value = ""; 
            })
            .catch(error => console.error(`❌ Error al enviar correo a ${email}:`, error));
    });
}