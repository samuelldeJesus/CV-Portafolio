const enlaces = document.querySelectorAll(".info_header a, .button_ver a");
const paginas = document.querySelectorAll(".pagina");

enlaces.forEach(enlace => {
    enlace.addEventListener("click", function(event) {
        event.preventDefault();

        const paginaSeleccionada = this.getAttribute("href").replace("#", "");

        // Quitar active de todos los enlaces del menú
        document.querySelectorAll(".info_header a").forEach(enlace => {
            enlace.classList.remove("active");
        });

        // Activar el enlace correspondiente del menú
        const enlaceMenu = document.querySelector(
            `.info_header a[href="#${paginaSeleccionada}"]`
        );

        if (enlaceMenu) {
            enlaceMenu.classList.add("active");
        }

        // Ocultar todas las páginas
        paginas.forEach(pagina => {
            pagina.classList.remove("active");
        });

        // Mostrar la página seleccionada
        const pagina = document.getElementById(paginaSeleccionada);

        if (pagina) {
            pagina.classList.add("active");
            document.querySelector(".contenido_scroll")?.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
});

/* ==========================================
   BOTÓN OCULTAR / MOSTRAR CONTACTO (TABLETS)
========================================== */
(function () {
    const caja = document.querySelector(".caja_principal");
    const boton = document.getElementById("togglePerfil");

    if (!caja || !boton) return;

    function actualizarBoton(oculto) {
        const texto = oculto ? "Mostrar contacto" : "Ocultar contacto";
        boton.setAttribute("aria-label", texto);
        boton.setAttribute("title", texto);
        boton.setAttribute("aria-expanded", String(!oculto));
    }

    boton.addEventListener("click", () => {
        const oculto = caja.classList.toggle("perfil_oculto");
        actualizarBoton(oculto);
    });

    // Si la pantalla sale del rango de tablet, se restablece el estado
    const rangoTablet = window.matchMedia("(min-width: 769px) and (max-width: 1024px)");

    rangoTablet.addEventListener("change", e => {
        if (!e.matches) {
            caja.classList.remove("perfil_oculto");
            actualizarBoton(false);
        }
    });
})();

/* ==========================================
   MENÚ Y CONTACTOS (MÓVIL Y TABLET)
   - Móvil: botones "Contactos" y "Menú" (solo uno abierto a la vez)
   - Tablet: con los contactos visibles, el menú es un botón desplegable
========================================== */
(function () {
    const caja = document.querySelector(".caja_principal");
    if (!caja) return;

    const btnContactos   = document.getElementById("btnContactos");
    const btnMenu        = document.getElementById("btnMenu");
    const btnMenuTablet  = document.getElementById("btnMenuTablet");
    const btnTogglePerfil = document.getElementById("togglePerfil");

    const esMovil = window.matchMedia("(max-width: 768px)");
    const esTablet = window.matchMedia("(min-width: 769px) and (max-width: 1024px)");

    function actualizarAria() {
        const contactos = caja.classList.contains("contactos_abiertos");
        const menu = caja.classList.contains("menu_abierto");

        btnContactos?.setAttribute("aria-expanded", String(contactos));
        btnMenu?.setAttribute("aria-expanded", String(menu));
        btnMenuTablet?.setAttribute("aria-expanded", String(menu));
    }

    // Abre o cierra un panel y cierra el otro
    function alternar(clase) {
        const abrir = !caja.classList.contains(clase);

        caja.classList.remove("contactos_abiertos", "menu_abierto");
        if (abrir) caja.classList.add(clase);

        actualizarAria();
    }

    function cerrarTodo() {
        caja.classList.remove("contactos_abiertos", "menu_abierto");
        actualizarAria();
    }

    btnContactos?.addEventListener("click", () => alternar("contactos_abiertos"));
    btnMenu?.addEventListener("click", () => alternar("menu_abierto"));
    btnMenuTablet?.addEventListener("click", () => alternar("menu_abierto"));

    // Al elegir una página: se cierra el menú y, en móvil, se sube al contenido
    document.querySelectorAll(".info_header a, .button_ver a").forEach(enlace => {
        enlace.addEventListener("click", () => {
            caja.classList.remove("menu_abierto");
            actualizarAria();

            if (esMovil.matches) {
                document.getElementById("contenido")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Tocar fuera cierra el menú desplegable
    document.addEventListener("click", e => {
        if (!caja.classList.contains("menu_abierto")) return;
        if (e.target.closest(".info_header, #btnMenu")) return;
        caja.classList.remove("menu_abierto");
        actualizarAria();
    });

    // Escape cierra el menú
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") cerrarTodo();
    });

    // Al ocultar/mostrar los contactos en tablet, se cierra el desplegable
    btnTogglePerfil?.addEventListener("click", () => {
        caja.classList.remove("menu_abierto");
        actualizarAria();
    });

    // Al cambiar de tamaño de pantalla se restablece todo
    [esMovil, esTablet].forEach(mq => mq.addEventListener("change", cerrarTodo));
})();






// ===== MODAL INFORMATIVO ===========================================================================





const modalInfo = document.getElementById("modalInfo");

const cerrarModal = document.getElementById("cerrarModal");
const aceptarModal = document.getElementById("aceptarModal");


// Abrir modal
function abrirModal() {
    modalInfo.classList.add("activo");
    document.body.style.overflow = "hidden";
}


// Cerrar modal
function cerrarModalInfo() {
    modalInfo.classList.remove("activo");
    document.body.style.overflow = "";
}


// Botones
cerrarModal.addEventListener("click", cerrarModalInfo);
aceptarModal.addEventListener("click", cerrarModalInfo);


// Cerrar al pulsar fuera del modal
modalInfo.addEventListener("click", function (e) {

    if (e.target === modalInfo) {
        cerrarModalInfo();
    }

});


// Cerrar con Escape
document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {
        cerrarModalInfo();
    }

});

document.querySelectorAll(".abrir-modal").forEach(enlace => {

    enlace.addEventListener("click", function (e) {

        e.preventDefault();
        abrirModal();

    });

});


// =================================
// MODAL PORTFOLIO - LIGHTBOX
// =================================

const portfolioModal = document.getElementById("portfolioModal");

const imagenAmpliada = document.getElementById("imagenAmpliada");

const cerrarPortfolio = document.getElementById("cerrarPortfolio");

const imagenAnterior = document.getElementById("imagenAnterior");

const imagenSiguiente = document.getElementById("imagenSiguiente");

const tarjetasPortfolio = document.querySelectorAll("#portafolio article");

let imagenesPortfolio = [];
let indiceImagen = 0;


// Obtener imágenes de las tarjetas
tarjetasPortfolio.forEach((tarjeta) => {

    const imagen = tarjeta.querySelector("img");

    if (imagen) {
        imagenesPortfolio.push(imagen);
    }

});


// Abrir modal
function abrirPortfolio(indice) {

    indiceImagen = indice;

    mostrarImagen();

    portfolioModal.classList.add("activo");

    document.body.style.overflow = "hidden";

}


// Mostrar imagen seleccionada
function mostrarImagen() {

    const imagen = imagenesPortfolio[indiceImagen];

    imagenAmpliada.src = imagen.src;

    imagenAmpliada.alt = imagen.alt || "Imagen del portfolio";

}


// Cerrar modal
function cerrarModalPortfolio() {

    portfolioModal.classList.remove("activo");

    document.body.style.overflow = "";

}


// Imagen anterior
function anteriorPortfolio() {

    indiceImagen--;

    if (indiceImagen < 0) {
        indiceImagen = imagenesPortfolio.length - 1;
    }

    mostrarImagen();

}


// Imagen siguiente
function siguientePortfolio() {

    indiceImagen++;

    if (indiceImagen >= imagenesPortfolio.length) {
        indiceImagen = 0;
    }

    mostrarImagen();

}


// Clic en las tarjetas
tarjetasPortfolio.forEach((tarjeta, indice) => {

    tarjeta.addEventListener("click", () => {

        if (imagenesPortfolio[indice]) {
            abrirPortfolio(indice);
        }

    });

});


// Eventos
cerrarPortfolio.addEventListener("click", cerrarModalPortfolio);

imagenAnterior.addEventListener("click", anteriorPortfolio);

imagenSiguiente.addEventListener("click", siguientePortfolio);


// Cerrar al pulsar fuera de la imagen
portfolioModal.addEventListener("click", (e) => {

    if (e.target === portfolioModal) {
        cerrarModalPortfolio();
    }

});


// Teclado
document.addEventListener("keydown", (e) => {

    if (!portfolioModal.classList.contains("activo")) return;

    if (e.key === "Escape") {
        cerrarModalPortfolio();
    }

    if (e.key === "ArrowLeft") {
        anteriorPortfolio();
    }

    if (e.key === "ArrowRight") {
        siguientePortfolio();
    }

});
