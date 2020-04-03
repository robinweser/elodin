[@react.component]
let make = (~size, ~mode=?, ~onClick, ~children) => {
  let css = ReactFela.useFela2();

  <div
    onClick
    className={
      BlockStyle.block(~mode?, ())
      ++ " "
      ++ BlockStyle.blockText(~size, ~mode?, ())
    }>
    children
  </div>;
};