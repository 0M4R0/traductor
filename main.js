document.addEventListener("DOMContentLoaded", () => {
    const inputText = document.getElementById("input-text");
    const switchLanguage = document.getElementById("switch-language");
    const copyButton = document.getElementById("copy-text");
    const translatedText = document.getElementById("translated-text");
    const sourceLang = document.getElementById("source-language");
    const targetLang = document.getElementById("target-language");
    const clearText = document.getElementById("clear-text");
    const MAX_TEXT_LENGTH = 500;


    // Función debounce para evitar múltiples llamadas mientras el usuario escribe
    function debounce(func, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Función para traducir el texto usando la API de MyMemory
    async function translate() {
        const text = inputText.value.trim();
        if (!text) {
            translatedText.value = "";
            return;
        }

        if (text.length > MAX_TEXT_LENGTH) {
            translatedText.value = `El texto es mayor a limite de caracteres (${MAX_TEXT_LENGTH}).`;
            return;
        }

        const source = sourceLang.value;
        const target = targetLang.value;
        const encodedText = encodeURIComponent(text); // Codificar el texto para URL
        const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${source}|${target}`;

        try {
            translatedText.value = "..."; // Mostrar mensaje de traducción
            const res = await fetch(url);
            const data = await res.json();
            // La respuesta contiene "responseData.translatedText"
            translatedText.value = data.responseData.translatedText || "No se pudo traducir.";
        } catch (error) {
            console.error("Error en la traducción:", error);
            translatedText.value = "Error en la traducción.";
        }
    }

    // Limpiar input
    clearText.addEventListener("click", () => {
        inputText.value = "";
        translatedText.value = "";
    });

    // Copiar texto al portapapeles
    copyButton.addEventListener("click", () => {
        if (!translatedText.value || translatedText.value === "...")  {
            alert("No hay texto para copiar");
            return;
        }
        navigator.clipboard.writeText(translatedText.value);
        alert("Texto copiado al portapapeles");
    });

    // Aplica debounce para que la traducción se ejecute 1/2 segundo después de dejar de escribir
    const debouncedTranslate = debounce(translate, 500);

    // Eventos: se llama a la traducción al escribir o al cambiar alguno de los idiomas
    inputText.addEventListener("input", debouncedTranslate);
    sourceLang.addEventListener("change", translate);
    targetLang.addEventListener("change", translate);

    // Intercambiar idiomas
    switchLanguage.addEventListener("click", () => {
        const tempLang = sourceLang.value;
        sourceLang.value = targetLang.value;
        targetLang.value = tempLang;
        const tempText = inputText.value;
        inputText.value = translatedText.value;
        translatedText.value = tempText;
        if (inputText.value) {
            translate();
        }
    });
});