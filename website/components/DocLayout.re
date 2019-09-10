open Utils;
open Prism;
open Css;
open Next;

let prism: Js.t('a) = [%bs.raw {| require("prismjs")|}];
[%bs.raw {|require('prismjs/components/prism-jsx.js') |}];
[%bs.raw {|require('prismjs/components/prism-javascript.js') |}];
[%bs.raw {|require('prismjs/components/prism-reason.js') |}];

let components = {
  "h1": (props: {. children: React.element}) => {
    <h1
      className={cls([
        MarkdownStyle.titleText(),
        style([selector("& + p", [marginTop(px(20))])]),
      ])}>
      {props##children}
    </h1>;
  },
  "h2": (props: {. children: React.element}) => {
    <h2
      className={cls([
        MarkdownStyle.heading(),
        MarkdownStyle.headingTwo(),
        MarkdownStyle.headingText(),
      ])}>
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
      className={cls([MarkdownStyle.fileName(), MarkdownStyle.headingText()])}>
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
  "code":
    (
      props: {
        .
        children: string,
        className: option(string),
      },
    ) => {
    let className = resolveOption(props##className, c => c, "");
    let language = Js.String.substr(9, className);

    let languages: Js.Dict.t('a) = prism##languages;

    let languageData = Js.Dict.get(languages, language);

    let highlighted =
      switch (languageData) {
      | Some(data) => Prism.highlight(props##children, data, language)
      | None => props##children
      };

    <pre className={MarkdownStyle.codeBox()}>
      <code
        className={cls([MarkdownStyle.code(), className])}
        dangerouslySetInnerHTML={__html: highlighted}
      />
    </pre>;
  },
  "td": (props: {. children: React.element}) =>
    <td className={MarkdownStyle.tableCell()}> {props##children} </td>,
  "table": (props: {. children: React.element}) =>
    <table className={MarkdownStyle.table()}> {props##children} </table>,
  "th": (props: {. children: React.element}) =>
    <th className={MarkdownStyle.tableHead()}> {props##children} </th>,
  "tr": (props: {. children: React.element}) =>
    <tr className={MarkdownStyle.tableRow()}> {props##children} </tr>,
  "inlineCode": (props: {. children: React.element}) =>
    <pre className={MarkdownStyle.inlineCodeBox()}>
      <code className={MarkdownStyle.code()}> {props##children} </code>
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
  <PageLayout>
    <Head>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/themes/prism.min.css"
        rel="stylesheet"
      />
    </Head>
    <Section style={ReactDOMRe.Style.make(~flexShrink="1", ())}>
      <div className={LayoutStyle.row()}>
        <Navigation />
        <MDX.MDXProvider components>
          <div
            className={cls([
              LayoutStyle.docContent(),
              style([selector("::-webkit-scrollbar", [display(`none)])]),
            ])}>
            children
          </div>
        </MDX.MDXProvider>
      </div>
    </Section>
  </PageLayout>;
};