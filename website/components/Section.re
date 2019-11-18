[@react.component]
let make = (~children, ~style=?, ~padding="0", ~bgColor="white") => {
  let css = ReactFela.useFela1();

  <div ?style className={css(SectionStyle.section(~bgColor, ~padding, ()))}>
    <Layout as_="div"> children </Layout>
  </div>;
};