open Utils;

[@react.component]
let make = () => {
  <PageLayout>
    <div style={ReactDOMRe.Style.make(~overflow="auto", ~flexShrink="1", ())}>
      <Section bgColor="rgb(245, 245, 245)">
        <div
          style={ReactDOMRe.Style.make(
            ~alignSelf="center",
            ~padding="8vh 0",
            ~minWidth="400px",
            ~maxWidth="40vw",
            (),
          )}>
          <img src="/static/logo.svg" width="100%" />
        </div>
      </Section>
      // <div
      //   style={ReactDOMRe.Style.make(
      //     ~alignSelf="center",
      //     ~flexDirection="row",
      //     ~padding="20px 0",
      //     (),
      //   )}>
      //   <button> {"Try Online" |> s} </button>
      //   <button> {"Getting Started" |> s} </button>
      // </div>
      <Section>
        <div
          style={ReactDOMRe.Style.make(
            ~flexGrow="1",
            ~flexDirection="row",
            ~padding="40px 0 20px",
            ~lineHeight="1.4",
            (),
          )}>
          <div
            style={ReactDOMRe.Style.make(
              ~flexGrow="1",
              ~flexShrink="1",
              ~padding="20px 40px",
              ~flexBasis="0",
              ~textAlign="center",
              (),
            )}>
            <h2 style={ReactDOMRe.Style.make(~paddingBottom="8px", ())}>
              {"Component-based" |> s}
            </h2>
            <p>
              {"Styles are authored on component-base and fully encapsulated from other styles accounting for predictable styling without side-effects. It also enables automatic code-splitting where each component is rendered to a new file."
               |> s}
            </p>
          </div>
          <div
            style={ReactDOMRe.Style.make(
              ~flexGrow="1",
              ~flexShrink="1",
              ~flexBasis="0",
              ~padding="20px 40px",
              ~textAlign="center",
              (),
            )}>
            <h2 style={ReactDOMRe.Style.make(~paddingBottom="8px", ())}>
              {"Write once, use everywhere" |> s}
            </h2>
            <p>
              {"Elodin compiles to a variety of different languages, platforms and libraries without having to change a single line. It's truly one file for all targets!"
               |> s}
            </p>
          </div>
        </div>
        <div
          style={ReactDOMRe.Style.make(
            ~flexGrow="1",
            ~flexDirection="row",
            ~lineHeight="1.4",
            (),
          )}>
          <div
            style={ReactDOMRe.Style.make(
              ~flexGrow="1",
              ~flexShrink="1",
              ~flexBasis="0",
              ~padding="20px 40px",
              ~textAlign="center",
              (),
            )}>
            <h2 style={ReactDOMRe.Style.make(~paddingBottom="8px", ())}>
              {"Type-safe properties" |> s}
            </h2>
            <p>
              {"The compiler will validate every property-value pair and throw on invalid rules resulting in solid code and bulletproof output. If it compiles, it works!"
               |> s}
            </p>
          </div>
          <div
            style={ReactDOMRe.Style.make(
              ~flexGrow="1",
              ~flexShrink="1",
              ~flexBasis="0",
              ~padding="20px 40px",
              ~textAlign="center",
              (),
            )}>
            <h2 style={ReactDOMRe.Style.make(~paddingBottom="8px", ())}>
              {"Quick learning-curve" |> s}
            </h2>
            <p>
              {"The syntax is a mix of CSS and JavaScript with some concepts from ReasonML and thus already familiar to many developers. It is declarative and unlike CSS only supports one value per property."
               |> s}
            </p>
          </div>
        </div>
      </Section>
    </div>
  </PageLayout>;
};

let default = make;