[@react.component]
let make = (~children, ~fontSize="16px") =>
  <div
    className={
      ButtonStyle.button() ++ " " ++ ButtonStyle.buttonText(~fontSize, ())
    }>
    children
  </div>;