open Utils;

[@react.component]
let make = () =>
  <nav className={NavigationStyle.navigation()}>
    <div className={NavigationStyle.navigationItem()}> {"Hallo" |> s} </div>
    <div className={NavigationStyle.navigationItem()}>
      {"Hallo" |> s}
      <div className={NavigationStyle.navigationItem()}> {"Hallo" |> s} </div>
      <div className={NavigationStyle.navigationItem()}> {"Hallo" |> s} </div>
    </div>
  </nav>;