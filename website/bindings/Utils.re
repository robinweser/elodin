let s = React.string;
let a = React.array;
let n = React.null;

let cls = (classNames: list(string)) => String.concat(" ", classNames);

let resolveOption = (optional, resolve, fallback) => {
  switch (optional) {
  | Some(value) => resolve(value)
  | None => fallback
  };
};