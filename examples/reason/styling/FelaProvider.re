open ReactFela;

let fallbackRenderer = FelaRenderer.make();

[@react.component]
let make = (~children, ~renderer=?) => {
  let currentRenderer =
    switch (renderer) {
    | Some(r) => r
    | None => fallbackRenderer
    };

  <RendererProvider renderer=currentRenderer> children </RendererProvider>;
};