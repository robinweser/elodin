[@react.component]
let make = (~children, ~fontSize="16px") => {
  let css = ReactFela.useFela2();

  <div
    className={css(
      ButtonStyle.button(),
      ButtonStyle.buttonText(~fontSize, ()),
    )}>
    children
  </div>;
};