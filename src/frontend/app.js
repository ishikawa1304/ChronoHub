// ============================================================
// ChronoHub - Full SPA Logic (app.js)
// Handles: Tasks, Events (Schedule), Meetings, Focus Timer, Carousel
// ============================================================

const API = "http://127.0.0.1:8000/api/v1";

// Obtener el JWT almacenado
const getToken = () => localStorage.getItem("chrono_token");

// Cerrar sesión y redirigir al login
function forceLogout() {
    localStorage.clear();
    window.location.href = "auth.html";
}

// Verificar que hay sesión activa al cargar el dashboard
if (!getToken()) {
    forceLogout();
}

// Global fetch interceptor — añade Authorization: Bearer <token> en todas las llamadas a la API
const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
    if (typeof url === "string" && url.startsWith(API)) {
        const token = getToken();
        if (!options.headers) {
            options.headers = {};
        }
        if (options.headers instanceof Headers) {
            if (!options.headers.has("Authorization") && token) {
                options.headers.append("Authorization", `Bearer ${token}`);
            }
        } else {
            if (!options.headers["Authorization"] && token) {
                options.headers["Authorization"] = `Bearer ${token}`;
            }
        }
    }
    const response = await originalFetch(url, options);
    // Si el servidor responde 401, el token expiró o es inválido
    if (response.status === 401 && typeof url === "string" && url.startsWith(API)) {
        showToast("Tu sesión ha expirado. Inicia sesión nuevamente.", "error");
        setTimeout(forceLogout, 1500);
    }
    return response;
};

let allTasks = [];
let allEvents = [];
let allMeetings = [];
let selectedDate = new Date();
let editingTaskId = null;
let editingEventId = null;
let editingMeetingId = null;

// ============================================================
// 1. INITIALIZATION
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    // Collapse Focus Sessions Card
    const btnFocusCollapse = document.getElementById("btn-focus-collapse");
    const focusSessionsCard = document.getElementById("focus-sessions-card");
    if (btnFocusCollapse && focusSessionsCard) {
        const isCollapsed = localStorage.getItem("focus_card_collapsed") === "true";
        if (isCollapsed) {
            focusSessionsCard.classList.add("collapsed");
        }
        btnFocusCollapse.addEventListener("click", () => {
            focusSessionsCard.classList.toggle("collapsed");
            localStorage.setItem("focus_card_collapsed", focusSessionsCard.classList.contains("collapsed"));
        });
    }

    // SPA Navigation
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", e => {
            e.preventDefault();
            navigateTo(item.dataset.view);
        });
    });

    // Modals
    document.getElementById("btn-open-task-modal")?.addEventListener("click", () => openCreateModal("task-modal"));
    document.getElementById("btn-open-task-modal-2")?.addEventListener("click", () => openCreateModal("task-modal"));
    document.getElementById("btn-open-event-modal")?.addEventListener("click", () => openCreateModal("event-modal"));
    document.getElementById("btn-open-meeting-modal")?.addEventListener("click", () => openCreateModal("meeting-modal"));

    document.querySelectorAll("[data-close]").forEach(btn => {
        btn.addEventListener("click", () => closeModal(btn.dataset.close));
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", e => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    // Forms
    document.getElementById("create-task-form").addEventListener("submit", handleCreateTask);
    document.getElementById("create-event-form").addEventListener("submit", handleCreateEvent);
    document.getElementById("create-meeting-form").addEventListener("submit", handleCreateMeeting);

    // Search
    document.getElementById("search-input").addEventListener("input", onSearch);

    // Trash
    document.getElementById("btn-trash").addEventListener("click", purgeCompletedTasks);

    // Participant management
    document.getElementById("btn-add-participant").addEventListener("click", addParticipantRow);
    setupParticipantRemove(document.querySelector(".btn-remove-participant"));

    // Initial data loads
    fetchTasks();
    fetchEvents();
    fetchMeetings().then(() => renderUpcomingMeetingsCarousel());
    fetchUserProfile();

    // Subsystems
    initFocusTimer();
    renderWeekHeader();
    initNotifications();
    initUserProfileModal();
    initDashboardCreateDropdown();
    initScheduleWeekNavigation();
    initSidebarMenu();
    initCustomDateTimePickers();
});

// ============================================================
// 2. SPA NAVIGATION
// ============================================================
function navigateTo(view) {
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));

    const targetView = document.getElementById(`view-${view}`);
    const targetNav = document.querySelector(`[data-view="${view}"]`);

    if (targetView) targetView.classList.remove("hidden");
    if (targetNav) targetNav.classList.add("active");

    // Refresh data on navigation
    if (view === "dashboard" || view === "tasks") filterAndRenderTasks();
    if (view === "schedule") renderEvents();
    if (view === "meetings") renderMeetings();
    if (view === "analytics") renderAnalytics();
}

// ============================================================
// 3. TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icons = {
        success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
        error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    };
    toast.innerHTML = `${icons[type] || icons.success} <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = "slideInRight 0.3s reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================
// 4. MODAL UTILITIES
// ============================================================
function setupModal(btnId, modalId) {
    const btn = document.getElementById(btnId);
    if (btn) btn.addEventListener("click", () => openModal(modalId));
}

function openModal(id) {
    document.getElementById(id)?.classList.add("active");
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove("active");
}

function openCreateModal(modalId) {
    if (modalId === "task-modal") {
        editingTaskId = null;
        document.getElementById("create-task-form").reset();
        const titleEl = document.querySelector("#task-modal .modal-title");
        if (titleEl) titleEl.textContent = "Nueva Tarea";
        const submitBtn = document.querySelector("#create-task-form button[type='submit']");
        if (submitBtn) submitBtn.textContent = "Guardar Tarea";
    } else if (modalId === "event-modal") {
        editingEventId = null;
        document.getElementById("create-event-form").reset();
        const titleEl = document.querySelector("#event-modal .modal-title");
        if (titleEl) titleEl.textContent = "Nuevo Evento";
        const submitBtn = document.querySelector("#create-event-form button[type='submit']");
        if (submitBtn) submitBtn.textContent = "Guardar Evento";
    } else if (modalId === "meeting-modal") {
        editingMeetingId = null;
        document.getElementById("create-meeting-form").reset();
        resetParticipantRows();
        const titleEl = document.querySelector("#meeting-modal .modal-title");
        if (titleEl) titleEl.textContent = "Agendar Reunión";
        const submitBtn = document.querySelector("#create-meeting-form button[type='submit']");
        if (submitBtn) submitBtn.textContent = "Agendar Reunión";
    }
    openModal(modalId);
}

// ============================================================
// 5. TASKS MODULE
// ============================================================
async function fetchTasks() {
    try {
        const res = await fetch(`${API}/tasks`);
        if (!res.ok) throw new Error();
        allTasks = await res.json();
        allTasks.sort((a, b) => {
            if (a.status === "completed" && b.status !== "completed") return 1;
            if (a.status !== "completed" && b.status === "completed") return -1;
            return b.id - a.id;
        });
        filterAndRenderTasks();
    } catch {
        document.getElementById("tasks-list").innerHTML =
            `<div class="tasks-loading" style="color:var(--color-high)">Error de conexión al backend. Verifica que el servidor esté activo.</div>`;
    }
}

function onSearch() {
    const view = document.querySelector(".view:not(.hidden)")?.id;
    if (view === "view-dashboard" || view === "view-tasks") filterAndRenderTasks();
    if (view === "view-schedule") renderEvents();
}

function filterAndRenderTasks() {
    const query = document.getElementById("search-input").value.toLowerCase().trim();
    const filtered = allTasks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
    );

    const active = allTasks.filter(t => t.status !== "completed").length;
    const badge = document.getElementById("task-count-badge");
    if (badge) badge.textContent = `${active} tarea${active !== 1 ? "s" : ""}`;

    renderTaskList("tasks-list", filtered, 280);
    renderTaskList("tasks-list-full", filtered, null);
}

function renderTaskList(containerId, tasks, maxHeight) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = `<div class="tasks-loading">No se encontraron tareas.</div>`;
        return;
    }

    container.innerHTML = "";
    if (maxHeight) container.style.maxHeight = `${maxHeight}px`;

    tasks.forEach(task => {
        const isCompleted = task.status === "completed";
        const el = document.createElement("div");
        el.className = `task-item${isCompleted ? " completed" : ""}`;
        el.dataset.id = task.id;

        let meta = "";
        if (task.due_date) {
            const d = new Date(task.due_date);
            meta = `<span class="task-meta">⏱ ${d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })} ${d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>`;
        } else if (task.description) {
            meta = `<span class="task-meta">${escapeHtml(task.description)}</span>`;
        }

        el.innerHTML = `
            <div class="task-checkbox-container">
                <input type="checkbox" class="task-checkbox" ${isCompleted ? "checked" : ""} onchange="toggleTaskStatus(${task.id}, this.checked)">
            </div>
            <div class="task-details">
                <span class="task-title-text">${escapeHtml(task.title)}</span>
                <div class="task-tags">
                    <span class="task-tag tag-${task.priority}">${task.priority}</span>
                    ${meta}
                </div>
            </div>
            <button class="btn-task-edit" onclick="editTask(${task.id})" title="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
            </button>
            <button class="btn-task-delete" onclick="deleteTask(${task.id})" title="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`;
        container.appendChild(el);
    });
}

