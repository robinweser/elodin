[@react.component]
let make = (~children) => {
  <>
    <Header />
    <div className={LayoutStyle.content()}>
      <Layout as_="div"> <div> children </div> </Layout>
    </div>
  </>;
};