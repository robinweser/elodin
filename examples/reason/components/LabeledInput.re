[@react.component]
let make = (~value, ~setValue, ~children) => {
  let css = ReactFela.useFela1();

  <>
    <label className={css(InputStyle.label())}> children </label>
    <input
      className={css(InputStyle.input())}
      value
      onChange={e => setValue(ReactEvent.Form.target(e)##value)}
    />
  </>;
};