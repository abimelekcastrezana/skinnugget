const canvas = document.getElementById("skinCanvas");
const ctx = canvas.getContext("2d");
const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const pencilBtn = document.getElementById("pencilBtn");
const eraserBtn = document.getElementById("eraserBtn");

let isDrawing = false;
let tool = "pencil"; // Herramienta por defecto

// Inicializar el canvas con transparencia
ctx.fillStyle = "rgba(0,0,0,0)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Si existe una skin guardada, cargarla
const savedSkin = localStorage.getItem("minecraftSkin");
if (savedSkin) {
	const img = new Image();
	img.src = savedSkin;
	img.onload = () => {
		ctx.drawImage(img, 0, 0);
		updatePreview();
	}
}

// Eventos para dibujar
canvas.addEventListener("mousedown", () => isDrawing = true);
canvas.addEventListener("mouseup", () => {
	isDrawing = false;
	saveSkin();
});
canvas.addEventListener("mouseleave", () => isDrawing = false);

canvas.addEventListener("mousemove", (e) => {
	if (!isDrawing) return;

	const rect = canvas.getBoundingClientRect();
	const x = Math.floor((e.clientX - rect.left) / (rect.width / 64));
	const y = Math.floor((e.clientY - rect.top) / (rect.height / 64));

	if (tool === "pencil") {
		ctx.fillStyle = colorPicker.value;
		ctx.fillRect(x, y, 1, 1);
	} else if (tool === "eraser") {
		ctx.clearRect(x, y, 1, 1);
	}
	updatePreview();
});

// Actualizar la vista previa ampliada
function updatePreview() {
	previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
	previewCtx.drawImage(canvas, 0, 0, 64, 64, 0, 0, 256, 256);
}

// Limpiar el canvas y eliminar skin guardada
function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "rgba(0,0,0,0)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	localStorage.removeItem("minecraftSkin");
	updatePreview();
}

// Guardar la skin en localStorage en formato PNG
function saveSkin() {
	localStorage.setItem("minecraftSkin", canvas.toDataURL("image/png"));
}

// Descargar la skin en PNG con transparencia
function downloadSkin() {
	const link = document.createElement("a");
	link.download = "minecraft_skin.png";
	link.href = canvas.toDataURL("image/png");
	link.click();
}

// Cambiar la herramienta activa y actualizar indicador visual
function setTool(selectedTool) {
	tool = selectedTool;

	if (tool === "pencil") {
		pencilBtn.classList.add("selected");
		eraserBtn.classList.remove("selected");
	} else {
		eraserBtn.classList.add("selected");
		pencilBtn.classList.remove("selected");
	}
}
