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