async function handleCreateTask(e) {
    e.preventDefault();
    const title = document.getElementById("task-title").value.trim();
    const description = document.getElementById("task-desc").value.trim();
    const priority = document.getElementById("task-priority").value;
    const dueRaw = document.getElementById("task-due").value;

    if (!title) return;

    const payload = {
        title,
        description: description || null,
        priority,
        due_date: dueRaw ? new Date(dueRaw).toISOString() : null
    };

    try {
        let res;
        if (editingTaskId) {
            res = await fetch(`${API}/tasks/${editingTaskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch(`${API}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }
        if (!res.ok) throw new Error();
        showToast(editingTaskId ? "¡Tarea actualizada exitosamente!" : "¡Tarea creada exitosamente!");
        closeModal("task-modal");
        document.getElementById("create-task-form").reset();
        editingTaskId = null;
        fetchTasks();
    } catch {
        showToast(editingTaskId ? "Error al actualizar la tarea" : "Error al crear la tarea", "error");
    }
}

window.editTask = function(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;

    document.getElementById("task-title").value = task.title;
    document.getElementById("task-desc").value = task.description || "";
    document.getElementById("task-priority").value = task.priority;
    
    if (task.due_date) {
        const d = new Date(task.due_date);
        const pad = n => String(n).padStart(2, "0");
        const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        document.getElementById("task-due").value = localStr;
    } else {
        document.getElementById("task-due").value = "";
    }

    const titleEl = document.querySelector("#task-modal .modal-title");
    if (titleEl) titleEl.textContent = "Editar Tarea";
    const submitBtn = document.querySelector("#create-task-form button[type='submit']");
    if (submitBtn) submitBtn.textContent = "Guardar Cambios";

    openModal("task-modal");
};

async function toggleTaskStatus(taskId, isChecked) {
    const status = isChecked ? "completed" : "pending";
    try {
        await fetch(`${API}/tasks/${taskId}/status?status=${status}`, { method: "PATCH" });
        const task = allTasks.find(t => t.id === taskId);
        if (task) task.status = status;
        showToast(isChecked ? "Tarea completada 🎉" : "Tarea reactivada");
        setTimeout(fetchTasks, 500);
    } catch {
        showToast("Error al actualizar", "error");
        fetchTasks();
    }
}

async function deleteTask(taskId) {
    try {
        await fetch(`${API}/tasks/${taskId}`, { method: "DELETE" });
        const el = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (el) { el.style.opacity = "0"; el.style.transform = "scale(0.9)"; el.style.transition = "all 0.3s ease"; }
        showToast("Tarea eliminada");
        setTimeout(fetchTasks, 300);
    } catch {
        showToast("Error al eliminar", "error");
    }
}

async function purgeCompletedTasks() {
    const completed = allTasks.filter(t => t.status === "completed");
    if (completed.length === 0) { showToast("No hay tareas completadas", "error"); return; }
    for (const t of completed) {
        try { await fetch(`${API}/tasks/${t.id}`, { method: "DELETE" }); } catch {}
    }
    showToast(`${completed.length} tarea(s) limpiadas`);
    fetchTasks();
}

// ============================================================
// 6. EVENTS (SCHEDULE) MODULE
// ============================================================
async function fetchEvents() {
    try {
        const res = await fetch(`${API}/events`);
        if (!res.ok) throw new Error();
        allEvents = await res.json();
        allEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        renderEvents();
    } catch {
        const el = document.getElementById("events-list");
        if (el) el.innerHTML = `<div class="tasks-loading" style="color:var(--color-high)">Error al cargar eventos. Verifica el backend.</div>`;
    }
}

function renderEvents() {
    const container = document.getElementById("events-list");
    if (!container) return;

    const query = document.getElementById("search-input").value.toLowerCase().trim();
    
    // Filter events by selected date AND search query
    const filtered = allEvents.filter(e => {
        const start = new Date(e.start_time);
        const matchesDate = start.toDateString() === selectedDate.toDateString();
        const matchesQuery = e.title.toLowerCase().includes(query);
        return matchesDate && matchesQuery;
    });

    if (filtered.length === 0) {
        const dateStr = selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
        container.innerHTML = `
            <div class="tasks-loading" style="flex-direction: column; gap: 10px;">
                <span>No hay eventos programados para el ${dateStr}.</span>
                <button class="btn-outline" id="btn-show-all-events" style="padding: 6px 12px; font-size: 12px; border-radius: 8px;">Mostrar todos los eventos</button>
            </div>`;
        document.getElementById("btn-show-all-events")?.addEventListener("click", () => {
            renderAllEventsWithoutDateFilter();
        });
        return;
    }

    container.innerHTML = "";
    filtered.forEach(ev => {
        const start = new Date(ev.start_time);
        const end = new Date(ev.end_time);
        const fmt = { hour: "2-digit", minute: "2-digit" };
        const startStr = start.toLocaleTimeString("es-ES", fmt);
        const endStr = end.toLocaleTimeString("es-ES", fmt);

        const el = document.createElement("div");
        el.className = "event-item";
        el.dataset.id = ev.id;
        el.innerHTML = `
            <div class="event-color-dot" style="background-color:${ev.color_code || "#4A6CF7"}"></div>
            <div class="event-details">
                <span class="event-title">${escapeHtml(ev.title)}</span>
                <span class="event-time">
                    ${ev.is_all_day
                        ? `<span class="event-all-day-badge">Todo el día</span>`
                        : `⏰ ${startStr} → ${endStr}`}
                </span>
            </div>
            <button class="btn-event-edit" onclick="editEvent(${ev.id})" title="Editar evento">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
            </button>
            <button class="btn-event-delete" onclick="deleteEvent(${ev.id})" title="Eliminar evento">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`;
        container.appendChild(el);
    });
}

function renderAllEventsWithoutDateFilter() {
    const container = document.getElementById("events-list");
    if (!container) return;

    const query = document.getElementById("search-input").value.toLowerCase().trim();
    const filtered = allEvents.filter(e => e.title.toLowerCase().includes(query));

    if (filtered.length === 0) {
        container.innerHTML = `<div class="tasks-loading">No hay eventos en el calendario. ¡Crea uno con el botón "Nuevo Evento"!</div>`;
        return;
    }

    container.innerHTML = "";
    filtered.forEach(ev => {
        const start = new Date(ev.start_time);
        const end = new Date(ev.end_time);
        const fmt = { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" };
        const startStr = start.toLocaleDateString("es-ES", fmt);
        const endStr = end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

        const el = document.createElement("div");
        el.className = "event-item";
        el.dataset.id = ev.id;
        el.innerHTML = `
            <div class="event-color-dot" style="background-color:${ev.color_code || "#4A6CF7"}"></div>
            <div class="event-details">
                <span class="event-title">${escapeHtml(ev.title)}</span>
                <span class="event-time">
                    ${ev.is_all_day
                        ? `<span class="event-all-day-badge">Todo el día</span>`
                        : `📅 ${startStr} → ${endStr}`}
                </span>
            </div>
            <button class="btn-event-edit" onclick="editEvent(${ev.id})" title="Editar evento">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
            </button>
            <button class="btn-event-delete" onclick="deleteEvent(${ev.id})" title="Eliminar evento">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`;
        container.appendChild(el);
    });
}

async function handleCreateEvent(e) {
    e.preventDefault();
    const title = document.getElementById("event-title").value.trim();
    const start = document.getElementById("event-start").value;
    const end = document.getElementById("event-end").value;
    const color = document.getElementById("event-color").value;
    const isAllDay = document.getElementById("event-allday").checked;

    if (!title || !start || !end) return;
    if (new Date(end) <= new Date(start)) {
        showToast("La fecha de fin debe ser posterior al inicio", "error"); return;
    }

    const payload = {
        title,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
        is_all_day: isAllDay,
        color_code: color
    };

    try {
        let res;
        if (editingEventId) {
            res = await fetch(`${API}/events/${editingEventId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch(`${API}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }
        if (!res.ok) throw new Error();
        showToast(editingEventId ? "¡Evento actualizado exitosamente! 📅" : "¡Evento creado exitosamente! 📅");
        closeModal("event-modal");
        document.getElementById("create-event-form").reset();
        editingEventId = null;
        fetchEvents();
    } catch {
        showToast(editingEventId ? "Error al actualizar el evento" : "Error al crear el evento", "error");
    }
}

window.editEvent = function(eventId) {
    const ev = allEvents.find(e => e.id === eventId);
    if (!ev) return;

    editingEventId = eventId;

    document.getElementById("event-title").value = ev.title;
    
    const formatLocal = (dtStr) => {
        const d = new Date(dtStr);
        const pad = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    document.getElementById("event-start").value = formatLocal(ev.start_time);
    document.getElementById("event-end").value = formatLocal(ev.end_time);
    document.getElementById("event-color").value = ev.color_code || "#4A6CF7";
    document.getElementById("event-allday").checked = ev.is_all_day || false;

    const titleEl = document.querySelector("#event-modal .modal-title");
    if (titleEl) titleEl.textContent = "Editar Evento";
    const submitBtn = document.querySelector("#create-event-form button[type='submit']");
    if (submitBtn) submitBtn.textContent = "Guardar Cambios";

    openModal("event-modal");
};

async function deleteEvent(eventId) {
    try {
        await fetch(`${API}/events/${eventId}`, { method: "DELETE" });
        const el = document.querySelector(`.event-item[data-id="${eventId}"]`);
        if (el) { el.style.opacity = "0"; el.style.transition = "all 0.3s ease"; }
        showToast("Evento eliminado");
        setTimeout(fetchEvents, 300);
    } catch {
        showToast("Error al eliminar el evento", "error");
    }
}

function renderWeekHeader() {
    const container = document.getElementById("week-header");
    if (!container) return;
    const today = new Date();
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    container.innerHTML = "";
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const isToday = d.toDateString() === today.toDateString();
        const isActive = d.toDateString() === selectedDate.toDateString();
        
        const col = document.createElement("div");
        col.className = `week-day-col${isToday ? " today" : ""}${isActive ? " active" : ""}`;
        col.innerHTML = `<div class="week-day-name">${days[d.getDay()]}</div><div class="week-day-number">${d.getDate()}</div>`;
        
        col.addEventListener("click", () => {
            selectedDate = d;
            renderWeekHeader();
            renderEvents();
        });
        
        container.appendChild(col);
    }
}

// ============================================================
// 7. MEETINGS MODULE
// ============================================================
async function fetchMeetings() {
    try {
        const res = await fetch(`${API}/meetings`);
        if (!res.ok) throw new Error();
        allMeetings = await res.json();
        allMeetings.sort((a, b) => new Date(a.event?.start_time) - new Date(b.event?.start_time));
        renderMeetings();
        renderUpcomingMeetingsCarousel();
    } catch {
        const el = document.getElementById("meetings-grid");
        if (el) el.innerHTML = `<div class="tasks-loading" style="color:var(--color-high)">Error al cargar reuniones. Verifica el backend.</div>`;
    }
}

function renderMeetings() {
    const container = document.getElementById("meetings-grid");
    if (!container) return;

    if (allMeetings.length === 0) {
        container.innerHTML = `<div class="tasks-loading">No hay reuniones agendadas. ¡Crea una con "Nueva Reunión"!</div>`;
        return;
    }

    container.innerHTML = "";
    allMeetings.forEach(m => {
        const ev = m.event;
        const start = ev ? new Date(ev.start_time) : null;
        const end = ev ? new Date(ev.end_time) : null;
        const timeStr = start && end
            ? `${start.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })} · ${start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`
            : "Sin fecha";

        const isVirtual = m.location?.startsWith("http");
        const locationIcon = isVirtual
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

        const participantsHtml = (m.participants || []).map(p =>
            `<span class="participant-chip">${escapeHtml(p.email)}</span>`
        ).join("");

        const card = document.createElement("div");
        card.className = "meeting-full-card";
        card.dataset.id = m.id;
        card.innerHTML = `
            <div class="meeting-full-title">${escapeHtml(ev?.title || "Reunión")}</div>
            <div class="meeting-full-time">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${timeStr}
            </div>
            <div class="meeting-full-location">
                ${locationIcon}
                ${isVirtual ? `<a href="${escapeHtml(m.location)}" target="_blank" style="color:var(--color-primary);text-decoration:none;font-weight:600;">Unirse al enlace</a>` : escapeHtml(m.location)}
            </div>
            ${m.meeting_notes ? `<div class="meeting-full-notes">${escapeHtml(m.meeting_notes)}</div>` : ""}
            ${participantsHtml ? `
                <div class="meeting-participants-label">Participantes</div>
                <div class="meeting-participants-list">${participantsHtml}</div>
            ` : ""}
            <div class="meeting-card-actions" style="display: flex; gap: 8px;">
                <button class="btn-edit-meeting" onclick="editMeeting(${m.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
                    Editar
                </button>
                <button class="btn-delete-meeting" onclick="deleteMeeting(${m.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Eliminar
                </button>
            </div>`;
        container.appendChild(card);
    });
}

async function handleCreateMeeting(e) {
    e.preventDefault();
    const title = document.getElementById("meeting-title").value.trim();
    const start = document.getElementById("meeting-start").value;
    const end = document.getElementById("meeting-end").value;
    const location = document.getElementById("meeting-location").value.trim();
    const notes = document.getElementById("meeting-notes").value.trim();

    if (!title || !start || !end || !location) {
        showToast("Completa todos los campos obligatorios", "error"); return;
    }
    if (new Date(end) <= new Date(start)) {
        showToast("La hora de fin debe ser posterior al inicio", "error"); return;
    }

    const emailInputs = document.querySelectorAll(".participant-email");
    const participants = Array.from(emailInputs)
        .map(inp => inp.value.trim())
        .filter(email => email.length > 0)
        .map(email => ({ email, status: "invited" }));

    const payload = {
        location,
        meeting_notes: notes || null,
        event: {
            title,
            start_time: new Date(start).toISOString(),
            end_time: new Date(end).toISOString(),
            is_all_day: false,
            color_code: "#8B5CF6"
        },
        participants
    };

    try {
        let res;
        if (editingMeetingId) {
            res = await fetch(`${API}/meetings/${editingMeetingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch(`${API}/meetings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.detail || "Error del servidor");
        }
        showToast(editingMeetingId ? "¡Reunión actualizada exitosamente! 👥" : "¡Reunión agendada exitosamente! 👥");
        closeModal("meeting-modal");
        document.getElementById("create-meeting-form").reset();
        resetParticipantRows();
        editingMeetingId = null;
        fetchMeetings();
        fetchEvents();
    } catch (err) {
        showToast(`Error: ${err.message}`, "error");
    }
}

window.editMeeting = function(meetingId) {
    const m = allMeetings.find(meet => meet.id === meetingId);
    if (!m) return;

    editingMeetingId = meetingId;

    const ev = m.event;
    document.getElementById("meeting-title").value = ev ? ev.title : "";
    
    const formatLocal = (dtStr) => {
        if (!dtStr) return "";
        const d = new Date(dtStr);
        const pad = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    document.getElementById("meeting-start").value = ev ? formatLocal(ev.start_time) : "";
    document.getElementById("meeting-end").value = ev ? formatLocal(ev.end_time) : "";
    document.getElementById("meeting-location").value = m.location || "";
    document.getElementById("meeting-notes").value = m.meeting_notes || "";

    const container = document.getElementById("participants-container");
    container.innerHTML = "";
    if (m.participants && m.participants.length > 0) {
        m.participants.forEach(p => {
            const row = document.createElement("div");
            row.className = "participant-row";
            row.innerHTML = `
                <input type="email" class="participant-email" value="${escapeHtml(p.email)}" placeholder="correo@ejemplo.com">
                <button type="button" class="btn-remove-participant" title="Quitar">×</button>`;
            setupParticipantRemove(row.querySelector(".btn-remove-participant"));
            container.appendChild(row);
        });
    } else {
        resetParticipantRows();
    }

    const titleEl = document.querySelector("#meeting-modal .modal-title");
    if (titleEl) titleEl.textContent = "Editar Reunión";
    const submitBtn = document.querySelector("#create-meeting-form button[type='submit']");
    if (submitBtn) submitBtn.textContent = "Guardar Cambios";

    openModal("meeting-modal");
};

async function deleteMeeting(meetingId) {
    try {
        await fetch(`${API}/meetings/${meetingId}`, { method: "DELETE" });
        const el = document.querySelector(`.meeting-full-card[data-id="${meetingId}"]`);
        if (el) { el.style.opacity = "0"; el.style.transform = "scale(0.95)"; el.style.transition = "all 0.3s ease"; }
        showToast("Reunión eliminada");
        setTimeout(() => { fetchMeetings(); fetchEvents(); }, 300);
    } catch {
        showToast("Error al eliminar la reunión", "error");
    }
}

function addParticipantRow() {
    const container = document.getElementById("participants-container");
    const row = document.createElement("div");
    row.className = "participant-row";
    row.innerHTML = `
        <input type="email" class="participant-email" placeholder="correo@ejemplo.com">
        <button type="button" class="btn-remove-participant" title="Quitar">×</button>`;
    setupParticipantRemove(row.querySelector(".btn-remove-participant"));
    container.appendChild(row);
}

function setupParticipantRemove(btn) {
    if (!btn) return;
    btn.addEventListener("click", () => {
        const rows = document.querySelectorAll(".participant-row");
        if (rows.length > 1) btn.closest(".participant-row").remove();
    });
}

function resetParticipantRows() {
    const container = document.getElementById("participants-container");
    container.innerHTML = `<div class="participant-row">
        <input type="email" class="participant-email" placeholder="correo@ejemplo.com">
        <button type="button" class="btn-remove-participant" title="Quitar">×</button>
    </div>`;
    setupParticipantRemove(container.querySelector(".btn-remove-participant"));
}

// ============================================================
// 8. FOCUS TIMER (INTERACTIVO CON PRESETS)
// ============================================================
function initFocusTimer() {
    const timerDisplay = document.getElementById("timer-time");
    const btnToggle = document.getElementById("btn-timer-toggle");
    const btnReset = document.getElementById("btn-timer-reset");
    const ring = document.getElementById("timer-progress");
    const sessionsCount = document.getElementById("completed-sessions-count");
    const pct = document.getElementById("focus-percentage");
    const bar = document.getElementById("focus-progress-fill");
    const customInput = document.getElementById("timer-custom-minutes");
    const btnMinus = document.getElementById("btn-timer-minus");
    const btnPlus = document.getElementById("btn-timer-plus");
    const presetBtns = document.querySelectorAll(".timer-preset-btn");

    let duration = 25 * 60;
    let remaining = duration;
    let interval = null;
    let running = false;
    let sessions = 0;
    const circumference = 440;

    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;

    function fmt(sec) {
        return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
    }

    function updateRing() {
        const pctDone = (duration - remaining) / duration;
        ring.style.strokeDashoffset = circumference - pctDone * circumference;
    }

    function setDuration(minutes) {
        if (running) return; // No cambiar duración mientras está corriendo
        duration = Math.max(1, Math.min(120, minutes)) * 60;
        remaining = duration;
        customInput.value = Math.round(duration / 60);
        timerDisplay.textContent = fmt(remaining);
        updateRing();
    }

    // Preset buttons
    presetBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (running) return;
            presetBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            setDuration(parseInt(btn.dataset.minutes));
        });
    });

    // +/- buttons
    btnMinus?.addEventListener("click", () => {
        if (running) return;
        const val = Math.max(1, parseInt(customInput.value || "25") - 5);
        presetBtns.forEach(b => b.classList.remove("active"));
        setDuration(val);
    });

    btnPlus?.addEventListener("click", () => {
        if (running) return;
        const val = Math.min(120, parseInt(customInput.value || "25") + 5);
        presetBtns.forEach(b => b.classList.remove("active"));
        setDuration(val);
    });

    // Direct input
    customInput?.addEventListener("change", () => {
        if (running) return;
        presetBtns.forEach(b => b.classList.remove("active"));
        setDuration(parseInt(customInput.value || "25"));
    });

    function tick() {
        if (remaining <= 0) {
            clearInterval(interval); interval = null; running = false;
            btnToggle.textContent = "Iniciar";
            sessions++;
            sessionsCount.textContent = sessions;
            const p = Math.min((sessions / 12) * 100, 100);
            pct.textContent = `${Math.round(p)}%`;
            bar.style.width = `${p}%`;
            showToast("¡Sesión de enfoque completada! ☕ Tómate un descanso");
            remaining = duration;
            timerDisplay.textContent = fmt(remaining);
            updateRing();
            return;
        }
        remaining--;
        timerDisplay.textContent = fmt(remaining);
        updateRing();
    }

    btnToggle.addEventListener("click", () => {
        if (running) {
            clearInterval(interval); interval = null; running = false;
            btnToggle.textContent = "Iniciar";
        } else {
            running = true;
            btnToggle.textContent = "Pausar";
            interval = setInterval(tick, 1000);
            showToast("Sesión de enfoque iniciada. ¡A concentrarse! 🎯");
        }
    });

    btnReset.addEventListener("click", () => {
        clearInterval(interval); interval = null; running = false;
        remaining = duration;
        btnToggle.textContent = "Iniciar";
        timerDisplay.textContent = fmt(remaining);
        updateRing();
    });
}

