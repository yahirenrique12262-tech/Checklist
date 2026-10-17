document.addEventListener('DOMContentLoaded', () => {
    // 1. Preguntas con lógica positiva
    const preguntas = [
        "1. Existen señalamientos turísticos visibles",
        "2. Las calles de acceso se encuentran en buen estado",
        "3. Hay iluminación adecuada en la zona",
        "4. Existen suficientes botes de basura",
        "5. Los botes de basura se encuentran en buenas condiciones",
        "6. La playa presenta condiciones adecuadas de limpieza",
        "7. No se observan residuos sólidos en la playa",
        "8. Existen baños públicos para los visitantes",
        "9. Los baños están limpios y funcionales",
        "10. Hay áreas de descanso o sombra para turistas",
        "11. Se observan restaurantes o palapas en funcionamiento",
        "12. Los establecimientos muestran buena higiene",
        "13. Existe estacionamiento para visitantes",
        "14. Hay transporte público accesible hacia la zona",
        "15. Se observan elementos de seguridad (policía, salvavidas)",
        "16. Existen señalamientos de prevención o seguridad"
    ];

    // Variables de Estado
    let respuestas = {};
    let observaciones = {};
    let registrosGuardados = [];
    let historialBorrados = [];

    // Referencias al DOM
    const checklistContainer = document.getElementById('checklist-container');
    const inputFecha = document.getElementById('fecha');
    const selectLugar = document.getElementById('lugar');
    const porcentajeTexto = document.getElementById('porcentaje-texto');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const listaGuardados = document.getElementById('lista-guardados');
    
    const btnAgregar = document.getElementById('btn-agregar');
    const btnBorrar = document.getElementById('btn-borrar');
    const btnRehacer = document.getElementById('btn-rehacer');
    const btnExportar = document.getElementById('btn-exportar');

    const modalDetalle = document.getElementById('modal-detalle');
    const closeModal = document.getElementById('close-modal');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalBody = document.getElementById('modal-body');

    // Asignar Fecha Actual por defecto
    const today = new Date().toISOString().split('T')[0];
    inputFecha.value = today;

    // 2. Renderizar Preguntas en la Interfaz
    function renderChecklist() {
        checklistContainer.innerHTML = '';
        preguntas.forEach((preg, idx) => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <div class="question-text">${preg}</div>
                <div class="btn-group">
                    <button class="btn-opt btn-si" data-idx="${idx}">Sí</button>
                    <button class="btn-opt btn-no" data-idx="${idx}">No</button>
                </div>
                <input type="text" class="obs-input" id="obs-${idx}" placeholder="Añadir descripción...">
            `;
            checklistContainer.appendChild(row);
        });

        // Eventos para botones Sí/No
        document.querySelectorAll('.btn-si').forEach(btn => {
            btn.addEventListener('click', (e) => seleccionarOpcion(parseInt(e.target.dataset.idx), 'Si'));
        });
        document.querySelectorAll('.btn-no').forEach(btn => {
            btn.addEventListener('click', (e) => seleccionarOpcion(parseInt(e.target.dataset.idx), 'No'));
        });
    }

    // 3. Manejo de Selección Sí/No
    function seleccionarOpcion(idx, opcion) {
        respuestas[idx] = opcion;

        const row = checklistContainer.children[idx];
        const btnSi = row.querySelector('.btn-si');
        const btnNo = row.querySelector('.btn-no');

        if (opcion === 'Si') {
            btnSi.classList.add('active-si');
            btnSi.innerHTML = '✓ Sí';
            btnNo.classList.remove('active-no');
            btnNo.innerHTML = 'No';
        } else {
            btnNo.classList.add('active-no');
            btnNo.innerHTML = '✗ No';
            btnSi.classList.remove('active-si');
            btnSi.innerHTML = 'Sí';
        }

        actualizarCumplimiento();
    }

    // 4. Calcular Porcentaje de Cumplimiento
    function actualizarCumplimiento() {
        const total = preguntas.length;
        const siCount = Object.values(respuestas).filter(v => v === 'Si').length;
        const porcentaje = total > 0 ? ((siCount / total) * 100).toFixed(1) : 0;

        porcentajeTexto.innerText = `${porcentaje}%`;
        progressBarFill.style.width = `${porcentaje}%`;
    }

    // 5. Agregar Registro a la Lista
    btnAgregar.addEventListener('click', () => {
        if (Object.keys(respuestas).length < preguntas.length) {
            alert('Por favor responda a todas las preguntas de la checklist antes de agregar.');
            return;
        }

        const lugar = selectLugar.value;
        const fecha = inputFecha.value;
        const siCount = Object.values(respuestas).filter(v => v === 'Si').length;
        const porcentaje = ((siCount / preguntas.length) * 100).toFixed(1);

        const registro = {
            "Fecha": fecha,
            "Lugar": lugar,
            "Cumplimiento %": porcentaje
        };

        preguntas.forEach((_, idx) => {
            const num = idx + 1;
            const evalRes = respuestas[idx] || 'N/A';
            const obsText = document.getElementById(`obs-${idx}`).value.trim();

            registro[`P${num}`] = evalRes;
            registro[`Com ${num}`] = obsText ? obsText : 'S/C';
        });

        registrosGuardados.push(registro);
        actualizarUILista();
        limpiarFormulario();
    });

    // 6. Limpiar Formulario
    function limpiarFormulario() {
        respuestas = {};
        renderChecklist();
        actualizarCumplimiento();
    }

    // 7. Actualizar Panel de Guardados en la Derecha
    function actualizarUILista() {
        listaGuardados.innerHTML = '';

        if (registrosGuardados.length === 0) {
            listaGuardados.innerHTML = '<p class="empty-msg">No hay evaluaciones guardadas aún.</p>';
        } else {
            registrosGuardados.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'saved-item-card';
                card.innerHTML = `
                    <div class="saved-item-info">
                        <strong>📍 ${item['Lugar']}</strong>
                        <span>Cumplimiento: ${item['Cumplimiento %']}%</span>
                    </div>
                    <button class="btn btn-ver" data-index="${index}">👁️ Ver más</button>
                `;
                listaGuardados.appendChild(card);
            });

            // Evento Ver Más
            document.querySelectorAll('.btn-ver').forEach(btn => {
                btn.addEventListener('click', (e) => mostrarModalDetalle(parseInt(e.target.dataset.index)));
            });
        }

        // Mostrar / Ocultar botón Rehacer
        if (historialBorrados.length > 0) {
            btnRehacer.classList.remove('hidden');
        } else {
            btnRehacer.classList.add('hidden');
        }
    }

    // 8. Borrar y Rehacer
    btnBorrar.addEventListener('click', () => {
        if (registrosGuardados.length === 0) return;
        const borrado = registrosGuardados.pop();
        historialBorrados.push(borrado);
        actualizarUILista();
    });

    btnRehacer.addEventListener('click', () => {
        if (historialBorrados.length === 0) return;
        const restaurado = historialBorrados.pop();
        registrosGuardados.push(restaurado);
        actualizarUILista();
    });

    // 9. Modal Ver Más
    function mostrarModalDetalle(index) {
        const item = registrosGuardados[index];
        modalTitulo.innerText = `Lugar: ${item['Lugar']} (${item['Cumplimiento %']}%)`;

        let html = '';
        preguntas.forEach((preg, idx) => {
            const num = idx + 1;
            const resp = item[`P${num}`];
            const obs = item[`Com ${num}`];
            const colorClass = resp === 'Si' ? 'text-success' : 'text-danger';

            html += `
                <div style="margin-bottom: 8px;">
                    <strong>• ${preg}:</strong> <span style="color: ${resp === 'Si' ? '#22c55e' : '#ef4444'}; font-weight: bold;">${resp}</span>
                    ${obs !== 'S/C' ? `<div style="font-size: 0.85rem; color: #94a3b8; margin-left: 15px;">Comentario: ${obs}</div>` : ''}
                </div>
            `;
        });

        modalBody.innerHTML = html;
        modalDetalle.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => modalDetalle.classList.add('hidden'));

    // 10. Exportar a Excel (.xlsx)
    btnExportar.addEventListener('click', () => {
        if (registrosGuardados.length === 0) {
            alert('No hay checklists guardadas para exportar.');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(registrosGuardados);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Checklist");

        const fileName = `Checklist_PuertoMadero_${new Date().toISOString().replace(/[:.-]/g, "")}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    });

    // Inicializar la aplicación
    renderChecklist();
});