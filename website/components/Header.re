open Utils;
open Next;

[@react.component]
let make = () => {
  <header className={HeaderStyle.header()}>
    <Layout as_="nav">
      <div className={HeaderStyle.navItem()}>
        <Link href="/documentation">
          <a className={HeaderStyle.navItemLink()}> {"Documentation" |> s} </a>
        </Link>
      </div>
      <div className={HeaderStyle.navItem()}>
        <Link href="/targets">
          <a className={HeaderStyle.navItemLink()}> {"Targets" |> s} </a>
        </Link>
      </div>
      <div className={HeaderStyle.navItem()}>
        <Link href="/tutorial">
          <a className={HeaderStyle.navItemLink()}> {"Tutorial" |> s} </a>
        </Link>
      </div>
      <div className={HeaderStyle.navItem()}>
        <Link href="/blog">
          <a className={HeaderStyle.navItemLink()}> {"Blog" |> s} </a>
        </Link>
      </div>
    </Layout>
  </header>;
};