// ============================================================
// 9. CARRUSEL DE REUNIONES DINÁMICO (DASHBOARD)
// ============================================================
let carouselCurrent = 0;

function renderUpcomingMeetingsCarousel() {
    const carousel = document.getElementById("meetings-carousel");
    const indicatorsContainer = document.getElementById("carousel-indicators");
    if (!carousel || !indicatorsContainer) return;

    // Filtrar reuniones futuras o de hoy
    const now = new Date();
    const upcoming = allMeetings.filter(m => {
        if (!m.event) return false;
        const end = new Date(m.event.end_time);
        return end >= now;
    }).sort((a, b) => new Date(a.event.start_time) - new Date(b.event.start_time));

    if (upcoming.length === 0) {
        carousel.innerHTML = `<div class="meeting-slide"><div class="meeting-card"><div class="meeting-card-header"><span class="meeting-tag">Sin reuniones</span></div><div class="meeting-time">--:--</div><div class="meeting-duration">No hay reuniones próximas</div><div class="meeting-footer"><span class="meeting-relative">Crea una desde "Reuniones"</span></div></div></div>`;
        indicatorsContainer.innerHTML = '';
        return;
    }

    carousel.innerHTML = '';
    upcoming.forEach(m => {
        const ev = m.event;
        const start = new Date(ev.start_time);
        const end = new Date(ev.end_time);
        const timeStr = start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
        const rangeStr = `${start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;

        // Calcular si es hoy, mañana u otro día
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        let relativeDay = start.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
        if (start.toDateString() === today.toDateString()) relativeDay = "Hoy";
        else if (start.toDateString() === tomorrow.toDateString()) relativeDay = "Mañana";

        const participantsImgs = (m.participants || []).slice(0, 3).map((p, i) =>
            `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.email.split('@')[0])}&background=random&size=40&bold=true" alt="${escapeHtml(p.email)}" style="margin-left:${i > 0 ? '-6px' : '0'}">`
        ).join('');

        const slide = document.createElement("div");
        slide.className = "meeting-slide";
        slide.innerHTML = `
            <div class="meeting-card">
                <div class="meeting-card-header">
                    <span class="meeting-tag">${escapeHtml(ev.title)}</span>
                </div>
                <div class="meeting-time">${timeStr}</div>
                <div class="meeting-duration">${rangeStr}</div>
                <div class="meeting-footer">
                    <span class="meeting-relative">${relativeDay}</span>
                    <div class="meeting-members">${participantsImgs || ''}</div>
                </div>
            </div>`;
        carousel.appendChild(slide);
    });

    // Construir indicadores
    const totalSlides = upcoming.length;
    const slidesPerView = 3;
    const totalPages = Math.max(1, Math.ceil(totalSlides / slidesPerView));
    carouselCurrent = 0;

    indicatorsContainer.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement("span");
        dot.className = `indicator${i === 0 ? " active" : ""}`;
        dot.dataset.slide = i;
        dot.addEventListener("click", () => { carouselCurrent = i; updateCarousel(); });
        indicatorsContainer.appendChild(dot);
    }

    // Conectar flechas
    document.getElementById("carousel-prev")?.addEventListener("click", () => {
        carouselCurrent = carouselCurrent > 0 ? carouselCurrent - 1 : totalPages - 1;
        updateCarousel();
    });
    document.getElementById("carousel-next")?.addEventListener("click", () => {
        carouselCurrent = carouselCurrent < totalPages - 1 ? carouselCurrent + 1 : 0;
        updateCarousel();
    });

    function updateCarousel() {
        const slide = document.querySelector(".meeting-slide");
        const slideWidth = slide ? slide.offsetWidth + 16 : 0;
        const offset = carouselCurrent * slidesPerView * slideWidth;
        carousel.style.transform = `translateX(-${offset}px)`;
        indicatorsContainer.querySelectorAll(".indicator").forEach((ind, i) => ind.classList.toggle("active", i === carouselCurrent));
    }

    window.addEventListener("resize", updateCarousel);
}

