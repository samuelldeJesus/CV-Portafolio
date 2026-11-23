/* ==========================================
   GENERADOR DE CURRÍCULUM PDF
   Descarga directa, sin ventanas emergentes
   (usa un iframe oculto con cv-pdf.html)
========================================== */

function iniciarGeneradorCV() {
    const boton = document.getElementById("btnDescargarCV");

    if (!boton) {
        console.error("No se encuentra el botón btnDescargarCV");
        return;
    }

    boton.addEventListener("click", () => generarCVPDF(boton));
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarGeneradorCV);
} else {
    iniciarGeneradorCV();
}


async function generarCVPDF(boton) {

    const texto = (elemento, selector) =>
        elemento?.querySelector(selector)?.textContent.replace(/\s+/g, " ").trim() || "";

    const todos = selector => [...document.querySelectorAll(selector)];

    const escapar = valor =>
        String(valor ?? "").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));

    const lista = items => items.map(i => `<li>${escapar(i)}</li>`).join("");

    const limpiar = el => el?.textContent.replace(/\s+/g, " ").trim() || "";

    // ---------- 1. LEER DATOS DE LA WEB ----------

    const nombre = texto(document, ".perfil_foto h1, .perfil_foto h2");
    const profesion = texto(document, ".perfil_foto p");
    const fotoURL = document.querySelector(".perfil_foto img")?.src || "";

    const enlaces = todos(".perfil_iconos a");
    const buscar = fn => enlaces.find(a => fn(a.href.toLowerCase(), a));

    const telefono  = buscar((h, a) => a.getAttribute("href")?.startsWith("tel:"));
    const email     = buscar((h, a) => a.getAttribute("href")?.startsWith("mailto:"));
    // Nacionalidad e idioma se identifican por su icono en la web
    const nacionalidad = enlaces.find(a => a.querySelector(".fa-address-card"));
    const idioma       = enlaces.find(a => a.querySelector(".fa-language"));

    const perfil = todos(".sobre_mi_texto p").map(p => limpiar(p)).join(" ");

    const habilidades = todos(".sobre_mi_tecnologias span").map(s => limpiar(s));

    const estudios = todos(".formacion_item").map(item => ({
        fecha: texto(item, ".formacion_fecha"),
        titulo: texto(item, ".formacion_info h3"),
        centro: texto(item, ".formacion_centro"),
        descripcion: texto(item, ".formacion_info > p:not(.formacion_centro)")
    }));

    const experiencias = todos(".experiencia_item").map(item => ({
        fecha: texto(item, ".experiencia_fecha"),
        puesto: texto(item, ".experiencia_info h3"),
        empresa: texto(item, ".experiencia_empresa"),
        descripcion: texto(item, ".experiencia_info > p:not(.experiencia_empresa)"),
        tareas: [...item.querySelectorAll(".experiencia_info li")].map(li => limpiar(li))
    }));

    const proyectos = todos(".portafolio_grid .proyecto").map(proyecto => ({
        nombre: texto(proyecto, ".proyecto_info h3"),
        descripcion: texto(proyecto, ".proyecto_info p"),
        url: ""
    }));

    // ---------- 2. CARGAR LA PLANTILLA EN UN IFRAME OCULTO ----------

    boton.disabled = true;
    boton.style.opacity = "0.6";

    const iframe = document.createElement("iframe");
    iframe.style.cssText =
        "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;visibility:hidden;";
    iframe.src = "cv-pdf.html?v=3";

    try {

        await new Promise((resolve, reject) => {
            iframe.onload = resolve;
            iframe.onerror = () => reject(new Error("Não foi possível carregar o cv-pdf.html"));
            document.body.appendChild(iframe);
        });

        // Si se abre con file:// el navegador bloquea el acceso al iframe
        let doc, win;
        try {
            win = iframe.contentWindow;
            doc = iframe.contentDocument;
            void doc.body;
        } catch (e) {
            throw new Error("Abra o projeto com um servidor local (Live Server) em vez de file://");
        }

        // Esperar a la librería html2pdf
        let intentos = 0;
        while (typeof win.html2pdf !== "function" && intentos < 100) {
            await new Promise(r => setTimeout(r, 100));
            intentos++;
        }
        if (typeof win.html2pdf !== "function") {
            throw new Error("A biblioteca html2pdf não foi carregada (sem conexão?).");
        }

        // ---------- 3. RELLENAR LA PLANTILLA ----------

        const ponerTexto = (id, valor) => {
            const el = doc.getElementById(id);
            if (!el) return;
            if (valor) el.textContent = valor;
            else el.remove();   // sin dato (ej. GitHub): no deja hueco en el PDF
        };

        ponerTexto("cv-nombre", nombre);
        ponerTexto("cv-profesion", profesion);
        // Contactos: solo teléfono, email, nacionalidad e idioma
        const ponerContacto = (id, rotulo, elementoWeb) => {
            const el = doc.getElementById(id);
            if (!el) return;
            const valor = limpiar(elementoWeb);
            if (valor) el.innerHTML = `<strong>${rotulo}:</strong> ${escapar(valor)}`;
            else el.remove();
        };

        ponerContacto("cv-telefono", "Telefone", telefono);
        ponerContacto("cv-email", "E-mail", email);
        ponerContacto("cv-nacionalidad", "Nacionalidade", nacionalidad);
        ponerContacto("cv-idioma", "Idioma", idioma);
        ponerTexto("cv-perfil", perfil);

        const imagenPDF = doc.getElementById("cv-foto");
        if (fotoURL) imagenPDF.src = fotoURL;
        else imagenPDF.style.display = "none";

        doc.getElementById("cv-experiencias").innerHTML =
            experiencias.map(e => `
                <article class="item">
                    <h3>${escapar(e.puesto)}</h3>
                    <div class="empresa">${escapar(e.empresa)}</div>
                    <div class="fecha">${escapar(e.fecha)}</div>
                    <p class="descripcion">${escapar(e.descripcion)}</p>
                    ${e.tareas.length ? `<ul>${lista(e.tareas)}</ul>` : ""}
                </article>`).join("");

        doc.getElementById("cv-estudios").innerHTML =
            estudios.map(e => `
                <article class="item">
                    <h3>${escapar(e.titulo)}</h3>
                    <div class="empresa">${escapar(e.centro)}</div>
                    <div class="fecha">${escapar(e.fecha)}</div>
                    <p class="descripcion">${escapar(e.descripcion)}</p>
                </article>`).join("");

        doc.getElementById("cv-habilidades").innerHTML =
            habilidades.map(h => `<span class="habilidad">${escapar(h)}</span>`).join("");

        doc.getElementById("cv-proyectos").innerHTML =
            proyectos.map(p => `
                <article class="proyecto">
                    <h3>${escapar(p.nombre)}</h3>
                    <p>${escapar(p.descripcion)}</p>
                    ${p.url ? `<a href="${escapar(p.url)}">Ver proyecto</a>` : ""}
                </article>`).join("");

        // Agrupar cada título de sección con su primer bloque de contenido
        // para que nunca quede un título solo al final de una página
        doc.querySelectorAll("#curriculum-pdf section").forEach(seccion => {
            const titulo = seccion.querySelector("h2");
            const contenedor = titulo?.nextElementSibling;
            if (!titulo || !contenedor) return;

            // Habilidades y perfil se mantienen enteros; en las demás, solo el primer elemento
            const entero = contenedor.classList.contains("habilidades") || contenedor.tagName === "P";
            const primero = entero ? contenedor : contenedor.firstElementChild;

            const grupo = doc.createElement("div");
            grupo.className = "grupo-titulo";
            titulo.before(grupo);
            grupo.appendChild(titulo);
            if (primero) grupo.appendChild(primero);
        });

        // Esperar a que cargue la foto
        await Promise.all([...doc.images].map(img =>
            img.complete ? Promise.resolve() :
            new Promise(r => { img.onload = r; img.onerror = r; })
        ));

        // ---------- 4. GENERAR Y DESCARGAR ----------

        // Generar el PDF en memoria (dentro del iframe)
        const buffer = await win.html2pdf()
            .set({
                margin: 15, // número: evita problemas de arrays entre ventanas
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                    scrollY: 0,
                    windowWidth: 794
                },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                pagebreak: {
                    // arrays creados con el Array del iframe (misma ventana que html2pdf)
                    mode: win.Array.of("css", "legacy"),
                    avoid: win.Array.of(".grupo-titulo", ".item", ".proyecto", ".cv-header", "h2")
                }
            })
            .from(doc.getElementById("curriculum-pdf"))
            .outputPdf("arraybuffer");

        // Descargar desde la página principal (el iframe puede bloquear descargas)
        const blob = new Blob([buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const enlaceDescarga = document.createElement("a");
        enlaceDescarga.href = url;
        enlaceDescarga.download = "CV-digital.pdf";
        document.body.appendChild(enlaceDescarga);
        enlaceDescarga.click();
        enlaceDescarga.remove();

        setTimeout(() => URL.revokeObjectURL(url), 10000);

    } catch (error) {
        console.error("Erro ao gerar o currículo:", error);
        alert("Não foi possível gerar o PDF:\n" + error.message);
    } finally {
        iframe.remove();
        boton.disabled = false;
        boton.style.opacity = "";
    }
}
