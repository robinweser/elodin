[@react.component]
let make = (~children, ~style=?, ~padding="0", ~bgColor="white") =>
  <div ?style className={SectionStyle.section(~bgColor, ~padding, ())}>
    <Layout as_="div"> children </Layout>
  </div>;