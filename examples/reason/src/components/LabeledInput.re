[@react.component]
let make = (~value, ~setValue, ~children) => {
  <>
    <label className={InputStyle.label()}> children </label>
    <input
      className={InputStyle.input()}
      value
      onChange={e => setValue(ReactEvent.Form.target(e)##value)}
    />
  </>;
};