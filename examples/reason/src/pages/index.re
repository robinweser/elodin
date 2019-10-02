let s = React.string;

module ModeSwitch = {
  [@react.component]
  let make = () => {
    let (mode, setMode) = React.useState(_ => BlockStyle.Light);
    let (size, setSize) = React.useState(_ => 16);

    <div>
      <input
        type_="number"
        value={string_of_int(size)}
        onChange={e => {
          let newValue = ReactEvent.Form.target(e)##value;

          setSize(_ => int_of_string(newValue));
        }}
      />
      <Block
        size={string_of_int(size) ++ "px"}
        mode
        onClick={_ =>
          setMode(_ =>
            switch (mode) {
            | BlockStyle.Light => BlockStyle.Dark
            | BlockStyle.Dark => BlockStyle.Light
            }
          )
        }>
        {"Mode: "
         ++ (
           switch (mode) {
           | BlockStyle.Light => "Light"
           | BlockStyle.Dark => "Dark"
           }
         )
         |> s}
      </Block>
    </div>;
  };
};

[@react.component]
let make = () => {
  let (text, setText) = React.useState(_ => "somevalue");

  <div>
    <Button> {"Hello" |> s} </Button>
    <Button fontSize="30px"> {"Hello" |> s} </Button>
    <LabeledInput value=text setValue=setText> {"Text" |> s} </LabeledInput>
    <ModeSwitch />
  </div>;
};

let default = make;