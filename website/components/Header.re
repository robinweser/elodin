open Utils;
open Next;

module HeaderLink = {
  [@react.component]
  let make = (~external_=?, ~href, ~children) => {
    let router = Router.useRouter();
    let isActive = Js.String.includes(href, router##pathname);
    let status = isActive ? Some(HeaderStyle.Active) : None;

    <div className={HeaderStyle.navItem()}>
      {switch (external_) {
       | Some(bool) =>
         <a href className={HeaderStyle.navItemLink(~status?, ())}>
           children
         </a>
       | None =>
         <Link href>
           <a className={HeaderStyle.navItemLink(~status?, ())}> children </a>
         </Link>
       }}
    </div>;
  };
};

[@react.component]
let make = () => {
  <header className={HeaderStyle.header()}>
    <Layout as_="nav">
      <div className={LayoutStyle.row()}>
        <HeaderLink href="/">
          <img src="/static/logo_white.svg" height="40" />
        </HeaderLink>
        <div style={ReactDOMRe.Style.make(~width="10px", ())} />
        <HeaderLink href="/blog"> {"Blog" |> s} </HeaderLink>
        <HeaderLink href="/docs"> {"Docs" |> s} </HeaderLink>
        <HeaderLink href="/try"> {"Try" |> s} </HeaderLink>
        <HeaderLink href="https://github.com/robinweser/elodin" external_=true>
          {"Github" |> s}
        </HeaderLink>
      </div>
    </Layout>
  </header>;
};