import { c as createComponent } from './astro-component_SqnoASqX.mjs';
import 'piccolore';
import { p as createRenderInstruction, h as addAttribute, k as renderTemplate, q as renderSlot, v as renderHead, o as renderComponent } from './entrypoint_DqHlnE6_.mjs';
import 'clsx';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$ClientRouter = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ClientRouter;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>${renderScript($$result, "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/node_modules/astro/components/ClientRouter.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate(_a || (_a = __template(['<html lang="id" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="generator"', '><title>Pancasila Fun Quiz - Neobrutalism Edition</title><!-- Google Fonts: Poppins --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap" rel="stylesheet"><!-- SPA Routing via Astro Client Router -->', `<!-- Inline diagnostic script to catch and display any runtime exceptions --><script>
			window.onerror = function (message, source, lineno, colno, error) {
				const div = document.createElement('div');
				div.style.position = 'fixed';
				div.style.top = '0';
				div.style.left = '0';
				div.style.width = '100%';
				div.style.backgroundColor = '#FF5E8C';
				div.style.color = '#000000';
				div.style.padding = '20px';
				div.style.zIndex = '999999';
				div.style.borderBottom = '4px solid #000000';
				div.style.fontFamily = 'monospace';
				div.style.fontSize = '14px';
				div.style.fontWeight = 'bold';
				div.innerHTML = \`
					<h1 style="font-size: 20px; font-weight: 900; margin: 0 0 10px 0; text-transform: uppercase;">🚨 Client-Side Runtime Error</h1>
					<p style="margin: 4px 0;"><strong>Pesan:</strong> \${message}</p>
					<p style="margin: 4px 0;"><strong>Sumber:</strong> \${source}:\${lineno}:\${colno}</p>
					<pre style="background-color: rgba(0,0,0,0.05); padding: 10px; margin: 10px 0 0 0; border: 2px solid #000; overflow: auto; max-height: 200px;">\${error ? error.stack : 'No stack trace available'}</pre>
				\`;
				document.body.appendChild(div);
				return false;
			};

			window.addEventListener('unhandledrejection', function (event) {
				const div = document.createElement('div');
				div.style.position = 'fixed';
				div.style.top = '0';
				div.style.left = '0';
				div.style.width = '100%';
				div.style.backgroundColor = '#FFE600';
				div.style.color = '#000000';
				div.style.padding = '20px';
				div.style.zIndex = '999999';
				div.style.borderBottom = '4px solid #000000';
				div.style.fontFamily = 'monospace';
				div.style.fontSize = '14px';
				div.style.fontWeight = 'bold';
				div.innerHTML = \`
					<h1 style="font-size: 20px; font-weight: 900; margin: 0 0 10px 0; text-transform: uppercase;">🚨 Unhandled Promise Rejection</h1>
					<p style="margin: 4px 0;"><strong>Alasan:</strong> \${event.reason}</p>
				\`;
				document.body.appendChild(div);
			});
		<\/script>`, '</head> <body class="font-poppins bg-[#FDFBF7] text-[#1A1A1A] selection:bg-[#FFE600] selection:text-black" data-astro-cid-sckkx6r4> ', "</body></html>"], ['<html lang="id" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="generator"', '><title>Pancasila Fun Quiz - Neobrutalism Edition</title><!-- Google Fonts: Poppins --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap" rel="stylesheet"><!-- SPA Routing via Astro Client Router -->', `<!-- Inline diagnostic script to catch and display any runtime exceptions --><script>
			window.onerror = function (message, source, lineno, colno, error) {
				const div = document.createElement('div');
				div.style.position = 'fixed';
				div.style.top = '0';
				div.style.left = '0';
				div.style.width = '100%';
				div.style.backgroundColor = '#FF5E8C';
				div.style.color = '#000000';
				div.style.padding = '20px';
				div.style.zIndex = '999999';
				div.style.borderBottom = '4px solid #000000';
				div.style.fontFamily = 'monospace';
				div.style.fontSize = '14px';
				div.style.fontWeight = 'bold';
				div.innerHTML = \\\`
					<h1 style="font-size: 20px; font-weight: 900; margin: 0 0 10px 0; text-transform: uppercase;">🚨 Client-Side Runtime Error</h1>
					<p style="margin: 4px 0;"><strong>Pesan:</strong> \\\${message}</p>
					<p style="margin: 4px 0;"><strong>Sumber:</strong> \\\${source}:\\\${lineno}:\\\${colno}</p>
					<pre style="background-color: rgba(0,0,0,0.05); padding: 10px; margin: 10px 0 0 0; border: 2px solid #000; overflow: auto; max-height: 200px;">\\\${error ? error.stack : 'No stack trace available'}</pre>
				\\\`;
				document.body.appendChild(div);
				return false;
			};

			window.addEventListener('unhandledrejection', function (event) {
				const div = document.createElement('div');
				div.style.position = 'fixed';
				div.style.top = '0';
				div.style.left = '0';
				div.style.width = '100%';
				div.style.backgroundColor = '#FFE600';
				div.style.color = '#000000';
				div.style.padding = '20px';
				div.style.zIndex = '999999';
				div.style.borderBottom = '4px solid #000000';
				div.style.fontFamily = 'monospace';
				div.style.fontSize = '14px';
				div.style.fontWeight = 'bold';
				div.innerHTML = \\\`
					<h1 style="font-size: 20px; font-weight: 900; margin: 0 0 10px 0; text-transform: uppercase;">🚨 Unhandled Promise Rejection</h1>
					<p style="margin: 4px 0;"><strong>Alasan:</strong> \\\${event.reason}</p>
				\\\`;
				document.body.appendChild(div);
			});
		<\/script>`, '</head> <body class="font-poppins bg-[#FDFBF7] text-[#1A1A1A] selection:bg-[#FFE600] selection:text-black" data-astro-cid-sckkx6r4> ', "</body></html>"])), addAttribute(Astro2.generator, "content"), renderComponent($$result, "ClientRouter", $$ClientRouter, { "data-astro-cid-sckkx6r4": true }), renderHead(), renderSlot($$result, $$slots["default"]));
}, "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
