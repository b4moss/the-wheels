import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import bash from "highlight.js/lib/languages/bash";

hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);

function highlightPage() {
  document.querySelectorAll("pre code[class*='language-']").forEach((block) => {
    hljs.highlightElement(block);
  });
}

highlightPage();
