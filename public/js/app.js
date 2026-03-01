// Core Application Logic & State
document.addEventListener('DOMContentLoaded', () => {
    
    // Auth Check
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    
    if (!token || !userRaw) {
        window.location.href = '/index.html';
        return;
    }

    const user = JSON.parse(userRaw);
    
    // UI Elements Binding
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userLevelDisplay = document.getElementById('userLevelDisplay');
    const navProductos = document.getElementById('navProductos');
    const navUsuarios = document.getElementById('navUsuarios');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // App State
    let currentData = [];
    let currentMode = 'solicitudes'; // 'solicitudes', 'productos', 'usuarios'

    // Init UI
    userNameDisplay.textContent = user.nombre;
    userLevelDisplay.textContent = `Nivel ${user.nivel} - ${user.correo}`;

    // Apply strict access control on frontend (visually only, API secures backend)
    if (user.nivel >= 3) {
        navProductos.classList.remove('hidden');
        navUsuarios.classList.remove('hidden');
    }

    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/index.html';
    });

    // Modular navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            
            const view = target.dataset.view;
            currentMode = view;
            
            titleMapping = {
                'solicitudes': 'Listado de Solicitudes',
                'productos': 'Catálogo de Productos Core',
                'usuarios': 'Gestión de Accesos (Usuarios)'
            };
            document.getElementById('pageTitle').textContent = titleMapping[view];
            
            // Adjust "New" button visibility
            const btnNew = document.getElementById('btnNewRequest');
            if (view === 'solicitudes') {
                btnNew.textContent = '+ Nueva solicitud';
            } else {
                btnNew.textContent = `+ Nuevo ${view.slice(0, -1)}`;
            }
            btnNew.style.display = (view === 'usuarios' && user.nivel < 3) ? 'none' : 'flex';

            fetchData();
        });
    });

    // Global fetcher using Token
    const authFetch = async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const res = await fetch(url, { ...options, headers });
        if (res.status === 401 || res.status === 403) {
            alert('Sesión expirada o permisos insuficientes.');
            localStorage.clear();
            window.location.href = '/index.html';
            throw new Error('Unauthorized');
        }
        return res.json();
    };

    const loader = document.getElementById('loader');
    const tableContainer = document.getElementById('tableContainer');
    const thead = document.getElementById('tableHeadings');
    const tbody = document.getElementById('tableBody');

    const fetchData = async () => {
        loader.classList.remove('hidden');
        tableContainer.classList.add('hidden');
        
        try {
            const data = await authFetch(`/api/v1/${currentMode}`);
            currentData = data.data || [];
            renderTable();
        } catch (error) {
            console.error(error);
        } finally {
            loader.classList.add('hidden');
            tableContainer.classList.remove('hidden');
        }
    };

    const getBadgeClass = (status) => {
        const map = {
            'CREADA': 'badge-creada',
            'APROBADA': 'badge-aprobada',
            'EN_PRODUCCION': 'badge-produccion',
            'FINALIZADA': 'badge-finalizada',
            'RECHAZADA': 'badge-rechazada'
        };
        return map[status] || 'badge-creada';
    };

    const renderTable = () => {
        thead.innerHTML = '';
        tbody.innerHTML = '';

        if (currentData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--clr-text-muted)">No hay registros encontrados en ${currentMode}.</td></tr>`;
            return;
        }

        if (currentMode === 'solicitudes') {
            thead.innerHTML = `
                <th>ID</th>
                <th>Producto / Item</th>
                <th>Envase</th>
                <th>Cant.</th>
                <th>Estado</th>
                <th>Acciones</th>
            `;
            
            currentData.forEach(item => {
                const row = document.createElement('tr');
                const pName = item.producto_nombre || item.producto_personalizado;
                row.innerHTML = `
                    <td>#${item.id}</td>
                    <td><strong>${pName}</strong><br/><small style="color:var(--clr-text-muted)">Creado por: ${item.creador_nombre}</small></td>
                    <td>${item.tipo_envase}</td>
                    <td>${item.cantidad}</td>
                    <td><span class="badge ${getBadgeClass(item.estado)}">${item.estado}</span></td>
                    <td>
                        <button class="btn-outline btn-sm" onclick="appContext.handleRequestAction(${item.id}, '${item.estado}')">Gestionar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
        else if (currentMode === 'productos') {
            thead.innerHTML = `<th>ID</th><th>Nombre</th><th>Descripción</th><th>Estado</th><th>Acciones</th>`;
            currentData.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${item.id}</td><td><strong>${item.nombre}</strong></td><td>${item.descripcion || '-'}</td>
                    <td>${item.estado}</td>
                    <td><button class="btn-outline btn-sm text-danger" onclick="appContext.deleteItem(${item.id})">Eliminar</button></td>
                `;
                tbody.appendChild(row);
            });
        }
        else if (currentMode === 'usuarios') {
            thead.innerHTML = `<th>ID</th><th>Usuario</th><th>Nivel</th><th>Estado / Intentos</th><th>Acciones</th>`;
            currentData.forEach(item => {
                const row = document.createElement('tr');
                const isBlocked = item.bloqueado ? '<span class="text-danger">BLOQUEADO</span>' : 'Activo';
                row.innerHTML = `
                    <td>#${item.id}</td>
                    <td><strong>${item.nombre}</strong><br/><small>${item.correo}</small></td>
                    <td>Nivel ${item.nivel}</td>
                    <td>${isBlocked} (${item.intentos_fallidos})</td>
                    <td><button class="btn-outline btn-sm" onclick="appContext.resetPass(${item.id})">Reset Pass</button></td>
                `;
                tbody.appendChild(row);
            });
        }
    };

    // Modal Builder Logic
    const modal = document.getElementById('globalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    const openModal = (title, htmlContent) => {
        modalTitle.textContent = title;
        modalBody.innerHTML = htmlContent;
        modal.classList.add('active');
    };

    const closeModal = () => modal.classList.remove('active');

    // Make Context Globally Accessible for onclick handlers
    window.appContext = {
        deleteItem: async (id) => {
            if(confirm('¿Eliminar registro irreversiblemente?')) {
                await authFetch(`/api/v1/${currentMode}/${id}`, { method: 'DELETE' });
                fetchData();
            }
        },
        resetPass: async (id) => {
            const pwd = prompt('Ingrese nueva contraseña de rescate obligando 6 caracteres mínimo:');
            if(pwd && pwd.length >= 6) {
                const res = await authFetch(`/api/v1/usuarios/${id}/reset-password`, {
                    method: 'POST',
                    body: JSON.stringify({ nueva_contrasena: pwd })
                });
                if(res.success) {
                    alert('Restablecido. Intentos fallidos purgados.'); fetchData();
                } else alert(res.message);
            }
        },
        handleRequestAction: (id, currentStatus) => {
            if (user.nivel < 2) {
                alert('Privilegios insuficientes. Solo nivel 2 o superior puede transicionar solicitudes.');
                return;
            }

            let formHtml = '';
            // Reglas Inteligentes Renderizadas
            if (currentStatus === 'CREADA') {
                formHtml = `
                    <div class="form-group">
                        <label>Esta solicitud requiere planificación rigurosa.</label>
                        <select id="actionSelect" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border); border-radius:4px; margin-bottom:1rem">
                            <option value="APROBADA">✅ Aprobar para Producción</option>
                            <option value="RECHAZADA">❌ Rechazar Inmediatamente</option>
                        </select>
                    </div>
                    
                    <div id="dateBlock" class="form-group">
                        <label>Fecha de Finalización Programada <span class="text-danger">*</span> (Inmutable tras de este paso)</label>
                        <input type="date" id="actionDate" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border); border-radius:4px">
                    </div>

                    <div id="reasonBlock" class="form-group hidden">
                        <label>Justificación del Rechazo <span class="text-danger">*</span></label>
                        <textarea id="actionReason" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border); border-radius:4px"></textarea>
                    </div>
                `;
            } else if (currentStatus === 'APROBADA') {
                formHtml = `<p>Enviar a producción</p><input type="hidden" id="actionSelect" value="EN_PRODUCCION">`;
            } else if (currentStatus === 'EN_PRODUCCION') {
                formHtml = `
                    <p>Finalizar produccion.:</p>
                    <input type="hidden" id="actionSelect" value="FINALIZADA">
                `;
            } else {
                formHtml = `<p>Estado finalizada. No existen más acciones para realizar.</p>`;
            }

            formHtml += `
                <div class="modal-actions">
                    <button class="btn-outline" onclick="document.getElementById('globalModal').classList.remove('active')">Cancelar</button>
                    ${!['FINALIZADA', 'RECHAZADA'].includes(currentStatus) ? `<button class="btn-primary" id="btnSubmitStatus">Aceptar</button>` : ''}
                </div>
            `;

            openModal(`Gestionar Solicitud #${id}`, formHtml);

            // Bind events for Dynamic Form Logic
            const select = document.getElementById('actionSelect');
            if (select && currentStatus === 'CREADA') {
                select.addEventListener('change', (e) => {
                    if (e.target.value === 'APROBADA') {
                        document.getElementById('dateBlock').classList.remove('hidden');
                        document.getElementById('reasonBlock').classList.add('hidden');
                    } else {
                        document.getElementById('dateBlock').classList.add('hidden');
                        document.getElementById('reasonBlock').classList.remove('hidden');
                    }
                });
            }

            const btnSubmit = document.getElementById('btnSubmitStatus');
            if (btnSubmit) {
                btnSubmit.addEventListener('click', async () => {
                    const action = document.getElementById('actionSelect').value;
                    const payload = { estado: action };
                    
                    if (action === 'APROBADA') {
                        const dt = document.getElementById('actionDate').value;
                        if (!dt) return alert('ERROR: La fecha es campo critico y no puede saltarse.');
                        payload.fecha_finalizacion_programada = dt;
                    } 
                    if (action === 'RECHAZADA') {
                        const rz = document.getElementById('actionReason').value;
                        if (!rz) return alert('ERROR: Debe rellenar imperativamente la justificación.');
                        payload.justificacion_rechazo = rz;
                    }

                    btnSubmit.disabled = true;
                    btnSubmit.innerHTML = '<span class="btn-spinner"></span>';
                    
                    try {
                        const res = await authFetch(`/api/v1/solicitudes/${id}/estado`, {
                            method: 'PATCH',
                            body: JSON.stringify(payload)
                        });
                        
                        if (res.success) {
                            closeModal();
                            fetchData();
                        } else {
                            alert(res.message);
                            btnSubmit.disabled = false;
                        }
                    } catch (err) {
                        btnSubmit.disabled = false;
                    }
                });
            }
        }
    };

    document.getElementById('btnNewRequest').addEventListener('click', async () => {
        if (currentMode === 'solicitudes') {
            
            // Primero, traer lista de productos activos
            let activeProducts = [];
            try {
                const resProds = await authFetch('/api/v1/productos');
                if (resProds.success && resProds.data) {
                    activeProducts = resProds.data.filter(p => p.estado === 'activo');
                }
            } catch (err) {}

            const envaseOptions = `
                <option value="Bolsa 5 kilos">Bolsa 5 kilos</option>
                <option value="Bolsa 10 kilos">Bolsa 10 kilos</option>
                <option value="Bolsa 20 kilos">Bolsa 20 kilos</option>
                <option value="Bolsa 30 kilos">Bolsa 30 kilos</option>
                <option value="Tambor">Tambor</option>
                <option value="Octavo">Octavo</option>
                <option value="Cuarto">Cuarto</option>
                <option value="Galón">Galón</option>
                <option value="Media caneca">Media caneca</option>
                <option value="Caneca">Caneca</option>
                <option value="Otra">Otra (Personalizado)</option>
            `;

            const form = `
                <div class="form-group" style="position:relative;">
                    <label>Producto de Catálogo (Buscador)</label>
                    <input type="text" id="reqProdSearch" autocomplete="off" placeholder="Escribe para buscar..." class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);">
                    <input type="hidden" id="reqProdId">
                    <div id="autocompleteResults" class="hidden" style="position:absolute; top:100%; left:0; right:0; background:rgba(20, 20, 30, 0.95); backdrop-filter:blur(10px); border:1px solid var(--clr-border); border-radius:4px; max-height:150px; overflow-y:auto; z-index:9999; box-shadow:0 8px 32px rgba(0,0,0,0.5);"></div>
                </div>
                <div class="form-group">
                    <label>O: Producto Personalizado (si no está en catálogo)</label>
                    <input type="text" id="reqName" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);">
                </div>
                <div class="form-group">
                    <label>Tipo de Envase(s) <small>(Mantenga CTRL/CMD para selección múltiple)</small> <span class="text-danger">*</span></label>
                    <select id="reqEnvase" multiple class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border); height:150px;">
                        ${envaseOptions}
                    </select>
                </div>
                <div class="form-group hidden" id="envaseCustomGroup">
                    <label>Especificar Otro Envase <span class="text-danger">*</span></label>
                    <input type="text" id="reqEnvaseCustom" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);">
                </div>
                <div class="form-group">
                    <label>Cantidad (Volume) <span class="text-danger">*</span></label>
                    <input type="number" id="reqQty" value="1" min="1" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);">
                </div>
                <div class="form-group">
                    <label>Notas / Instrucciones Adicionales</label>
                    <textarea id="reqNota" rows="2" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);"></textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn-outline" onclick="document.getElementById('globalModal').classList.remove('active')">Cancelar</button>
                    <button class="btn-primary" id="submitCreate">CREAR SOLICITUD</button>
                </div>
            `;
            openModal('Nueva Solicitud', form);

            // Autocomplete search logic
            const searchInput = document.getElementById('reqProdSearch');
            const hiddenInput = document.getElementById('reqProdId');
            const resultsDiv = document.getElementById('autocompleteResults');

            searchInput.addEventListener('input', (e) => {
                const val = e.target.value.toLowerCase();
                resultsDiv.innerHTML = '';
                hiddenInput.value = ''; // Reset ID si el usuario modifica el texto despues de seleccionar

                if (!val) {
                    resultsDiv.classList.add('hidden');
                    return;
                }

                // Filtrar productos
                const matches = activeProducts.filter(p => p.nombre.toLowerCase().includes(val));
                
                if (matches.length > 0) {
                    resultsDiv.classList.remove('hidden');
                    matches.forEach(m => {
                        const div = document.createElement('div');
                        div.style.padding = '0.5rem 0.8rem';
                        div.style.cursor = 'pointer';
                        div.style.borderBottom = '1px solid var(--clr-border)';
                        div.style.transition = 'all 0.3s ease';
                        div.style.color = 'var(--clr-text-main)';
                        div.textContent = m.nombre;
                        div.addEventListener('mouseenter', () => {
                            div.style.background = 'var(--clr-primary)';
                            div.style.color = 'white';
                            div.style.paddingLeft = '1.2rem';
                        });
                        div.addEventListener('mouseleave', () => {
                            div.style.background = 'transparent';
                            div.style.color = 'var(--clr-text-main)';
                            div.style.paddingLeft = '0.8rem';
                        });
                        
                        // Al hacer clic en un item de la busqueda
                        div.addEventListener('click', () => {
                            searchInput.value = m.nombre;
                            hiddenInput.value = m.id;
                            resultsDiv.classList.add('hidden');
                        });
                        resultsDiv.appendChild(div);
                    });
                } else {
                    resultsDiv.classList.remove('hidden');
                    const div = document.createElement('div');
                    div.style.padding = '0.5rem 0.8rem';
                    div.style.color = 'var(--clr-text-muted)';
                    div.textContent = 'No se encontraron coincidencias...';
                    resultsDiv.appendChild(div);
                }
            });

            // Cerrar el dropdown al hacer click fuera
            document.addEventListener('click', (e) => {
                if (e.target !== searchInput && e.target !== resultsDiv) {
                    resultsDiv.classList.add('hidden');
                }
            });
            
            // Logic to show/hide the custom package input
            document.getElementById('reqEnvase').addEventListener('change', (e) => {
                const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                const customGroup = document.getElementById('envaseCustomGroup');
                if (selected.includes('Otra')) {
                    customGroup.classList.remove('hidden');
                } else {
                    customGroup.classList.add('hidden');
                }
            });

            document.getElementById('submitCreate').addEventListener('click', async () => {
                // Obtener valores de select múltiple
                const mSelect = document.getElementById('reqEnvase');
                let selectedArray = Array.from(mSelect.selectedOptions).map(opt => opt.value);
                
                if (selectedArray.length === 0) return alert('Debes seleccionar al menos un tipo de envase.');

                // Handle 'Otra'
                if (selectedArray.includes('Otra')) {
                    const customValue = document.getElementById('reqEnvaseCustom').value.trim();
                    if (!customValue) return alert('Por favor, especifica el envase "Otra".');
                    
                    // Replace 'Otra' with the actual custom text
                    selectedArray = selectedArray.map(item => item === 'Otra' ? customValue : item);
                }

                const finalEnvases = selectedArray.join(', ');

                const payload = {
                    producto_id: document.getElementById('reqProdId').value ? parseInt(document.getElementById('reqProdId').value) : null,
                    producto_personalizado: document.getElementById('reqName').value || null,
                    tipo_envase: finalEnvases,
                    cantidad: parseInt(document.getElementById('reqQty').value),
                    nota: document.getElementById('reqNota').value || null
                };

                // Limpiar nulos para api stricta
                if (!payload.producto_id) delete payload.producto_id;
                if (!payload.producto_personalizado) delete payload.producto_personalizado;
                if (!payload.nota) delete payload.nota;

                try{
                    const res = await authFetch('/api/v1/solicitudes', {
                        method: 'POST', body: JSON.stringify(payload)
                    });
                    if (res.success) { closeModal(); fetchData(); }
                    else {
                        if (res.errors && Array.isArray(res.errors)) {
                            alert('Validación Fallida:\\n' + res.errors.map(e => e.msg).join('\\n'));
                        } else {
                            alert(res.message);
                        }
                    }
                }catch(e){}
            });
        }
        else if(currentMode === 'usuarios') {
            const form = `
                <div class="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" id="usrName" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);">
                </div>
                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" id="usrEmail" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);">
                </div>
                <div class="form-group">
                    <label>Contraseña Provisional</label>
                    <input type="password" id="usrPass" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);">
                </div>
                <div class="form-group">
                    <label>Nivel de Acceso (1 a 3)</label>
                    <select id="usrLevel" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);">
                        <option value="1">Nivel 1 - Operador</option>
                        <option value="2">Nivel 2 - Producción</option>
                        <option value="3">Nivel 3 - Supervisor</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="btn-outline" onclick="document.getElementById('globalModal').classList.remove('active')">Cancelar</button>
                    <button class="btn-primary" id="submitUsrCreate">Crear Usuario</button>
                </div>
            `;
            openModal('Registrar Nuevo Usuario', form);
            
            document.getElementById('submitUsrCreate').addEventListener('click', async () => {
                const payload = {
                    nombre: document.getElementById('usrName').value,
                    correo: document.getElementById('usrEmail').value,
                    contrasena: document.getElementById('usrPass').value,
                    nivel: parseInt(document.getElementById('usrLevel').value)
                };
                
                // Light Frontend validation
                if(!payload.nombre || !payload.correo || !payload.contrasena) return alert('Todos los campos son obligatorios');
                
                try{
                    const res = await authFetch('/api/v1/usuarios', {
                        method: 'POST', body: JSON.stringify(payload)
                    });
                    if (res.success) { 
                        closeModal(); 
                        fetchData(); 
                    } else {
                        // Handle Express Validator Array of Errors
                        if (res.errors && Array.isArray(res.errors)) {
                            const errorMsg = res.errors.map(e => e.msg).join('\\n');
                            alert('Validación Fallida:\\n' + errorMsg);
                        } else {
                            alert(res.message || 'Error al crear usuario');
                        }
                    }
                }catch(e){
                    console.error(e);
                }
            });
        }
        else if(currentMode === 'productos') {
            const form = `
                <div class="form-group">
                    <label>Nombre del Producto Comercial</label>
                    <input type="text" id="prodName" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);">
                </div>
                <div class="form-group">
                    <label>Descripción Básica</label>
                    <textarea id="prodDesc" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);"></textarea>
                </div>
                <div class="form-group">
                    <label>Estado Inicial</label>
                    <select id="prodStatus" class="input-container" style="width:100%; padding:0.8rem; background:var(--clr-bg-dark); color:white; border:1px solid var(--clr-border);">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="btn-outline" onclick="document.getElementById('globalModal').classList.remove('active')">Cancelar</button>
                    <button class="btn-primary" id="submitProdCreate">Añadir Catálogo</button>
                </div>
            `;
            openModal('Nuevo Producto del Sistema', form);
            
            document.getElementById('submitProdCreate').addEventListener('click', async () => {
                const payload = {
                    nombre: document.getElementById('prodName').value,
                    descripcion: document.getElementById('prodDesc').value,
                    estado: document.getElementById('prodStatus').value
                };
                if(!payload.nombre) return alert('El nombre es obligatorio');
                try{
                    const res = await authFetch('/api/v1/productos', {
                        method: 'POST', body: JSON.stringify(payload)
                    });
                    if (res.success) { 
                        closeModal(); 
                        fetchData(); 
                    } else {
                        if (res.errors && Array.isArray(res.errors)) {
                            const errorMsg = res.errors.map(e => e.msg).join('\\n');
                            alert('Validación Fallida:\\n' + errorMsg);
                        } else {
                            alert(res.message || 'Error guardando producto');
                        }
                    }
                }catch(e){}
            });
        }
    });

    // Boot system
    fetchData();
});