// ============================================================
// 10. UTILITIES
// ============================================================
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ============================================================
// 11. ANALYTICS MODULE (DYNAMIC METRICS & SVG CHARTS)
// ============================================================
function renderAnalytics() {
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === "completed").length;
    const pendingTasks = totalTasks - completedTasks;
    
    // Cards
    document.getElementById("stat-completed-tasks").textContent = completedTasks;
    document.getElementById("stat-total-events").textContent = allEvents.length;
    document.getElementById("stat-total-meetings").textContent = allMeetings.length;
    
    const focusSessions = parseInt(document.getElementById("completed-sessions-count")?.textContent || "0");
    const focusHours = ((focusSessions * 25) / 60).toFixed(1);
    document.getElementById("stat-focus-hours").textContent = `${focusHours}h`;

    // Donut Chart
    const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    document.getElementById("donut-percentage").textContent = `${rate}%`;
    
    const circle = document.getElementById("donut-chart-fill");
    if (circle) {
        const circumference = 251.2;
        const offset = circumference - (rate / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
    
    document.getElementById("legend-text-completed").textContent = `Completadas: ${completedTasks}`;
    document.getElementById("legend-text-pending").textContent = `Pendientes: ${pendingTasks}`;

    // Priority Bars
    const high = allTasks.filter(t => t.priority === "high").length;
    const medium = allTasks.filter(t => t.priority === "medium").length;
    const low = allTasks.filter(t => t.priority === "low").length;

    const max = Math.max(high, medium, low, 1);
    
    const barHigh = document.getElementById("bar-priority-high");
    const barMedium = document.getElementById("bar-priority-medium");
    const barLow = document.getElementById("bar-priority-low");

    if (barHigh) barHigh.style.width = `${(high / max) * 100}%`;
    if (barMedium) barMedium.style.width = `${(medium / max) * 100}%`;
    if (barLow) barLow.style.width = `${(low / max) * 100}%`;

    document.getElementById("count-priority-high").textContent = high;
    document.getElementById("count-priority-medium").textContent = medium;
    document.getElementById("count-priority-low").textContent = low;
}

// ============================================================
// 12. USER PROFILE MODULE (BACKEND INTEGRATION)
// ============================================================
let userProfile = { name: "Chron", email: "user@chronohub.com", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" };

async function fetchUserProfile() {
    try {
        const res = await fetch(`${API}/user`);
        if (!res.ok) throw new Error();
        userProfile = await res.json();
        updateProfileUI();
    } catch (err) {
        console.error("Error fetching user profile", err);
    }
}

function updateProfileUI() {
    // Update Header
    const headerImg = document.getElementById("profile-img-header");
    if (headerImg && userProfile.avatar_url) headerImg.src = userProfile.avatar_url;

    // Update Sidebar
    const sidebarImg = document.getElementById("profile-img-sidebar");
    const sidebarName = document.getElementById("profile-name-sidebar");
    if (sidebarImg && userProfile.avatar_url) sidebarImg.src = userProfile.avatar_url;
    if (sidebarName && userProfile.name) sidebarName.textContent = userProfile.name;

    // Update Modal Fields
    const usernameInput = document.getElementById("profile-username");
    const emailInput = document.getElementById("profile-email");
    const avatarPreview = document.getElementById("profile-avatar-preview");
    const avatarUrlInput = document.getElementById("profile-avatar-url");

    if (usernameInput) usernameInput.value = userProfile.name || "";
    if (emailInput) emailInput.value = userProfile.email || "";
    if (avatarPreview && userProfile.avatar_url) avatarPreview.src = userProfile.avatar_url;
    if (avatarUrlInput) avatarUrlInput.value = userProfile.avatar_url || "";
}

function initUserProfileModal() {
    // Abrir Modal
    document.getElementById("btn-sidebar-profile")?.addEventListener("click", () => {
        updateProfileUI();
        openModal("profile-modal");
    });
    document.getElementById("btn-top-profile")?.addEventListener("click", () => {
        updateProfileUI();
        openModal("profile-modal");
    });

    // Selección de avatares predefinidos
    const avatarOpts = document.querySelectorAll(".avatar-opt");
    const avatarPreview = document.getElementById("profile-avatar-preview");
    const avatarUrlInput = document.getElementById("profile-avatar-url");

    avatarOpts.forEach(opt => {
        opt.addEventListener("click", () => {
            avatarOpts.forEach(o => o.classList.remove("active"));
            opt.classList.add("active");
            if (avatarPreview) avatarPreview.src = opt.src;
            if (avatarUrlInput) avatarUrlInput.value = opt.src;
        });
    });

    // URL personalizada
    avatarUrlInput?.addEventListener("input", () => {
        if (avatarUrlInput.value) {
            if (avatarPreview) avatarPreview.src = avatarUrlInput.value;
            avatarOpts.forEach(o => o.classList.remove("active"));
        }
    });

    // === SUBIDA DE IMAGEN LOCAL ===
    const fileInput = document.getElementById("profile-avatar-file");
    const btnUpload = document.getElementById("btn-upload-avatar");

    btnUpload?.addEventListener("click", () => {
        fileInput?.click();
    });

    fileInput?.addEventListener("change", async () => {
        const file = fileInput.files[0];
        if (!file) return;

        // Validar tamaño
        if (file.size > 5 * 1024 * 1024) {
            showToast("El archivo excede el límite de 5 MB.", "error");
            return;
        }

        // Vista previa inmediata
        const reader = new FileReader();
        reader.onload = (e) => {
            if (avatarPreview) avatarPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Subir al servidor
        const formData = new FormData();
        formData.append("file", file);

        try {
            btnUpload.disabled = true;
            btnUpload.querySelector("span").textContent = "Subiendo...";

            const res = await fetch(`${API}/user/avatar`, {
                method: "POST",
                body: formData
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Error al subir");
            }
            const data = await res.json();
            if (avatarUrlInput) avatarUrlInput.value = data.avatar_url;
            avatarOpts.forEach(o => o.classList.remove("active"));
            showToast("¡Avatar subido exitosamente! 📸");

            // Actualizar la vista previa con la URL del servidor
            if (avatarPreview) avatarPreview.src = data.avatar_url;
        } catch (err) {
            showToast(`Error: ${err.message}`, "error");
        } finally {
            btnUpload.disabled = false;
            btnUpload.querySelector("span").textContent = "Seleccionar archivo";
            fileInput.value = ""; // Reset
        }
    });

    // Envío del formulario
    document.getElementById("edit-profile-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("profile-username").value.trim();
        const email = document.getElementById("profile-email").value.trim();
        const avatar_url = document.getElementById("profile-avatar-url").value.trim() || document.getElementById("profile-avatar-preview").src;

        try {
            const res = await fetch(`${API}/user`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, avatar_url })
            });
            if (!res.ok) throw new Error();
            userProfile = await res.json();
            updateProfileUI();
            closeModal("profile-modal");
            showToast("¡Perfil actualizado con éxito! ✨");
        } catch {
            showToast("Error al guardar el perfil", "error");
        }
    });

    // Cerrar sesión — llama al backend y luego limpia localStorage
    document.getElementById("btn-logout")?.addEventListener("click", async () => {
        try {
            await fetch(`${API}/auth/logout`, { method: "POST" });
        } catch (_) {
            // Si falla la llamada, igual cerramos sesión localmente
        }
        localStorage.clear();
        showToast("Cerrando sesión...", "success");
        setTimeout(() => {
            window.location.href = "auth.html";
        }, 800);
    });
}

