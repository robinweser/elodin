open Next;

[@react.component]
let make = (~as_="div", ~children) => {
  let router = Router.useRouter();
  let css = ReactFela.useFela1();
  let isWide =
    Js.String.includes("docs", router##pathname)
    || Js.String.includes("try", router##pathname);
  let size = isWide ? Some(LayoutStyle.Wide) : None;

  ReactDOMRe.createDOMElementVariadic(
    as_,
    ~props=
      ReactDOMRe.domProps(
        ~className=css(LayoutStyle.layout(~size?, ())),
        (),
      ),
    [|children|],
  );
};