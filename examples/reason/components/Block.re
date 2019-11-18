[@react.component]
let make = (~size, ~mode=?, ~onClick, ~children) => {
  let css = ReactFela.useFela2();

  <div
    onClick
    className={css(
      BlockStyle.block(~mode?, ()),
      BlockStyle.blockText(~size, ~mode?, ()),
    )}>
    children
  </div>;
};