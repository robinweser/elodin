module MDXProvider = {
  [@bs.module "@mdx-js/tag"] [@react.component]
  external make:
    (~components: Js.t('a), ~children: React.element) => React.element =
    "MDXProvider";
};