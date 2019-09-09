open Next;

[@react.component]
let make = (~children) => {
  let router = Router.useRouter();
  let isWide =
    Js.String.includes("docs", router##pathname)
    || Js.String.includes("try", router##pathname);

  <> <Header /> children </>;
};