const canvas = document.getElementById("skinCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const pencilBtn = document.getElementById("pencilBtn");
const eraserBtn = document.getElementById("eraserBtn");

// Cada celda de la cuadrícula es 8×8
const GRID_SIZE = 8;

let tool = "pencil";
let isDrawing = false;

let undoStack = [];
let redoStack = [];

// Cargar el dibujo guardado (solo la capa de dibujo)
const savedSkin = localStorage.getItem("minecraftSkin");
if (savedSkin) {
	const img = new Image();
	img.src = savedSkin;
	img.onload = () => {
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	};
}

// Guardar estado en la pila de undo
function pushState() {
	undoStack.push(canvas.toDataURL("image/png"));
	redoStack = []; // Limpiar la pila de redo
}

// Restaurar un estado
function restoreState(state) {
	const img = new Image();
	img.src = state;
	img.onload = () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		saveSkin();
	};
}

// Guardar en localStorage
function saveSkin() {
	const tempCanvas = document.createElement("canvas");
	const tempCtx = tempCanvas.getContext("2d");
	tempCanvas.width = canvas.width;
	tempCanvas.height = canvas.height;
	tempCtx.drawImage(canvas, 0, 0);
	localStorage.setItem("minecraftSkin", tempCanvas.toDataURL("image/png"));
}

// Eventos del mouse
canvas.addEventListener("mousedown", (e) => {
	isDrawing = true;
	// Pinta de inmediato al hacer clic
	paint(e);
	pushState();
});

canvas.addEventListener("mousemove", (e) => {
	if (!isDrawing) return;
	paint(e);
});

canvas.addEventListener("mouseup", () => {
	if (isDrawing) {
		isDrawing = false;
		saveSkin();
	}
});

canvas.addEventListener("mouseleave", () => {
	isDrawing = false;
});

// Función de pintura, alinea el trazo a la cuadrícula 8×8
function paint(e) {
	const rect = canvas.getBoundingClientRect();
	// Convertir coordenadas de pantalla a coordenadas del canvas
	let x = (e.clientX - rect.left) * (canvas.width / rect.width);
	let y = (e.clientY - rect.top) * (canvas.height / rect.height);

	// Ajustar a la cuadrícula de 8 px
	x = Math.floor(x / GRID_SIZE) * GRID_SIZE;
	y = Math.floor(y / GRID_SIZE) * GRID_SIZE;

	if (tool === "pencil") {
		ctx.fillStyle = colorPicker.value;
		ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
	} else if (tool === "eraser") {
		ctx.clearRect(x, y, GRID_SIZE, GRID_SIZE);
	}
}

// Borrar todo
function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	localStorage.removeItem("minecraftSkin");
	undoStack = [];
	redoStack = [];
	pushState();
}

// Descargar la skin en PNG
function downloadSkin() {
	const tempCanvas = document.createElement("canvas");
	const tempCtx = tempCanvas.getContext("2d");
	tempCanvas.width = canvas.width;
	tempCanvas.height = canvas.height;
	tempCtx.drawImage(canvas, 0, 0);

	const link = document.createElement("a");
	link.download = "minecraft_skin.png";
	link.href = tempCanvas.toDataURL("image/png");
	link.click();
}

// Cambiar herramienta
function setTool(selectedTool) {
	tool = selectedTool;
	pencilBtn.classList.toggle("selected", tool === "pencil");
	eraserBtn.classList.toggle("selected", tool === "eraser");
}

// Undo
function undo() {
	// No hacemos nada si solo hay un estado
	if (undoStack.length > 1) {
		redoStack.push(undoStack.pop());
		const prevState = undoStack[undoStack.length - 1];
		restoreState(prevState);
	}
}

// Redo
function redo() {
	if (redoStack.length > 0) {
		const state = redoStack.pop();
		undoStack.push(state);
		restoreState(state);
	}
}
