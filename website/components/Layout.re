[@react.component]
let make = (~as_="div", ~children) =>
  ReactDOMRe.createDOMElementVariadic(
    as_,
    ~props=ReactDOMRe.domProps(~className=LayoutStyle.layout(), ()),
    [|children|],
  );