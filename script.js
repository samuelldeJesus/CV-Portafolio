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