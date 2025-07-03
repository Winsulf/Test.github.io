const API = "http://104.7.226.51: 5006";

let solicitudesActuales = [];

function login() {
  const id = document.getElementById("inputID").value.trim();
  document.getElementById("loginError").innerText = "";
  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  })
    .then(r => r.json())
    .then(data => {
      if (data.allowed) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("username").innerText = data.clearance.nombre;
        cargarModulos(data.clearance.clearance);
      } else {
        document.getElementById("loginError").innerText = "ID inválido";
      }
    })
    .catch(err => {
      document.getElementById("loginError").innerText = "Error de conexión";
      console.error(err);
    });
}

function cargarModulos(nivel) {
  const todos = ["Save Info", "Translate", "Image2Text", "Image2Text & Translate", "Solve Math Problems", "pepepe"];
  const dispPorNivel = {
    1: ["Save Info"],
    2: ["Save Info", "Translate"],
    3: ["Save Info", "Translate", "Image2Text"],
    4: ["Save Info", "Translate", "Image2Text", "Image2Text & Translate"],
    5: ["Save Info", "Translate", "Image2Text", "Image2Text & Translate", "Solve Math Problems"],
    6: ["Save Info", "Translate", "Image2Text", "Image2Text & Translate", "Solve Math Problems", "Administrador"]
  };
  const disp = dispPorNivel[nivel] || [];
  const cont = document.getElementById("modulesContainer");
  cont.innerHTML = "";
  todos.forEach(mod => {
    const d = document.createElement("div");
    d.className = "module" + (disp.includes(mod) ? "" : " unavailable");
    d.innerText = disp.includes(mod) ? mod : "";
    cont.appendChild(d);
  });

  if (nivel === 6) {
    cargarSolicitudesPendientes();
  }
}

function cargarSolicitudesPendientes() {
  const contExistente = document.getElementById("adminRequests");
  if (contExistente) contExistente.remove();

  const cont = document.createElement("div");
  cont.id = "adminRequests";
  cont.style.marginTop = "30px";
  cont.innerHTML = `<h3 style="color:#bfa900;">Solicitudes Pendientes</h3>`;
  document.getElementById("dashboard").appendChild(cont);

  fetch(`${API}/admin`)
    .then(res => res.json())
    .then(data => {
      solicitudesActuales = data;
      if (data.length === 0) {
        cont.innerHTML += "<p>No hay solicitudes pendientes.</p>";
        return;
      }
      data.forEach((solicitud, index) => {
        const div = document.createElement("div");
        div.style.background = "#222200";
        div.style.border = "1px solid #bfa900";
        div.style.borderRadius = "8px";
        div.style.padding = "10px";
        div.style.margin = "10px 0";

        div.innerHTML = `
          <p><strong>ID:</strong> ${solicitud.id}</p>
          <p><strong>Nombre:</strong> ${solicitud.username}</p>
          <p><strong>Email:</strong> ${solicitud.email}</p>
          <p><strong>Clearance solicitado:</strong>
            <input type="number" min="1" max="6" id="clearance-${index}" value="${solicitud.clearance}" style="width:50px;">
          </p>
          <button onclick="aprobarSolicitud(${index})" style="background:#bfa900; color:#121212; padding:5px 10px; border:none; border-radius:5px; cursor:pointer; margin-right: 10px;">Aprobar</button>
          <button onclick="rechazarSolicitud(${index})" style="background:#a00; color:#fff; padding:5px 10px; border:none; border-radius:5px; cursor:pointer;">Rechazar</button>
        `;

        cont.appendChild(div);
      });
    })
    .catch(err => {
      cont.innerHTML += `<p style="color:red;">Error cargando solicitudes</p>`;
      console.error(err);
    });
}

function aprobarSolicitud(index) {
  const solicitud = solicitudesActuales[index];
  if (!solicitud) return alert("Solicitud no encontrada");

  const nuevoNivel = parseInt(document.getElementById(`clearance-${index}`).value);
  if (isNaN(nuevoNivel) || nuevoNivel < 1 || nuevoNivel > 6) {
    alert("Nivel de clearance inválido");
    return;
  }

  const approvedUsers = [{
    id: solicitud.id,
    nombre: solicitud.username,
    clearance: nuevoNivel
  }];

  fetch(`${API}/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved_users: approvedUsers })
  })
    .then(r => r.text())
    .then(msg => {
      alert(msg);
      solicitudesActuales.splice(index, 1);
      cargarSolicitudesPendientes();
    })
    .catch(err => {
      alert("Error al aprobar usuario");
      console.error(err);
    });
}

function rechazarSolicitud(index) {
  solicitudesActuales = solicitudesActuales.filter((_, i) => i !== index);

  fetch(`${API}/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved_users: [], rejected_requests: solicitudesActuales })
  })
    .then(r => r.text())
    .then(() => {
      alert("Solicitud rechazada.");
      cargarSolicitudesPendientes();
    })
    .catch(err => {
      alert("Error al rechazar solicitud");
      console.error(err);
    });
}

function mostrarSolicitud() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("solicitudSection").style.display = "block";
  document.getElementById("solicitudResult").innerText = "";
}

function volverLogin() {
  document.getElementById("solicitudSection").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}

function enviarSolicitud() {
  const payload = {
    id: document.getElementById("nuevoID").value.trim(),
    username: document.getElementById("nuevoNombre").value.trim(),
    clearance: parseInt(document.getElementById("nuevoNivel").value),
    email: document.getElementById("nuevoEmail").value.trim()
  };
  document.getElementById("solicitudResult").innerText = "";
  fetch(`${API}/request-id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(r => r.text())
    .then(msg => {
      document.getElementById("solicitudResult").innerText = msg;
    })
    .catch(err => {
      document.getElementById("solicitudResult").innerText = "Error enviando solicitud";
      console.error(err);
    });
}
