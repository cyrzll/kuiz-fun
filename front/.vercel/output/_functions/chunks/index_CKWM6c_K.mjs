import { c as createComponent } from './astro-component_SqnoASqX.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_DqHlnE6_.mjs';
import { $ as $$Layout } from './Layout_stwwPH4h.mjs';
import { G as GameFlowApp } from './GameFlowApp_Dp7zDprN.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { slug } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "GameFlowApp", GameFlowApp, { "client:load": true, "slug": slug, "client:component-hydration": "load", "client:component-path": "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/components/GameFlowApp.jsx", "client:component-export": "default" })} ` })}`;
}, "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/pages/games/[slug]/index.astro", void 0);

const $$file = "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/pages/games/[slug]/index.astro";
const $$url = "/games/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
