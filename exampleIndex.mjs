/* index.js ---------------------------------------------------------------- */
require('./styles.css');
const rive = require('@rive-app/webgl2');
const { decodeImage, EventType, RiveEventType } = rive;

/* ---------- DOM refs ---------------------------------------------------- */
const els = {
	canvas: document.getElementById('rive-canvas'),
	controls: document.getElementById('controls-container'),
};

/* ---------- helpers ----------------------------------------------------- */
const argbToHex = (a) => '#' + (a & 0xffffff).toString(16).padStart(6, '0').toUpperCase();
const hexToArgb = (h) => parseInt('FF' + h.slice(1), 16);
const makeRow = (label, el) => {
	const row = document.createElement('div');
	row.className = 'ctl-row';
	const lab = document.createElement('label');
	lab.textContent = label;
	row.append(lab, el);
	return row;
};

/* ------------ robust formatter for anything Rive passes ---------------- */
function fmt(x) {
	if (x === undefined || x === null) return '';
	if (typeof x === 'string') return x;
	if (Array.isArray(x)) return x.join(', ');
	if (typeof x === 'object') {
		// Rive WebGL2 ships an object `{type:"statechange", data:[...]}`
		if (Array.isArray(x.data)) return x.data.join(', ');
		if ('name' in x) return x.name;
		return JSON.stringify(x);
	}
	return String(x);
}

/* ------------ onStateChange callback ----------------------------------- */
function handleStateChange(sm, st) {
	const left = fmt(sm);
	const right = fmt(st);
	const line = right ? `StateChange: ${left} -> ${right}` : `StateChange: ${left}`;
	if (uiHandles) {
		if (uiHandles.stTgl.checked) uiHandles.logEvent(line);
	} else {
		pending.push(line); // queue until UI exists
	}
}
/* ---------- runtime image swap ----------------------------------------- */
const assetMap = new Map();
function substituteImage(name, url) {
	const asset = assetMap.get(name);
	if (!asset || !url) return;
	fetch(url)
		.then((r) => r.arrayBuffer())
		.then((buf) => decodeImage(new Uint8Array(buf)))
		.then((img) => {
			asset.setRenderImage(img);
			img.unref();
		})
		.catch((_e) => console.error('Image decode error', _e));
}

/* ---------- gather props we expose ------------------------------------- */
function buildRootInfo(riveInst, diagramVM) {
	const smBool = riveInst.stateMachineInputs('State Machine 1').find((i) => i.name === 'Diagram Enter');

	const children = diagramVM.properties
		.filter((p) => p.type === 'viewModel')
		.map((p) => {
			const vm = diagramVM.viewModel(p.name);
			const isPill = p.name.startsWith('pill_');
			const isPopup = p.name.startsWith('popup_');

			const props = [];
			if (isPill) {
				try {
					props.push({
						name: 'Button Label',
						type: 'string',
						input: vm.string('Button Label'),
					});
				} catch (_e) {}
				try {
					props.push({
						name: 'Label Color',
						type: 'color',
						input: vm.color('Label Color'),
					});
				} catch (_e) {}
				try {
					const arrowInst = vm.viewModel('Arrow Number');
					props.push({
						name: 'Arrow Button Color',
						type: 'color',
						input: arrowInst.color('Button Color'),
					});
				} catch (_e) {}
			}
			if (isPopup) {
				try {
					props.push({
						name: 'Image Picker',
						type: 'enum',
						input: vm.enum('Image Picker'),
					});
				} catch (_e) {}
				try {
					props.push({
						name: 'Title',
						type: 'string',
						input: vm.string('Title'),
					});
				} catch (_e) {}
				try {
					props.push({
						name: 'Content',
						type: 'string',
						input: vm.string('Content'),
					});
				} catch (_e) {}
			}
			return { name: p.name, props };
		})
		.filter((c) => c.props.length);

	return { smBool, children };
}

