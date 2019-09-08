let useCounter = (~model) => {
  let (state, setState) = React.useState(_ => model);

  let actions = {
    pub inc = () => setState(value => value + 1);
    pub dec = () => setState(value => value - 1);
    pub incBy = by => setState(value => value + by)
  };

  let rec effects = () => {
    pub incAfter = delay => {
      Js.Global.setTimeout(() => actions#inc(), delay);

      ();
    }
  };

  (state, actions, effects());
};

[@react.component]
let make = () => {
  let (state, actions, effects) = useCounter(~model=0);

  React.useEffect0(() => {
    effects#incAfter(1000);
    None;
  });

  <div>
    <h1> {string_of_int(state) |> React.string} </h1>
    <button onClick={_ => actions#inc()}> {"+" |> React.string} </button>
    <button onClick={_ => actions#dec()}> {"-" |> React.string} </button>
    <button onClick={_ => actions#incBy(5)}> {"+5" |> React.string} </button>
  </div>;
};

let default = make;