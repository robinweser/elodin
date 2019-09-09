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
  let router = Router.useRouter();
  let isWide =
    Js.String.includes("docs", router##pathname)
    || Js.String.includes("try", router##pathname);

  <header className={HeaderStyle.header()}>
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
        // <HeaderLink href="/blog"> {"Blog" |> s} </HeaderLink>
        <HeaderLink href="/docs/intro/what-why"> {"Docs" |> s} </HeaderLink>
        // <HeaderLink href="/try"> {"Try" |> s} </HeaderLink>
        <HeaderLink href="https://github.com/robinweser/elodin" external_=true>
          {"Github" |> s}
        </HeaderLink>
      </div>
    </Layout>
  </header>;
};