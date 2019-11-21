open Utils;
open Next;

module HeaderLink = {
  [@react.component]
  let make = (~external_=?, ~href, ~children, ~includes=?) => {
    let css = ReactFela.useFela1();
    let router = Router.useRouter();
    let isActive =
      Js.String.includes(
        resolveOption(includes, i => i, href),
        router##pathname,
      );
    let status = isActive ? Some(HeaderStyle.Active) : None;

    <div className={css(HeaderStyle.navItem())}>
      {switch (external_) {
       | Some(bool) =>
         <a href className={css(HeaderStyle.navItemLink(~status?, ()))}>
           children
         </a>
       | None =>
         <Link href>
           <a className={css(HeaderStyle.navItemLink(~status?, ()))}>
             children
           </a>
         </Link>
       }}
    </div>;
  };
};

[@react.component]
let make = () => {
  let (navActive, setNavActive) = React.useState(_ => false);
  let css = ReactFela.useFela1();
  let css2 = ReactFela.useFela2();
  let router = Router.useRouter();
  let isWide =
    Js.String.includes("docs", router##pathname)
    || Js.String.includes("try", router##pathname);

  <header className={css(HeaderStyle.header())}>
    <div
      style={ReactDOMRe.Style.make(
        ~position="fixed",
        ~top="0px",
        ~bottom="0px",
        ~left="0px",
        ~right="0px",
        ~zIndex="10",
        ~display=navActive ? "flex" : "none",
        ~backgroundColor="white",
        ~overflow="auto",
        ~paddingTop="20px",
        ~paddingBottom="20px",
        (),
      )}>
      <div
        onClick={_ => setNavActive(_ => false)}
        style={ReactDOMRe.Style.make(
          ~top="10px",
          ~right="10px",
          ~position="fixed",
          ~padding="10px",
          ~cursor="pointer",
          (),
        )}>
        {"Close" |> s}
      </div>
      <Navigation.NavigationContent />
    </div>
    <Layout as_="nav">
      <div className={css(LayoutStyle.row())}>
        <HeaderLink href="/"> <Logo /> </HeaderLink>
        {Js.String.includes("docs", router##pathname)
           ? <div
               onClick={_ => setNavActive(_ => true)}
               style={ReactDOMRe.Style.make(~cursor="pointer", ())}
               className={css2(
                 HeaderStyle.navItem(),
                 LayoutStyle.hideOnDesktop(),
               )}>
               <span className={css(HeaderStyle.navItemLink())}>
                 {"Menu" |> s}
               </span>
             </div>
           : n}
        // <HeaderLink href="/blog"> {"Blog" |> s} </HeaderLink>
        <HeaderLink includes="/docs" href="/docs/intro/what-why">
          {"Docs" |> s}
        </HeaderLink>
        // <HeaderLink href="/try"> {"Try" |> s} </HeaderLink>
        <HeaderLink href="https://github.com/robinweser/elodin" external_=true>
          {"Github" |> s}
        </HeaderLink>
      </div>
    </Layout>
  </header>;
};