// ============================================================
// 13. NOTIFICATIONS SYSTEM
// ============================================================
let notifications = [
    { id: 1, type: "info", title: "Bienvenido a ChronoHub", desc: "Comienza a organizar tu día agregando tareas, eventos y reuniones.", unread: true },
    { id: 2, type: "warning", title: "Reunión de Equipo Q4", desc: "Tu Sprint Planning Q4 empieza pronto. ¡No olvides unirte!", unread: true },
    { id: 3, type: "success", title: "¡Meta Cumplida!", desc: "Has completado todas tus tareas pendientes de hoy.", unread: true }
];

function initNotifications() {
    const btn = document.getElementById("btn-notifications");
    const dropdown = document.getElementById("notifications-dropdown");
    const btnClear = document.getElementById("btn-clear-notifications");

    // Toggle Dropdown
    btn?.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown?.classList.toggle("active");
    });

    // Close Dropdown on click outside
    document.addEventListener("click", (e) => {
        if (dropdown && !e.target.closest(".notifications-wrapper")) {
            dropdown.classList.remove("active");
        }
    });

    // Clear All
    btnClear?.addEventListener("click", () => {
        notifications = notifications.map(n => ({ ...n, unread: false }));
        renderNotifications();
        showToast("Notificaciones marcadas como leídas");
    });

    renderNotifications();
}

