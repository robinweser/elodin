[@react.component]
let make = (~size, ~mode=?, ~onClick, ~children) => {
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