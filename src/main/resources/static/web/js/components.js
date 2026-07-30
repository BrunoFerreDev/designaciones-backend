(function () {
  // Componentes Vue compartidos globales
  const { ref, computed, watch, onMounted } = Vue;

  // 1. COMPONENTE SIDEBAR
  window.SidebarComponent = {
    template: `
    <div class="fixed bottom-0 left-0 right-0 h-[60px] w-full bg-white border-t border-slate-200 flex flex-row justify-start items-center px-2.5 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] overflow-x-auto whitespace-nowrap md:static md:w-[220px] md:h-full md:flex-shrink-0 md:border-r md:border-t-0 md:flex-col md:justify-start md:py-5 md:px-0 md:shadow-none md:overflow-x-visible scrollbar-none">
      <div class="hidden md:flex md:items-center md:gap-2 md:px-5 md:pb-5 md:border-b md:border-slate-200 md:mb-4 w-full">
        <span class="text-xl">⚽</span>
        <div>
          <div class="text-sm font-bold text-slate-800">ArbDesig</div>
          <div class="text-[10px] text-slate-500 font-medium">Fútbol · Árbitros</div>
        </div>
      </div>

      <a v-for="nav in navItems" :key="nav.id" :href="nav.file" 
         class="inline-flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] cursor-pointer transition-all border-none bg-transparent w-[72px] shrink-0 text-center h-full md:flex md:flex-row md:items-center md:justify-start md:gap-3 md:py-3 md:px-5 md:text-sm md:w-full md:h-auto md:text-left"
         :class="currentFile === nav.file ? 'text-emerald-700 font-bold bg-emerald-50/50 md:border-l-4 md:border-emerald-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'">
        <span class="material-symbols-outlined text-xl md:text-lg">{{ nav.icon }}</span>
        <span>{{ nav.label }}</span>
      </a>

      <button @click="logout" 
         class="inline-flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] cursor-pointer transition-all border-none bg-transparent w-[72px] shrink-0 text-center h-full md:flex md:flex-row md:items-center md:justify-start md:gap-3 md:py-3 md:px-5 md:text-sm md:w-full md:h-auto md:text-left text-red-500 hover:text-red-700 hover:bg-red-50 md:mt-0">
        <span class="material-symbols-outlined text-xl md:text-lg">logout</span>
        <span>Cerrar Sesión</span>
      </button>
    </div>
  `,
    setup() {

      const currentFile = window.location.pathname.split("/").pop() || "index.html";
      const navItems = [
        { id: "dashboard", file: "index.html", icon: "dashboard", label: "Resumen" },
        { id: "canchas", file: "canchas.html", icon: "stadium", label: "Canchas" },
        { id: "arbitros", file: "arbitros.html", icon: "sports", label: "Árbitros" },
        { id: "suspensiones", file: "suspensiones.html", icon: "block", label: "Suspensiones" },
        { id: "designaciones", file: "designaciones.html", icon: "assignment", label: "Designaciones" },
        { id: "buscar", file: "buscar.html", icon: "search", label: "Buscador" },
        { id: "estadisticas", file: "estadisticas.html", icon: "bar_chart", label: "Estadísticas" },
        { id: "historico", file: "historico.html", icon: "history", label: "Historial" },
      ];
      const logout = () => {
        if (confirm("¿Cerrar sesión?")) {
          window.authService.logout();
        }
      };
      return { currentFile, navItems, logout };
    }
  };

  // 2. COMPONENTE MODAL GLOBAL
  window.ModalComponent = {
    template: `
    <transition name="fade">
      <div v-if="modal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-4" @click.self="closeModal">
        <div :class="[
          'bg-white rounded-2xl w-full shadow-2xl border border-slate-100 animate-scale-up flex flex-col',
          modal?.type === 'comparativaWeekend' || modal?.type === 'arbitrosDesignadosWeekend' || modal?.type === 'arbitrosPorDia'
            ? 'max-w-5xl h-[85vh] p-0 overflow-hidden'
            : 'max-w-[500px] p-6 overflow-y-auto max-h-[90vh]'
        ]" :style="modal?.type === 'manageReferees' || modal?.type === 'whatsappMessage' ? 'max-width: 550px' : ''">
          
          <!-- MODAL: ADD / EDIT CANCHA -->
          <div v-if="modal.type === 'addCancha' || modal.type === 'editCancha'">
            <h3 class="text-lg font-bold text-slate-800 mb-4">{{ isEdit ? 'Editar Cancha' : 'Nueva Cancha' }}</h3>
            <form @submit.prevent="submitCancha">
              <div class="form-group">
                <label class="form-label">Nombre de Cancha</label>
                <input type="text" v-model="form.nombreCancha" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">Categoría</label>
                <select v-model="form.categoria" class="form-input">
                  <option value="FUTBOL_11">Fútbol 11</option>
                  <option value="FUTBOL_10">Fútbol 10</option>
                  <option value="FUTBOL_9">Fútbol 9</option>
                </select>
              </div>
              <div class="form-group flex gap-5">
                <label class="cursor-pointer flex items-center gap-1.5 text-xs text-slate-600 select-none">
                  <input type="checkbox" v-model="form.fueraDeJuego" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"> Fuera de Juego
                </label>
                <label class="cursor-pointer flex items-center gap-1.5 text-xs text-slate-600 select-none">
                  <input type="checkbox" v-model="form.estado" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"> Activa
                </label>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn primary">Guardar</button>
              </div>
            </form>
          </div>

          <!-- MODAL: ADD / EDIT ARBITRO -->
          <div v-if="modal.type === 'addArbitro' || modal.type === 'editArbitro'">
            <h3 class="text-lg font-bold text-slate-800 mb-4">{{ isEdit ? 'Editar Árbitro' : 'Nuevo Árbitro' }}</h3>
            <form @submit.prevent="submitArbitro">
              <div class="form-group">
                <label class="form-label">Nombre</label>
                <input type="text" v-model="form.nombre" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">Apellido</label>
                <input type="text" v-model="form.apellido" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">WhatsApp (sin el + ni 0)</label>
                <input type="text" v-model="form.whatsapp" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Categoría</label>
                <select v-model="form.categoria" class="form-input">
                  <option value="AVANZADO">Avanzado</option>
                  <option value="INTERMEDIO">Intermedio</option>
                  <option value="PRINCIPAL_1">Principal 1</option>
                  <option value="PRINCIPAL_2">Principal 2</option>
                  <option value="PRINCIPAL_3">Principal 3</option>
                  <option value="PRINCIPAL_4">Principal 4</option>
                  <option value="ASISTENTE">Asistente</option>
                  <option value="INICIAL">Inicial</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Talles</label>
                <div class="flex gap-2.5">
                  <select v-model="form.talleCamiseta" class="form-input flex-1">
                    <option value="S">Camiseta S</option>
                    <option value="M">Camiseta M</option>
                    <option value="L">Camiseta L</option>
                    <option value="XL">Camiseta XL</option>
                  </select>
                  <select v-model="form.talleShort" class="form-input flex-1">
                    <option value="S">Short S</option>
                    <option value="M">Short M</option>
                    <option value="L">Short L</option>
                    <option value="XL">Short XL</option>
                  </select>
                </div>
              </div>
              <div class="form-group flex flex-wrap gap-4">
                <label class="cursor-pointer flex items-center gap-1.5 text-xs text-slate-600 select-none"><input type="checkbox" v-model="form.estado" class="rounded border-slate-300 text-emerald-600 w-4 h-4"> Activo</label>
                <label class="cursor-pointer flex items-center gap-1.5 text-xs text-slate-600 select-none"><input type="checkbox" v-model="form.disponibleSabado" class="rounded border-slate-300 text-emerald-600 w-4 h-4"> Disp Sábado</label>
                <label class="cursor-pointer flex items-center gap-1.5 text-xs text-slate-600 select-none"><input type="checkbox" v-model="form.disponibleDomingo" class="rounded border-slate-300 text-emerald-600 w-4 h-4"> Disp Domingo</label>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn primary">Guardar</button>
              </div>
            </form>
          </div>

          <!-- MODAL: ADD / EDIT DESIGNACION -->
          <div v-if="modal.type === 'addDesignacion' || modal.type === 'editDesignacion'">
            <h3 class="text-lg font-bold text-slate-800 mb-4">{{ isEdit ? 'Editar Designación' : 'Nueva Designación' }}</h3>
            <form @submit.prevent="submitDesignacion">
              <div class="form-group">
                <label class="form-label">Cancha</label>
                <select v-model="form.canchaId" class="form-input" required>
                  <option value="" disabled>Seleccione una cancha...</option>
                  <option v-for="c in state.canchas" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Fecha y Hora</label>
                <input type="datetime-local" v-model="form.fecha" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">Cantidad de Partidos</label>
                <input type="number" v-model="form.cantidadPartidos" class="form-input" required min="1" max="20">
              </div>
              <div class="form-group">
                <label class="form-label">Etapa Campeonato</label>
                <select v-model="form.etapaCampeonato" class="form-input">
                  <option value="FECHA_NORMAL">Fecha normal</option>
                  <option value="FECHA_PICANTE">Fecha picante</option>
                  <option value="CLASIFICACION">Clasificación</option>
                  <option value="CRUCES">Cruces</option>
                  <option value="SEMIFINAL">Semifinales</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn primary">Guardar</button>
              </div>
            </form>
          </div>

          <!-- MODAL: MANAGE REFEREES -->
          <div v-if="modal.type === 'manageReferees'">
            <h3 class="text-lg font-bold text-slate-800 mb-1 flex items-center gap-1.5"><span class="material-symbols-outlined text-emerald-600">groups</span> Gestionar Árbitros</h3>
            <div class="text-xs text-slate-500 mb-4" v-if="des">
              Cancha: <strong class="text-slate-700">{{ des.cancha?.nombreCancha || window.getCancha(des.idCancha || des.canchaId)?.nombre || '—' }}</strong> · Fecha: <span class="uppercase font-medium text-slate-700">{{ window.formatFecha(des.fecha) }}</span>
            </div>

            <div class="mb-4 p-3 rounded-lg text-xs" :class="isComplete ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'">
              <strong>{{ isComplete ? 'Designación Completa' : 'Designación Incompleta' }}</strong><br>
              Requiere mínimo {{ required }} árbitros. Asignados: {{ assigned.length }}.
            </div>

            <h4 class="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">🏃‍♂️ Árbitros Asignados ({{ assigned.length }})</h4>
            <div class="flex flex-col gap-2 max-h-[160px] overflow-y-auto mb-4 border border-slate-100 p-2.5 rounded-lg bg-slate-50">
              <div v-if="assigned.length === 0" class="text-xs text-center text-slate-400 py-3">Ninguno asignado. Usa el buscador inferior.</div>
              <div v-for="asg in assigned" :key="asg.idDesignados || asg.id" class="flex justify-between items-center bg-white border border-slate-200/60 p-2 rounded-lg text-xs shadow-sm">
                <span><strong class="text-slate-800">{{ (asg.arbitro || window.getArbitro(asg.arbitro?.idArbitro || asg.idArbitro))?.nombre }} {{ (asg.arbitro || window.getArbitro(asg.arbitro?.idArbitro || asg.idArbitro))?.apellido }}</strong> <span class="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded ml-1">{{ asg.rol || 'Árbitro' }}</span></span>
                <button class="btn danger p-1 text-red-500 border-none bg-transparent hover:bg-red-50" @click="removeReferee(asg.arbitro?.idArbitro || asg.idArbitro)" title="Quitar">
                  <span class="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>

            <h4 class="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">➕ Asignar Árbitro Disponible</h4>
            <div class="flex gap-2">
              <select v-model="selectedRef" class="form-input flex-1 text-xs" style="height:36px">
                <option value="" disabled>Seleccione un árbitro...</option>
                <option v-for="a in available" :key="a.idArbitro" :value="a.idArbitro">{{ a.nombre }} {{ a.apellido }} ({{ a.categoria }})</option>
              </select>
              <select v-model="selectedRole" class="form-input text-xs" style="width:140px; height:36px">
                <option v-for="r in window.ROLES_ARB" :key="r" :value="r">{{ r }}</option>
              </select>
              <button class="btn primary text-xs shrink-0 flex items-center justify-center" style="height:36px; padding:0 12px" @click="assignReferee" :disabled="!selectedRef || isAssigning">
                <span v-if="isAssigning" class="material-symbols-outlined animate-spin text-base">sync</span>
                <span v-else>Asignar</span>
              </button>
            </div>

            <div class="modal-footer mt-5 border-t border-slate-100 pt-4">
              <button class="btn" @click="closeModal">Cerrar</button>
            </div>
          </div>

          <!-- MODAL: UPDATE FEES -->
          <div v-if="modal.type === 'updateFees'">
            <h3 class="text-lg font-bold text-slate-800 mb-1 flex items-center gap-1.5"><span class="material-symbols-outlined text-emerald-600">payments</span> Actualizar Viáticos</h3>
            <div class="text-xs text-slate-500 mb-4">Configura los montos a percibir por los árbitros asignados.</div>

            <div class="flex gap-2 mb-4 border-b border-slate-100 pb-4">
              <input type="number" v-model="globalFee" placeholder="Monto para todos..." class="form-input text-xs flex-1" style="height:36px">
              <button class="btn primary text-xs flex items-center justify-center" style="height:36px" @click="applyGlobalFee" :disabled="!globalFee || isApplyingFee">
                <span v-if="isApplyingFee" class="material-symbols-outlined animate-spin text-base">sync</span>
                <span v-else>Aplicar a todos</span>
              </button>
            </div>

            <div class="flex flex-col gap-2 max-h-[220px] overflow-y-auto mb-4 p-1">
              <div v-if="assigned.length === 0" class="text-xs text-center text-slate-400 py-4">Sin árbitros asignados.</div>
              <div v-for="asg in assigned" :key="asg.idDesignados || asg.id" class="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs">
                <span class="font-semibold text-slate-700">{{ (asg.arbitro || window.getArbitro(asg.arbitro?.idArbitro || asg.idArbitro))?.nombre }} {{ (asg.arbitro || window.getArbitro(asg.arbitro?.idArbitro || asg.idArbitro))?.apellido }}</span>
                <input type="number" class="form-input text-right text-xs" style="width:120px; height:30px;" :value="asg.montoPercibido || 0" @change="updateIndividualFee(asg.idDesignados || asg.id, $event.target.value)">
              </div>
            </div>

            <div class="modal-footer border-t border-slate-100 pt-4">
              <button class="btn" @click="closeModal">Cerrar / Listo</button>
            </div>
          </div>

          <!-- MODAL: VIEW SUSPENSION / ADVERTENCIA -->
          <div v-if="modal.type === 'viewSuspension'">
            <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-1.5"><span class="material-symbols-outlined text-red-500">warning</span> Detalle de Sanción / Advertencia</h3>
            <div class="text-xs text-slate-700 space-y-2.5 leading-relaxed" v-if="s">
              <div><strong>Árbitro:</strong> {{ a ? a.apellido + ', ' + a.nombre : 'Desconocido' }}</div>
              <div><strong>Tipo de Medida:</strong> {{ s.tipoSuspencion === 2 ? 'Suspensión (' + s.cantidadDias + ' días)' : 'Llamado de atención' }}</div>
              <div><strong>Fecha del incidente:</strong> <span class="uppercase font-medium text-slate-600">{{ window.formatFecha(s.fechaIncidente) }}</span></div>
              <div><strong>Cancha:</strong> {{ s.cancha?.nombreCancha || window.getCancha(s.cancha)?.nombre || 'Ninguna/No aplica' }}</div>
              <div class="bg-slate-50 p-3 rounded-lg border border-slate-150 mt-3 font-normal">
                <strong class="text-slate-800 text-[11px] uppercase tracking-wider block mb-1">Motivo / Descripción:</strong>
                <span class="text-slate-500 italic">{{ s.motivo || 'Sin detalles' }}</span>
              </div>
            </div>
            <div class="modal-footer mt-5">
              <button class="btn danger" @click="deleteSuspensionFromModal">Eliminar / Revocar Sanción</button>
              <button class="btn" @click="closeModal">Cerrar</button>
            </div>
          </div>

          <!-- MODAL: WHATSAPP SHARE -->
          <div v-if="modal.type === 'whatsappMessage'">
            <h3 class="text-lg font-bold text-slate-800 mb-1 flex items-center gap-1.5"><span class="material-symbols-outlined text-emerald-600">share</span> Compartir por WhatsApp</h3>
            <div class="text-xs text-slate-500 mb-4">Copia el texto formateado o envíalo directamente a un grupo.</div>
            <textarea class="form-input text-[11px] font-mono p-3 leading-normal border border-slate-200" rows="12" style="resize:none;" :value="messageText" id="whatsapp-text-area"></textarea>
            <div class="modal-footer mt-4">
              <button class="btn text-xs" @click="copyWaText">Copiar al Portapapeles</button>
              <button class="btn primary text-xs flex items-center gap-1" @click="sendWaDirect">
                <span class="material-symbols-outlined text-base">outgoing_mail</span> Enviar a WhatsApp
              </button>
              <button class="btn text-xs" @click="closeModal">Cerrar</button>
            </div>
          </div>

          <!-- MODAL: COMPARATIVA DE FINES DE SEMANA -->
          <div v-if="modal.type === 'comparativaWeekend'" class="w-full flex flex-col h-full">
            <!-- Cabecera -->
            <div class="flex items-start justify-between p-6 border-b border-slate-100 bg-white">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <span class="material-symbols-outlined">sync_alt</span>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-slate-800">Comparativa de Fines de Semana</h2>
                  <p class="text-sm text-slate-500">Control de repetición (Fin de semana pasado vs Este fin de semana)</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <input type="date" v-model="compLastSat" class="form-input text-xs" style="height:32px; width:130px; margin-bottom:0;" title="Sábado Finde Pasado">
                  <input type="date" v-model="compThisSat" class="form-input text-xs" style="height:32px; width:130px; margin-bottom:0;" title="Sábado Este Finde">
                  <button class="btn p-1.5" @click="generateComparativa" title="Recargar">
                    <span class="material-symbols-outlined text-sm" :class="{'animate-spin': isGeneratingComp}">refresh</span>
                  </button>
                </div>
                <button class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100" @click="closeModal">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <!-- Cuerpo del Modal (Scrollable) -->
            <div v-if="!comparativaData" class="flex-1 flex flex-col justify-center items-center py-10 text-slate-400 bg-slate-50/30">
               <span class="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
               <span class="text-xs">Cargando datos comparativos...</span>
            </div>
            
            <div v-else class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50/30">
              <!-- Tarjetas de Resumen -->
              <div class="grid grid-cols-5 gap-3">
                <div class="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col justify-between border-l-4 border-l-red-500 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-red-400': currentTabComparativa === 'repitenAmbosSabDom'}" @click="currentTabComparativa = 'repitenAmbosSabDom'">
                  <span class="text-[10px] font-bold text-red-600 tracking-wider">REPITEN AMBOS SÁB/DOM</span>
                  <div class="text-2xl font-bold text-red-700 my-0.5">{{ comparativaData.repitenAmbosSabDom.length }}</div>
                  <span class="text-[10px] text-red-500">Alerta carga doble</span>
                </div>
                <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col justify-between border-l-4 border-l-emerald-600 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-emerald-400': currentTabComparativa === 'repitenSabado'}" @click="currentTabComparativa = 'repitenSabado'">
                  <span class="text-[10px] font-bold text-emerald-700 tracking-wider">REPITEN SÁBADO</span>
                  <div class="text-2xl font-bold text-emerald-800 my-0.5">{{ comparativaData.repitenSabado.length }}</div>
                  <span class="text-[10px] text-emerald-600">Sábado ambos findes</span>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col justify-between border-l-4 border-l-blue-500 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-blue-400': currentTabComparativa === 'repitenDomingo'}" @click="currentTabComparativa = 'repitenDomingo'">
                  <span class="text-[10px] font-bold text-blue-600 tracking-wider">REPITEN DOMINGO</span>
                  <div class="text-2xl font-bold text-blue-700 my-0.5">{{ comparativaData.repitenDomingo.length }}</div>
                  <span class="text-[10px] text-blue-500">Domingo ambos findes</span>
                </div>
                <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-col justify-between border-l-4 border-l-indigo-400 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-indigo-400': currentTabComparativa === 'soloFindePasado'}" @click="currentTabComparativa = 'soloFindePasado'">
                  <span class="text-[10px] font-bold text-indigo-600 tracking-wider">SÓLO FINDE PASADO</span>
                  <div class="text-2xl font-bold text-indigo-700 my-0.5">{{ comparativaData.soloFindePasado.length }}</div>
                  <span class="text-[10px] text-indigo-500">No dirigen este finde</span>
                </div>
                <div class="bg-green-50 border border-green-100 rounded-xl p-3 flex flex-col justify-between border-l-4 border-l-green-400 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-green-400': currentTabComparativa === 'soloEsteFinde'}" @click="currentTabComparativa = 'soloEsteFinde'">
                  <span class="text-[10px] font-bold text-green-600 tracking-wider">SÓLO ESTE FINDE</span>
                  <div class="text-2xl font-bold text-green-700 my-0.5">{{ comparativaData.soloEsteFinde.length }}</div>
                  <span class="text-[10px] text-green-500">No dirigieron el anterior</span>
                </div>
              </div>

              <!-- Filtros (Pills) -->
              <div class="flex items-center justify-between gap-1.5 bg-slate-100/80 p-1 rounded-full border border-slate-200 overflow-x-auto">
                <button @click="currentTabComparativa = 'todos'" class="flex-1 py-1.5 px-3 text-xs font-medium rounded-full transition-colors whitespace-nowrap" :class="currentTabComparativa === 'todos' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Todos
                </button>
                <button @click="currentTabComparativa = 'repitenAmbosSabDom'" class="flex-1 py-1.5 px-3 text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap" :class="currentTabComparativa === 'repitenAmbosSabDom' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Repiten Sáb/Dom <span class="bg-slate-200 text-slate-600 px-1.5 rounded-full text-[10px] font-bold">{{ comparativaData.repitenAmbosSabDom.length }}</span>
                </button>
                <button @click="currentTabComparativa = 'repitenSabado'" class="flex-1 py-1.5 px-3 text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap" :class="currentTabComparativa === 'repitenSabado' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Repiten Sábado <span class="bg-slate-200 text-slate-600 px-1.5 rounded-full text-[10px] font-bold">{{ comparativaData.repitenSabado.length }}</span>
                </button>
                <button @click="currentTabComparativa = 'repitenDomingo'" class="flex-1 py-1.5 px-3 text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap" :class="currentTabComparativa === 'repitenDomingo' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Repiten Domingo <span class="bg-slate-200 text-slate-600 px-1.5 rounded-full text-[10px] font-bold">{{ comparativaData.repitenDomingo.length }}</span>
                </button>
                <button @click="currentTabComparativa = 'soloFindePasado'" class="flex-1 py-1.5 px-3 text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap" :class="currentTabComparativa === 'soloFindePasado' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Sólo Pasado <span class="bg-slate-200 text-slate-600 px-1.5 rounded-full text-[10px] font-bold">{{ comparativaData.soloFindePasado.length }}</span>
                </button>
                <button @click="currentTabComparativa = 'soloEsteFinde'" class="flex-1 py-1.5 px-3 text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap" :class="currentTabComparativa === 'soloEsteFinde' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Sólo Este <span class="bg-slate-200 text-slate-600 px-1.5 rounded-full text-[10px] font-bold">{{ comparativaData.soloEsteFinde.length }}</span>
                </button>
              </div>

              <!-- Lista de Árbitros -->
              <div class="space-y-4">
                <div v-if="filteredComparativaList.length === 0" class="text-sm text-center text-slate-400 py-6 bg-white rounded-xl border border-slate-100 italic">No hay árbitros en esta categoría.</div>
                
                <div v-for="(item, idx) in filteredComparativaList" :key="idx" class="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col gap-3">
                  <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-200 shadow-sm">
                        {{ item.nombre.charAt(0) }}{{ item.apellido.charAt(0) }}
                      </div>
                      <div>
                        <h3 class="font-bold text-slate-800 text-lg leading-tight">{{ item.nombre }} {{ item.apellido }}</h3>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-xs text-slate-500 font-medium">Árbitro</span>
                          <span class="text-slate-300">•</span>
                          <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md tracking-wider">{{ item.categoria || 'SIN CATEGORÍA' }}</span>
                        </div>
                      </div>
                    </div>
                    <!-- Etiqueta de tipo si está en todos -->
                    <span v-if="currentTabComparativa === 'todos'" class="text-xs font-bold px-3 py-1 rounded-full border shadow-sm" :class="getComparativaBadgeStyle(item._sourceType)">
                      {{ getComparativaBadgeText(item._sourceType) }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-6 bg-slate-50/60 rounded-lg p-4 border border-slate-100 relative">
                    <!-- Finde Pasado -->
                    <div>
                      <div class="flex justify-between items-center mb-3">
                        <div class="flex items-center gap-1 text-slate-700 font-semibold text-sm">
                          <span class="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span> Finde Pasado:
                        </div>
                        <span class="text-sm font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">{{ item.last.length }} part.</span>
                      </div>
                      <div class="space-y-2">
                        <div v-if="item.last.length === 0" class="text-xs text-slate-400 italic py-2 text-center bg-white border border-dashed border-slate-200 rounded-md">Sin designaciones</div>
                        <div v-for="(m, midx) in item.last" :key="'l'+midx" class="text-xs flex flex-col bg-white p-2.5 border border-slate-100 rounded-md shadow-sm">
                          <span :class="m.dia === 'Sábado' ? 'text-emerald-600 font-bold' : 'text-blue-600 font-bold'">{{ m.dia }}</span>
                          <div class="flex items-center gap-1.5 text-slate-600 truncate mt-1">
                            <span>⚽</span> <span class="font-semibold text-slate-700">{{ m.cancha }}</span> <span class="text-slate-300">•</span>
                            <span class="text-red-400 font-medium flex items-center gap-0.5"><span class="material-symbols-outlined text-[14px]">alarm</span>{{ m.hora }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="absolute left-1/2 -ml-px w-px h-[calc(100%-32px)] bg-slate-200 top-4"></div>

                    <!-- Este Finde -->
                    <div class="pl-2">
                      <div class="flex justify-between items-center mb-3">
                        <div class="flex items-center gap-1 text-slate-700 font-semibold text-sm">
                          <span class="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span> Este Finde:
                        </div>
                        <span class="text-sm font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">{{ item.this.length }} part.</span>
                      </div>
                      <div class="space-y-2">
                        <div v-if="item.this.length === 0" class="text-xs text-slate-400 italic py-2 text-center bg-white border border-dashed border-slate-200 rounded-md">Sin designaciones</div>
                        <div v-for="(m, midx) in item.this" :key="'t'+midx" class="text-xs flex flex-col bg-white p-2.5 border border-slate-100 rounded-md shadow-sm">
                          <span :class="m.dia === 'Sábado' ? 'text-emerald-600 font-bold' : 'text-blue-600 font-bold'">{{ m.dia }}</span>
                          <div class="flex items-center gap-1.5 text-slate-600 truncate mt-1">
                            <span>⚽</span> <span class="font-semibold text-slate-700">{{ m.cancha }}</span> <span class="text-slate-300">•</span>
                            <span class="text-red-400 font-medium flex items-center gap-0.5"><span class="material-symbols-outlined text-[14px]">alarm</span>{{ m.hora }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pie del Modal -->
            <div class="border-t border-slate-100 p-4 flex justify-end gap-3 bg-slate-50/80 mt-auto">
              <button class="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm" @click="printComparativaReportLegacy" :disabled="isGeneratingComp || !comparativaData">
                <span class="material-symbols-outlined text-[18px]">print</span> Imprimir Reporte
              </button>
              <button class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-sm" @click="closeModal">Cerrar</button>
            </div>
          </div>


          <!-- MODAL: ARBITROS POR DIA -->
          <div v-if="modal.type === 'arbitrosPorDia'" class="w-full flex flex-col h-full">
            <!-- Cabecera -->
            <div class="flex items-start justify-between p-6 border-b border-slate-100 bg-white">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <span class="material-symbols-outlined">calendar_today</span>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-slate-800">Árbitros por Disponibilidad</h2>
                  <p class="text-sm text-slate-500">Resumen de disponibilidad de árbitros para el fin de semana</p>
                </div>
              </div>
              <button class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100" @click="closeModal">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Cuerpo del Modal (Scrollable) -->
            <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50/30">
              <!-- Tarjetas de Resumen -->
              <div class="grid grid-cols-4 gap-4">
                <!-- Tarjeta 1 (Azul) -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-blue-500 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-blue-400': currentTabDisponibilidad === 'ambos'}" @click="currentTabDisponibilidad = 'ambos'">
                  <span class="text-xs font-bold text-blue-700 tracking-wider">AMBOS DÍAS</span>
                  <div class="text-3xl font-bold text-blue-800 my-1">{{ availabilityGroups.ambos.length }}</div>
                  <span class="text-xs text-blue-600">Sáb. y Dom.</span>
                </div>
                <!-- Tarjeta 2 (Verde) -->
                <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-emerald-500 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-emerald-400': currentTabDisponibilidad === 'soloSabado'}" @click="currentTabDisponibilidad = 'soloSabado'">
                  <span class="text-xs font-bold text-emerald-700 tracking-wider">SÓLO SÁBADO</span>
                  <div class="text-3xl font-bold text-emerald-800 my-1">{{ availabilityGroups.soloSabado.length }}</div>
                  <span class="text-xs text-emerald-600">Sólo Sáb.</span>
                </div>
                <!-- Tarjeta 3 (Naranja) -->
                <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-orange-400 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-orange-400': currentTabDisponibilidad === 'soloDomingo'}" @click="currentTabDisponibilidad = 'soloDomingo'">
                  <span class="text-xs font-bold text-orange-700 tracking-wider">SÓLO DOMINGO</span>
                  <div class="text-3xl font-bold text-orange-800 my-1">{{ availabilityGroups.soloDomingo.length }}</div>
                  <span class="text-xs text-orange-600">Sólo Dom.</span>
                </div>
                <!-- Tarjeta 4 (Rojo) -->
                <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-red-400 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-red-400': currentTabDisponibilidad === 'sinDisponibilidad'}" @click="currentTabDisponibilidad = 'sinDisponibilidad'">
                  <span class="text-xs font-bold text-red-700 tracking-wider">SIN DISPONIBILIDAD</span>
                  <div class="text-3xl font-bold text-red-800 my-1">{{ availabilityGroups.sinDisponibilidad.length }}</div>
                  <span class="text-xs text-red-600">Sin días asignados</span>
                </div>
              </div>

              <!-- Filtros (Pills) -->
              <div class="flex items-center gap-2 bg-slate-100/80 p-1 rounded-full border border-slate-200 overflow-x-auto">
                <button @click="currentTabDisponibilidad = 'todos'" class="flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap" :class="currentTabDisponibilidad === 'todos' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Todos Disponibles
                </button>
                <button @click="currentTabDisponibilidad = 'ambos'" class="flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap" :class="currentTabDisponibilidad === 'ambos' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Ambos Días <span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{{ availabilityGroups.ambos.length }}</span>
                </button>
                <button @click="currentTabDisponibilidad = 'soloSabado'" class="flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap" :class="currentTabDisponibilidad === 'soloSabado' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Sólo Sábado <span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{{ availabilityGroups.soloSabado.length }}</span>
                </button>
                <button @click="currentTabDisponibilidad = 'soloDomingo'" class="flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap" :class="currentTabDisponibilidad === 'soloDomingo' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Sólo Domingo <span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{{ availabilityGroups.soloDomingo.length }}</span>
                </button>
                <button @click="currentTabDisponibilidad = 'sinDisponibilidad'" class="flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap" :class="currentTabDisponibilidad === 'sinDisponibilidad' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Sin Disponibilidad <span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{{ availabilityGroups.sinDisponibilidad.length }}</span>
                </button>
                <button @click="currentTabDisponibilidad = 'inactivos'" class="flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap" :class="currentTabDisponibilidad === 'inactivos' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Inactivos <span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{{ availabilityGroups.inactivos.length }}</span>
                </button>
              </div>

              <!-- Lista de Árbitros -->
              <div class="space-y-4">
                <div v-if="filteredDisponibilidadList.length === 0" class="text-sm text-center text-slate-400 py-8 italic bg-white rounded-xl border border-slate-100">
                  No hay árbitros en esta categoría.
                </div>
                
                <div v-for="item in filteredDisponibilidadList" :key="item.idArbitro" class="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all bg-white relative overflow-hidden flex flex-col gap-3">
                  <div class="absolute right-0 top-0 bottom-0 w-1.5" :class="getDisponibilidadBorderClass(item)"></div>
                  
                  <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg border border-slate-200 shadow-sm">
                        {{ item.nombre.charAt(0) }}{{ item.apellido.charAt(0) }}
                      </div>
                      <div>
                        <h3 class="font-bold text-slate-800 text-lg leading-tight">{{ item.nombre }} {{ item.apellido }}</h3>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-xs text-slate-500 font-medium" :class="item.estado ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'">
                            {{ item.estado ? 'Activo' : 'Inactivo' }}
                          </span>
                          <span class="text-slate-300">•</span>
                          <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md tracking-wider">{{ item.categoria || 'SIN CATEGORÍA' }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex gap-2">
                      <span v-if="item.estado && item.disponibleSabado" class="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sábado
                      </span>
                      <span v-if="item.estado && item.disponibleDomingo" class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Domingo
                      </span>
                      <span v-if="item.estado && !item.disponibleSabado && !item.disponibleDomingo" class="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Sin Disponibilidad
                      </span>
                      <span v-if="!item.estado" class="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactivo
                      </span>
                    </div>
                  </div>

                  <!-- Detalle de disponibilidad en caja -->
                  <div class="bg-slate-50/60 rounded-lg p-3.5 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px] text-slate-400">info</span>
                    <span v-if="!item.estado">El árbitro está desactivado y no puede ser designado para ningún partido.</span>
                    <span v-else-if="item.disponibleSabado && item.disponibleDomingo">Disponible para dirigir partidos ambos días del fin de semana (Sábado y Domingo).</span>
                    <span v-else-if="item.disponibleSabado">Disponible únicamente para dirigir partidos el Sábado.</span>
                    <span v-else-if="item.disponibleDomingo">Disponible únicamente para dirigir partidos el Domingo.</span>
                    <span v-else>No tiene disponibilidad declarada para este fin de semana.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pie del Modal -->
            <div class="border-t border-slate-100 p-4 flex justify-end gap-3 bg-slate-50/80">
              <button class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-sm" @click="closeModal">
                Cerrar
              </button>
            </div>
          </div>


          <!-- MODAL: ARBITROS DESIGNADOS FIN DE SEMANA -->
          <div v-if="modal.type === 'arbitrosDesignadosWeekend'" class="w-full flex flex-col h-full">
            <!-- Cabecera -->
            <div class="flex items-start justify-between p-6 border-b border-slate-100 bg-white">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <span class="material-symbols-outlined">group</span>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-slate-800">Árbitros Designados por Día</h2>
                  <p class="text-sm text-slate-500">Resumen de árbitros asignados para el fin de semana (excluye finalizadas)</p>
                </div>
              </div>
              <button class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100" @click="closeModal">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Cuerpo del Modal (Scrollable) -->
            <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50/30">
              <!-- Tarjetas de Resumen -->
              <div class="grid grid-cols-4 gap-4">
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-blue-500 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-blue-400': currentTabDesignados === 'repiten'}" @click="currentTabDesignados = 'repiten'">
                  <span class="text-xs font-bold text-blue-700 tracking-wider">AMBOS DÍAS</span>
                  <div class="text-3xl font-bold text-blue-800 my-1">{{ assignedWeekendGroups.repiten.length }}</div>
                  <span class="text-xs text-blue-600">Sáb. y Dom.</span>
                </div>
                <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-emerald-500 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-emerald-400': currentTabDesignados === 'soloSabado'}" @click="currentTabDesignados = 'soloSabado'">
                  <span class="text-xs font-bold text-emerald-700 tracking-wider">SÓLO SÁBADO</span>
                  <div class="text-3xl font-bold text-emerald-800 my-1">{{ assignedWeekendGroups.soloSabado.length }}</div>
                  <span class="text-xs text-emerald-600">Sólo Sáb.</span>
                </div>
                <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-orange-400 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-orange-400': currentTabDesignados === 'soloDomingo'}" @click="currentTabDesignados = 'soloDomingo'">
                  <span class="text-xs font-bold text-orange-700 tracking-wider">SÓLO DOMINGO</span>
                  <div class="text-3xl font-bold text-orange-800 my-1">{{ assignedWeekendGroups.soloDomingo.length }}</div>
                  <span class="text-xs text-orange-600">Sólo Dom.</span>
                </div>
                <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-red-400 shadow-sm cursor-pointer hover:shadow transition-shadow" :class="{'ring-2 ring-red-400': currentTabDesignados === 'noDesignados'}" @click="currentTabDesignados = 'noDesignados'">
                  <span class="text-xs font-bold text-red-700 tracking-wider">SIN DESIGNAR</span>
                  <div class="text-3xl font-bold text-red-800 my-1">{{ assignedWeekendGroups.noDesignados.length }}</div>
                  <span class="text-xs text-red-600">Sin partidos</span>
                </div>
              </div>

              <!-- Filtros (Pills) -->
              <div class="flex items-center gap-2 bg-slate-100/80 p-1 rounded-full border border-slate-200 overflow-x-auto">
                <button @click="currentTabDesignados = 'todos'" class="flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap" :class="currentTabDesignados === 'todos' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Todos Desig.
                </button>
                <button @click="currentTabDesignados = 'repiten'" class="flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap" :class="currentTabDesignados === 'repiten' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Ambos Días <span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{{ assignedWeekendGroups.repiten.length }}</span>
                </button>
                <button @click="currentTabDesignados = 'soloSabado'" class="flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap" :class="currentTabDesignados === 'soloSabado' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Sólo Sábado <span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{{ assignedWeekendGroups.soloSabado.length }}</span>
                </button>
                <button @click="currentTabDesignados = 'soloDomingo'" class="flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap" :class="currentTabDesignados === 'soloDomingo' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Sólo Domingo <span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{{ assignedWeekendGroups.soloDomingo.length }}</span>
                </button>
                <button @click="currentTabDesignados = 'noDesignados'" class="flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap" :class="currentTabDesignados === 'noDesignados' ? 'text-slate-800 bg-white shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:bg-slate-200/50'">
                  Sin Designar <span class="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{{ assignedWeekendGroups.noDesignados.length }}</span>
                </button>
              </div>

              <!-- Lista de Árbitros -->
              <div class="space-y-4">
                <div v-if="filteredDesignadosList.length === 0" class="text-sm text-center text-slate-400 py-8 italic bg-white rounded-xl border border-slate-100">No hay árbitros en esta categoría.</div>
                
                <div v-for="(item, idx) in filteredDesignadosList" :key="idx" class="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white relative overflow-hidden flex flex-col gap-3">
                  <div class="absolute right-0 top-0 bottom-0 w-1.5" :class="getDesignadosBorderClass(item)"></div>
                  
                  <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg border border-slate-200 shadow-sm">
                        {{ item.ref.nombre.charAt(0) }}{{ item.ref.apellido.charAt(0) }}
                      </div>
                      <div>
                        <h3 class="font-bold text-slate-800 text-lg leading-tight">{{ item.ref.nombre }} {{ item.ref.apellido }}</h3>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-xs text-slate-500 font-medium">Árbitro</span>
                          <span class="text-slate-300">•</span>
                          <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md tracking-wider">{{ item.ref.categoria || 'SIN CATEGORÍA' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-2" v-if="item._sourceType !== 'noDesignados'">
                      <span v-if="item.onSaturday" class="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">Sábado</span>
                      <span v-if="item.onSunday" class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">Domingo</span>
                    </div>
                    <span v-else class="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">Sin Designar</span>
                  </div>

                  <div v-if="item._sourceType !== 'noDesignados'" class="bg-slate-50/60 rounded-lg p-4 border border-slate-100 space-y-3">
                    <div v-if="item.onSaturday">
                      <div class="text-sm font-bold text-emerald-600 mb-2 flex items-center gap-1"><span>⚽</span> Sábado:</div>
                      <div class="flex flex-wrap gap-2.5">
                        <div v-for="m in item.matches.filter(x => x.dia === 'Sáb')" :key="m.cancha + m.hora" class="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 border border-slate-100 rounded-md shadow-sm w-fit">
                          <span class="font-semibold text-slate-700">{{ m.cancha }}</span> <span class="text-slate-300">•</span>
                          <span class="text-red-400 font-medium flex items-center gap-0.5"><span class="material-symbols-outlined text-[14px]">alarm</span>{{ m.hora }}</span> <span class="text-slate-300">•</span>
                          <span class="text-slate-500 font-bold">{{ m.rol }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="item.onSunday">
                      <div class="text-sm font-bold text-blue-600 mb-2 flex items-center gap-1"><span>⚽</span> Domingo:</div>
                      <div class="flex flex-wrap gap-2.5">
                        <div v-for="m in item.matches.filter(x => x.dia === 'Dom')" :key="m.cancha + m.hora" class="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 border border-slate-100 rounded-md shadow-sm w-fit">
                          <span class="font-semibold text-slate-700">{{ m.cancha }}</span> <span class="text-slate-300">•</span>
                          <span class="text-red-400 font-medium flex items-center gap-0.5"><span class="material-symbols-outlined text-[14px]">alarm</span>{{ m.hora }}</span> <span class="text-slate-300">•</span>
                          <span class="text-slate-500 font-bold">{{ m.rol }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="bg-slate-50/60 rounded-lg p-4 border border-slate-100 text-xs text-slate-500 italic">
                    Árbitro disponible para el fin de semana pero sin asignaciones activas.
                  </div>
                </div>
              </div>
            </div>

            <!-- Pie del Modal -->
            <div class="border-t border-slate-100 p-4 flex justify-end gap-3 bg-slate-50/80">
              <button class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-sm" @click="closeModal">
                Cerrar
              </button>
            </div>
          </div>

        </div>
      </transition>
  `,
    setup() {
      const modal = computed(() => window.state.modal);
      const type = computed(() => window.state.modal?.type);
      const id = computed(() => window.state.modal?.id);
      const isEdit = computed(() => type.value?.includes("edit"));
      const state = window.state;
      const form = new Proxy({}, {
        get(target, prop) {
          return window.state.form[prop];
        },
        set(target, prop, value) {
          window.state.form[prop] = value;
          return true;
        }
      });

      const des = computed(() => {
        const dId = id.value;
        if (!dId) return null;
        const list = [
          ...window.state.designacionesIncompletas,
          ...window.state.designaciones,
          ...window.state.designacionesFinalizadas,
          ...window.state.designacionesAConfirmar,
        ];
        return list.find((d) => (d.idDesignacion || d.id) === dId) || window.state.modal?.data;
      });

      const assigned = computed(() => {
        const dId = id.value;
        if (!dId) return [];
        return window.state.arbitrosDesignadosMap[dId] || [];
      });

      const required = computed(() => {
        if (!des.value) return 3;
        return window.minArbitros(des.value.cantidadPartidos || 0);
      });

      const isComplete = computed(() => {
        return assigned.value.length >= required.value;
      });

      const available = computed(() => {
        if (!des.value) return [];
        const day = des.value.fecha ? window.getDayOfWeekLocal(des.value.fecha) : -1;
        const isSaturday = day === 6;
        const isSunday = day === 0;
        const assignedIds = new Set(assigned.value.map(asg => asg.idArbitro || asg.arbitro?.idArbitro));
        return window.state.arbitros.filter(a => {
          if (a.estado === false) return false;
          if (assignedIds.has(a.idArbitro)) return false;
          if ((isSaturday || isSunday) && !a.disponibleSabado && !a.disponibleDomingo) return false;
          if (window.isRefereeAssignedToDifferentCourtOnSameDay && window.isRefereeAssignedToDifferentCourtOnSameDay(a.idArbitro, des.value))
            return false;
          return true;
        });
      });

      const s = computed(() => {
        const sId = id.value;
        if (!sId) return null;
        return window.state.suspensiones.find(item => item.id === sId || item.idSuspencion === sId);
      });

      const a = computed(() => {
        if (!s.value) return null;
        const arbId = s.value.arbitro?.idArbitro || s.value.arbitro?.id || s.value.arbitro;
        return window.getArbitro(Number(arbId));
      });

      const assignedWeekendGroups = computed(() => {
        const lists = [
          ...window.state.designacionesIncompletas,
          ...window.state.designaciones,
          ...window.state.designacionesFinalizadas,
          ...window.state.designacionesAConfirmar,
          ...(window.state.designacionesAceptadas || []),
        ];

        const refsMap = {};
        
        lists.forEach((d) => {
          const dId = d.idDesignacion || d.id;
          const day = window.getDayOfWeekLocal(d.fecha);
          const assigned = window.state.arbitrosDesignadosMap[dId] || d.arbitrosDesignados || d.arbitros || [];
          
          assigned.forEach((asg) => {
            const a = asg.arbitro || window.getArbitro(asg.idArbitro);
            if (!a) return;
            const id = Number(a.idArbitro);
            if (!refsMap[id]) {
              refsMap[id] = {
                ref: a,
                onSaturday: false,
                onSunday: false,
                matches: []
              };
            }
            const info = refsMap[id];
            if (day === 6) info.onSaturday = true;
            if (day === 0) info.onSunday = true;
            
            const canchaObj = d.cancha || window.getCancha(d.idCancha || d.canchaId);
            const cancha = canchaObj?.nombreCancha || canchaObj?.nombre || "—";
            const timeStr = d.fecha?.split("T")[1]?.slice(0, 5) || "A confirmar";
            info.matches.push({
              cancha,
              hora: timeStr,
              rol: asg.rol || "Árbitro",
              dia: day === 6 ? "Sáb" : (day === 0 ? "Dom" : "Otro")
            });
          });
        });

        const repiten = [];
        const soloSabado = [];
        const soloDomingo = [];
        
        Object.values(refsMap).forEach((info) => {
          if (info.onSaturday && info.onSunday) {
            repiten.push(info);
          } else if (info.onSaturday) {
            soloSabado.push(info);
          } else if (info.onSunday) {
            soloDomingo.push(info);
          }
        });

        const designatedIds = new Set(Object.keys(refsMap).map(Number));
        const noDesignados = window.state.arbitros.filter(a => a.estado && !designatedIds.has(Number(a.idArbitro)));

        return {
          repiten,
          soloSabado,
          soloDomingo,
          noDesignados
        };
      });

      const sab = computed(() => window.state.arbitros.filter(a => a.estado && a.disponibleSabado));
      const dom = computed(() => window.state.arbitros.filter(a => a.estado && a.disponibleDomingo));
      const inactivos = computed(() => window.state.arbitros.filter(a => !a.estado));

      const messageText = computed(() => {
        const lists = [
          ...window.state.designacionesIncompletas,
          ...window.state.designaciones,
          ...(window.state.designacionesAceptadas || []),
        ];

        const datesMap = {};
        lists.forEach((d) => {
          const dateStr = d.fecha?.split("T")[0];
          if (!dateStr) return;
          if (!datesMap[dateStr]) datesMap[dateStr] = [];
          const msgDetail = datesMap[dateStr].find(x => (x.id || x.idDesignacion) === (d.id || d.idDesignacion));
          if (!msgDetail) datesMap[dateStr].push(d);
        });

        let msg = "*DESIGNACIONES PARA EL FIN DE SEMANA*\n\n";
        Object.keys(datesMap)
          .sort()
          .forEach((date) => {
            const formattedDate = window.formatFecha(date);
            msg += `*${formattedDate.toUpperCase()}*\n`;
            datesMap[date].forEach((d) => {
              const cancha =
                d.cancha?.nombreCancha ||
                window.getCancha(d.idCancha || d.canchaId)?.nombre ||
                "—";
              const parts = d.fecha?.split("T")[1]?.split(":");
              const timeStr = parts ? `${parts[0]}:${parts[1]}hs` : "A confirmar";
              msg += `🏟️ *${cancha.toUpperCase()}* - ⏰ ${timeStr} (${d.cantidadPartidos} partidos)\n`;

              const refs =
                window.state.arbitrosDesignadosMap[d.idDesignacion || d.id] ||
                d.arbitros ||
                [];
              if (refs.length === 0) {
                msg += "⚠️ _Sin árbitros designados aún_\n";
              } else {
                refs.forEach((r) => {
                  const aVal = r.arbitro || window.getArbitro(r.idArbitro);
                  msg += `• ${aVal ? `${aVal.nombre} ${aVal.apellido}` : "—"} (${r.rol || "Árbitro"})\n`;
                });
              }
              msg += "\n";
            });
          });
        return msg;
      });

      const submitCancha = async () => {
        if (!form.nombreCancha) {
          alert("Completá el nombre de la cancha.");
          return;
        }
        const dto = {
          nombreCancha: form.nombreCancha.trim(),
          categoria: form.categoria || "FUTBOL_11",
          fueraDeJuego: form.fueraDeJuego || false,
          estado: form.estado !== false,
        };
        if (type.value === "editCancha") {
          const c = window.getCancha(id.value);
          if (c) {
            c.nombreCancha = dto.nombreCancha;
            c.nombre = dto.nombreCancha;
            c.categoria = dto.categoria;
            c.fueraDeJuego = dto.fueraDeJuego;
            c.estado = dto.estado;
          }
          window.closeModal();
        } else {
          try {
            const created = await window.canchaService.createCancha(dto);
            window.state.canchas.push({
              id: created.idCancha || created.id || window.state.nextCanchaId++,
              nombre: created.nombreCancha || created.nombre || dto.nombreCancha,
              categoria: created.categoria || dto.categoria,
              fueraDeJuego: created.fueraDeJuego !== undefined ? created.fueraDeJuego : dto.fueraDeJuego,
              estado: created.estado !== undefined ? created.estado : dto.estado,
              partidos: 0,
              ciudad: "",
              ...created,
            });
            window.closeModal();
          } catch (err) {
            console.error("Error al crear cancha:", err);
            alert("No se pudo crear la cancha: " + err.message);
          }
        }
      };

      const submitArbitro = async () => {
        if (!form.nombre || !form.apellido) {
          alert("Ingresá nombre y apellido.");
          return;
        }
        const dto = {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          rol: form.rol || "Árbitro Principal",
          whatsapp: form.whatsapp?.trim() || "",
          estado: form.estado !== false,
          disponibleSabado: form.disponibleSabado !== false,
          disponibleDomingo: form.disponibleDomingo !== false,
          categoria: form.categoria || "INICIAL",
          talleCamiseta: form.talleCamiseta || "M",
          talleShort: form.talleShort || "M",
        };
        if (type.value === "editArbitro") {
          try {
            const updated = await window.arbitroService.updateArbitro(id.value, dto);
            const aVal = window.getArbitro(id.value);
            if (aVal) Object.assign(aVal, { ...dto, ...(updated || {}) });
            window.closeModal();
          } catch (err) {
            console.error("Error al actualizar árbitro:", err);
            alert("No se pudo actualizar el árbitro: " + err.message);
          }
        } else {
          try {
            const created = await window.arbitroService.createArbitro(dto);
            window.state.arbitros.push({
              idArbitro: created.idArbitro || created.id || window.state.nextArbId++,
              designaciones: 0,
              ...created,
            });
            window.closeModal();
          } catch (err) {
            console.error("Error al crear árbitro:", err);
            alert("No se pudo crear el árbitro: " + err.message);
          }
        }
      };

      const submitDesignacion = async () => {
        const cId = Number(form.canchaId);
        if (!cId || !form.fecha || !form.cantidadPartidos) {
          alert("Completá cancha, fecha y cantidad de partidos.");
          return;
        }
        let formattedFecha = form.fecha;
        if (form.fecha && form.fecha.includes("T") && form.fecha.split(":").length === 2) {
          formattedFecha = form.fecha + ":00";
        }
        const dto = {
          idCancha: cId,
          fecha: formattedFecha,
          cantidadPartidos: Number(form.cantidadPartidos),
          etapaCampeonato: form.etapaCampeonato || "FECHA_NORMAL",
        };
        try {
          if (type.value === "editDesignacion") {
            await window.designacionService.actualizarDesignacion(id.value, dto);
          } else {
            await window.designacionService.createDesignacion(dto);
          }
          await window.reloadAllDesignaciones();
          window.closeModal();
        } catch (err) {
          console.error("Error al guardar designación:", err);
          alert("No se pudo guardar la designación: " + err.message);
        }
      };

      // Manage referees state
      const selectedRef = ref("");
      const selectedRole = ref(window.ROLES_ARB[0]);
      const isAssigning = ref(false);

      const assignReferee = async () => {
        if (!selectedRef.value) return;
        isAssigning.value = true;
        try {
          await window.designacionService.asignarArbitroManual(id.value, Number(selectedRef.value));
          window.state.arbitrosDesignadosMap[id.value] = [];
          const res = await window.designacionService.getDesignados(id.value);
          window.state.arbitrosDesignadosMap[id.value] = Array.isArray(res) ? res : res.data || res || [];
          await window.reloadAllDesignaciones();
          if (window.updateDesignacionStateLocal) window.updateDesignacionStateLocal(id.value);
          selectedRef.value = "";
        } catch (err) {
          console.error("API assign failed", err);
          alert("No se pudo asignar el árbitro: " + err.message);
        } finally {
          isAssigning.value = false;
        }
      };

      const removeReferee = async (refId) => {
        try {
          await window.designacionService.quitarArbitroManual(id.value, refId);
          window.state.arbitrosDesignadosMap[id.value] = [];
          const res = await window.designacionService.getDesignados(id.value);
          window.state.arbitrosDesignadosMap[id.value] = Array.isArray(res) ? res : res.data || res || [];
          await window.reloadAllDesignaciones();
          if (window.updateDesignacionStateLocal) window.updateDesignacionStateLocal(id.value);
        } catch (err) {
          console.error("API remove failed", err);
          alert("No se pudo quitar el árbitro: " + err.message);
        }
      };

      // Update fees state
      const globalFee = ref("");
      const isApplyingFee = ref(false);

      const applyGlobalFee = async () => {
        const fee = Number(globalFee.value);
        if (isNaN(fee) || fee <= 0) return;
        isApplyingFee.value = true;
        try {
          await window.designacionService.actualizarMontoATodos(id.value, fee);
          window.state.arbitrosDesignadosMap[id.value] = [];
          const res = await window.designacionService.getDesignados(id.value);
          window.state.arbitrosDesignadosMap[id.value] = Array.isArray(res) ? res : res.data || res || [];
          globalFee.value = "";
        } catch (err) {
          console.error("API update global fee failed", err);
          alert("No se pudo aplicar el viático global: " + err.message);
        } finally {
          isApplyingFee.value = false;
        }
      };

      const updateIndividualFee = async (assignedId, val) => {
        try {
          await window.designacionService.actualizarMontoPercibido(assignedId, Number(val));
          const match = assigned.value.find(asg => (asg.idDesignados || asg.id) === assignedId);
          if (match) match.montoPercibido = Number(val);
        } catch (err) {
          console.error("API individual fee update failed", err);
          alert("No se pudo actualizar el viático: " + err.message);
        }
      };

      const deleteSuspensionFromModal = () => {
        if (window.deleteSuspencion) {
          window.deleteSuspencion(id.value);
        }
        window.closeModal();
      };

      const copyWaText = () => {
        const area = document.getElementById("whatsapp-text-area");
        if (area) {
          area.select();
          document.execCommand("copy");
          alert("Texto copiado al portapapeles.");
        }
      };

      const sendWaDirect = () => {
        const text = encodeURIComponent(messageText.value);
        window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
      };

      // Comparativa state
      const compLastSat = ref("");
      const compThisSat = ref("");
      const isGeneratingComp = ref(false);

      // -- UI State Availability --
      const currentTabDisponibilidad = ref('todos');

      const availabilityGroups = computed(() => {
        const list = window.state.arbitros;
        const ambos = list.filter(a => a.estado && a.disponibleSabado && a.disponibleDomingo);
        const soloSabado = list.filter(a => a.estado && a.disponibleSabado && !a.disponibleDomingo);
        const soloDomingo = list.filter(a => a.estado && !a.disponibleSabado && a.disponibleDomingo);
        const sinDisponibilidad = list.filter(a => a.estado && !a.disponibleSabado && !a.disponibleDomingo);
        const inactivos = list.filter(a => !a.estado);
        return {
          ambos,
          soloSabado,
          soloDomingo,
          sinDisponibilidad,
          inactivos
        };
      });

      const filteredDisponibilidadList = computed(() => {
        const grp = availabilityGroups.value;
        if (currentTabDisponibilidad.value === 'todos') {
          return [...grp.ambos, ...grp.soloSabado, ...grp.soloDomingo, ...grp.sinDisponibilidad];
        } else if (currentTabDisponibilidad.value === 'ambos') {
          return grp.ambos;
        } else if (currentTabDisponibilidad.value === 'soloSabado') {
          return grp.soloSabado;
        } else if (currentTabDisponibilidad.value === 'soloDomingo') {
          return grp.soloDomingo;
        } else if (currentTabDisponibilidad.value === 'sinDisponibilidad') {
          return grp.sinDisponibilidad;
        } else if (currentTabDisponibilidad.value === 'inactivos') {
          return grp.inactivos;
        }
        return [];
      });

      const getDisponibilidadBorderClass = (item) => {
        if (!item.estado) return 'bg-slate-400';
        if (item.disponibleSabado && item.disponibleDomingo) return 'bg-blue-400';
        if (item.disponibleSabado) return 'bg-emerald-400';
        if (item.disponibleDomingo) return 'bg-orange-400';
        return 'bg-red-400';
      };

      // -- UI State --
      const currentTabDesignados = ref('todos');
      const currentTabComparativa = ref('todos');
      const comparativaData = ref(null);

      // Computed para filtrar Designados
      const filteredDesignadosList = computed(() => {
        const groups = assignedWeekendGroups.value;
        let list = [];
        if (currentTabDesignados.value === 'todos' || currentTabDesignados.value === 'repiten') {
          groups.repiten.forEach(x => list.push({ ...x, _sourceType: 'repiten' }));
        }
        if (currentTabDesignados.value === 'todos' || currentTabDesignados.value === 'soloSabado') {
          groups.soloSabado.forEach(x => list.push({ ...x, _sourceType: 'soloSabado' }));
        }
        if (currentTabDesignados.value === 'todos' || currentTabDesignados.value === 'soloDomingo') {
          groups.soloDomingo.forEach(x => list.push({ ...x, _sourceType: 'soloDomingo' }));
        }
        if (currentTabDesignados.value === 'noDesignados') {
          groups.noDesignados.forEach(x => list.push({ ref: x, matches: [], onSaturday: false, onSunday: false, _sourceType: 'noDesignados' }));
        }
        return list;
      });

      const getDesignadosBorderClass = (item) => {
        if (item._sourceType === 'repiten') return 'bg-blue-400';
        if (item._sourceType === 'soloSabado') return 'bg-emerald-400';
        if (item._sourceType === 'soloDomingo') return 'bg-orange-400';
        return 'bg-red-400';
      };

      // Computed para filtrar Comparativa
      const filteredComparativaList = computed(() => {
        if (!comparativaData.value) return [];
        let list = [];
        const addToList = (sourceArr, type) => {
          sourceArr.forEach(x => list.push({ ...x, _sourceType: type }));
        };
        
        if (currentTabComparativa.value === 'todos' || currentTabComparativa.value === 'repitenAmbosSabDom') addToList(comparativaData.value.repitenAmbosSabDom, 'repitenAmbosSabDom');
        if (currentTabComparativa.value === 'todos' || currentTabComparativa.value === 'repitenSabado') addToList(comparativaData.value.repitenSabado, 'repitenSabado');
        if (currentTabComparativa.value === 'todos' || currentTabComparativa.value === 'repitenDomingo') addToList(comparativaData.value.repitenDomingo, 'repitenDomingo');
        if (currentTabComparativa.value === 'todos' || currentTabComparativa.value === 'soloFindePasado') addToList(comparativaData.value.soloFindePasado, 'soloFindePasado');
        if (currentTabComparativa.value === 'todos' || currentTabComparativa.value === 'soloEsteFinde') addToList(comparativaData.value.soloEsteFinde, 'soloEsteFinde');
        
        return list;
      });

      const getComparativaBadgeStyle = (type) => {
        if (type === 'repitenAmbosSabDom') return 'bg-red-50 text-red-600 border-red-200';
        if (type === 'repitenSabado') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        if (type === 'repitenDomingo') return 'bg-blue-50 text-blue-600 border-blue-200';
        if (type === 'soloFindePasado') return 'bg-indigo-50 text-indigo-600 border-indigo-200';
        if (type === 'soloEsteFinde') return 'bg-green-50 text-green-600 border-green-200';
        return '';
      };
      const getComparativaBadgeText = (type) => {
        if (type === 'repitenAmbosSabDom') return 'Repiten Sáb/Dom';
        if (type === 'repitenSabado') return 'Repiten Sábado';
        if (type === 'repitenDomingo') return 'Repiten Domingo';
        if (type === 'soloFindePasado') return 'Sólo Pasado';
        if (type === 'soloEsteFinde') return 'Sólo Este';
        return '';
      };

      const printComparativaReportLegacy = () => {
        if (comparativaData.value) {
            window.printComparativaReport(comparativaData.value);
        }
      };


      const generateComparativa = async () => {
        if (!compLastSat.value || !compThisSat.value) {
          alert("Completa ambas fechas de referencia (Sábados).");
          return;
        }
        isGeneratingComp.value = true;
        try {
          const lastSunDate = new Date(compLastSat.value);
          lastSunDate.setDate(lastSunDate.getDate() + 1);
          const lastSunStr = lastSunDate.toISOString().split("T")[0];

          const thisSunDate = new Date(compThisSat.value);
          thisSunDate.setDate(thisSunDate.getDate() + 1);
          const thisSunStr = thisSunDate.toISOString().split("T")[0];

          const listLast = await window.designacionService.buscarPorRango(compLastSat.value, lastSunStr);
          const listThis = await window.designacionService.buscarPorRango(compThisSat.value, thisSunStr);

          const allList = [...listLast, ...listThis];
          for (const d of allList) {
            const dId = d.idDesignacion || d.id;
            if (!window.state.arbitrosDesignadosMap[dId]) {
              const refs = await window.designacionService.getDesignados(dId);
              window.state.arbitrosDesignadosMap[dId] = Array.isArray(refs) ? refs : refs.data || refs || [];
            }
          }

          comparativaData.value = {
            datesLast: [compLastSat.value, lastSunStr],
            datesThis: [compThisSat.value, thisSunStr],
            repitenAmbosSabDom: window.getRepitenAmbosSabDom(listLast, listThis),
            repitenSabado: window.getRepitenSabado(listLast, listThis),
            repitenDomingo: window.getRepitenDomingo(listLast, listThis),
            soloFindePasado: window.getSoloFindePasado(listLast, listThis),
            soloEsteFinde: window.getSoloEsteFinde(listLast, listThis),
          };
        } catch (err) {
          console.error(err);
          alert("Error al generar comparativa: " + err.message);
        } finally {
          isGeneratingComp.value = false;
        }
      };

      watch(type, (newType) => {
        if (newType === "comparativaWeekend") {
          const defaultLast = window.getMostRecentSaturday();
          const defaultThisDate = new Date(defaultLast);
          defaultThisDate.setDate(defaultThisDate.getDate() + 7);
          const defaultThis = defaultThisDate.toISOString().split("T")[0];
          compLastSat.value = defaultLast;
          compThisSat.value = defaultThis;
          currentTabComparativa.value = 'todos';
          generateComparativa();
        } else if (newType === "arbitrosDesignadosWeekend") {
          currentTabDesignados.value = 'todos';
        } else if (newType === "arbitrosPorDia") {
          currentTabDisponibilidad.value = 'todos';
        }
      });

      return {
        modal,
        type,
        id,
        isEdit,
        state,
        form,
        des,
        assigned,
        required,
        isComplete,
        available,
        s,
        a,
        sab,
        dom,
        inactivos,
        messageText,
        assignedWeekendGroups,

        submitCancha,
        submitArbitro,
        submitDesignacion,

        selectedRef,
        selectedRole,
        isAssigning,
        assignReferee,
        removeReferee,

        globalFee,
        isApplyingFee,
        applyGlobalFee,
        updateIndividualFee,

        deleteSuspensionFromModal,
        copyWaText,
        sendWaDirect,

        compLastSat,
          compThisSat,
          isGeneratingComp,
          generateComparativa,
          printComparativaReportLegacy,
          currentTabDesignados,
          currentTabComparativa,
          comparativaData,
          filteredDesignadosList,
          getDesignadosBorderClass,
          filteredComparativaList,
          getComparativaBadgeStyle,
          getComparativaBadgeText,
        currentTabDisponibilidad,
        filteredDisponibilidadList,
        getDisponibilidadBorderClass,
        availabilityGroups,
        closeModal: window.closeModal,
        window
      };
    }
  };
})();
