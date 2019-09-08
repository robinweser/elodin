open Utils;

let components = {
  "h1": (props: {. children: React.element}) => {
    <h1 className={cls([MarkdownStyle.title(), MarkdownStyle.titleText()])}>
      {props##children}
    </h1>;
  },
  "h2": (props: {. children: React.element}) => {
    <h2
      className={cls([MarkdownStyle.heading(), MarkdownStyle.headingText()])}>
      {props##children}
    </h2>;
  },
  "h3": (props: {. children: React.element}) => {
    <h3
      className={cls([MarkdownStyle.heading(), MarkdownStyle.headingText()])}>
      {props##children}
    </h3>;
  },

  "h4": (props: {. children: React.element}) => {
    <h4
      className={cls([MarkdownStyle.heading(), MarkdownStyle.headingText()])}>
      {props##children}
    </h4>;
  },

  "h5": (props: {. children: React.element}) => {
    <h5
      className={cls([MarkdownStyle.heading(), MarkdownStyle.headingText()])}>
      {props##children}
    </h5>;
  },

  "h6": (props: {. children: React.element}) => {
    <h6
      className={cls([MarkdownStyle.heading(), MarkdownStyle.headingText()])}>
      {props##children}
    </h6>;
  },

  "p": (props: {. children: React.element}) =>
    <p
      className={cls([
        MarkdownStyle.paragraph(),
        MarkdownStyle.paragraphText(),
      ])}>
      {props##children}
    </p>,
  "code": (props: {. children: string}) =>
    <pre className={MarkdownStyle.codeBox()}>
      <code
        className={MarkdownStyle.code()}
        dangerouslySetInnerHTML={__html: props##children}
      />
    </pre>,
  "td": (props: {. children: React.element}) =>
    <td className={MarkdownStyle.tableCell()}> {props##children} </td>,
  "table": (props: {. children: React.element}) =>
    <table className={MarkdownStyle.table()}> {props##children} </table>,
  "th": (props: {. children: React.element}) =>
    <th className={MarkdownStyle.tableHead()}> {props##children} </th>,
  "tr": (props: {. children: React.element}) =>
    <tr className={MarkdownStyle.tableRow()}> {props##children} </tr>,
  "inlineCode": (props: {. children: string}) =>
    <pre className={MarkdownStyle.inlineCodeBox()}>
      <code
        className={MarkdownStyle.code()}
        dangerouslySetInnerHTML={__html: props##children}
      />
    </pre>,
  "strong": (props: {. children: React.element}) =>
    <b className={MarkdownStyle.strong()}> {props##children} </b>,
  "a":
    (
      props: {
        .
        href: string,
        children: React.element,
      },
    ) =>
    <a
      href={
        props##href;
      }
      className={MarkdownStyle.link()}>
      {props##children}
    </a>,
  "ul": (props: {. children: React.element}) =>
    <ul className={cls([MarkdownStyle.list(), MarkdownStyle.listText()])}>
      {props##children}
    </ul>,
  "ol": (props: {. children: React.element}) =>
    <ol className={cls([MarkdownStyle.list(), MarkdownStyle.listText()])}>
      {props##children}
    </ol>,
  "li": (props: {. children: React.element}) =>
    <li className={MarkdownStyle.listItem()}> {props##children} </li>,

  "blockquote": (props: {. children: React.element}) =>
    <div
      className={cls([
        MarkdownStyle.blockquote(),
        MarkdownStyle.blockquoteText(),
      ])}>
      {props##children}
    </div>,
};

[@react.component]
let make = (~children) => {
  <>
    <Header />
    <div className={LayoutStyle.row()}>
      <Navigation />
      <div className={LayoutStyle.content()}>
        <div className={LayoutStyle.navContent()}>
          <MDX.MDXProvider components> children </MDX.MDXProvider>
        </div>
      </div>
    </div>
  </>;
};