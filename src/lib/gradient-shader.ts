const SETTINGS = {
	tempo: 2,
	noiseSpeed: 0.11,
	noiseAmount: 0.15,
	noiseFrequency: 3.4,
	distortion: 0.2,
	waveScale: [1, 2],
	grain: 0.05,
	brightness: 1.05,
} as const;

const MAX_PIXEL_RATIO = 2;
const MAX_FRAME_DELTA_MS = 100;

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
	gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColors[4];
uniform vec2 uDirection;
uniform vec2 uWaveScale;
uniform float uNoiseAmount;
uniform float uNoiseFrequency;
uniform float uDistortion;
uniform float uGrain;
uniform float uBrightness;

// 3D simplex noise by Ashima Arts and Stefan Gustavson, MIT licence:
// https://github.com/ashima/webgl-noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
	const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
	const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
	vec3 i = floor(v + dot(v, C.yyy));
	vec3 x0 = v - i + dot(i, C.xxx);
	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min(g.xyz, l.zxy);
	vec3 i2 = max(g.xyz, l.zxy);
	vec3 x1 = x0 - i1 + C.xxx;
	vec3 x2 = x0 - i2 + C.yyy;
	vec3 x3 = x0 - D.yyy;
	i = mod289(i);
	vec4 p = permute(permute(permute(
		i.z + vec4(0.0, i1.z, i2.z, 1.0))
		+ i.y + vec4(0.0, i1.y, i2.y, 1.0))
		+ i.x + vec4(0.0, i1.x, i2.x, 1.0));
	float n_ = 0.142857142857;
	vec3 ns = n_ * D.wyz - D.xzx;
	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_);
	vec4 x = x_ * ns.x + ns.yyyy;
	vec4 y = y_ * ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);
	vec4 b0 = vec4(x.xy, y.xy);
	vec4 b1 = vec4(x.zw, y.zw);
	vec4 s0 = floor(b0) * 2.0 + 1.0;
	vec4 s1 = floor(b1) * 2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));
	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
	vec3 p0 = vec3(a0.xy, h.x);
	vec3 p1 = vec3(a0.zw, h.y);
	vec3 p2 = vec3(a1.xy, h.z);
	vec3 p3 = vec3(a1.zw, h.w);
	vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;
	vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
	m = m * m;
	return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 ramp(float t) {
	float s = clamp(t, 0.0, 1.0) * 3.0;
	vec3 color = mix(uColors[0], uColors[1], clamp(s, 0.0, 1.0));
	color = mix(color, uColors[2], clamp(s - 1.0, 0.0, 1.0));
	return mix(color, uColors[3], clamp(s - 2.0, 0.0, 1.0));
}

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
	float aspect = uResolution.x / uResolution.y;
	vec2 p = gl_FragCoord.xy / uResolution - 0.5;
	p.x *= aspect;

	vec2 warp = vec2(
		snoise(vec3(p * 0.9, uTime)),
		snoise(vec3(p * 0.9 + 7.3, uTime))
	);
	vec2 q = p + uDistortion * warp;

	float wave = snoise(vec3(q * uWaveScale * 0.8, uTime * 0.6));
	float detail = snoise(vec3(q * uNoiseFrequency * 0.5, uTime * 1.5));

	// Same gradient-line length as CSS linear-gradient, so the static fallback lines up.
	float halfLine = 0.5 * (abs(uDirection.x) * aspect + abs(uDirection.y));
	float t = dot(q, uDirection) / (2.0 * halfLine) + 0.5;
	t += wave * 0.25 + detail * uNoiseAmount;

	vec3 color = ramp(t) * (1.0 + wave * 0.12) * uBrightness;
	color += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * uGrain;
	gl_FragColor = vec4(color, 1.0);
}
`;

type Rgb = [number, number, number];

function parseHex(value: string): Rgb | undefined {
	const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(
		value.trim(),
	);
	if (!match) return undefined;
	return [match[1], match[2], match[3]].map(
		(channel) => parseInt(channel, 16) / 255,
	) as Rgb;
}

function readTokens(element: Element) {
	const style = getComputedStyle(element);
	const colors = [1, 2, 3, 4].map((index) =>
		parseHex(style.getPropertyValue(`--gradient-${index}`)),
	);
	const angle = parseFloat(style.getPropertyValue('--gradient-angle'));
	if (colors.some((color) => !color) || Number.isNaN(angle)) return undefined;
	return { colors: colors as Rgb[], angle };
}

function compile(
	gl: WebGLRenderingContext,
	type: GLenum,
	source: string,
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
	const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	const program = gl.createProgram();
	if (!vertex || !fragment || !program) return null;
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

/**
 * Renders the brand gradient into the canvas. Sets `data-ready` on the canvas after the first
 * frame; until then, and whenever WebGL is unavailable, the canvas stays transparent so a CSS
 * fallback behind it remains visible.
 */
export function mountGradient(canvas: HTMLCanvasElement): void {
	const tokens = readTokens(canvas);
	const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
	if (!tokens || !gl) return;
	const program = createProgram(gl);
	if (!program) return;

	gl.useProgram(program);

	// One oversized triangle covers the viewport with fewer vertices than a quad.
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 3, -1, -1, 3]),
		gl.STATIC_DRAW,
	);
	const position = gl.getAttribLocation(program, 'aPosition');
	gl.enableVertexAttribArray(position);
	gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

	const uniform = (name: string) => gl.getUniformLocation(program, name);
	const radians = (tokens.angle * Math.PI) / 180;
	// CSS angles run clockwise from "to top"; gl_FragCoord has y pointing up.
	gl.uniform2f(uniform('uDirection'), Math.sin(radians), Math.cos(radians));
	gl.uniform3fv(uniform('uColors'), tokens.colors.flat());
	gl.uniform2f(uniform('uWaveScale'), ...SETTINGS.waveScale);
	gl.uniform1f(uniform('uNoiseAmount'), SETTINGS.noiseAmount);
	gl.uniform1f(uniform('uNoiseFrequency'), SETTINGS.noiseFrequency);
	gl.uniform1f(uniform('uDistortion'), SETTINGS.distortion);
	gl.uniform1f(uniform('uGrain'), SETTINGS.grain);
	gl.uniform1f(uniform('uBrightness'), SETTINGS.brightness);
	const resolutionLocation = uniform('uResolution');
	const timeLocation = uniform('uTime');

	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
	let visible = false;
	let frame = 0;
	let time = 0;
	let lastNow: number | undefined;
	let targetSize: [number, number] = [0, 0];
	let appliedSize: [number, number] = [0, 0];

	const draw = () => {
		const [width, height] = targetSize;
		if (width === 0 || height === 0) return;
		if (width !== appliedSize[0] || height !== appliedSize[1]) {
			canvas.width = width;
			canvas.height = height;
			gl.viewport(0, 0, width, height);
			gl.uniform2f(resolutionLocation, width, height);
			appliedSize = [width, height];
		}
		gl.uniform1f(timeLocation, time);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		canvas.dataset.ready = '';
	};

	const tick = (now: number) => {
		if (lastNow !== undefined) {
			// Hidden tabs pause rAF; an unclamped delta would make the pattern jump on return.
			const delta = Math.min(now - lastNow, MAX_FRAME_DELTA_MS);
			time += (delta / 1000) * SETTINGS.noiseSpeed * SETTINGS.tempo;
		}
		lastNow = now;
		draw();
		frame = requestAnimationFrame(tick);
	};

	const update = () => {
		cancelAnimationFrame(frame);
		frame = 0;
		lastNow = undefined;
		if (!visible) return;
		if (reducedMotion.matches) draw();
		else frame = requestAnimationFrame(tick);
	};

	// Observers may batch several entries per callback; only the newest reflects the current state.
	const intersection = new IntersectionObserver((entries) => {
		const latest = entries.at(-1);
		if (!latest) return;
		visible = latest.isIntersecting;
		update();
	});
	const resize = new ResizeObserver((entries) => {
		const latest = entries.at(-1);
		if (!latest) return;
		const ratio = Math.min(devicePixelRatio, MAX_PIXEL_RATIO);
		targetSize = [
			Math.round(latest.contentRect.width * ratio),
			Math.round(latest.contentRect.height * ratio),
		];
		if (visible && frame === 0) draw();
	});
	intersection.observe(canvas);
	resize.observe(canvas);
	reducedMotion.addEventListener('change', update);

	canvas.addEventListener('webglcontextlost', () => {
		visible = false;
		update();
		intersection.disconnect();
		resize.disconnect();
		reducedMotion.removeEventListener('change', update);
		delete canvas.dataset.ready;
	});
}
