open Utils;

[@react.component]
let make = () => {
  <PageLayout>
    <div
      style={ReactDOMRe.Style.make(
        ~alignSelf="center",
        ~maxWidth="600px",
        (),
      )}>
      <img src="/static/logo.svg" width="100%" />
    </div>
  </PageLayout>;
};

let default = make;