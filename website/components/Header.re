open Utils;
open Next;

module HeaderLink = {
  [@react.component]
  let make = (~external_=?, ~href, ~children, ~includes=?) => {
    let router = Router.useRouter();
    let isActive =
      Js.String.includes(
        resolveOption(includes, i => i, href),
        router##pathname,
      );
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
  let (navActive, setNavActive) = React.useState(_ => false);
  let router = Router.useRouter();
  let isWide =
    Js.String.includes("docs", router##pathname)
    || Js.String.includes("try", router##pathname);

  <header className={HeaderStyle.header()}>
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
      <div className={LayoutStyle.row()}>
        <HeaderLink href="/">
          <svg width="42" height="42" viewBox="0 0 1241 1241" version="1.1">
            <g transform="matrix(0.63711,0,0,0.63711,-109.062,-394.703)">
              <circle
                cx="1142.32"
                cy="1590.27"
                r="367.345"
                style={ReactDOMRe.Style.make(~fill="white", ())}
              />
            </g>
            <g transform="matrix(1,0,0,1,-397.031,-637.087)">
              <circle
                cx="637.945"
                cy="1039.3"
                r="148.992"
                style={ReactDOMRe.Style.make(~fill="white", ())}
              />
            </g>
            <g transform="matrix(1,0,0,1,358.893,-204.302)">
              <circle
                cx="637.945"
                cy="1039.3"
                r="148.992"
                style={ReactDOMRe.Style.make(
                  ~fill="white",
                  ~opacity="0.75",
                  (),
                )}
              />
            </g>
            <g transform="matrix(1,0,0,1,-18.0626,8.55692)">
              <circle
                cx="637.945"
                cy="1039.3"
                r="148.992"
                style={ReactDOMRe.Style.make(~fill="white", ())}
              />
            </g>
            <g transform="matrix(1,0,0,1,-18.7399,-849.929)">
              <circle
                cx="637.945"
                cy="1039.3"
                r="148.992"
                style={ReactDOMRe.Style.make(
                  ~fill="white",
                  ~opacity="0.75",
                  (),
                )}
              />
            </g>
            <g transform="matrix(1,0,0,1,358.763,-637.161)">
              <circle
                cx="637.945"
                cy="1039.3"
                r="148.992"
                style={ReactDOMRe.Style.make(~fill="white", ())}
              />
            </g>
            <g transform="matrix(1,0,0,1,-397.792,-204.186)">
              <circle
                cx="637.945"
                cy="1039.3"
                r="148.992"
                style={ReactDOMRe.Style.make(
                  ~fill="white",
                  ~opacity="0.75",
                  (),
                )}
              />
            </g>
          </svg>
        </HeaderLink>
        {Js.String.includes("docs", router##pathname)
           ? <div
               onClick={_ => setNavActive(_ => true)}
               style={ReactDOMRe.Style.make(~cursor="pointer", ())}
               className={cls([
                 HeaderStyle.navItem(),
                 LayoutStyle.hideOnDesktop(),
               ])}>
               <span className={HeaderStyle.navItemLink()}>
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