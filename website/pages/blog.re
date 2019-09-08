open Utils;

[@react.component]
let make = () => {
  <PageLayout> <h1> {"Blog" |> s} </h1> </PageLayout>;
};

let default = make;