function renderNotifications() {
    const container = document.getElementById("notifications-list");
    const badge = document.getElementById("notification-badge");
    if (!container) return;

    const unreadCount = notifications.filter(n => n.unread).length;
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = "flex";
        } else {
            badge.style.display = "none";
        }
    }

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="notifications-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span>No tienes notificaciones</span>
            </div>`;
        return;
    }

    container.innerHTML = "";
    notifications.forEach(n => {
        const item = document.createElement("div");
        item.className = `notification-item${n.unread ? " unread" : ""}`;
        
        let iconSvg = "";
        if (n.type === "info") {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        } else if (n.type === "success") {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        }

        item.innerHTML = `
            <div class="notification-icon ${n.type}">${iconSvg}</div>
            <div class="notification-content" onclick="markNotificationRead(${n.id})">
                <span class="notification-item-title">${escapeHtml(n.title)}</span>
                <span class="notification-desc">${escapeHtml(n.desc)}</span>
            </div>
            <button class="btn-dismiss-notification" onclick="dismissNotification(${n.id}, event)">×</button>`;
        container.appendChild(item);
    });
}

window.markNotificationRead = function(id) {
    const n = notifications.find(notif => notif.id === id);
    if (n) {
        n.unread = false;
        renderNotifications();
    }
};

window.dismissNotification = function(id, event) {
    event.stopPropagation();
    notifications = notifications.filter(notif => notif.id !== id);
    renderNotifications();
};

// ============================================================
// 14. NEW MODULES FOR DASHBOARD & WEEK NAV
// ============================================================
function initDashboardCreateDropdown() {
    const btnTrigger = document.getElementById("btn-dashboard-create-trigger");
    const menu = document.getElementById("dropdown-create-menu");

    btnTrigger?.addEventListener("click", (e) => {
        e.stopPropagation();
        menu?.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
        if (menu && !e.target.closest(".dropdown-create")) {
            menu.classList.remove("active");
        }
    });

    document.querySelectorAll(".dropdown-create-item").forEach(item => {
        item.addEventListener("click", () => {
            const action = item.dataset.action;
            if (action === "task") openCreateModal("task-modal");
            if (action === "event") openCreateModal("event-modal");
            if (action === "meeting") openCreateModal("meeting-modal");
            menu?.classList.remove("active");
        });
    });
}

function initScheduleWeekNavigation() {
    document.getElementById("btn-prev-week")?.addEventListener("click", () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 7);
        selectedDate = d;
        renderWeekHeader();
        renderEvents();
    });

    document.getElementById("btn-next-week")?.addEventListener("click", () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 7);
        selectedDate = d;
        renderWeekHeader();
        renderEvents();
    });
}

function initSidebarMenu() {
    const sidebar = document.getElementById("sidebar");
    const spacer = document.getElementById("sidebar-spacer");
    const mobileMenuToggle = document.getElementById("btn-mobile-menu-toggle");
    const sidebarClose = document.getElementById("btn-sidebar-close");
    const overlay = document.getElementById("sidebar-overlay");
    const menuLinks = document.querySelectorAll(".sidebar-menu .menu-item");

    // ── Desktop: sync spacer width with sidebar hover ──────────────────────
    // CSS :hover on .sidebar cannot affect its sibling .sidebar-spacer,
    // so we use JS mouseenter/mouseleave to keep them in sync.
    function expandSpacer() {
        if (window.innerWidth > 768 && spacer) {
            spacer.style.width = "var(--sidebar-width)";
        }
    }

    function collapseSpacer() {
        if (window.innerWidth > 768 && spacer) {
            spacer.style.width = "78px";
        }
    }

    sidebar?.addEventListener("mouseenter", expandSpacer);
    sidebar?.addEventListener("mouseleave", collapseSpacer);

    // Mobile Open Drawer
    mobileMenuToggle?.addEventListener("click", () => {
        sidebar?.classList.add("mobile-active");
        overlay?.classList.add("active");
    });

    // Mobile Close Drawer
    function closeMobileMenu() {
        sidebar?.classList.remove("mobile-active");
        overlay?.classList.remove("active");
    }

    sidebarClose?.addEventListener("click", closeMobileMenu);
    overlay?.addEventListener("click", closeMobileMenu);

    // Auto-close mobile drawer when navigation links are clicked
    menuLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });

    // Reset on resize
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
            collapseSpacer(); // ensure spacer resets to compact width
        } else if (spacer) {
            spacer.style.width = ""; // mobile: spacer is hidden, clear inline style
        }
    });
}

// ============================================================
// 15. CUSTOM PREMIUM DATE-TIME PICKER COMPONENT
// ============================================================

class CustomDateTimePicker {
    constructor(input) {
        this.input = input;
        this.value = input.value;
        this.currentDate = this.value ? new Date(this.value) : new Date();
        this.selectedDate = this.value ? new Date(this.value) : null;
        
        this.viewYear = this.currentDate.getFullYear();
        this.viewMonth = this.currentDate.getMonth();
        
        this.selectedHour = 12;
        this.selectedMinute = 0;
        this.selectedAmPm = 'PM';
        
        if (this.selectedDate) {
            let h = this.selectedDate.getHours();
            this.selectedMinute = this.selectedDate.getMinutes();
            this.selectedAmPm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            this.selectedHour = h ? h : 12;
        } else {
            const now = new Date();
            let h = now.getHours();
            this.selectedMinute = now.getMinutes();
            this.selectedAmPm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            this.selectedHour = h ? h : 12;
        }
        
        this.init();
    }

    init() {
        const parent = this.input.parentNode;
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'custom-datetime-wrapper';
        parent.insertBefore(this.wrapper, this.input);
        this.wrapper.appendChild(this.input);
        
        // Hide native input using visually hidden class
        this.input.classList.add('custom-dt-hidden-native');
        
        // Create trigger
        this.trigger = document.createElement('div');
        this.trigger.className = 'custom-dt-trigger';
        this.trigger.setAttribute('tabindex', '0');
        this.trigger.innerHTML = `
            <span class="custom-dt-text">${this.formatDateTime(this.selectedDate)}</span>
            <svg class="custom-dt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
        `;
        this.wrapper.appendChild(this.trigger);
        
        // Create popover – append to body so it escapes modal transform stacking context
        this.popover = document.createElement('div');
        this.popover.className = 'custom-dt-popover';
        document.body.appendChild(this.popover);
        
        // Setup descriptor interceptor
        this.setupValueInterceptor();
        
        // Event Listeners
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePopover();
        });
        
        this.trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.togglePopover();
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target) && !this.popover.contains(e.target)) {
                this.closePopover();
            }
        });
        
        this.popover.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Form validation error handlers
        this.input.addEventListener('invalid', (e) => {
            e.preventDefault();
            this.trigger.style.borderColor = 'var(--color-high)';
            this.trigger.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.15)';
            this.trigger.focus();
        });

        this.input.addEventListener('focus', () => {
            this.trigger.focus();
        });
        
        this.render();
    }

    setupValueInterceptor() {
        const self = this;
        const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        Object.defineProperty(this.input, 'value', {
            get: function() {
                return descriptor.get.call(this);
            },
            set: function(val) {
                descriptor.set.call(this, val);
                self.onExternalValueChange(val);
            },
            configurable: true
        });
    }

    onExternalValueChange(val) {
        this.value = val;
        if (val) {
            const date = new Date(val);
            this.selectedDate = date;
            this.viewYear = date.getFullYear();
            this.viewMonth = date.getMonth();
            
            let h = date.getHours();
            this.selectedMinute = date.getMinutes();
            this.selectedAmPm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            this.selectedHour = h ? h : 12;
        } else {
            this.selectedDate = null;
        }
        
        // Reset validation styles if values are set/cleared
        this.trigger.style.borderColor = '';
        this.trigger.style.boxShadow = '';
        
        this.updateTriggerUI();
        this.render();
    }

    updateTriggerUI() {
        let dateVal = null;
        if (this.selectedDate) {
            let hour = this.selectedHour;
            if (this.selectedAmPm === 'PM' && hour < 12) hour += 12;
            if (this.selectedAmPm === 'AM' && hour === 12) hour = 0;
            dateVal = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate(), hour, this.selectedMinute);
        }
        this.trigger.querySelector('.custom-dt-text').textContent = this.formatDateTime(dateVal);
    }

    formatDateTime(date) {
        if (!date || isNaN(date.getTime())) return "Seleccionar fecha y hora";
        const day = String(date.getDate()).padStart(2, '0');
        const monthsShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
        const monthStr = monthsShort[date.getMonth()];
        const year = date.getFullYear();
        
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hourStr = String(hours).padStart(2, '0');
        
        return `${day} de ${monthStr}, ${year} - ${hourStr}:${minutes} ${ampm}`;
    }

    togglePopover() {
        const isActive = this.popover.classList.contains('active');
        document.querySelectorAll('.custom-dt-popover').forEach(p => {
            p.classList.remove('active');
        });
        
        if (!isActive) {
            this.popover.classList.add('active');
            this.positionPopover();
            
            const baseDate = this.selectedDate || new Date();
            this.viewYear = baseDate.getFullYear();
            this.viewMonth = baseDate.getMonth();
            this.render();
            
            // Re-position after render (content may have changed height)
            requestAnimationFrame(() => this.positionPopover());
        }
    }

    positionPopover() {
        const rect = this.trigger.getBoundingClientRect();
        const popoverWidth = 320;
        const popoverHeight = this.popover.offsetHeight || 420;
        const margin = 8;
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;

        // Horizontal: align left edge with trigger, clamp so it doesn't go off-screen
        let left = rect.left;
        if (left + popoverWidth > vpW - 8) {
            left = vpW - popoverWidth - 8;
        }
        if (left < 8) left = 8;

        // Vertical: prefer opening below, but open above if not enough space
        const spaceBelow = vpH - rect.bottom - margin;
        const spaceAbove = rect.top - margin;

        let top;
        if (spaceBelow >= popoverHeight || spaceBelow >= spaceAbove) {
            // Open below
            top = rect.bottom + margin;
        } else {
            // Open above
            top = rect.top - popoverHeight - margin;
            if (top < 8) top = 8;
        }

        this.popover.style.left = `${left}px`;
        this.popover.style.top = `${top}px`;
        this.popover.style.bottom = 'auto';
        this.popover.style.right = 'auto';
        this.popover.style.margin = '0';
    }

    closePopover() {
        this.popover.classList.remove('active');
        this.trigger.style.borderColor = '';
        this.trigger.style.boxShadow = '';
    }

    changeMonth(dir) {
        this.viewMonth += dir;
        if (this.viewMonth < 0) {
            this.viewMonth = 11;
            this.viewYear -= 1;
        } else if (this.viewMonth > 11) {
            this.viewMonth = 0;
            this.viewYear += 1;
        }
        this.render();
    }

    selectDate(date) {
        this.selectedDate = date;
        this.render();
        this.updateNativeInputValue();
    }

    selectToday() {
        const today = new Date();
        this.selectedDate = today;
        this.viewYear = today.getFullYear();
        this.viewMonth = today.getMonth();
        
        let h = today.getHours();
        this.selectedMinute = today.getMinutes();
        this.selectedAmPm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        this.selectedHour = h ? h : 12;
        
        this.render();
        this.updateNativeInputValue();
    }

    updateNativeInputValue() {
        if (!this.selectedDate) return;
        
        let hour = this.selectedHour;
        if (this.selectedAmPm === 'PM' && hour < 12) hour += 12;
        if (this.selectedAmPm === 'AM' && hour === 12) hour = 0;
        
        const year = this.selectedDate.getFullYear();
        const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(this.selectedDate.getDate()).padStart(2, '0');
        const hStr = String(hour).padStart(2, '0');
        const mStr = String(this.selectedMinute).padStart(2, '0');
        
        const localStr = `${year}-${month}-${day}T${hStr}:${mStr}`;
        
        const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        descriptor.set.call(this.input, localStr);
        
        this.trigger.style.borderColor = '';
        this.trigger.style.boxShadow = '';
        
        this.updateTriggerUI();
        
        this.input.dispatchEvent(new Event('input', { bubbles: true }));
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    render() {
        const months = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        
        this.popover.innerHTML = `
            <div class="custom-dt-header">
                <span class="custom-dt-month-title">${months[this.viewMonth]} de ${this.viewYear}</span>
                <div class="custom-dt-nav-actions">
                    <button class="custom-dt-nav-btn prev-month-btn" type="button" title="Mes anterior">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <button class="custom-dt-nav-btn next-month-btn" type="button" title="Mes siguiente">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="custom-dt-weekdays">
                <div class="custom-dt-weekday">Lu</div>
                <div class="custom-dt-weekday">Ma</div>
                <div class="custom-dt-weekday">Mi</div>
                <div class="custom-dt-weekday">Ju</div>
                <div class="custom-dt-weekday">Vi</div>
                <div class="custom-dt-weekday">Sa</div>
                <div class="custom-dt-weekday">Do</div>
            </div>
            <div class="custom-dt-grid"></div>
            <div class="custom-dt-time-section">
                <div class="custom-dt-time-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Hora</span>
                </div>
                <div class="custom-dt-time-inputs">
                    <select class="custom-dt-time-select hour-select"></select>
                    <span class="custom-dt-time-colon">:</span>
                    <select class="custom-dt-time-select minute-select"></select>
                    <button class="custom-dt-ampm-btn" type="button">${this.selectedAmPm}</button>
                </div>
            </div>
            <div class="custom-dt-footer">
                <button class="custom-dt-today-btn" type="button">Hoy</button>
                <button class="custom-dt-done-btn" type="button">Done</button>
            </div>
        `;
        
        const hourSelect = this.popover.querySelector('.hour-select');
        for (let h = 1; h <= 12; h++) {
            const opt = document.createElement('option');
            const val = String(h).padStart(2, '0');
            opt.value = h;
            opt.textContent = val;
            if (h === this.selectedHour) opt.selected = true;
            hourSelect.appendChild(opt);
        }
        
        const minuteSelect = this.popover.querySelector('.minute-select');
        for (let m = 0; m < 60; m++) {
            const opt = document.createElement('option');
            const val = String(m).padStart(2, '0');
            opt.value = m;
            opt.textContent = val;
            if (m === this.selectedMinute) opt.selected = true;
            minuteSelect.appendChild(opt);
        }
        
        this.renderGrid();
        this.attachInternalEvents();
    }

    renderGrid() {
        const grid = this.popover.querySelector('.custom-dt-grid');
        grid.innerHTML = '';
        
        const firstDay = new Date(this.viewYear, this.viewMonth, 1);
        const dayOfWeek = firstDay.getDay();
        const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        const today = new Date();
        
        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(this.viewYear, this.viewMonth, 1 - startOffset + i);
            const dayEl = document.createElement('div');
            dayEl.className = 'custom-dt-day';
            dayEl.textContent = cellDate.getDate();
            
            const isCurrentMonth = cellDate.getMonth() === this.viewMonth;
            if (!isCurrentMonth) {
                dayEl.classList.add('empty');
            }
            
            if (cellDate.toDateString() === today.toDateString()) {
                dayEl.classList.add('today');
            }
            
            if (this.selectedDate && cellDate.toDateString() === this.selectedDate.toDateString()) {
                dayEl.classList.add('selected');
            }
            
            dayEl.addEventListener('click', () => {
                this.selectDate(cellDate);
            });
            
            grid.appendChild(dayEl);
        }
    }

    attachInternalEvents() {
        this.popover.querySelector('.prev-month-btn').addEventListener('click', () => {
            this.changeMonth(-1);
        });
        
        this.popover.querySelector('.next-month-btn').addEventListener('click', () => {
            this.changeMonth(1);
        });
        
        const hourSelect = this.popover.querySelector('.hour-select');
        hourSelect.addEventListener('change', () => {
            this.selectedHour = parseInt(hourSelect.value);
            if (!this.selectedDate) this.selectedDate = new Date();
            this.updateNativeInputValue();
        });
        
        const minuteSelect = this.popover.querySelector('.minute-select');
        minuteSelect.addEventListener('change', () => {
            this.selectedMinute = parseInt(minuteSelect.value);
            if (!this.selectedDate) this.selectedDate = new Date();
            this.updateNativeInputValue();
        });
        
        const ampmBtn = this.popover.querySelector('.custom-dt-ampm-btn');
        ampmBtn.addEventListener('click', () => {
            this.selectedAmPm = this.selectedAmPm === 'AM' ? 'PM' : 'AM';
            ampmBtn.textContent = this.selectedAmPm;
            if (!this.selectedDate) this.selectedDate = new Date();
            this.updateNativeInputValue();
        });
        
        this.popover.querySelector('.custom-dt-today-btn').addEventListener('click', () => {
            this.selectToday();
        });
        
        this.popover.querySelector('.custom-dt-done-btn').addEventListener('click', () => {
            if (!this.selectedDate) {
                this.selectToday();
            }
            this.closePopover();
        });
    }
}

function initCustomDateTimePickers() {
    document.querySelectorAll('input[type="datetime-local"]').forEach(input => {
        if (!input.dataset.customPickerInitialized) {
            input.dataset.customPickerInitialized = "true";
            new CustomDateTimePicker(input);
        }
    });
}
