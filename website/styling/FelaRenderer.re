open Fela;

let devMode: bool = [%bs.raw {| process.env.NODE_ENV !== "production" |}];

let staticStyles = [|
  ("*", style({"margin": 0, "padding": 0})),
  (
    "._v, div",
    style({
      "display": "flex",
      "alignSelf": "stretch",
      "flexDirection": "column",
      "flexShrink": 0,
      "maxWidth": "100%",
      "boxSizing": "border-box",
      "WebkitOverflowScrolling": "touch",
    }),
  ),
  (
    "body",
    style({
      "fontFamily": "-apple-system, Helvetica Neue, Helvetica, Arial, sans-serif",
      "overflowBehavior": "none",
      "fontSize": "16px",
    }),
  ),
  ("._t", style({"display": "inline"})),
|];

let make = () => {
  let renderer =
    Renderer.make(RendererConfig.make(~plugins=Presets.web, ~devMode, ()));

  Belt.Array.map(staticStyles, ((selector, style)) =>
    renderer##renderStatic(style, selector)
  );

  renderer;
};