/* ---------- UI builder -------------------------------------------------- */
function buildUI(riveInst, info, pendingLogs) {
	/* skeleton */
	els.controls.innerHTML = `
    <details open class="section"><summary>State Machine</summary><div id="sm-box"></div></details>
    <details open class="section"><summary>Controls (${info.children.length})</summary><div id="ctl-box"></div></details>
    <details class="section"><summary>Events</summary>
      <div class="event-controls">
        <label><input type="checkbox" id="evt-state-toggle" checked> State-changes</label>
        <label><input type="checkbox" id="evt-filter-toggle"> Filter</label>
        <input id="evt-filter-list" type="text" placeholder="comma-separated names" disabled>
      </div>
      <div id="evt-box" class="console"></div>
    </details>
    <details class="section"><summary>Image Assets</summary><div id="img-box"></div></details>
  `;
	const smBox = document.getElementById('sm-box');
	const ctlBox = document.getElementById('ctl-box');
	const evtBox = document.getElementById('evt-box');
	const imgBox = document.getElementById('img-box');
	const stTgl = document.getElementById('evt-state-toggle');
	const fltTgl = document.getElementById('evt-filter-toggle');
	const fltList = document.getElementById('evt-filter-list');

	/* state-machine toggle */
	if (info.smBool) {
		const btn = document.createElement('button');
		btn.className = 'toggle-btn';
		btn.textContent = info.smBool.value ? 'Entered' : 'Not Entered';
		btn.addEventListener('click', () => {
			info.smBool.value = !info.smBool.value;
			btn.textContent = info.smBool.value ? 'Entered' : 'Not Entered';
		});
		smBox.append(makeRow('Diagram Enter:', btn));
	}

	/* child controls */
	info.children.forEach((child) => {
		const det = document.createElement('details');
		det.className = 'instance';
		det.innerHTML = `<summary>${child.name}</summary>`;

		child.props.forEach((p) => {
			let ctrl;
			if (p.type === 'string') {
				ctrl = document.createElement('textarea');
				ctrl.value = (p.input.value || '').replace(/\\n/g, '\n');
				ctrl.addEventListener('input', () => (p.input.value = ctrl.value.replace(/\n/g, '\\n')));
			} else if (p.type === 'enum') {
				ctrl = document.createElement('select');
				riveInst
					.enums()
					.find((d) => d.name === p.name)
					.values.forEach((v) => ctrl.append(new Option(v, v)));
				ctrl.value = p.input.value;
				ctrl.addEventListener('change', () => (p.input.value = ctrl.value));
			} else if (p.type === 'color') {
				ctrl = document.createElement('input');
				ctrl.type = 'color';
				ctrl.value = argbToHex(p.input.value);
				ctrl.addEventListener('input', () => (p.input.value = hexToArgb(ctrl.value)));
			}
			if (ctrl) det.append(makeRow(p.name + ':', ctrl));
		});

		ctlBox.appendChild(det);
	});

	/* image rows */
	assetMap.forEach((asset) => {
		const urlIn = document.createElement('input');
		urlIn.type = 'url';
		urlIn.placeholder = 'https://example.com/img.png';
		const btn = document.createElement('button');
		btn.textContent = 'Load';
		btn.addEventListener('click', () => substituteImage(asset.name, urlIn.value));
		const row = makeRow(asset.name + ':', urlIn);
		row.append(btn);
		imgBox.appendChild(row);
	});

	/* ---- event console ---- */
	function logEvent(text) {
		if (fltTgl.checked) {
			const names = fltList.value
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			if (names.length && names.every((n) => !text.includes(n))) return;
		}
		const div = document.createElement('div');
		div.textContent = text;
		evtBox.append(div);
		evtBox.scrollTop = evtBox.scrollHeight;
	}
	/* flush any early logs collected before UI ready */
	pendingLogs.forEach(logEvent);

	/* RiveEvent (custom events) */
	riveInst.on(EventType.RiveEvent, (e) => {
		const d = e.data || {};
		if (d.type === RiveEventType.General) {
			logEvent(`Event: ${d.name}`);
		} else if (d.type === RiveEventType.OpenUrl) {
			logEvent(`OpenUrl: ${d.url}`);
		} else {
			logEvent(`Event: ${d.name || JSON.stringify(d)}`);
		}
	});

	/* enable/disable filter list */
	fltTgl.addEventListener('change', () => {
		fltList.disabled = !fltTgl.checked;
	});

	/* expose logEvent for state-change callback closure */
	return { logEvent, stTgl };
}

/* ---------- bootstrap --------------------------------------------------- */
function init() {
	const pending = []; // store early state-change logs before UI exists
	let uiHandles = null; // { logEvent, stTgl }

	/* ------------ onStateChange callback ----------------------------------- */
	function handleStateChange(sm, st) {
		const left = fmt(sm);
		const right = fmt(st);
		const line = right ? `StateChange: ${left} -> ${right}` : `StateChange: ${left}`;
		if (uiHandles) {
			if (uiHandles.stTgl.checked) uiHandles.logEvent(line);
		} else {
			pending.push(line); // queue until UI exists
		}
	}

	const inst = new rive.Rive({
		src: 'diagram_v3.4.riv',
		artboard: 'Diagram',
		stateMachines: 'State Machine 1',
		canvas: els.canvas,
		autoplay: true,
		autoBind: true,
		/* new native callback */
		onStateChange: handleStateChange,
		/* capture images for swapping */
		assetLoader: (asset) => {
			if (asset.isImage) assetMap.set(asset.name, asset);
			return false;
		},
		onLoad() {
			inst.resizeDrawingSurfaceToCanvas();
			const info = buildRootInfo(inst, inst.viewModelInstance);
			uiHandles = buildUI(inst, info, pending);
		},
	});

	window.addEventListener('resize', () => inst.resizeDrawingSurfaceToCanvas());
}

init();
